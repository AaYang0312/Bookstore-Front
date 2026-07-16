import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryButtons.css';

const CategoryButtons = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/category/list');
      const data = await response.json();
      
      if (data.code === 0) {
        const categoryList = data.data.map(category => ({
          name: category.name,
          count: category.book_count,
          icon: category.icon,
          color: category.color,
          gradient: category.gradient
        }));
        
        setCategories(categoryList);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      '文学': '📖', '科幻': '🚀', '古典文学': '🏛️', '政治小说': '🏛️', '政治寓言': '🦁',
      '童话': '🧸', '科普': '🔬', '历史': '📜', '科技': '💻', '计算机': '💻', '其他': '📚'
    };
    return iconMap[categoryName] || '📚';
  };

  const getCategoryColor = (categoryName) => {
    const colorMap = {
      '文学': '#ff6b6b',
      '科幻': '#4ecdc4',
      '古典文学': '#45b7d1',
      '政治小说': '#96ceb4',
      '政治寓言': '#feca57',
      '童话': '#ff9ff3',
      '科普': '#54a0ff',
      '历史': '#5f27cd',
      '科技': '#00d2d3',
      '计算机': '#ff9f43',
      '其他': '#c8d6e5'
    };
    return colorMap[categoryName] || '#c8d6e5';
  };

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
    <div className="category-buttons-section">
      <div className="category-buttons-container">
        <h2 className="category-section-title">图书分类</h2>
        <div className="category-buttons-grid">
          {/* 全部图书按钮 */}
          <button
            type="button"
            className={`category-button all-category ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            <div className="category-button-icon">📚</div>
            <div className="category-button-content">
              <div className="category-button-name">全部图书</div>
              <div className="category-button-count">20</div>
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
                '--category-accent': category.color || getCategoryColor(category.name)
              }}
            >
              <div className="category-button-icon">{category.icon || getCategoryIcon(category.name)}</div>
              <div className="category-button-content">
                <div className="category-button-name">{category.name}</div>
                <div className="category-button-count">{category.count}</div>
              </div>
              <div className="category-button-overlay"></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryButtons;
