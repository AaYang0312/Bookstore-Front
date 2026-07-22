import React, { useEffect, useRef, useState } from 'react';

const RevealOnScroll = ({ children, className = '', delay = 0 }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -7% 0px'
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`store-reveal ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--store-reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
