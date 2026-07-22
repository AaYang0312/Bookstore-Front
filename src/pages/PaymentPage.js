import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StoreIcon from '../components/StoreIcon';
import { useUser } from '../contexts/UserContext';
import { API_BASE } from '../config/api';
import './PaymentPage.css';

const paymentMethods = [
  { id: 'alipay', name: '支付宝', description: '使用支付宝账户安全付款', icon: 'wallet' },
  { id: 'wechat', name: '微信支付', description: '使用微信扫码或账户付款', icon: 'send' },
  { id: 'card', name: '银行卡', description: '支持常用借记卡与信用卡', icon: 'card' }
];

const formatMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
};

const PaymentStateCard = ({ tone = 'loading', title, description, action }) => (
  <main className="payment-page">
    <section className={`payment-state-card payment-state-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="payment-state-icon">
        <StoreIcon name={tone === 'error' ? 'refresh' : 'lock'} size={26} />
      </span>
      <span className="section-eyebrow">SECURE CHECKOUT</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {tone === 'loading' && <span className="payment-state-progress" aria-hidden="true"><i /></span>}
      {action}
    </section>
  </main>
);

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const successDialogRef = useRef(null);
  const paymentInFlightRef = useRef(false);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setLoadError('缺少订单编号，请从购物车重新结算。');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.code === 0) {
        setOrder(data.data);
      } else {
        setLoadError(data.message || '订单信息读取失败，请稍后重试。');
      }
    } catch (requestError) {
      setLoadError('网络连接异常，暂时无法读取订单信息。');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      navigate('/');
      return;
    }
    fetchOrderDetails();
  }, [user, userLoading, navigate, fetchOrderDetails]);

  useEffect(() => {
    if (!showSuccessModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => successDialogRef.current?.focus(), 0);
    const redirectTimer = window.setTimeout(() => navigate('/orders'), 5000);
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [showSuccessModal, navigate]);

  const handlePayment = async () => {
    if (!order || order.is_paid || paymentInFlightRef.current) return;

    paymentInFlightRef.current = true;
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/order/${order.id}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.code === 0) {
        setOrder((current) => ({ ...current, is_paid: true, status: 1 }));
        setShowSuccessModal(true);
      } else {
        setPaymentError(data.message || '支付没有完成，请检查订单后重试。');
      }
    } catch (requestError) {
      setPaymentError('网络连接异常，支付没有完成，请稍后重试。');
    } finally {
      paymentInFlightRef.current = false;
      setPaymentLoading(false);
    }
  };

  if (userLoading || (user && loading)) {
    return <PaymentStateCard title="正在准备支付信息" description="请稍候，我们正在核对订单与应付金额。" />;
  }

  if (!user) return null;

  if (loadError) {
    return (
      <PaymentStateCard
        tone="error"
        title="订单信息没有加载成功"
        description={loadError}
        action={
          <div className="payment-state-actions">
            <button type="button" className="payment-primary-button" onClick={fetchOrderDetails}>
              重新加载<StoreIcon name="refresh" size={17} />
            </button>
            <button type="button" className="payment-text-button" onClick={() => navigate('/orders')}>返回我的订单</button>
          </div>
        }
      />
    );
  }

  if (!order) {
    return (
      <PaymentStateCard
        tone="error"
        title="没有找到这笔订单"
        description="订单可能已被移除，请返回订单列表重新选择。"
        action={<button type="button" className="payment-primary-button" onClick={() => navigate('/orders')}>返回我的订单</button>}
      />
    );
  }

  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const totalBooks = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const selectedMethod = paymentMethods.find((method) => method.id === paymentMethod) || paymentMethods[0];

  return (
    <main className="payment-page">
      <div className="payment-container">
        <header className="payment-page-header">
          <div>
            <span className="section-eyebrow">SECURE CHECKOUT</span>
            <h1>确认支付</h1>
            <p>核对书单与金额，完成这段阅读旅程的最后一步。</p>
          </div>
          <span className={`payment-status-badge${order.is_paid ? ' is-paid' : ''}`}>
            <StoreIcon name={order.is_paid ? 'check' : 'clock'} size={16} />
            {order.is_paid ? '订单已支付' : '等待支付'}
          </span>
        </header>

        <ol className="payment-steps" aria-label="结算进度">
          <li className="is-complete"><span><StoreIcon name="check" size={13} /></span><div><strong>购物车</strong><small>书单已确认</small></div></li>
          <li className="is-active"><span>2</span><div><strong>确认支付</strong><small>核对订单信息</small></div></li>
          <li className={order.is_paid ? 'is-complete' : ''}><span>{order.is_paid ? <StoreIcon name="check" size={13} /> : '3'}</span><div><strong>完成支付</strong><small>订单进入处理中</small></div></li>
        </ol>

        <div className="payment-layout">
          <section className="payment-order-card" aria-labelledby="payment-order-title">
            <header className="payment-card-header">
              <div>
                <span className="payment-card-eyebrow">ORDER DETAILS</span>
                <h2 id="payment-order-title">订单明细</h2>
              </div>
              <div className="payment-order-reference">
                <span>订单编号</span>
                <strong>{order.order_no || `#${order.id}`}</strong>
              </div>
            </header>

            <div className="payment-order-items">
              {items.map((item, index) => (
                <article className="payment-order-item" key={item.id || `${item.book_id}-${index}`}>
                  <div className="payment-book-cover">
                    {item.book?.cover_url && (
                      <img
                        src={item.book.cover_url}
                        alt={`《${item.book?.title || '图书'}》封面`}
                        onError={(event) => { event.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span><StoreIcon name="brand" size={24} /></span>
                  </div>
                  <div className="payment-book-info">
                    <h3>{item.book?.title || '图书信息暂缺'}</h3>
                    <p>{item.book?.author || '作者信息暂缺'}</p>
                    <small>数量 × {item.quantity}</small>
                  </div>
                  <div className="payment-book-price">
                    <strong>¥{formatMoney(item.subtotal)}</strong>
                    <span>单价 ¥{formatMoney(item.price)}</span>
                  </div>
                </article>
              ))}
            </div>

            <footer className="payment-order-footer">
              <span>共 {totalBooks} 本图书</span>
              <span>书款小计 <strong>¥{formatMoney(order.total_amount)}</strong></span>
            </footer>
          </section>

          <aside className="payment-checkout-card" aria-label="支付摘要">
            <div className="payment-amount-block">
              <span>本次应付</span>
              <strong><small>¥</small>{formatMoney(order.total_amount)}</strong>
              <p>免运费 · 金额已含全部书款</p>
            </div>

            <fieldset className="payment-methods" disabled={paymentLoading || order.is_paid}>
              <legend>选择支付方式</legend>
              <div className="payment-method-options">
                {paymentMethods.map((method) => (
                  <label className={`payment-method-option${paymentMethod === method.id ? ' is-selected' : ''}`} key={method.id}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    <span className="payment-method-icon"><StoreIcon name={method.icon} size={20} /></span>
                    <span className="payment-method-copy"><strong>{method.name}</strong><small>{method.description}</small></span>
                    <span className="payment-radio-mark" aria-hidden="true"><i /></span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="payment-summary-lines">
              <div><span>商品金额</span><strong>¥{formatMoney(order.total_amount)}</strong></div>
              <div><span>配送费用</span><strong>免运费</strong></div>
              <div className="payment-summary-total"><span>应付总额</span><strong>¥{formatMoney(order.total_amount)}</strong></div>
            </div>

            {paymentError && (
              <div className="payment-inline-error" role="alert">
                <StoreIcon name="refresh" size={17} />
                <span>{paymentError}</span>
              </div>
            )}

            <button
              type="button"
              className="payment-pay-button"
              onClick={handlePayment}
              disabled={paymentLoading || order.is_paid}
            >
              {paymentLoading ? (
                <><span className="payment-button-spinner" aria-hidden="true" />正在处理支付</>
              ) : order.is_paid ? (
                <><StoreIcon name="check" size={18} />订单已支付</>
              ) : (
                <><StoreIcon name="lock" size={17} />使用{selectedMethod.name}支付 ¥{formatMoney(order.total_amount)}</>
              )}
            </button>
            <button type="button" className="payment-later-button" onClick={() => navigate('/orders')}>稍后支付，返回订单</button>

            <div className="payment-assurance">
              <StoreIcon name="shield" size={17} />
              <span>支付请求已加密，重复点击不会重复扣减库存。</span>
            </div>
          </aside>
        </div>
      </div>

      {showSuccessModal && (
        <div className="payment-success-overlay">
          <section
            className="payment-success-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-success-title"
            tabIndex="-1"
            ref={successDialogRef}
          >
            <div className="payment-success-mark" aria-hidden="true">
              <span><StoreIcon name="check" size={30} /></span>
              <i /><i /><i />
            </div>
            <span className="payment-card-eyebrow">PAYMENT COMPLETE</span>
            <h2 id="payment-success-title">支付成功</h2>
            <p>这笔订单已经确认，我们会尽快为您准备书籍。</p>

            <div className="payment-success-receipt">
              <div><span>订单编号</span><strong>{order.order_no || `#${order.id}`}</strong></div>
              <div><span>支付方式</span><strong>{selectedMethod.name}</strong></div>
              <div className="payment-success-total"><span>支付金额</span><strong>¥{formatMoney(order.total_amount)}</strong></div>
            </div>

            <div className="payment-success-actions">
              <button type="button" className="payment-primary-button" onClick={() => navigate('/orders')}>
                查看我的订单<StoreIcon name="arrowRight" size={17} />
              </button>
              <button type="button" className="payment-text-button" onClick={() => navigate('/')}>继续逛书城</button>
            </div>
            <div className="payment-redirect-note" role="status">
              <span><i /></span>
              5 秒后自动前往我的订单
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default PaymentPage;
