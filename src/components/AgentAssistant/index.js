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

  const handleSend = async (content) => {
    const userMessage = { id: createId(), role: 'user', content };
    const assistantId = createId();
    const nextHistory = [...messages, userMessage];
    setMessages([...nextHistory, { id: assistantId, role: 'assistant', content: '', books: [] }]);

    try {
      await sendMessage({
        message: content,
        conversationId,
        history: messages,
        onText: (delta) => setMessages((current) => current.map((item) =>
          item.id === assistantId ? { ...item, content: item.content + delta } : item
        )),
        onData: (payload) => {
          const books = payload.books || payload.recommendations;
          if (!Array.isArray(books)) return;
          setMessages((current) => current.map((item) =>
            item.id === assistantId ? { ...item, books } : item
          ));
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
        />
      )}
      <AgentButton isOpen={isOpen} onClick={() => setIsOpen((open) => !open)} />
    </div>
  );
};

export default AgentAssistant;
