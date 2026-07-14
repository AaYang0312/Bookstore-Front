import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const paymentInFlightRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (!orderId) {
      setError('缺少订单ID，请从购物车重新结算');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/v1/order/${orderId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.code === 0) {
          setOrder(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('获取订单信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, navigate]);

  const handlePayment = async () => {
    if (!order || paymentInFlightRef.current) return;

    paymentInFlightRef.current = true;
    setPaymentLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/order/${order.id}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.code === 0) {
        setShowSuccessModal(true);
        // 3秒后跳转到订单列表
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('支付失败');
    } finally {
      paymentInFlightRef.current = false;
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载支付信息...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate('/cart')} className="back-btn">
            返回购物车
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="payment-page">
        <div className="error-container">
          <p className="error-message">订单信息不存在</p>
          <button onClick={() => navigate('/cart')} className="back-btn">
            返回购物车
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <h2>订单支付</h2>
          <p className="order-no">订单号：{order.order_no}</p>
        </div>

        <div className="payment-content">
          <div className="order-summary">
            <h3>订单信息</h3>
            <div className="order-items">
              {order.order_items?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <h4>{item.book?.title}</h4>
                    <p>{item.book?.author}</p>
                  </div>
                  <div className="item-details">
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">¥{item.price}</span>
                    <span className="item-subtotal">¥{item.subtotal}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>总计：</span>
              <span className="total-amount">¥{order.total_amount}</span>
            </div>
          </div>

          <div className="payment-methods">
            <h3>选择支付方式</h3>
            <div className="method-options">
              <label className="method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="alipay"
                  checked={paymentMethod === 'alipay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">💰</span>
                <span className="method-name">支付宝</span>
              </label>
              <label className="method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wechat"
                  checked={paymentMethod === 'wechat'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">💳</span>
                <span className="method-name">微信支付</span>
              </label>
              <label className="method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">🏦</span>
                <span className="method-name">银行卡</span>
              </label>
            </div>
          </div>

          <div className="payment-actions">
            <button onClick={() => navigate('/cart')} className="cancel-btn">
              取消支付
            </button>
            <button onClick={handlePayment} className="pay-btn" disabled={paymentLoading || order.is_paid}>
              {order.is_paid ? '订单已支付' : paymentLoading ? '支付处理中...' : `立即支付 ¥${order.total_amount}`}
            </button>
          </div>
        </div>
      </div>

      {/* 支付成功弹窗 */}
      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h3>支付成功！</h3>
            <p>订单号：{order.order_no}</p>
            <p>支付金额：¥{order.total_amount}</p>
            <p>正在跳转到订单列表...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage; 
