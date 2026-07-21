import React, { useEffect, useState } from 'react';
import adminApi from '../services/adminApi';
import AdminIcon from '../components/AdminIcon';
import { DemoNotice, EmptyState, ErrorState, Field, LoadingState, Modal, PageHeading, PrimaryButton, SecondaryButton, StatusBadge } from '../components/AdminUI';

const blankItem = { title: '', description: '', image_url: '', link_url: '/', sort_order: 0, is_active: true };

const CarouselManagePage = () => {
  const [state, setState] = useState({ loading: true, rows: [], isDemo: false, warning: '', error: '' });
  const [editing, setEditing] = useState(null);
  useEffect(() => {
    adminApi.carousel()
      .then((result) => setState({ loading: false, rows: result.data, isDemo: result.isDemo, warning: result.warning || '', error: '' }))
      .catch((error) => setState({ loading: false, rows: [], isDemo: false, warning: '', error: error.message }));
  }, []);
  const toggle = async (row) => {
    try {
      const result = await adminApi.setCarouselStatus(row.id, !row.is_active);
      setState((current) => ({ ...current, error: '', isDemo: current.isDemo || result.isDemo, rows: current.rows.map((item) => item.id === row.id ? { ...item, ...result.data } : item) }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    try {
      const result = await adminApi.saveCarousel({ ...editing, sort_order: Number(editing.sort_order) });
      setState((current) => ({ ...current, error: '', isDemo: current.isDemo || result.isDemo, rows: editing.id ? current.rows.map((row) => row.id === editing.id ? result.data : row) : [...current.rows, result.data] }));
      setEditing(null);
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  };

  return <div className="admin-page">
    <PageHeading eyebrow="Homepage" title="轮播图管理" description="管理商城首页的主视觉内容、跳转地址和展示顺序。" action={<PrimaryButton onClick={() => setEditing({ ...blankItem })}>新增轮播图</PrimaryButton>} />
    <DemoNotice show={state.isDemo} message={state.warning} />
    {state.loading ? <section className="admin-panel"><LoadingState /></section> : state.error ? <section className="admin-panel"><ErrorState message={state.error} /></section> : state.rows.length ? <section className="admin-carousel-grid">
      {state.rows.map((row) => <article className="admin-carousel-card" key={row.id}>
        <div className="admin-carousel-preview">{row.image_url && <img src={row.image_url} alt=""/>}<div className="admin-carousel-copy"><h3>{row.title}</h3><p>{row.description}</p></div></div>
        <div className="admin-carousel-meta"><div><StatusBadge tone={row.is_active ? 'success' : 'neutral'}>{row.is_active ? '展示中' : '已停用'}</StatusBadge><small>排序 {row.sort_order || 0} · {row.link_url || '无跳转'}</small></div><div className="admin-carousel-actions"><button className="admin-icon-button" onClick={() => setEditing({ ...row })} aria-label="编辑"><AdminIcon name="edit" size={17}/></button><button className={`admin-switch ${row.is_active ? 'is-on' : ''}`} onClick={() => toggle(row)} aria-label="切换展示状态" /></div></div>
      </article>)}
    </section> : <section className="admin-panel"><EmptyState title="还没有轮播图" description="新增一张首页主视觉。" /></section>}
    {editing && <Modal title={editing.id ? '编辑轮播图' : '新增轮播图'} onClose={() => setEditing(null)}><form className="admin-form" onSubmit={submit}><div className="admin-form-grid">
      <Field label="标题"><input className="admin-input" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}/></Field>
      <Field label="排序"><input className="admin-input" type="number" min="0" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })}/></Field>
      <label className="admin-form-field is-wide"><span>描述</span><textarea className="admin-textarea" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })}/></label>
      <label className="admin-form-field is-wide"><span>图片地址</span><input className="admin-input" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}/></label>
      <Field label="跳转地址"><input className="admin-input" value={editing.link_url || ''} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })}/></Field>
      <Field label="展示状态"><select className="admin-select" value={String(editing.is_active)} onChange={(e) => setEditing({ ...editing, is_active: e.target.value === 'true' })}><option value="true">展示</option><option value="false">停用</option></select></Field>
    </div><div className="admin-form-actions"><SecondaryButton onClick={() => setEditing(null)}>取消</SecondaryButton><PrimaryButton type="submit" icon={null}>保存轮播图</PrimaryButton></div></form></Modal>}
  </div>;
};

export default CarouselManagePage;
