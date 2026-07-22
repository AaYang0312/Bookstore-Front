import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import StoreIcon from '../components/StoreIcon';
import './OrderHistoryPage.css';

const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

const statusMap = {
  0: { text: '待支付', key: 'pending', icon: 'clock' },
  1: { text: '已支付', key: 'paid', icon: 'check' },
  2: { text: '已取消', key: 'cancelled', icon: 'close' }
};

const OrderHistoryPage = () => {
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/order/list`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.code === 0) {
        let ordersArray = [];

        if (data.data && data.data.orders) {
          ordersArray = Array.isArray(data.data.orders) ? data.data.orders : [];
        } else if (Array.isArray(data.data)) {
          ordersArray = data.data;
        }

        setOrders(ordersArray);
      } else {
        setError(data.message || '获取订单失败');
      }
    } catch (requestError) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [user, userLoading, navigate, fetchOrders]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN');
  };

  const formatPrice = (price) => {
    const amount = Number(price);
    return Number.isFinite(amount) ? amount.toFixed(2) : '0.00';
  };

  if (userLoading || (user && loading)) {
    return (
      <main className="order-history-page">
        <div className="order-history-container">
          <div className="order-loading" aria-live="polite" aria-label="正在加载订单">
            <div className="order-loading-heading"><span /><strong /><i /></div>
            {[0, 1, 2].map((item) => <div className="order-loading-card" key={item}><span /><i /><strong /></div>)}
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="order-history-page">
      <div className="order-history-container">
        <header className="order-page-header">
          <div>
            <span className="section-eyebrow">Order archive</span>
            <h1>我的订单</h1>
            <p>每一本抵达书架的书，都从这里留下记录。</p>
          </div>
          <div className="order-count" aria-label={`共 ${orders.length} 笔订单`}>
            <span><StoreIcon name="package" size={20} /></span>
            <strong>{orders.length}</strong>
            <small>笔订单</small>
          </div>
        </header>

        {error ? (
          <section className="order-state-card order-error" role="alert">
            <span className="order-state-icon"><StoreIcon name="refresh" size={27} /></span>
            <span className="section-eyebrow">暂时无法读取</span>
            <h2>订单记录没有加载成功</h2>
            <p>{error}</p>
            <button type="button" className="order-primary-btn" onClick={fetchOrders}>
              重新加载<StoreIcon name="refresh" size={17} />
            </button>
          </section>
        ) : orders.length === 0 ? (
          <section className="order-state-card order-empty">
            <span className="order-state-icon"><StoreIcon name="package" size={30} /></span>
            <span className="section-eyebrow">Your first chapter</span>
            <h2>还没有订单记录</h2>
            <p>去挑一本喜欢的书，开启你的第一笔阅读收藏。</p>
            <button type="button" className="order-primary-btn" onClick={() => navigate('/#books')}>
              去逛书城<StoreIcon name="arrowRight" size={17} />
            </button>
          </section>
        ) : (
          <section className="orders-list" aria-label="订单列表">
            {orders.map((order, orderIndex) => {
              const statusInfo = statusMap[order.status] || { text: '未知状态', key: 'unknown', icon: 'package' };
              const items = Array.isArray(order.order_items) ? order.order_items : [];

              return (
                <article
                  key={order.id}
                  className="order-card"
                  style={{ '--order-delay': `${Math.min(orderIndex, 6) * 38}ms` }}
                >
                  <header className="order-card-header">
                    <div className="order-reference">
                      <span>订单编号</span>
                      <strong>{order.order_no || `#${order.id}`}</strong>
                      <time dateTime={order.created_at || undefined}>{formatDate(order.created_at)}</time>
                    </div>
                    <span className={`order-status order-status-${statusInfo.key}`}>
                      <StoreIcon name={statusInfo.icon} size={15} />
                      {statusInfo.text}
                    </span>
                  </header>

                  <div className="order-items">
                    {items.map((item) => (
                      <div key={item.id} className="order-item">
                        <div className="order-item-cover">
                          {item.book?.cover_url && (
                            <img
                              src={item.book.cover_url}
                              alt={`《${item.book?.title || '图书'}》封面`}
                              loading="lazy"
                              onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          <span className="order-cover-fallback"><StoreIcon name="brand" size={25} /></span>
                        </div>
                        <div className="order-item-info">
                          <h3>{item.book?.title || '图书信息暂缺'}</h3>
                          <p>{item.book?.author || '作者信息暂缺'}</p>
                          <span>数量 × {item.quantity}</span>
                        </div>
                        <div className="order-item-price">
                          <strong>¥{formatPrice(item.subtotal)}</strong>
                          <span>单价 ¥{formatPrice(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <footer className="order-card-footer">
                    <div className="order-payment-meta">
                      <StoreIcon name={order.is_paid ? 'check' : 'clock'} size={17} />
                      <span>{order.is_paid && order.payment_time ? `支付于 ${formatDate(order.payment_time)}` : '等待完成支付'}</span>
                    </div>
                    <div className="order-total">
                      <span>订单合计</span>
                      <strong>¥{formatPrice(order.total_amount)}</strong>
                    </div>
                  </footer>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default OrderHistoryPage;
