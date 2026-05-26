export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR').format(price);
}; 