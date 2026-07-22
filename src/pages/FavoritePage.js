import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorite } from '../contexts/FavoriteContext';
import BookGrid from '../components/BookGrid';
import StoreIcon from '../components/StoreIcon';
import './FavoritePage.css';

const FavoritePage = () => {
  const navigate = useNavigate();
  const { favorites, loading, fetchFavorites } = useFavorite();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeFilter, setTimeFilter] = useState('all');
  const [totalCount, setTotalCount] = useState(0);

  const loadFavorites = useCallback(async () => {
    const data = await fetchFavorites(currentPage, timeFilter);
    if (data) {
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    }
  }, [currentPage, timeFilter, fetchFavorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setCurrentPage(1);
  };

  const timeFilterOptions = [
    { value: 'all', label: '全部' },
    { value: 'today', label: '今天' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'year', label: '今年' }
  ];

  if (loading) {
    return (
      <main className="favorite-page favorite-page-state" aria-busy="true">
        <div className="favorite-loading-card">
          <div className="favorite-spinner" aria-hidden="true"></div>
          <p>正在整理你的收藏书单...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="favorite-page">
      <section className="favorite-header" aria-labelledby="favorite-page-title">
        <div className="favorite-title">
          <span className="section-eyebrow">MY LIBRARY</span>
          <h1 id="favorite-page-title">我的收藏</h1>
          <p>把打动你的书留在这里，随时回来继续阅读旅程。</p>
        </div>
        <div className="favorite-count-card" aria-label={`共收藏 ${totalCount} 本书`}>
          <span className="favorite-count-icon"><StoreIcon name="heart" size={20} /></span>
          <span>
            <strong>{totalCount}</strong>
            <small>本珍藏好书</small>
          </span>
        </div>
      </section>

      <section className="favorite-toolbar" aria-label="收藏筛选">
        <div className="time-filter">
          <span className="filter-label"><StoreIcon name="clock" size={16} /> 收藏时间</span>
          <div className="filter-buttons" role="group" aria-label="按收藏时间筛选">
            {timeFilterOptions.map(option => (
              <button
                type="button"
                key={option.value}
                className={`filter-btn ${timeFilter === option.value ? 'active' : ''}`}
                onClick={() => handleTimeFilterChange(option.value)}
                aria-pressed={timeFilter === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <span className="favorite-result-count">当前共 {totalCount} 本</span>
      </section>

      <section className="favorite-content" aria-live="polite">
        {favorites.length > 0 ? (
          <>
            <BookGrid books={favorites.map(fav => fav.book)} />
            
            {totalPages > 1 && (
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
            )}
          </>
        ) : (
          <div className="favorite-empty-state">
            <div className="empty-icon"><StoreIcon name="heart" size={30} /></div>
            <span className="section-eyebrow">YOUR NEXT FAVORITE</span>
            <h2 className="empty-title">这里还没有收藏</h2>
            <p className="empty-description">
              遇到喜欢的书时，点一下心形按钮，它就会出现在这里。
            </p>
            <button type="button" onClick={() => navigate('/')} className="back-to-home-btn">
              去发现好书 <StoreIcon name="arrowRight" size={18} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default FavoritePage;
