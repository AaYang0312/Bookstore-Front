import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './UserDropdown.css';

const UserDropdown = ({ user, onLogout, onClose }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleProfileClick = () => {
    onClose();
    // 导航到个人信息页面
    window.location.href = '/profile';
  };

  return (
    <>
      <div className="user-dropdown">
        <div className="dropdown-header">
          <div className="dropdown-user-info">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="dropdown-avatar"
              />
            ) : (
              <div className="dropdown-avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="dropdown-user-details">
              <span className="dropdown-username">{user.username}</span>
              <span className="dropdown-email">{user.email}</span>
            </div>
          </div>
        </div>
        
        <div className="dropdown-menu">
          {user.is_admin && (
            <Link to="/admin" className="dropdown-item admin-dropdown-item" onClick={onClose}>
              <span className="dropdown-icon">▦</span>
              管理后台
              <span className="dropdown-role-badge">ADMIN</span>
            </Link>
          )}
          <button className="dropdown-item" onClick={handleProfileClick}>
            <span className="dropdown-icon">👤</span>
            个人信息
          </button>
          <Link to="/orders" className="dropdown-item" onClick={onClose}>
            <span className="dropdown-icon">📋</span>
            我的订单
          </Link>
          <Link to="/favorites" className="dropdown-item" onClick={onClose}>
            <span className="dropdown-icon">❤️</span>
            我的收藏
          </Link>
          <Link to="/settings" className="dropdown-item">
            <span className="dropdown-icon">⚙️</span>
            设置
          </Link>
          <div className="dropdown-divider"></div>
          <button className="dropdown-item logout-item" onClick={onLogout}>
            <span className="dropdown-icon">🚪</span>
            退出登录
          </button>
        </div>
      </div>

      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </>
  );
};

// 个人信息模态框组件（保留作为备用）
const ProfileModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: 实现保存用户信息的逻辑
    setIsEditing(false);
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>
          ✕
        </button>
        
        <div className="profile-header">
          <h2>个人信息</h2>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '取消' : '编辑'}
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <button className="change-avatar-btn">
                更换头像
              </button>
            )}
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>邮箱</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>手机号</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
              />
            </div>

            {isEditing && (
              <div className="profile-actions">
                <button className="save-button" onClick={handleSave}>
                  保存
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDropdown;
