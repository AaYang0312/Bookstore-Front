import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import StoreIcon from '../components/StoreIcon';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();
  const { user } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [failedImages, setFailedImages] = useState({});
  const checkoutInFlightRef = useRef(false);
  const idempotencyKeyRef = useRef(null);

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(bookId);
    } else {
      updateQuantity(bookId, newQuantity);
    }
  };

  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }
    if (checkoutInFlightRef.current || items.length === 0) return;

    checkoutInFlightRef.current = true;
    setCheckoutLoading(true);
    setCheckoutError('');

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = window.crypto.randomUUID();
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/order/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idempotency_key: idempotencyKeyRef.current,
          items: items.map(item => ({
            book_id: item.id,
            quantity: item.quantity,
            price: item.currentPrice
          }))
        })
      });

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(data.message || '创建订单失败');
      }

      clearCart();
      navigate(`/payment/${data.data.id}`);
    } catch (error) {
      setCheckoutError(error.message || '创建订单失败，请稍后重试');
    } finally {
      checkoutInFlightRef.current = false;
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon"><StoreIcon name="cart" size={30} /></div>
            <span className="section-eyebrow">MY CART</span>
            <h1 className="empty-cart-title">购物车还是空的</h1>
            <p className="empty-cart-subtext">把想读的书放进来，慢慢组成你的下一段阅读旅程。</p>
            <button type="button" className="empty-cart-action" onClick={() => navigate('/')}>
              去书城看看 <StoreIcon name="arrowRight" size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-page-heading">
          <div>
            <span className="section-eyebrow">MY CART</span>
            <h1>购物车</h1>
            <p>核对你的书单和数量，准备开启下一段阅读。</p>
          </div>
          <span className="cart-count-label">{getTotalItems()} 本书</span>
        </div>
        
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header" aria-hidden="true">
              <span>图书信息</span>
              <span>单价</span>
              <span>数量</span>
              <span>小计</span>
              <span>操作</span>
            </div>
            
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-image">
                      {item.imageUrl && !failedImages[item.id] ? (
                        <img
                          src={item.imageUrl}
                          alt={`${item.title}封面`}
                          onError={() => setFailedImages((current) => ({ ...current, [item.id]: true }))}
                        />
                      ) : <StoreIcon name="brand" size={28} />}
                    </div>
                    <div className="item-details">
                      <button type="button" className="item-title" onClick={() => navigate(`/book/${item.id}`)}>{item.title}</button>
                      <p className="item-author">{item.author}</p>
                    </div>
                  </div>
                  <div className="item-price"><span>单价</span>¥{item.currentPrice}</div>
                  <div className="item-quantity">
                    <button 
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      aria-label={`减少《${item.title}》数量`}
                    >
                      <StoreIcon name="minus" size={16} />
                    </button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="quantity-input"
                      aria-label={`《${item.title}》数量`}
                      min="1"
                      max={item.stock}
                    />
                    <button 
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      aria-label={`增加《${item.title}》数量`}
                    >
                      <StoreIcon name="plus" size={16} />
                    </button>
                  </div>
                  <div className="item-subtotal"><span>小计</span>¥{item.currentPrice * item.quantity}</div>
                  <div className="item-action">
                    <button 
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`移除《${item.title}》`}
                    >
                      <StoreIcon name="trash" size={19} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-summary">
            <span className="section-eyebrow">ORDER SUMMARY</span>
            <h2 className="summary-title">订单摘要</h2>
            <div className="summary-items">
              <div className="summary-item">
                <span>商品金额</span>
                <span>¥{totalPrice}</span>
              </div>

              <div className="summary-item">
                <span>运费</span>
                <span>免运费</span>
              </div>
              <div className="summary-total">
                <span>应付总额</span>
                <span>¥{totalPrice}</span>
              </div>
            </div>
            <button 
              type="button"
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? '正在创建订单...' : `去结算（${getTotalItems()} 本）`}
            </button>
            {checkoutError && <p className="cart-checkout-error" role="alert">{checkoutError}</p>}
            <p className="summary-note">
              已选择 {items.length} 种图书，共 {getTotalItems()} 本
            </p>
            <div className="summary-assurance">
              <StoreIcon name="shield" size={17} />
              <span>库存与价格将在提交订单时再次确认</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 
