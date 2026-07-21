import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../services/adminApi';
import { DemoNotice, LoadingState, PageHeading, StatusBadge, Table, formatDate, formatMoney } from '../components/AdminUI';

const dayLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '今天'];

const DashboardPage = () => {
  const [state, setState] = useState({ loading: true, data: null, isDemo: false, warning: '' });

  useEffect(() => {
    adminApi.dashboard()
      .then((result) => setState({ loading: false, data: result.data, isDemo: result.isDemo, warning: result.warning || '' }))
      .catch((error) => setState({ loading: false, data: null, isDemo: false, warning: error.message }));
  }, []);

  if (state.loading) return <div className="admin-page"><LoadingState /></div>;
  const data = state.data || {};
  const status = (value) => ({ 0: ['warning', '待支付'], 1: ['success', '已支付'], 2: ['neutral', '已取消'] }[value] || ['neutral', '未知']);
  const orderColumns = [
    { key: 'order_no', label: '订单编号', render: (row) => <div className="admin-cell-primary"><strong>{row.order_no}</strong><small>{formatDate(row.created_at)}</small></div> },
    { key: 'username', label: '用户' },
    { key: 'item_count', label: '商品', render: (row) => `${row.item_count || row.order_items?.length || 0} 件` },
    { key: 'total_amount', label: '金额', render: (row) => <strong>{formatMoney(row.total_amount)}</strong> },
    { key: 'status', label: '状态', render: (row) => <StatusBadge tone={status(row.status)[0]}>{status(row.status)[1]}</StatusBadge> }
  ];

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Overview" title="早上好，欢迎回来" description="这里汇总了书城今天最值得关注的数据。" />
      <DemoNotice show={state.isDemo} message={state.warning} />
      <section className="admin-stats">
        <article className="admin-stat-card"><span>图书总数</span><strong>{data.book_count || 0}</strong><small>当前收录图书</small></article>
        <article className="admin-stat-card" style={{ '--stat-color': '#34c759' }}><span>销售收入</span><strong>{formatMoney(data.revenue)}</strong><small>已支付订单合计</small></article>
        <article className="admin-stat-card" style={{ '--stat-color': '#af52de' }}><span>注册用户</span><strong>{data.user_count || 0}</strong><small>累计用户数量</small></article>
        <article className="admin-stat-card" style={{ '--stat-color': '#ff9f0a' }}><span>待处理事项</span><strong>{(data.low_stock_count || 0) + (data.pending_order_count || 0)}</strong><small>{data.low_stock_count || 0} 本低库存 · {data.pending_order_count || 0} 个待支付</small></article>
      </section>
      <section className="admin-dashboard-grid">
        <article className="admin-panel">
          <header className="admin-panel-header"><div><h2>近七日销售趋势</h2><p>订单销售额走势</p></div><StatusBadge tone="success">稳定增长</StatusBadge></header>
          <div className="admin-panel-body">
            <div className="admin-chart">
              {(data.sales_trend || []).map((value, index) => <div className="admin-chart-column" key={dayLabels[index]}><i style={{ height: `${Math.max(8, value)}%` }} /><span>{dayLabels[index]}</span></div>)}
            </div>
          </div>
        </article>
        <article className="admin-panel">
          <header className="admin-panel-header"><div><h2>热销图书</h2><p>按累计销量排序</p></div><Link className="admin-panel-link" to="/admin/books">全部图书</Link></header>
          <div className="admin-panel-body">
            <ol className="admin-ranking">{(data.top_books || []).map((book, index) => <li key={book.id}><b>{index + 1}</b><strong>{book.title}</strong><span>{book.sale || 0} 本</span></li>)}</ol>
          </div>
        </article>
        <article className="admin-panel">
          <header className="admin-panel-header"><div><h2>最近订单</h2><p>最新产生的订单记录</p></div><Link className="admin-panel-link" to="/admin/orders">查看全部</Link></header>
          {(data.recent_orders || []).length ? <Table columns={orderColumns} rows={data.recent_orders || []} /> : <div className="admin-state"><p>暂无订单</p></div>}
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
