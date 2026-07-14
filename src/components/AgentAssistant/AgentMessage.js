import React from 'react';
import BookRecommendationCard from './BookRecommendationCard';

const AgentMessage = ({ message, onOpenBook, onAddToCart }) => {
  const isUser = message.role === 'user';
  const hasBooks = message.books?.length > 0;

  // 流式请求开始时会先插入一条空的 assistant 占位消息。
  // 这条消息由 AgentPanel 的加载动画代为展示，避免重复头像。
  if (!isUser && !message.content && !hasBooks) return null;

  return (
    <div className={`agent-message-row ${isUser ? 'is-user' : 'is-assistant'}`}>
      {!isUser && <div className="agent-avatar" aria-hidden="true">书</div>}
      <div className="agent-message-content">
        {message.content && (
          <div className={`agent-bubble ${message.error ? 'is-error' : ''}`}>
            {message.content}
          </div>
        )}
        {hasBooks && (
          <div className="agent-book-list" aria-label="推荐图书">
            {message.books.map((book) => (
              <BookRecommendationCard
                key={book.id}
                book={book}
                onOpen={onOpenBook}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMessage;
