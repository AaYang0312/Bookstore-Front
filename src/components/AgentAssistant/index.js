import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getBookPricing } from '../../utils/bookPrice';
import AgentButton from './AgentButton';
import AgentPanel from './AgentPanel';
import useAgentStream from './useAgentStream';
import './AgentAssistant.css';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '你好，我是你的购书助手。告诉我你的阅读兴趣、预算或学习目标，我来帮你挑选。'
};

const AgentAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const conversationId = useMemo(createId, []);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { sendMessage, stop, isStreaming } = useAgentStream();

  const handleSend = async (content, { display, baseMessages } = {}) => {
    // baseMessages：调用方已对现有消息做过修改（如标记卡片已处理）时传入，
    // 避免闭包中的旧 messages 覆盖掉修改
    const priorMessages = baseMessages || messages;
    const userMessage = { id: createId(), role: 'user', content: display || content };
    const assistantId = createId();
    setMessages([...priorMessages, userMessage, { id: assistantId, role: 'assistant', content: '', books: [] }]);

    try {
      await sendMessage({
        message: content,
        conversationId,
        history: priorMessages,
        onText: (delta) => setMessages((current) => current.map((item) =>
          item.id === assistantId ? { ...item, content: item.content + delta } : item
        )),
        onData: (payload) => {
          const books = payload.books || payload.recommendations;
          if (!Array.isArray(books)) return;
          setMessages((current) => current.map((item) =>
            item.id === assistantId ? { ...item, books } : item
          ));
        },
        onConfirm: ({ operationId, summary }) => {
          if (!operationId || !summary) return;
          setMessages((current) => current.map((item) => item.id === assistantId
            ? { ...item, confirm: { operationId, summary } }
            : item));
        },
        onError: (errorText) => {
          setMessages((current) => current.map((item) => item.id === assistantId
            ? { ...item, error: true, content: errorText }
            : item));
        }
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages((current) => current.filter((item) => item.id !== assistantId));
        return;
      }
      setMessages((current) => current.map((item) => item.id === assistantId
        ? { ...item, error: true, content: error.message || '连接失败，请稍后再试。' }
        : item));
    }
  };

  // 确认卡片按钮：回发标记消息（服务端执行写操作），并在界面上把卡片标记为已处理
  const handleConfirmDecision = (message, decision) => {
    const operationId = message.confirm?.operationId;
    if (!operationId || message.confirm.resolved || isStreaming) return;

    const markedMessages = messages.map((item) => (
      item.id === message.id && item.confirm?.operationId === operationId
        ? { ...item, confirm: { ...item.confirm, resolved: decision } }
        : item
    ));
    setMessages(markedMessages);

    const isOrder = message.confirm.summary?.type === 'create_order';
    if (decision === 'confirmed') {
      handleSend(`[CONFIRM:${operationId}]`, {
        display: isOrder ? '✓ 确认下单' : '✓ 确认取消订单',
        baseMessages: markedMessages
      });
    } else {
      handleSend(`[REJECT:${operationId}]`, {
        display: '✕ 再想想，先不操作',
        baseMessages: markedMessages
      });
    }
  };

  const handleAddToCart = (book) => {
    const { originalPrice, currentPrice } = getBookPricing(book);
    addToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: originalPrice,
      currentPrice,
      imageUrl: book.cover_url,
      stock: book.stock
    });
  };

  return (
    <div className="agent-assistant-root">
      {isOpen && (
        <AgentPanel
          messages={messages}
          isStreaming={isStreaming}
          onClose={() => setIsOpen(false)}
          onSend={handleSend}
          onStop={stop}
          onOpenBook={(bookId) => { navigate(`/book/${bookId}`); setIsOpen(false); }}
          onAddToCart={handleAddToCart}
          onConfirmDecision={handleConfirmDecision}
        />
      )}
      <AgentButton isOpen={isOpen} onClick={() => setIsOpen((open) => !open)} />
    </div>
  );
};

export default AgentAssistant;
