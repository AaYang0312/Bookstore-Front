import React from 'react';
import BookRecommendationCard from './BookRecommendationCard';

const AgentMessage = ({ message, onOpenBook, onAddToCart }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`agent-message-row ${isUser ? 'is-user' : 'is-assistant'}`}>
      {!isUser && <div className="agent-avatar" aria-hidden="true">书</div>}
      <div className="agent-message-content">
        {message.content && (
          <div className={`agent-bubble ${message.error ? 'is-error' : ''}`}>
            {message.content}
          </div>
        )}
        {message.books?.length > 0 && (
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
