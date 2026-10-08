import { useCallback, useRef, useState } from 'react';
import { AGENT_API_URL } from '../../config/api';


const getValidationDetail = (payload) => {
  if (!Array.isArray(payload?.detail)) return '';

  return payload.detail.map((item) => {
    const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
    return field ? `${field}：${item.msg}` : item.msg;
  }).filter(Boolean).join('；');
};

const readStream = async (response, handlers) => {
  const { onText, onData, onConfirm, onError } = handlers;
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  const dispatchEvent = (event) => {
    const lines = event.split('\n');
    const eventName = lines.find((line) => line.startsWith('event:'))?.slice(6).trim() || '';
    const dataLine = lines.find((line) => line.startsWith('data:'));
    if (!dataLine) return;

    const raw = dataLine.slice(5).trim();
    if (!raw || raw === '[DONE]') return;

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }

    // SSE 事件按 event 名分发（delta / confirm_request / done / error …）；
    // 无 event 行时仍认 action=confirm_required，或同时带 operation_id 与 summary 的载荷
    const isConfirm = eventName === 'confirm_request'
      || payload?.action === 'confirm_required'
      || Boolean(payload?.operation_id && payload?.summary);
    if (eventName === 'delta' || payload?.type === 'text' || payload?.delta) {
      onText(payload?.content || payload?.delta || '');
    } else if (isConfirm) {
      onConfirm({
        operationId: payload?.operation_id || payload?.operationId,
        summary: payload?.summary
      });
    } else if (eventName === 'error') {
      onError(payload?.message || '助手服务返回错误，请稍后重试。');
    } else if (eventName === 'done') {
      // 完整回答已通过 delta 流式输出，无额外处理
    } else if (payload && (payload.type === 'books' || payload.books)) {
      onData(payload);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    // 归一化 CRLF，但保留块尾单独的 \r，避免它和下一包的 \n 被提前拆成事件边界
    buffer = buffer.replace(/\r\n/g, '\n');
    const heldCR = !done && buffer.endsWith('\r') ? '\r' : '';
    if (heldCR) buffer = buffer.slice(0, -1);
    if (done) buffer = buffer.replace(/\r/g, '\n');

    const events = buffer.split('\n\n');
    buffer = (events.pop() || '') + heldCR;

    events.forEach(dispatchEvent);
    if (done) {
      if (buffer.trim()) dispatchEvent(buffer);
      break;
    }
  }
};

export default function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async ({
    message, conversationId, history, onText, onData, onConfirm, onError
  }) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(AGENT_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
          history: history
            .filter(({ role, content, error }) => (
              !error
              && (role === 'user' || role === 'assistant')
              && typeof content === 'string'
              && content.trim().length > 0
            ))
            .slice(-10)
            .map(({ role, content }) => ({ role, content }))
        })
      });

      if (!response.ok) {
        let errorPayload = null;
        try {
          errorPayload = await response.json();
        } catch {
          // 错误响应不一定是 JSON，继续使用状态码生成提示。
        }

        if (response.status === 422) {
          const detail = getValidationDetail(errorPayload);
          throw new Error(detail ? `请求内容校验失败：${detail}` : '请求内容校验失败');
        }

        throw new Error(response.status === 404
          ? 'Agent 服务尚未启用'
          : `Agent 服务暂时不可用（${response.status}）`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        await readStream(response, {
          onText: onText || (() => {}),
          onData: onData || (() => {}),
          onConfirm: onConfirm || (() => {}),
          onError: onError || (() => {})
        });
      } else {
        const payload = await response.json();
        onText(payload.message || payload.data?.message || '');
        onData(payload.data || payload);
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      if (error instanceof TypeError) {
        throw new Error('暂时无法连接购书助手，请确认 Agent 服务已经启动。');
      }
      throw error;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { sendMessage, stop, isStreaming };
}
