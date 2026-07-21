import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';
import { DemoNotice, EmptyState, Field, LoadingState, Modal, PageHeading, PrimaryButton, SearchField, SecondaryButton, StatusBadge, Table, formatMoney } from '../components/AdminUI';

const blankBook = { title: '', author: '', isbn: '', category_name: '', price: '', stock: '', sale: 0, status: 1, cover_url: '' };

const BookManagePage = () => {
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  const [state, setState] = useState({ loading: true, rows: [], isDemo: false, warning: '' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setState((current) => ({ ...current, loading: true }));
    adminApi.books(filters).then((result) => setState({ loading: false, rows: result.data, isDemo: result.isDemo, warning: result.warning || '' }));
  }, [filters]);

  const toggleStatus = async (book) => {
    const result = await adminApi.setBookStatus(book.id, book.status === 1 ? 0 : 1);
    setState((current) => ({ ...current, isDemo: current.isDemo || result.isDemo, rows: current.rows.map((row) => row.id === book.id ? { ...row, ...result.data } : row) }));
  };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    const payload = { ...editing, price: Number(editing.price), stock: Number(editing.stock), status: Number(editing.status) };
    const result = await adminApi.saveBook(payload);
    setState((current) => ({ ...current, isDemo: current.isDemo || result.isDemo, rows: payload.id ? current.rows.map((row) => row.id === payload.id ? result.data : row) : [result.data, ...current.rows] }));
    setSaving(false); setEditing(null);
  };
  const columns = [
    { key: 'title', label: '图书', render: (row) => <div className="admin-book-cell"><span className="admin-book-cover">{row.cover_url ? <img src={row.cover_url} alt="" /> : '书'}</span><div className="admin-cell-primary"><strong>{row.title}</strong><small>{row.author || '未知作者'} · {row.isbn || '无 ISBN'}</small></div></div> },
    { key: 'category_name', label: '分类', render: (row) => row.category_name || row.type || '未分类' },
    { key: 'price', label: '价格', render: (row) => <strong>{formatMoney(row.price)}</strong> },
    { key: 'stock', label: '库存', render: (row) => <span className={row.stock < 10 ? 'admin-stock-low' : ''}>{row.stock} 本</span> },
    { key: 'sale', label: '销量', render: (row) => `${row.sale || 0} 本` },
    { key: 'status', label: '状态', render: (row) => <StatusBadge tone={row.status === 1 ? 'success' : 'neutral'}>{row.status === 1 ? '已上架' : '已下架'}</StatusBadge> },
    { key: 'actions', label: '操作', render: (row) => <><button className="admin-text-button" onClick={() => setEditing({ ...row })}>编辑</button><button className="admin-text-button" onClick={() => toggleStatus(row)}>{row.status === 1 ? '下架' : '上架'}</button></> }
  ];

  return (
    <div className="admin-page">
      <PageHeading eyebrow="Catalog" title="图书管理" description="维护图书资料、价格、库存和上架状态。" action={<PrimaryButton onClick={() => setEditing({ ...blankBook })}>新增图书</PrimaryButton>} />
      <DemoNotice show={state.isDemo} message={state.warning} />
      <div className="admin-toolbar"><SearchField value={filters.keyword} onChange={(keyword) => setFilters((v) => ({ ...v, keyword }))} placeholder="搜索书名、作者或 ISBN"/><select className="admin-select" value={filters.status} onChange={(e) => setFilters((v) => ({ ...v, status: e.target.value }))}><option value="">全部状态</option><option value="1">已上架</option><option value="0">已下架</option></select></div>
      <section className="admin-panel">{state.loading ? <LoadingState /> : state.rows.length ? <Table columns={columns} rows={state.rows} /> : <EmptyState title="没有找到图书" />}</section>
      {editing && <Modal title={editing.id ? '编辑图书' : '新增图书'} description="保存后将同步到图书目录。" onClose={() => setEditing(null)}><form className="admin-form" onSubmit={submit}><div className="admin-form-grid">
        <Field label="书名"><input className="admin-input" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}/></Field>
        <Field label="作者"><input className="admin-input" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })}/></Field>
        <Field label="ISBN"><input className="admin-input" value={editing.isbn} onChange={(e) => setEditing({ ...editing, isbn: e.target.value })}/></Field>
        <Field label="分类"><input className="admin-input" value={editing.category_name || ''} onChange={(e) => setEditing({ ...editing, category_name: e.target.value })}/></Field>
        <Field label="价格"><input className="admin-input" type="number" min="0" required value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })}/></Field>
        <Field label="库存"><input className="admin-input" type="number" min="0" required value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })}/></Field>
        <Field label="上架状态"><select className="admin-select" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}><option value="1">立即上架</option><option value="0">暂不上架</option></select></Field>
        <Field label="封面地址"><input className="admin-input" value={editing.cover_url || ''} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })}/></Field>
      </div><div className="admin-form-actions"><SecondaryButton onClick={() => setEditing(null)}>取消</SecondaryButton><PrimaryButton type="submit" icon={null} disabled={saving}>{saving ? '保存中…' : '保存图书'}</PrimaryButton></div></form></Modal>}
    </div>
  );
};

export default BookManagePage;
