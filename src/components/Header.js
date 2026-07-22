import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { useCartAnimation } from '../contexts/CartAnimationContext';
import { useFavorite } from '../contexts/FavoriteContext';
import AuthModal from './AuthModal';
import UserDropdown from './UserDropdown';
import CartAnimation from './CartAnimation';
import StoreIcon from './StoreIcon';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { user, logout } = useUser();
  const { cartAnimation, cartButtonRef, cartBadgeRef, handleAnimationComplete } = useCartAnimation();
  const { favoriteCount, fetchFavoriteCount } = useFavorite();
  
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: 'login'
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  // 获取收藏数量
  React.useEffect(() => {
    if (user) {
      fetchFavoriteCount();
    }
  }, [user, fetchFavoriteCount]);

  useEffect(() => {
    if (!showUserDropdown) return undefined;

    const handlePointerDown = (event) => {
      if (!userMenuRef.current?.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowUserDropdown(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserDropdown]);

  const openAuthModal = (mode) => {
    setAuthModal({
      isOpen: true,
      mode
    });
  };

  const closeAuthModal = () => {
    setAuthModal({
      isOpen: false,
      mode: 'login'
    });
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-icon"><StoreIcon name="brand" size={20} /></span>
            <span className="logo-copy"><strong className="logo-text">博学书城</strong><small>BO XUE BOOKS</small></span>
          </Link>

          <nav className="store-nav" aria-label="商城主导航">
            <NavLink to="/" end>首页</NavLink>
            <a href="/#books">精选</a>
            <a href="/#categories">分类</a>
            <NavLink to="/favorites">收藏</NavLink>
          </nav>
          
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-box">
              <StoreIcon name="search" size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="搜索书籍、作者" 
                aria-label="搜索书籍、作者"
                className="search-input"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button type="submit" className="search-btn">搜索</button>
            </form>
          </div>
          
          <div className="header-actions">
            {/* 收藏夹按钮 */}
            {user && (
              <Link to="/favorites" className="favorite-button">
                <StoreIcon name="heart" size={18} />
                <span className="favorite-text">收藏夹</span>
                {favoriteCount > 0 && (
                  <span className="favorite-badge">{favoriteCount}</span>
                )}
              </Link>
            )}
            
            <Link to="/cart" className="cart-button" ref={cartButtonRef}>
              <StoreIcon name="cart" size={19} />
              <span className="cart-text">购物车</span>
              {getTotalItems() > 0 && (
                <span className="cart-badge" ref={cartBadgeRef}>{getTotalItems()}</span>
              )}
            </Link>
            
            {user ? (
              <div className="user-section" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-avatar-container"
                  onClick={toggleUserDropdown}
                  aria-label={showUserDropdown ? '关闭账户菜单' : '打开账户菜单'}
                  aria-haspopup="menu"
                  aria-expanded={showUserDropdown}
                  aria-controls="account-menu"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user.username}</span>
                  <StoreIcon name="chevronDown" size={14} className="dropdown-arrow" />
                </button>
                
                {showUserDropdown && (
                  <UserDropdown 
                    user={user}
                    onLogout={handleLogout}
                    onClose={() => setShowUserDropdown(false)}
                  />
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="auth-btn login-btn"
                  onClick={() => openAuthModal('login')}
                >
                  登录
                </button>
                <button 
                  className="auth-btn register-btn"
                  onClick={() => openAuthModal('register')}
                >
                  注册
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
      />

      <CartAnimation
        isVisible={cartAnimation.isVisible}
        startPosition={cartAnimation.startPosition}
        endPosition={cartAnimation.endPosition}
        onAnimationComplete={handleAnimationComplete}
      />
    </>
  );
};

export default Header;
