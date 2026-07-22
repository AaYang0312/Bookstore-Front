import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import StoreIcon from '../components/StoreIcon';
import './CategoryPage.css';

const categoryMeta = {
  '文学': { icon: 'brand', label: 'LITERATURE', accent: '#9b5c45' },
  '科幻': { icon: 'compass', label: 'SCIENCE FICTION', accent: '#3f6f77' },
  '古典文学': { icon: 'clock', label: 'CLASSICS', accent: '#8a6a3d' },
  '政治小说': { icon: 'layers', label: 'POLITICAL FICTION', accent: '#6e6558' },
  '政治寓言': { icon: 'spark', label: 'ALLEGORY', accent: '#8b6484' },
  '童话': { icon: 'spark', label: 'FAIRY TALES', accent: '#8b6484' },
  '科普': { icon: 'compass', label: 'POPULAR SCIENCE', accent: '#47727a' },
  '历史': { icon: 'clock', label: 'HISTORY', accent: '#8a6a3d' },
  '科技': { icon: 'layers', label: 'TECHNOLOGY', accent: '#486b58' },
  '计算机': { icon: 'layers', label: 'COMPUTING', accent: '#486b58' }
};

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const fetchCategoryBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/api/v1/book/category/${category}?page=${currentPage}&page_size=12`);
      const data = await response.json();
      
      if (data.code === 0) {
        setBooks(data.data.books || []);
        setTotalBooks(data.data.total || 0);
        setTotalPages(data.data.total_pages || 1);
      } else {
        setError('获取分类书籍失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [category, currentPage]);

  useEffect(() => {
    fetchCategoryBooks();
  }, [fetchCategoryBooks]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCategoryMeta = categoryMeta[category] || { icon: 'brand', label: 'BOOK CATEGORY', accent: 'var(--color-accent)' };

  if (loading) {
    return (
      <main className="category-page category-page-state" aria-busy="true">
        <div className="category-state-card">
          <div className="category-loading-spinner" aria-hidden="true"></div>
          <p>正在整理「{category}」书单...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="category-page category-page-state">
        <div className="category-state-card" role="alert">
          <div className="category-state-icon"><StoreIcon name="brand" size={28} /></div>
          <h1>分类书单暂时无法打开</h1>
          <p>{error}</p>
          <button type="button" onClick={fetchCategoryBooks} className="retry-button">
            重新加载
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="category-page" style={{ '--category-page-accent': currentCategoryMeta.accent }}>
      <section className="category-header" aria-labelledby="category-page-title">
        <nav className="category-breadcrumb" aria-label="面包屑导航">
          <button onClick={() => navigate('/')} className="breadcrumb-link">
            <StoreIcon name="chevronLeft" size={17} /> 返回书城
          </button>
          <span aria-hidden="true">/</span>
          <span className="breadcrumb-current">{category}</span>
        </nav>
        
        <div className="category-info">
          <div className="category-icon" aria-hidden="true"><StoreIcon name={currentCategoryMeta.icon} size={30} /></div>
          <div className="category-details">
            <span className="section-eyebrow">{currentCategoryMeta.label}</span>
            <h1 className="category-title" id="category-page-title">{category}</h1>
            <p className="category-description">
              从这一主题出发，发现值得慢慢读完的好书。
            </p>
          </div>
          <div className="category-count" aria-label={`共 ${totalBooks} 本图书`}>
            <strong>{totalBooks}</strong><span>本图书</span>
          </div>
        </div>
      </section>

      <section className="category-content" aria-label={`${category}分类图书`}>
        {books.length > 0 ? (
          <>
            <BookGrid books={books} />
            <div className="pagination">
              <button 
                type="button"
                className="pagination-btn" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="上一页"
              >
                <StoreIcon name="chevronLeft" size={17} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    type="button"
                    key={pageNum}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-label={`第 ${pageNum} 页`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  {currentPage > 3 && <span className="pagination-ellipsis">...</span>}
                  {currentPage > 3 && currentPage < totalPages - 2 && (
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => handlePageChange(currentPage)}
                      aria-current="page"
                    >
                      {currentPage}
                    </button>
                  )}
                  {currentPage < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
                  {currentPage < totalPages - 2 && (
                    <button
                      type="button"
                      className="pagination-btn"
                      onClick={() => handlePageChange(totalPages)}
                      aria-label={`第 ${totalPages} 页`}
                    >
                      {totalPages}
                    </button>
                  )}
                </>
              )}
              <button 
                type="button"
                className="pagination-btn" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="下一页"
              >
                <StoreIcon name="chevronRight" size={17} />
              </button>
            </div>
          </>
        ) : (
          <div className="category-empty-state">
            <div className="empty-icon"><StoreIcon name={currentCategoryMeta.icon} size={31} /></div>
            <span className="section-eyebrow">MORE BOOKS ARE COMING</span>
            <h2 className="empty-title">「{category}」还没有上架图书</h2>
            <p className="empty-description">
              我们正在扩充这份书单，你也可以先去看看其他阅读方向。
            </p>
            <button type="button" onClick={() => navigate('/#categories')} className="back-to-home-btn">
              浏览其他分类 <StoreIcon name="arrowRight" size={18} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default CategoryPage; 
