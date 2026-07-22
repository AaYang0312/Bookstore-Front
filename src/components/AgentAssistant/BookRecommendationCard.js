import React from 'react';
import StoreIcon from '../StoreIcon';

const getCurrentPrice = (book) => book.discount > 0
  ? Math.floor(book.price * (100 - book.discount) / 100)
  : book.price;

const BookRecommendationCard = ({ book, onOpen, onAddToCart }) => {
  const currentPrice = getCurrentPrice(book);
  const unavailable = book.stock <= 0 || book.status === 0;

  return (
    <article className="agent-book-card">
      <button className="agent-book-main" type="button" onClick={() => onOpen(book.id)}>
        <div className="agent-book-cover">
          {book.cover_url
            ? <img src={book.cover_url} alt="" />
            : <StoreIcon name="brand" size={23} />}
        </div>
        <div className="agent-book-copy">
          <strong>{book.title}</strong>
          <span>{book.author || '作者未知'}</span>
          {book.reason && <p>{book.reason}</p>}
          <div className="agent-book-price">
            <b>¥{currentPrice}</b>
            {currentPrice !== book.price && <del>¥{book.price}</del>}
          </div>
        </div>
      </button>
      <button
        className="agent-book-add"
        type="button"
        disabled={unavailable}
        onClick={() => onAddToCart(book)}
      >
        {unavailable ? '暂时缺货' : <><StoreIcon name="cart" size={16} /> 加入购物车</>}
      </button>
    </article>
  );
};

export default BookRecommendationCard;
