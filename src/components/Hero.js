import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreIcon from './StoreIcon';
import './Hero.css';

const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');
const HERO_FALLBACK_IMAGE = '/images/bookstore-editorial-hero.webp';

const fallbackSlides = [{
  id: 'editorial',
  eyebrow: '博学编辑部 · 本周精选',
  title: '把值得读的书，放到你面前',
  subtitle: '从经典到新知，为每一次阅读认真筛选。',
  description: '不追逐喧闹榜单，只挑选经得起时间与思考的好书。',
  image: HERO_FALLBACK_IMAGE,
  buttonText: '开始选书',
  buttonLink: '#books'
}];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 从后端获取轮播图数据
  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const response = await fetch(`${API_BASE}/carousel/list`);
        const data = await response.json();
        
        if (data.code === 0 && Array.isArray(data.data) && data.data.length > 0) {
          // 转换后端数据格式为前端需要的格式
          const formattedSlides = data.data.map(carousel => ({
            id: carousel.id,
            eyebrow: '博学编辑部 · 推荐阅读',
            title: carousel.title,
            subtitle: carousel.description,
            description: carousel.description,
            image: carousel.image_url || HERO_FALLBACK_IMAGE,
            buttonText: '查看专题',
            buttonLink: carousel.link_url || '#books'
          }));
          setSlides(formattedSlides);
        } else {
          console.error('获取轮播图失败:', data.message);
          setSlides(fallbackSlides);
        }
      } catch (error) {
        console.error('获取轮播图失败:', error);
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchCarousels();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === 0) {
        // 如果是第一张，平滑过渡到最后一张
        return slides.length - 1;
      }
      return prev - 1;
    });
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === slides.length - 1) {
        // 如果是最后一张，平滑过渡到第一张
        return 0;
      }
      return prev + 1;
    });
  };

  const handleButtonClick = (linkUrl) => {
    if (linkUrl.startsWith('#')) {
      document.querySelector(linkUrl)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (linkUrl.startsWith('/')) {
      navigate(linkUrl);
    } else {
      window.location.href = linkUrl;
    }
  };

  if (loading) {
    return (
      <div className="hero-section">
        <div className="hero-container hero-skeleton" aria-label="正在加载精选内容">
          <div className="hero-skeleton-copy"><span /><strong /><i /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-slider">
          {slides.map((slide, index) => (
            <article
              key={slide.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              aria-hidden={index !== currentSlide}
            >
              <div className="hero-content">
                <div className="hero-image">
                  <img
                    src={slide.image || HERO_FALLBACK_IMAGE}
                    alt=""
                    onError={(event) => { event.currentTarget.src = HERO_FALLBACK_IMAGE; }}
                  />
                </div>
                <div className="hero-text">
                  <span className="hero-eyebrow">{slide.eyebrow || '博学编辑部 · 推荐阅读'}</span>
                  <h1 className="hero-title">{slide.title}</h1>
                  {slide.subtitle && <p className="hero-subtitle">{slide.subtitle}</p>}
                  {slide.description && slide.description !== slide.subtitle && <p className="hero-description">{slide.description}</p>}
                  <div className="hero-actions">
                    <button className="hero-button" tabIndex={index === currentSlide ? 0 : -1} onClick={() => handleButtonClick(slide.buttonLink)}>
                      <span>{slide.buttonText}</span><StoreIcon name="arrowRight" size={17} />
                    </button>
                    <button className="hero-button hero-button-secondary" tabIndex={index === currentSlide ? 0 : -1} onClick={() => handleButtonClick('#categories')}><span>浏览分类</span></button>
                  </div>
                  <div className="hero-assurance" aria-label="服务特点">
                    <span><StoreIcon name="spark" size={15} />编辑精选</span>
                    <span><StoreIcon name="shield" size={15} />正版好书</span>
                    <span><StoreIcon name="package" size={15} />安心配送</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 导航按钮 */}
        {slides.length > 1 && <>
          <button className="hero-nav prev" onClick={goToPrevSlide} aria-label="上一张轮播图"><StoreIcon name="chevronLeft" /></button>
          <button className="hero-nav next" onClick={goToNextSlide} aria-label="下一张轮播图"><StoreIcon name="chevronRight" /></button>
        </>}

        {/* 指示器 */}
        {slides.length > 1 && <div className="hero-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`切换到第 ${index + 1} 张轮播图`}
              aria-current={index === currentSlide ? 'true' : undefined}
            />
          ))}
        </div>}
      </div>
    </div>
  );
};

export default Hero;
