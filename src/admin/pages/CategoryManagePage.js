import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';
import { DemoNotice, EmptyState, Field, LoadingState, Modal, PageHeading, PrimaryButton, SecondaryButton, StatusBadge, Table } from '../components/AdminUI';

const blankCategory = { name: '', icon: '📚', description: '', sort: 0, is_active: true };

const CategoryManagePage = () => {
  const [state, setState] = useState({ loading: true, rows: [], isDemo: false, warning: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => { adminApi.categories().then((result) => setState({ loading: false, rows: result.data, isDemo: result.isDemo, warning: result.warning || '' })); }, []);
  const toggle = async (row) => {
    const result = await adminApi.setCategoryStatus(row.id, !row.is_active);
    setState((current) => ({ ...current, isDemo: current.isDemo || result.isDemo, rows: current.rows.map((item) => item.id === row.id ? { ...item, ...result.data } : item) }));
  };
  const submit = async (event) => {
    event.preventDefault();
    const result = await adminApi.saveCategory({ ...editing, sort: Number(editing.sort) });
    setState((current) => ({ ...current, isDemo: current.isDemo || result.isDemo, rows: editing.id ? current.rows.map((row) => row.id === editing.id ? result.data : row) : [...current.rows, result.data] }));
    setEditing(null);
  };
  const columns = [
    { key: 'name', label: '分类', render: (row) => <div className="admin-book-cell"><span className="admin-book-cover" style={{ width: 40, height: 40 }}>{row.icon || '📚'}</span><div className="admin-cell-primary"><strong>{row.name}</strong><small>{row.description || '暂无分类描述'}</small></div></div> },
    { key: 'book_count', label: '图书数量', render: (row) => `${row.book_count || 0} 本` },
    { key: 'sort', label: '排序', render: (row) => row.sort || 0 },
    { key: 'is_active', label: '状态', render: (row) => <StatusBadge tone={row.is_active ? 'success' : 'neutral'}>{row.is_active ? '已启用' : '已停用'}</StatusBadge> },
    { key: 'actions', label: '操作', render: (row) => <><button className="admin-text-button" onClick={() => setEditing({ ...row })}>编辑</button><button className={`admin-switch ${row.is_active ? 'is-on' : ''}`} onClick={() => toggle(row)} aria-label={row.is_active ? '停用分类' : '启用分类'} /></> }
  ];

  return <div className="admin-page">
    <PageHeading eyebrow="Taxonomy" title="分类管理" description="管理商城首页和图书目录使用的分类。" action={<PrimaryButton onClick={() => setEditing({ ...blankCategory })}>新增分类</PrimaryButton>} />
    <DemoNotice show={state.isDemo} message={state.warning} />
    <section className="admin-panel">{state.loading ? <LoadingState /> : state.rows.length ? <Table columns={columns} rows={state.rows} /> : <EmptyState title="还没有分类" description="新建第一个图书分类。" />}</section>
    {editing && <Modal title={editing.id ? '编辑分类' : '新增分类'} onClose={() => setEditing(null)}><form className="admin-form" onSubmit={submit}><div className="admin-form-grid">
      <Field label="分类名称"><input className="admin-input" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}/></Field>
      <Field label="图标"><input className="admin-input" value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}/></Field>
      <Field label="排序权重"><input className="admin-input" type="number" min="0" value={editing.sort} onChange={(e) => setEditing({ ...editing, sort: e.target.value })}/></Field>
      <Field label="状态"><select className="admin-select" value={String(editing.is_active)} onChange={(e) => setEditing({ ...editing, is_active: e.target.value === 'true' })}><option value="true">启用</option><option value="false">停用</option></select></Field>
      <label className="admin-form-field is-wide"><span>分类描述</span><textarea className="admin-textarea" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/></label>
    </div><div className="admin-form-actions"><SecondaryButton onClick={() => setEditing(null)}>取消</SecondaryButton><PrimaryButton type="submit" icon={null}>保存分类</PrimaryButton></div></form></Modal>}
  </div>;
};

export default CategoryManagePage;
