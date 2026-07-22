import React, { useEffect, useId, useRef } from 'react';
import AdminIcon from './AdminIcon';

export const PageHeading = ({ eyebrow, title, description, action }) => (
  <div className="admin-page-heading">
    <div>
      {eyebrow && <span className="admin-eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {action}
  </div>
);

export const DemoNotice = ({ show, message }) => show ? (
  <div className="admin-demo-notice" role="status">
    <span className="admin-demo-dot" />
    <span><strong>界面预览模式</strong> 当前显示演示数据；管理端接口可用后会自动读取真实数据。</span>
    {message && <span className="admin-demo-reason">{message}</span>}
  </div>
) : null;

export const SearchField = ({ value, onChange, placeholder = '搜索' }) => (
  <label className="admin-search-field">
    <AdminIcon name="search" size={18} />
    <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
  </label>
);

export const PrimaryButton = ({ children, onClick, icon = 'plus', type = 'button', disabled }) => (
  <button type={type} className="admin-button admin-button-primary" onClick={onClick} disabled={disabled}>
    {icon && <AdminIcon name={icon} size={17} />}{children}
  </button>
);

export const SecondaryButton = ({ children, onClick, icon, type = 'button' }) => (
  <button type={type} className="admin-button admin-button-secondary" onClick={onClick}>
    {icon && <AdminIcon name={icon} size={17} />}{children}
  </button>
);

export const StatusBadge = ({ tone = 'neutral', children }) => (
  <span className={`admin-status admin-status-${tone}`}><span />{children}</span>
);

export const LoadingState = () => (
  <div className="admin-state"><span className="admin-loader"/><p>正在加载数据…</p></div>
);

export const EmptyState = ({ title = '暂无数据', description = '调整筛选条件后再试试。' }) => (
  <div className="admin-state admin-empty-state"><div><AdminIcon name="inventory" size={28} /></div><h3>{title}</h3><p>{description}</p></div>
);

export const ErrorState = ({ message = '管理接口暂时不可用，请稍后重试。' }) => (
  <div className="admin-state admin-empty-state"><div><AdminIcon name="alert" size={28} /></div><h3>数据加载失败</h3><p>{message}</p></div>
);

export const Table = ({ columns, rows, rowKey = 'id' }) => (
  <div className="admin-table-scroll">
    <table className="admin-table">
      <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row[rowKey]}>{columns.map((column) => <td key={column.key} data-label={column.label}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Modal = ({ title, description, children, onClose }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const modal = modalRef.current;
    const firstControl = modal?.querySelector('input, select, textarea') || modal?.querySelector('button');
    (firstControl || modal)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'Tab' && modal) {
        const controls = [...modal.querySelectorAll('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])')]
          .filter((element) => !element.disabled && element.getAttribute('aria-hidden') !== 'true');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, []);

  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section ref={modalRef} tabIndex="-1" className="admin-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
        <header><div><h2 id={titleId}>{title}</h2>{description && <p>{description}</p>}</div><button className="admin-icon-button" onClick={onClose} aria-label="关闭"><AdminIcon name="close" /></button></header>
        {children}
      </section>
    </div>
  );
};

export const Field = ({ label, children, hint }) => (
  <label className="admin-form-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
);

export const formatDate = (value) => value ? new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—';
export const formatMoney = (value) => `¥${Number(value || 0).toLocaleString('zh-CN')}`;
