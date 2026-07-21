import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import AdminIcon from '../components/AdminIcon';
import '../styles/admin.css';

const navigation = [
  { to: '/admin', label: '数据概览', icon: 'dashboard', end: true },
  { to: '/admin/books', label: '图书管理', icon: 'books' },
  { to: '/admin/categories', label: '分类管理', icon: 'categories' },
  { to: '/admin/orders', label: '订单管理', icon: 'orders' },
  { to: '/admin/users', label: '用户管理', icon: 'users' },
  { to: '/admin/carousel', label: '轮播图管理', icon: 'carousel' }
];

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const current = navigation.find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to));

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`}>
        <Link to="/admin" className="admin-brand" onClick={() => setMenuOpen(false)}>
          <span className="admin-brand-mark">B</span>
          <span><strong>博学书城</strong><small>管理后台</small></span>
        </Link>
        <nav className="admin-nav" aria-label="后台导航">
          <span className="admin-nav-label">工作台</span>
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)}>
              <AdminIcon name={item.icon} /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/">← 返回商城</Link>
          <span>Bookstore Console · v1.0</span>
        </div>
      </aside>
      {menuOpen && <button className="admin-sidebar-overlay" onClick={() => setMenuOpen(false)} aria-label="关闭导航" />}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-button" onClick={() => setMenuOpen(true)} aria-label="打开导航"><AdminIcon name="menu" /></button>
            <span>{current?.label || '管理后台'}</span>
          </div>
          <div className="admin-account">
            <span className="admin-account-avatar">{(user?.username || '管').slice(0, 1).toUpperCase()}</span>
            <span><strong>{user?.username || '管理员'}</strong><small>系统管理员</small></span>
          </div>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
