import React from 'react';
import { Link } from 'react-router-dom';
import StoreIcon from './StoreIcon';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand"><span><StoreIcon name="brand" size={20} /></span><div><strong>博学书城</strong><small>让每一本好书，被真正看见。</small></div></div>
        <nav className="footer-links" aria-label="页脚导航"><Link to="/">商城首页</Link><Link to="/orders">我的订单</Link><Link to="/favorites">我的收藏</Link></nav>
        <p className="footer-text">© {new Date().getFullYear()} 博学书城 · 演示项目</p>
        <div className="footer-compliance">
          <a
            className="footer-icp"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            title="前往工业和信息化部备案管理系统查询"
          >
            苏ICP备2026050715号-1
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
