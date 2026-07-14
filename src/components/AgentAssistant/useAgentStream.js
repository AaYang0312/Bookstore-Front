import { useCallback, useRef, useState } from 'react';

const AGENT_API_URL = process.env.REACT_APP_AGENT_API_URL
  || 'http://localhost:8080/api/v1/agent/chat';

const getValidationDetail = (payload) => {
  if (!Array.isArray(payload?.detail)) return '';

  return payload.detail.map((item) => {
    const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
    return field ? `${field}：${item.msg}` : item.msg;
  }).filter(Boolean).join('；');
};

const readStream = async (response, onText, onData) => {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    events.forEach((event) => {
      const dataLine = event.split('\n').find((line) => line.startsWith('data:'));
      if (!dataLine) return;

      const raw = dataLine.slice(5).trim();
      if (!raw || raw === '[DONE]') return;

      try {
        const payload = JSON.parse(raw);
        if (payload.type === 'text' || payload.delta) onText(payload.content || payload.delta || '');
        if (payload.type === 'books' || payload.books) onData(payload);
      } catch {
        onText(raw);
      }
    });

    if (done) break;
  }
};

export default function useAgentStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async ({ message, conversationId, history, onText, onData }) => {
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
        await readStream(response, onText, onData);
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
