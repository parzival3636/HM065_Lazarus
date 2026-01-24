/**
 * Currency Formatter Utility
 * Formats numbers to Indian Rupee (₹) with proper locale formatting
 */

/**
 * Format a number as Indian Rupees with proper locale formatting
 * @param {number} amount - The amount to format
 * @param {object} options - Optional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    showSymbol = true,
    decimals = 0,
    locale = 'en-IN'
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const formatted = Number(amount).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format a currency range (min-max)
 * @param {number} min - Minimum amount
 * @param {number} max - Maximum amount
 * @returns {string} Formatted range string
 */
export const formatCurrencyRange = (min, max) => {
  if (!min && !max) return 'Budget not specified';
  if (!max) return formatCurrency(min);
  if (!min) return `Up to ${formatCurrency(max)}`;
  
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

/**
 * Format hourly rate
 * @param {number} rate - Hourly rate
 * @returns {string} Formatted hourly rate string
 */
export const formatHourlyRate = (rate) => {
  if (!rate) return 'Rate not specified';
  return `${formatCurrency(rate)}/hr`;
};

/**
 * Parse currency string to number (removes ₹ symbol and commas)
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  return Number(String(currencyString).replace(/[₹,]/g, ''));
};
