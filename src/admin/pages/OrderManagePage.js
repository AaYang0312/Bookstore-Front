import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';
import { DemoNotice, EmptyState, LoadingState, PageHeading, SearchField, StatusBadge, Table, formatDate, formatMoney } from '../components/AdminUI';

const statusMeta = { 0: ['warning', '待支付'], 1: ['success', '已支付'], 2: ['neutral', '已取消'] };

const OrderManagePage = () => {
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [state, setState] = useState({ loading: true, rows: [], isDemo: false, warning: '' });
  useEffect(() => {
    setState((current) => ({ ...current, loading: true }));
    adminApi.orders(filters).then((result) => setState({ loading: false, rows: result.data, isDemo: result.isDemo, warning: result.warning || '' }));
  }, [filters]);
  const changeStatus = async (row, status) => {
    const result = await adminApi.setOrderStatus(row.id, Number(status));
    setState((current) => ({ ...current, isDemo: current.isDemo || result.isDemo, rows: current.rows.map((item) => item.id === row.id ? { ...item, ...result.data } : item) }));
  };
  const columns = [
    { key: 'order_no', label: '订单', render: (row) => <div className="admin-cell-primary"><strong>{row.order_no}</strong><small>{formatDate(row.created_at)}</small></div> },
    { key: 'username', label: '下单用户', render: (row) => row.username || row.user?.username || `用户 #${row.user_id}` },
    { key: 'item_count', label: '商品', render: (row) => `${row.item_count || row.order_items?.length || 0} 件` },
    { key: 'total_amount', label: '订单金额', render: (row) => <strong>{formatMoney(row.total_amount)}</strong> },
    { key: 'status', label: '当前状态', render: (row) => <StatusBadge tone={(statusMeta[row.status] || statusMeta[2])[0]}>{(statusMeta[row.status] || statusMeta[2])[1]}</StatusBadge> },
    { key: 'actions', label: '修改状态', render: (row) => <select className="admin-select" value={row.status} onChange={(e) => changeStatus(row, e.target.value)}><option value="0">待支付</option><option value="1">已支付</option><option value="2">已取消</option></select> }
  ];
  return <div className="admin-page">
    <PageHeading eyebrow="Orders" title="订单管理" description="查询订单并处理支付和取消状态。" />
    <DemoNotice show={state.isDemo} message={state.warning} />
    <div className="admin-toolbar"><SearchField value={filters.keyword} onChange={(keyword) => setFilters((v) => ({ ...v, keyword }))} placeholder="搜索订单编号或用户名"/><select className="admin-select" value={filters.status} onChange={(e) => setFilters((v) => ({ ...v, status: e.target.value }))}><option value="">全部状态</option><option value="0">待支付</option><option value="1">已支付</option><option value="2">已取消</option></select></div>
    <section className="admin-panel">{state.loading ? <LoadingState /> : state.rows.length ? <Table columns={columns} rows={state.rows} /> : <EmptyState title="没有找到订单" />}</section>
  </div>;
};

export default OrderManagePage;
