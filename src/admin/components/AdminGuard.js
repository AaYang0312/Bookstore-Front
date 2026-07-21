import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import '../styles/admin.css';

const AdminGuard = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="admin-access-page">
        <span className="admin-loader" />
        <p>正在验证管理员身份…</p>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <div className="admin-access-page">
        <div className="admin-access-card">
          <span className="admin-brand-mark">B</span>
          <span className="admin-access-eyebrow">Bookstore Console</span>
          <h1>{user ? '当前账户没有管理权限' : '请先登录管理员账户'}</h1>
          <p>{user ? '后台仅允许管理员访问，请联系现有管理员分配权限。' : '登录成功后，可从头像菜单进入管理后台。'}</p>
          <Link to="/">返回博学书城</Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminGuard;
