import React, { useEffect, useRef, useState } from 'react';
import AgentMessage from './AgentMessage';
import StoreIcon from '../StoreIcon';

const suggestions = ['推荐几本入门书', '看看最近的新书', '找 50 元以内的书'];

const AgentPanel = ({ messages, isStreaming, onClose, onSend, onStop, onOpenBook, onAddToCart }) => {
  const [input, setInput] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (text = input) => {
    const value = text.trim();
    if (!value || isStreaming) return;
    onSend(value);
    setInput('');
  };

  return (
    <section className="agent-panel" role="dialog" aria-labelledby="agent-panel-title">
      <header className="agent-panel-header">
        <div className="agent-title-wrap">
          <div className="agent-title-icon" aria-hidden="true"><StoreIcon name="spark" size={21} /></div>
          <div>
            <h2 id="agent-panel-title">智能购书助手</h2>
            <p><span className="agent-online-dot" />为你查找和比较好书</p>
          </div>
        </div>
        <button className="agent-icon-button" type="button" onClick={onClose} aria-label="关闭购书助手"><StoreIcon name="close" size={20} /></button>
      </header>

      <div className="agent-message-list" ref={listRef} aria-live="polite">
        {messages.map((message) => (
          <AgentMessage
            key={message.id}
            message={message}
            onOpenBook={onOpenBook}
            onAddToCart={onAddToCart}
          />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="agent-message-row is-assistant">
            <div className="agent-avatar" aria-hidden="true"><StoreIcon name="brand" size={15} /></div>
            <div className="agent-typing" aria-label="助手正在思考"><i /><i /><i /></div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="agent-suggestions">
          {suggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => submit(suggestion)}>{suggestion}</button>
          ))}
        </div>
      )}

      <div className="agent-composer">
        <textarea
          ref={inputRef}
          value={input}
          rows="1"
          maxLength="500"
          placeholder="告诉我你想读什么……"
          aria-label="向购书助手发送消息"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <button
          className={`agent-send-button ${isStreaming ? 'is-stop' : ''}`}
          type="button"
          onClick={isStreaming ? onStop : () => submit()}
          disabled={!isStreaming && !input.trim()}
          aria-label={isStreaming ? '停止生成' : '发送消息'}
        >
          <StoreIcon name={isStreaming ? 'stop' : 'send'} size={isStreaming ? 15 : 18} />
        </button>
      </div>
      <p className="agent-disclaimer">推荐仅供参考，下单前请核对价格与库存</p>
    </section>
  );
};

export default AgentPanel;
