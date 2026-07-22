import { getBookPricing } from './bookPrice';

describe('getBookPricing', () => {
  test('treats discount as the percentage saved', () => {
    expect(getBookPricing({ price: 59, discount: 20 })).toEqual({
      originalPrice: 59,
      currentPrice: 47,
      discountPercent: 20,
      savings: 12,
      hasDiscount: true
    });
  });

  test('keeps the original price when there is no discount', () => {
    expect(getBookPricing({ price: 38, discount: 0 })).toMatchObject({
      originalPrice: 38,
      currentPrice: 38,
      savings: 0,
      hasDiscount: false
    });
  });

  test('normalizes numeric strings returned by an API', () => {
    expect(getBookPricing({ price: '68', discount: '15' })).toMatchObject({
      originalPrice: 68,
      currentPrice: 57,
      discountPercent: 15,
      hasDiscount: true
    });
  });
});
