import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreIcon from './StoreIcon';
import { API_BASE } from '../config/api';
import './CategoryButtons.css';

const categoryFallback = [
  { name: '文学', count: 0 }, { name: '科幻', count: 0 }, { name: '童话', count: 0 },
  { name: '历史', count: 0 }, { name: '计算机', count: 0 }
];
const categoryStyles = {
  '文学': ['brand', '#9b5c45'], '科幻': ['compass', '#3f6f77'], '童话': ['spark', '#8b6484'],
  '历史': ['clock', '#8a6a3d'], '计算机': ['layers', '#486b58'], '其他': ['brand', '#68706b']
};

const CategoryButtons = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/category/list`);
      const data = await response.json();
      
      if (data.code === 0) {
        const categoryList = data.data.map(category => ({
          name: category.name,
          count: category.book_count,
          icon: category.icon,
          color: category.color,
          gradient: category.gradient
        }));
        
        setCategories(categoryList.length ? categoryList : categoryFallback);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
      setCategories(categoryFallback);
    }
  };

  const getCategoryStyle = (categoryName) => categoryStyles[categoryName] || categoryStyles['其他'];

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      navigate('/');
    } else {
      navigate(`/category/${category}`);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="category-buttons-section" id="categories">
      <div className="category-buttons-container">
        <div className="category-heading">
          <div><span className="section-eyebrow">按兴趣探索</span><h2 className="category-section-title">下一本，从这里开始</h2></div>
          <p>从故事、想象到知识，找到适合此刻的阅读方向。</p>
        </div>
        <div className="category-buttons-grid">
          {/* 全部图书按钮 */}
          <button
            type="button"
            className={`category-button all-category ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            <div className="category-button-icon"><StoreIcon name="layers" size={22} /></div>
            <div className="category-button-content">
              <div className="category-button-name">全部图书</div>
              <div className="category-button-count">全部在售</div>
            </div>
            <div className="category-button-overlay"></div>
          </button>

          {/* 动态分类按钮 */}
          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.name)}
              style={{
                '--category-accent': getCategoryStyle(category.name)[1]
              }}
            >
              <div className="category-button-icon"><StoreIcon name={getCategoryStyle(category.name)[0]} size={22} /></div>
              <div className="category-button-content">
                <div className="category-button-name">{category.name}</div>
                <div className="category-button-count">{category.count ? `${category.count} 本` : '浏览分类'}</div>
              </div>
              <div className="category-button-overlay"></div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryButtons;
