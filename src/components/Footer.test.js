import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

describe('Footer', () => {
  test('links the ICP filing number to the MIIT filing system', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const filingLink = screen.getByRole('link', { name: '苏ICP备2026050715号-1' });
    expect(filingLink.getAttribute('href')).toBe('https://beian.miit.gov.cn/');
    expect(filingLink.getAttribute('target')).toBe('_blank');
    expect(filingLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
