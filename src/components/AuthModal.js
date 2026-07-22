import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import StoreIcon from './StoreIcon';
import { API_BASE } from '../config/api';
import './AuthModal.css';

const resolveAuthError = (message, mode, status) => {
  const fallback = mode === 'login' ? '登录失败，请稍后重试' : '注册失败，请稍后重试';
  const normalizedMessage = (message || '').trim();

  if (/验证码/.test(normalizedMessage)) {
    return { field: 'captchaValue', message: '验证码错误或已失效，请输入新的验证码' };
  }

  if (mode === 'login' && /(用户|账号).*不存在/.test(normalizedMessage)) {
    return { field: 'username', message: '账号不存在，请检查用户名，或先注册新账号' };
  }

  if (mode === 'login' && /密码错误/.test(normalizedMessage)) {
    return { field: 'password', message: '密码错误，请重新输入' };
  }

  if (mode === 'register' && /(用户名|邮箱|手机号).*已存在/.test(normalizedMessage)) {
    return { message: '用户名、邮箱或手机号已被使用，请更换后重试' };
  }

  if (mode === 'register' && /两次密码不一致/.test(normalizedMessage)) {
    return { field: 'confirmPassword', message: '两次输入的密码不一致，请重新确认' };
  }

  if (/网络错误|无法连接|Failed to fetch/i.test(normalizedMessage)) {
    return { message: '无法连接服务器，请检查网络后重试' };
  }

  if (/请求参数|参数绑定/.test(normalizedMessage)) {
    return { message: '提交的信息格式有误，请检查后重试' };
  }

  if (/生成token/.test(normalizedMessage)) {
    return { message: '登录服务暂时不可用，请稍后重试' };
  }

  if (status >= 500) {
    return { message: '服务暂时不可用，请稍后重试' };
  }

  return { message: normalizedMessage || fallback };
};

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);
  const returnFocusRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const { login, register, loading } = useUser();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);
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

  const focusField = (fieldName) => {
    window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector(`[name="${fieldName}"]`)?.focus({ preventScroll: true });
    });
  };

  // 获取验证码
  const fetchCaptcha = async () => {
    setIsCaptchaLoading(true);
    try {
      const response = await fetch(`${API_BASE}/captcha/generate`);
      const data = await response.json();
      
      if (response.ok && data.code === 0 && data.data?.captcha_base64) {
        setCaptchaData({
          captchaId: data.data.captcha_id,
          captchaBase64: data.data.captcha_base64
        });
        setSubmitError(prev => prev.startsWith('验证码加载失败') ? '' : prev);
      } else {
        throw new Error(data.message || '验证码加载失败');
      }
    } catch (err) {
      console.error('获取验证码失败:', err);
      setCaptchaData({ captchaId: '', captchaBase64: '' });
      setSubmitError('验证码加载失败，请点击“重新加载”后再试');
    } finally {
      setIsCaptchaLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSubmitError('');
    setErrors(prev => {
      if (!prev[name]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
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
    setSubmitError('');
    const firstInvalidField = Object.keys(newErrors)[0];
    if (firstInvalidField) focusField(firstInvalidField);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      let result;

      try {
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
          setSubmitError('');

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
          const authError = resolveAuthError(result.message, mode, result.status);
          if (authError.field) {
            setErrors(prev => ({ ...prev, [authError.field]: authError.message }));
          } else {
            setSubmitError(authError.message);
          }

          setFormData(prev => ({ ...prev, captchaValue: '' }));
          await fetchCaptcha();
          if (authError.field) focusField(authError.field);
        }
      } catch (error) {
        setSubmitError('操作未完成，请稍后重试');
      } finally {
        setIsSubmitting(false);
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
    setSubmitError('');
    setShowSuccess(false);
  };

  if (!isOpen) return null;

  const modeTitleId = `auth-title-${mode}`;
  const isBusy = loading || isSubmitting || showSuccess;

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

        {submitError && (
          <div className="auth-error" role="alert" aria-live="assertive">
            <span className="auth-feedback-icon" aria-hidden="true">!</span>
            <span className="auth-feedback-copy">
              <strong>{mode === 'login' ? '登录未完成' : '注册未完成'}</strong>
              <small>{submitError}</small>
            </span>
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
              disabled={isBusy}
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? `auth-username-error-${mode}` : undefined}
            />
            {errors.username && <span className="error-message" role="alert" id={`auth-username-error-${mode}`}>{errors.username}</span>}
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
                  disabled={isBusy}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'auth-email-error' : undefined}
                />
                {errors.email && <span className="error-message" role="alert" id="auth-email-error">{errors.email}</span>}
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
                  disabled={isBusy}
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'auth-phone-error' : undefined}
                />
                {errors.phone && <span className="error-message" role="alert" id="auth-phone-error">{errors.phone}</span>}
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
              disabled={isBusy}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? `auth-password-error-${mode}` : undefined}
            />
            {errors.password && <span className="error-message" role="alert" id={`auth-password-error-${mode}`}>{errors.password}</span>}
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
                disabled={isBusy}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'auth-confirm-password-error' : undefined}
              />
              {errors.confirmPassword && <span className="error-message" role="alert" id="auth-confirm-password-error">{errors.confirmPassword}</span>}
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
                disabled={isBusy}
                inputMode="numeric"
                autoComplete="off"
                aria-invalid={Boolean(errors.captchaValue)}
                aria-describedby={errors.captchaValue ? `auth-captcha-error-${mode}` : 'auth-captcha-hint'}
              />
              <div className="captcha-image-container">
                <button type="button" className="captcha-refresh" onClick={fetchCaptcha} disabled={isBusy || isCaptchaLoading} aria-label="刷新验证码" title="点击刷新验证码">
                  {captchaData.captchaBase64 ? (
                    <>
                      <img src={captchaData.captchaBase64} alt="验证码" className="captcha-image" />
                      <span className="captcha-refresh-icon" aria-hidden="true"><StoreIcon name="refresh" size={15} /></span>
                    </>
                  ) : (
                    <span className="captcha-fallback">{isCaptchaLoading ? '加载中...' : '重新加载'}</span>
                  )}
                </button>
              </div>
            </div>
            <span className="captcha-hint" id="auth-captcha-hint">看不清？点击图片刷新</span>
            {errors.captchaValue && <span className="error-message" role="alert" id={`auth-captcha-error-${mode}`}>{errors.captchaValue}</span>}
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

          <button type="submit" className="auth-submit-btn" disabled={isBusy || isCaptchaLoading || !captchaData.captchaId}>
            {isSubmitting ? '正在验证...' : (showSuccess ? '已完成' : (mode === 'login' ? '登录' : '注册'))}
          </button>
        </form>

        <div className="auth-switch">
          <span className="switch-text">
            {mode === 'login' ? '还没有账户？' : '已有账户？'}
          </span>
          <button type="button" className="switch-btn" onClick={switchMode} disabled={isBusy}>
            {mode === 'login' ? '立即注册' : '立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
