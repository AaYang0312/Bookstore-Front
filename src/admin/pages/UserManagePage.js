import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';
import { DemoNotice, EmptyState, LoadingState, PageHeading, SearchField, StatusBadge, Table, formatDate } from '../components/AdminUI';

const UserManagePage = () => {
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState({ loading: true, rows: [], isDemo: false, warning: '' });
  useEffect(() => {
    setState((current) => ({ ...current, loading: true }));
    adminApi.users({ keyword }).then((result) => setState({ loading: false, rows: result.data, isDemo: result.isDemo, warning: result.warning || '' }));
  }, [keyword]);
  const toggleRole = async (row) => {
    const result = await adminApi.setUserAdmin(row.id, !row.is_admin);
    setState((current) => ({ ...current, isDemo: current.isDemo || result.isDemo, rows: current.rows.map((item) => item.id === row.id ? { ...item, ...result.data } : item) }));
  };
  const columns = [
    { key: 'username', label: '用户', render: (row) => <div className="admin-book-cell"><span className="admin-account-avatar">{(row.username || '用').slice(0, 1).toUpperCase()}</span><div className="admin-cell-primary"><strong>{row.username}</strong><small>用户 ID：{row.id}</small></div></div> },
    { key: 'email', label: '邮箱' },
    { key: 'phone', label: '手机号', render: (row) => row.phone || '—' },
    { key: 'created_at', label: '注册时间', render: (row) => formatDate(row.created_at) },
    { key: 'is_admin', label: '角色', render: (row) => <StatusBadge tone={row.is_admin ? 'success' : 'neutral'}>{row.is_admin ? '管理员' : '普通用户'}</StatusBadge> },
    { key: 'actions', label: '管理员权限', render: (row) => <button className={`admin-switch ${row.is_admin ? 'is-on' : ''}`} onClick={() => toggleRole(row)} aria-label="切换管理员权限" /> }
  ];
  return <div className="admin-page">
    <PageHeading eyebrow="Customers" title="用户管理" description="查看注册用户并分配后台管理员角色。" />
    <DemoNotice show={state.isDemo} message={state.warning} />
    <div className="admin-toolbar"><SearchField value={keyword} onChange={setKeyword} placeholder="搜索用户名、邮箱或手机号"/></div>
    <section className="admin-panel">{state.loading ? <LoadingState /> : state.rows.length ? <Table columns={columns} rows={state.rows} /> : <EmptyState title="没有找到用户" />}</section>
  </div>;
};

export default UserManagePage;
