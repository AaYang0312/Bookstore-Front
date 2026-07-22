import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import StoreIcon from './StoreIcon';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);
  const returnFocusRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const { login, register, loading, error } = useUser();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [captchaData, setCaptchaData] = useState({
    captchaId: '',
    captchaBase64: ''
  });

  // 监听initialMode的变化，更新mode状态
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 当模态框打开时，获取验证码（登录和注册都需要）
  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return undefined;

    returnFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => firstInputRef.current?.focus({ preventScroll: true }));

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.requestAnimationFrame(() => {
      if (dialogRef.current) dialogRef.current.scrollTop = 0;
      firstInputRef.current?.focus({ preventScroll: true });
    });
  }, [isOpen, mode]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    captchaValue: ''
  });
  const [errors, setErrors] = useState({});

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/captcha/generate');
      const data = await response.json();
      
      if (data.code === 0) {
        setCaptchaData({
          captchaId: data.data.captcha_id,
          captchaBase64: data.data.captcha_base64
        });
      }
    } catch (err) {
      console.error('获取验证码失败:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'login') {
      // 登录模式：用户名 + 密码 + 验证码
      if (!formData.username) {
        newErrors.username = '请输入用户名';
      }

      if (!formData.password) {
        newErrors.password = '请输入密码';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少6位';
      }

      if (!formData.captchaValue) {
        newErrors.captchaValue = '请输入验证码';
      } else if (formData.captchaValue.length !== 4) {
        newErrors.captchaValue = '验证码为4位数字';
      }
    } else {
      // 注册模式：用户名 + 邮箱 + 电话 + 密码 + 确认密码 + 验证码
      if (!formData.username) {
        newErrors.username = '请输入用户名';
      } else if (formData.username.length < 2) {
        newErrors.username = '用户名至少2位';
      }

      if (!formData.email) {
        newErrors.email = '请输入邮箱地址';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = '请输入有效的邮箱地址';
      }

      if (!formData.phone) {
        newErrors.phone = '请输入手机号码';
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入有效的手机号码';
      }

      if (!formData.password) {
        newErrors.password = '请输入密码';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少6位';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码不一致';
      }

      if (!formData.captchaValue) {
        newErrors.captchaValue = '请输入验证码';
      } else if (formData.captchaValue.length !== 4) {
        newErrors.captchaValue = '验证码为4位数字';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      let result;
      
      if (mode === 'login') {
        result = await login(
          formData.username, 
          formData.password, 
          {
            captchaID: captchaData.captchaId,
            captchaValue: formData.captchaValue
          }
        );
      } else {
        result = await register(
          formData.username,
          formData.password,
          formData.email,
          formData.phone,
          formData.confirmPassword,
          {
            captchaID: captchaData.captchaId,
            captchaValue: formData.captchaValue
          }
        );
      }

      if (result.success) {
        // 显示成功消息
        setSuccessMessage(mode === 'login' ? '登录成功！' : '注册成功！');
        setShowSuccess(true);
        
        // 清空表单
        setFormData({
          username: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          captchaValue: ''
        });
        setErrors({});
        
        // 延迟关闭模态框，给用户信息更新一些时间
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
          // 登录成功后刷新页面以显示头像
          if (mode === 'login') {
            window.location.reload();
          }
        }, 1500);
      } else {
        // 如果登录或注册失败，刷新验证码
        fetchCaptcha();
        setFormData(prev => ({
          ...prev,
          captchaValue: ''
        }));
      }
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      captchaValue: ''
    });
    setErrors({});
    setShowSuccess(false);
  };

  if (!isOpen) return null;

  const modeTitleId = `auth-title-${mode}`;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modeTitleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="关闭">
          <StoreIcon name="close" size={20} />
        </button>
        
        <div className="auth-modal-header">
          <div className="auth-logo">
            <div className="auth-logo-icon" aria-hidden="true"><StoreIcon name="brand" size={22} /></div>
            <span className="auth-logo-copy">
              <span className="auth-logo-text">博学书城</span>
              <small>MEMBER ACCESS</small>
            </span>
          </div>
          <h2 className="auth-title" id={modeTitleId}>
            {mode === 'login' ? '欢迎回来' : '创建账户'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? '登录您的账户，开始您的阅读之旅' 
              : '注册新账户，享受更多阅读服务'
            }
          </p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="auth-success" role="status">
            <div className="success-icon"><StoreIcon name="check" size={17} /></div>
            <span>{successMessage}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor={`auth-username-${mode}`}>用户名</label>
            <input
              id={`auth-username-${mode}`}
              ref={firstInputRef}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder={mode === 'login' ? '请输入用户名' : '请输入用户名'}
              disabled={loading}
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? `auth-username-error-${mode}` : undefined}
            />
            {errors.username && <span className="error-message" id={`auth-username-error-${mode}`}>{errors.username}</span>}
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">邮箱地址</label>
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="请输入邮箱地址"
                  disabled={loading}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'auth-email-error' : undefined}
                />
                {errors.email && <span className="error-message" id="auth-email-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="auth-phone">手机号码</label>
                <input
                  id="auth-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="请输入手机号码"
                  disabled={loading}
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'auth-phone-error' : undefined}
                />
                {errors.phone && <span className="error-message" id="auth-phone-error">{errors.phone}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor={`auth-password-${mode}`}>密码</label>
            <input
              id={`auth-password-${mode}`}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="请输入密码"
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `auth-password-error-${mode}` : undefined}
            />
            {errors.password && <span className="error-message" id={`auth-password-error-${mode}`}>{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm-password">确认密码</label>
              <input
                id="auth-confirm-password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="请再次输入密码"
                disabled={loading}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'auth-confirm-password-error' : undefined}
              />
              {errors.confirmPassword && <span className="error-message" id="auth-confirm-password-error">{errors.confirmPassword}</span>}
            </div>
          )}

          {/* 验证码输入框 - 登录和注册都需要 */}
          <div className="form-group">
            <label className="form-label" htmlFor={`auth-captcha-${mode}`}>验证码</label>
            <div className="captcha-container">
              <input
                id={`auth-captcha-${mode}`}
                type="text"
                name="captchaValue"
                value={formData.captchaValue}
                onChange={handleInputChange}
                className={`form-input captcha-input ${errors.captchaValue ? 'error' : ''}`}
                placeholder="请输入验证码"
                maxLength="4"
                disabled={loading}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(errors.captchaValue)}
                aria-describedby={errors.captchaValue ? `auth-captcha-error-${mode}` : 'auth-captcha-hint'}
              />
              {captchaData.captchaBase64 && (
                <div className="captcha-image-container">
                  <button type="button" className="captcha-refresh" onClick={fetchCaptcha} aria-label="刷新验证码" title="点击刷新验证码">
                    <img src={captchaData.captchaBase64} alt="验证码" className="captcha-image" />
                    <span aria-hidden="true"><StoreIcon name="refresh" size={15} /></span>
                  </button>
                </div>
              )}
            </div>
            <span className="captcha-hint" id="auth-captcha-hint">看不清？点击图片刷新</span>
            {errors.captchaValue && <span className="error-message" id={`auth-captcha-error-${mode}`}>{errors.captchaValue}</span>}
          </div>

          {mode === 'login' && (
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" className="checkbox-input" />
                <span className="checkbox-text">记住我</span>
              </label>
              <button type="button" className="forgot-password">忘记密码？</button>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>

        <div className="auth-switch">
          <span className="switch-text">
            {mode === 'login' ? '还没有账户？' : '已有账户？'}
          </span>
          <button type="button" className="switch-btn" onClick={switchMode} disabled={loading}>
            {mode === 'login' ? '立即注册' : '立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
