import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import StoreIcon from './StoreIcon';
import './UserDropdown.css';

const UserDropdown = ({ user, onLogout, onClose }) => {
  const itemClassName = ({ isActive }) => `dropdown-item${isActive ? ' is-active' : ''}`;
  const userInitial = user.username?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="user-dropdown" id="account-menu" role="menu" aria-label="账户菜单">
      <div className="dropdown-header">
        <div className="dropdown-user-info">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.username}的头像`}
              className="dropdown-avatar"
            />
          ) : (
            <div className="dropdown-avatar-placeholder" aria-hidden="true">
              {userInitial}
            </div>
          )}
          <div className="dropdown-user-details">
            <span className="dropdown-eyebrow">BOOK MEMBER</span>
            <span className="dropdown-username">{user.username}</span>
            <span className="dropdown-email">{user.email || '欢迎回到博学书城'}</span>
          </div>
        </div>
      </div>

      {user.is_admin && (
        <Link to="/admin" className="admin-dropdown-card" role="menuitem" onClick={onClose}>
          <span className="dropdown-icon admin-icon"><StoreIcon name="dashboard" size={18} /></span>
          <span className="dropdown-item-copy">
            <strong>管理后台</strong>
            <small>管理书籍、订单与运营</small>
          </span>
          <span className="dropdown-role-badge">ADMIN</span>
        </Link>
      )}

      <div className="dropdown-menu" role="group" aria-label="账户快捷入口">
        <NavLink to="/profile" className={itemClassName} role="menuitem" onClick={onClose}>
          <span className="dropdown-icon"><StoreIcon name="user" size={18} /></span>
          <span className="dropdown-item-copy"><strong>个人信息</strong><small>查看与编辑账户资料</small></span>
          <StoreIcon name="chevronRight" size={15} className="dropdown-item-arrow" />
        </NavLink>
        <NavLink to="/orders" className={itemClassName} role="menuitem" onClick={onClose}>
          <span className="dropdown-icon"><StoreIcon name="order" size={18} /></span>
          <span className="dropdown-item-copy"><strong>我的订单</strong><small>查看购买与配送记录</small></span>
          <StoreIcon name="chevronRight" size={15} className="dropdown-item-arrow" />
        </NavLink>
        <NavLink to="/favorites" className={itemClassName} role="menuitem" onClick={onClose}>
          <span className="dropdown-icon"><StoreIcon name="heart" size={18} /></span>
          <span className="dropdown-item-copy"><strong>我的收藏</strong><small>继续阅读心愿书单</small></span>
          <StoreIcon name="chevronRight" size={15} className="dropdown-item-arrow" />
        </NavLink>
      </div>

      <div className="dropdown-footer">
        <button type="button" className="dropdown-item logout-item" role="menuitem" onClick={onLogout}>
          <span className="dropdown-icon"><StoreIcon name="logout" size={18} /></span>
          <span className="dropdown-item-copy"><strong>退出登录</strong><small>安全退出当前账户</small></span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
