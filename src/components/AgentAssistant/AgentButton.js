import React from 'react';

const AgentButton = ({ isOpen, onClick }) => (
  <button
    className={`agent-launcher ${isOpen ? 'is-open' : ''}`}
    type="button"
    onClick={onClick}
    aria-label={isOpen ? '关闭购书助手' : '打开购书助手'}
    aria-expanded={isOpen}
  >
    <span className="agent-launcher-icon" aria-hidden="true">{isOpen ? '×' : '书'}</span>
    {!isOpen && <span className="agent-launcher-label">购书助手</span>}
  </button>
);

export default AgentButton;
