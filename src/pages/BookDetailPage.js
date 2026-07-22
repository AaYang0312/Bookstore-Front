import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { CartAnimationContext } from '../contexts/CartAnimationContext';
import { useCart } from '../contexts/CartContext';
import StoreIcon from '../components/StoreIcon';
import './BookDetailPage.css';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerCartAnimation } = useContext(CartAnimationContext);
  const { addToCart, clearCart, updateQuantity } = useCart();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [coverFailed, setCoverFailed] = useState(false);

  const fetchBookDetail = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/book/detail/${id}`);
      const data = await response.json();
      
      if (data.code === 0) {
        setBook(data.data);
      } else {
        setError('获取书籍详情失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetail();
  }, [fetchBookDetail]);

  const handleAddToCart = (e) => {
    if (book && book.stock > 0) {
      // 获取按钮位置用于动画
      const rect = e.currentTarget.getBoundingClientRect();
      const startPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      triggerCartAnimation(startPosition);
      // 添加指定数量的商品到购物车
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: book.id,
          title: book.title,
          author: book.author,
          price: book.price,
          currentPrice: discountedPrice,
          imageUrl: book.cover_url,
          stock: book.stock
        });
      }
    }
  };

  const handleBuyNow = () => {
    if (book && book.stock > 0) {
      // 清空购物车，只添加当前书籍
      clearCart();
      
      // 添加商品到购物车
      addToCart({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        currentPrice: discountedPrice,
        imageUrl: book.cover_url,
        stock: book.stock
      });
      
      // 更新数量为选择的数量
      updateQuantity(book.id, quantity);
      
      // 跳转到结算页面
      navigate('/payment');
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= book.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="detail-state-container">
          <div className="loading-spinner"></div>
          <p>正在展开这本书...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <div className="detail-state-container">
          <div className="detail-state-icon"><StoreIcon name="brand" size={28} /></div>
          <h1>暂时找不到这本书</h1>
          <p>{error || '书籍不存在'}</p>
          <button onClick={() => navigate('/')} className="back-button">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = Math.round(book.price * book.discount / 100);
  const hasDiscount = book.discount < 100;
  const outOfStock = book.stock <= 0;

  return (
    <div className="book-detail-page">
      <div className="detail-container">
        <nav className="detail-breadcrumb" aria-label="面包屑导航">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            <StoreIcon name="chevronLeft" size={17} /> 返回书城
          </button>
          <span aria-hidden="true">/</span>
          <span className="breadcrumb-current">{book.title}</span>
        </nav>

        <div className="book-detail-content">
          <div className="book-image-section">
            <div className="book-image-container">
              {book.cover_url && !coverFailed ? (
                <img
                  src={book.cover_url}
                  alt={`${book.title}封面`}
                  className="book-detail-image"
                  onError={() => setCoverFailed(true)}
                />
              ) : (
                <div className="book-placeholder">
                <StoreIcon name="brand" size={52} />
                <p className="placeholder-text">暂无封面</p>
                </div>
              )}
              {outOfStock && <div className="out-of-stock-badge">缺货</div>}
              {hasDiscount && <div className="discount-badge">省 {100 - book.discount}%</div>}
            </div>
          </div>

          <div className="book-info-section">
            <div className="book-header">
              <span className="section-eyebrow">BOOK DETAILS</span>
              <div className="book-type-badge">{book.type}</div>
              <h1 className="book-title">{book.title}</h1>
              <p className="book-author">作者：{book.author}</p>
            </div>

            <div className="book-price-section">
              <div className="price-info">
                {hasDiscount ? (
                  <>
                    <span className="current-price">¥{discountedPrice}</span>
                    <span className="original-price">¥{book.price}</span>
                    <span className="discount-text"><StoreIcon name="tag" size={15} /> 节省 ¥{book.price - discountedPrice}</span>
                  </>
                ) : (
                  <span className="current-price">¥{book.price}</span>
                )}
              </div>
            </div>

            <div className="book-stock-section">
              <div className="stock-info">
                <span className={`stock-status ${outOfStock ? 'out-of-stock' : 'in-stock'}`}>
                  {outOfStock ? '暂时缺货' : `库存：${book.stock} 本`}
                </span>
                {!outOfStock && (
                  <div className="quantity-selector">
                    <span className="quantity-label">数量</span>
                    <button 
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label="减少数量"
                    >
                      <StoreIcon name="minus" size={16} />
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button 
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= book.stock}
                      aria-label="增加数量"
                    >
                      <StoreIcon name="plus" size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="book-description">
              <h3>图书简介</h3>
              <p>{book.description || '暂无简介'}</p>
            </div>

            <div className="book-actions">
              <button 
                className={`add-to-cart-btn ${outOfStock ? 'disabled' : ''}`}
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                {outOfStock ? '暂时缺货' : <><StoreIcon name="cart" size={19} /> 加入购物车（{quantity}）</>}
              </button>
              <button 
                className={`buy-now-btn ${outOfStock ? 'disabled' : ''}`}
                onClick={handleBuyNow}
                disabled={outOfStock}
              >
                {outOfStock ? '暂时缺货' : <>立即购买 <StoreIcon name="arrowRight" size={18} /></>}
              </button>
            </div>

            <div className="book-meta">
              <h2>出版信息</h2>
              <div className="meta-item">
                <span className="meta-label">ISBN：</span>
                <span className="meta-value">{book.isbn || '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">出版社：</span>
                <span className="meta-value">{book.publisher || '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">出版日期：</span>
                <span className="meta-value">{book.publish_date || '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">页数：</span>
                <span className="meta-value">{book.pages ? `${book.pages}页` : '暂无'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">语言：</span>
                <span className="meta-value">{book.language || '中文'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">装帧：</span>
                <span className="meta-value">{book.format || '平装'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
