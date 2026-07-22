export const getBookPricing = (book = {}) => {
  const parsedPrice = Number(book.price);
  const parsedDiscount = Number(book.discount);
  const originalPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  const discountPercent = Number.isFinite(parsedDiscount) ? parsedDiscount : 0;
  const hasDiscount = discountPercent > 0 && discountPercent <= 100;
  const currentPrice = hasDiscount
    ? Math.floor(originalPrice * (100 - discountPercent) / 100)
    : originalPrice;

  return {
    originalPrice,
    currentPrice,
    discountPercent,
    savings: originalPrice - currentPrice,
    hasDiscount
  };
};
