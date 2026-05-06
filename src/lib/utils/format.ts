/**
 * PolicyVault Currency Utility
 * Handles Indian Rupee formatting (Lakhs/Crores)
 */

export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') return '₹ 0';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '₹ 0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
};
