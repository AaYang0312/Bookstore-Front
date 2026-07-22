import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import StoreIcon from '../components/StoreIcon';
import './ProfilePage.css';

const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

const createProfileForm = (user) => ({
  username: user?.username || '',
  email: user?.email || '',
  phone: user?.phone || '',
  avatar: user?.avatar || ''
});

const formatProfileDate = (value) => {
  if (!value) return '暂未记录';
  const date = new Date(value.replace?.(' ', 'T') || value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const ProfilePage = () => {
  const { user, updateUserProfile, loading } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [formData, setFormData] = useState(() => createProfileForm(user));
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) setFormData(createProfileForm(user));
  }, [user]);

  const accountDates = useMemo(() => ({
    created: formatProfileDate(user?.created_at),
    updated: formatProfileDate(user?.updated_at)
  }), [user?.created_at, user?.updated_at]);

  const clearMessageLater = () => {
    window.setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const profileData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      avatar: formData.avatar.trim()
    };

    if (!profileData.username) {
      setMessage({ type: 'error', text: '请输入用户名后再保存。' });
      document.getElementById('profile-username')?.focus();
      return;
    }
    if (!profileData.email) {
      setMessage({ type: 'error', text: '请输入邮箱地址后再保存。' });
      document.getElementById('profile-email')?.focus();
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(profileData.email)) {
      setMessage({ type: 'error', text: '邮箱格式不正确，请检查后重试。' });
      document.getElementById('profile-email')?.focus();
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });
    const result = await updateUserProfile(profileData);
    setIsSaving(false);

    if (result.success) {
      setMessage({ type: 'success', text: '个人信息已更新。' });
      setIsEditing(false);
      clearMessageLater();
    } else {
      setMessage({ type: 'error', text: result.error || '更新失败，请稍后重试。' });
    }
  };

  const handleCancel = () => {
    setFormData(createProfileForm(user));
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setMessage({ type: '', text: '' });
  };

  useEffect(() => {
    if (!showPasswordModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => {
      document.getElementById('profile-old-password')?.focus();
    }, 0);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowPasswordModal(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setMessage({ type: '', text: '' });
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPasswordModal]);

  const handlePasswordSave = async (event) => {
    event.preventDefault();

    if (!passwordData.oldPassword) {
      setMessage({ type: 'error', text: '请输入当前密码。' });
      document.getElementById('profile-old-password')?.focus();
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少需要 6 位。' });
      document.getElementById('profile-new-password')?.focus();
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致。' });
      document.getElementById('profile-confirm-password')?.focus();
      return;
    }

    setIsPasswordSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/user/password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword
        })
      });
      const data = await response.json();

      if (response.ok && data.code === 0) {
        closePasswordModal();
        setMessage({ type: 'success', text: '登录密码已更新。' });
        clearMessageLater();
      } else {
        setMessage({ type: 'error', text: data.message || '密码修改失败，请稍后重试。' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络连接异常，请稍后重试。' });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <main className="profile-page">
        <div className="profile-state-card" role="status">
          <span className="profile-state-icon"><StoreIcon name="user" size={24} /></span>
          <h1>正在读取个人信息</h1>
          <p>请稍候，我们正在整理您的书城账户资料。</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-state-card">
          <span className="profile-state-icon"><StoreIcon name="user" size={24} /></span>
          <h1>登录后查看个人信息</h1>
          <p>请从页面右上角登录，继续管理您的账户资料。</p>
        </div>
      </main>
    );
  }

  const userInitial = user.username?.charAt(0).toUpperCase() || 'U';

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-page-header">
          <div>
            <span className="section-eyebrow">READER PROFILE</span>
            <h1>个人信息</h1>
            <p>妥善维护您的联系方式，让订单通知与阅读服务准确抵达。</p>
          </div>
          <span className="profile-membership-badge">
            <StoreIcon name={user.is_admin ? 'shield' : 'brand'} size={16} />
            {user.is_admin ? '书城管理员' : '书城会员'}
          </span>
        </header>

        {message.text && (
          <div
            className={`profile-message profile-message-${message.type}`}
            role={message.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            <span><StoreIcon name={message.type === 'success' ? 'check' : 'close'} size={17} /></span>
            {message.text}
          </div>
        )}

        <div className="profile-layout">
          <aside className="profile-summary-column" aria-label="账户概览">
            <section className="profile-identity-card">
              <div className="profile-avatar-frame">
                {user.avatar ? (
                  <img src={user.avatar} alt={`${user.username}的头像`} className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-placeholder" aria-hidden="true">{userInitial}</div>
                )}
                <span className="profile-avatar-status" title="账户状态正常">
                  <StoreIcon name="check" size={12} />
                </span>
              </div>
              <span className="profile-card-eyebrow">BO XUE MEMBER</span>
              <h2>{user.username}</h2>
              <p>{user.email || '尚未填写邮箱地址'}</p>

              <dl className="profile-account-list">
                <div>
                  <dt>会员编号</dt>
                  <dd>#{String(user.id).padStart(4, '0')}</dd>
                </div>
                <div>
                  <dt>加入书城</dt>
                  <dd>{accountDates.created}</dd>
                </div>
                <div>
                  <dt>最近更新</dt>
                  <dd>{accountDates.updated}</dd>
                </div>
              </dl>
            </section>

            <section className="profile-security-card">
              <span className="profile-card-icon"><StoreIcon name="shield" size={20} /></span>
              <div>
                <span className="profile-card-eyebrow">ACCOUNT SECURITY</span>
                <h2>账户安全</h2>
                <p>定期更新密码，保护订单与个人资料。</p>
              </div>
              <button type="button" className="profile-secondary-button" onClick={() => setShowPasswordModal(true)}>
                修改密码
                <StoreIcon name="arrowRight" size={16} />
              </button>
            </section>
          </aside>

          <section className="profile-details-card" aria-labelledby="profile-details-title">
            <div className="profile-card-header">
              <div>
                <span className="profile-card-eyebrow">PROFILE DETAILS</span>
                <h2 id="profile-details-title">基础资料</h2>
                <p>{isEditing ? '完成修改后保存，资料将同步至当前账户。' : '点击编辑后即可更新以下账户资料。'}</p>
              </div>
              {!isEditing && (
                <button type="button" className="profile-edit-button" onClick={() => setIsEditing(true)}>
                  <StoreIcon name="user" size={17} />
                  编辑资料
                </button>
              )}
            </div>

            <form className="profile-form" onSubmit={handleSave} noValidate>
              <div className="profile-field-grid">
                <div className="profile-field">
                  <label htmlFor="profile-username">用户名</label>
                  <input
                    id="profile-username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    autoComplete="username"
                    aria-describedby="profile-username-hint"
                  />
                  <span id="profile-username-hint">用于登录与书城内展示</span>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-email">邮箱地址</label>
                  <input
                    id="profile-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    autoComplete="email"
                    aria-describedby="profile-email-hint"
                  />
                  <span id="profile-email-hint">用于重要通知与账户找回</span>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-phone">手机号码</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    autoComplete="tel"
                    aria-describedby="profile-phone-hint"
                  />
                  <span id="profile-phone-hint">用于订单通知与客服联系</span>
                </div>

                <div className="profile-field">
                  <label htmlFor="profile-avatar">头像图片地址</label>
                  <input
                    id="profile-avatar"
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleInputChange}
                    disabled={!isEditing || isSaving}
                    autoComplete="url"
                    placeholder="https://example.com/avatar.jpg"
                    aria-describedby="profile-avatar-hint"
                  />
                  <span id="profile-avatar-hint">粘贴可公开访问的 JPG 或 PNG 地址</span>
                </div>
              </div>

              <div className={`profile-edit-note${isEditing ? ' is-visible' : ''}`} aria-hidden={!isEditing}>
                <StoreIcon name="shield" size={17} />
                保存前请确认联系方式准确，资料仅用于账户与订单服务。
              </div>

              {isEditing && (
                <div className="profile-form-actions">
                  <button type="submit" className="profile-primary-button" disabled={isSaving}>
                    {isSaving ? '正在保存…' : '保存更改'}
                  </button>
                  <button type="button" className="profile-cancel-button" onClick={handleCancel} disabled={isSaving}>
                    取消
                  </button>
                </div>
              )}
            </form>
          </section>
        </div>
      </div>

      {showPasswordModal && (
        <div className="profile-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && closePasswordModal()}>
          <section className="profile-password-modal" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
            <button type="button" className="profile-modal-close" onClick={closePasswordModal} aria-label="关闭修改密码窗口">
              <StoreIcon name="close" size={19} />
            </button>
            <div className="profile-modal-heading">
              <span className="profile-card-icon"><StoreIcon name="shield" size={21} /></span>
              <span className="profile-card-eyebrow">ACCOUNT SECURITY</span>
              <h2 id="password-modal-title">修改登录密码</h2>
              <p>请输入当前密码，并设置至少 6 位的新密码。</p>
            </div>

            {message.text && (
              <div className={`profile-message profile-message-${message.type}`} role="alert" aria-live="polite">
                <span><StoreIcon name={message.type === 'success' ? 'check' : 'close'} size={17} /></span>
                {message.text}
              </div>
            )}

            <form className="profile-password-form" onSubmit={handlePasswordSave}>
              <div className="profile-field">
                <label htmlFor="profile-old-password">当前密码</label>
                <input id="profile-old-password" type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePasswordChange} autoComplete="current-password" disabled={isPasswordSaving} />
              </div>
              <div className="profile-field">
                <label htmlFor="profile-new-password">新密码</label>
                <input id="profile-new-password" type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} autoComplete="new-password" minLength="6" disabled={isPasswordSaving} />
              </div>
              <div className="profile-field">
                <label htmlFor="profile-confirm-password">确认新密码</label>
                <input id="profile-confirm-password" type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} autoComplete="new-password" minLength="6" disabled={isPasswordSaving} />
              </div>
              <div className="profile-modal-actions">
                <button type="submit" className="profile-primary-button" disabled={isPasswordSaving}>
                  {isPasswordSaving ? '正在保存…' : '确认修改'}
                </button>
                <button type="button" className="profile-cancel-button" onClick={closePasswordModal} disabled={isPasswordSaving}>取消</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
