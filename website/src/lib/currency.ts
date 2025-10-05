import { supabase } from './supabase';

export type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  last_updated: string;
}

/**
 * Fetch all exchange rates from the database
 */
export async function getExchangeRates(): Promise<ExchangeRate[]> {
  try {
    const { data, error } = await supabase
      .from('currency_exchange_rates')
      .select('from_currency, to_currency, rate, last_updated')
      .order('from_currency');

    if (error) {
      console.error('Error fetching exchange rates:', error);
      return getDefaultExchangeRates();
    }

    return data || getDefaultExchangeRates();
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return getDefaultExchangeRates();
  }
}

/**
 * Get default exchange rates (fallback if database is unavailable)
 */
function getDefaultExchangeRates(): ExchangeRate[] {
  return [
    { from_currency: 'KES', to_currency: 'USD', rate: 0.0077, last_updated: new Date().toISOString() },
    { from_currency: 'KES', to_currency: 'EUR', rate: 0.0071, last_updated: new Date().toISOString() },
    { from_currency: 'KES', to_currency: 'GBP', rate: 0.0061, last_updated: new Date().toISOString() },
    { from_currency: 'KES', to_currency: 'KES', rate: 1.0, last_updated: new Date().toISOString() },
    { from_currency: 'USD', to_currency: 'KES', rate: 130.0, last_updated: new Date().toISOString() },
    { from_currency: 'EUR', to_currency: 'KES', rate: 141.0, last_updated: new Date().toISOString() },
    { from_currency: 'GBP', to_currency: 'KES', rate: 164.0, last_updated: new Date().toISOString() },
  ];
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRates: ExchangeRate[]
): number {
  if (fromCurrency === toCurrency) return amount;

  const rate = exchangeRates.find(
    (r) => r.from_currency === fromCurrency && r.to_currency === toCurrency
  );

  if (!rate) {
    console.warn(`Exchange rate not found for ${fromCurrency} -> ${toCurrency}`);
    return amount;
  }

  return amount * rate.rate;
}

/**
 * Format price with proper currency symbol and formatting
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  options: {
    showDecimals?: boolean;
    locale?: string;
  } = {}
): string {
  const { showDecimals = false, locale = 'en-US' } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    return formatter.format(amount);
  } catch (error) {
    // Fallback if Intl fails
    const symbols: Record<Currency, string> = {
      KES: 'KES',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const formatted = showDecimals
      ? amount.toFixed(2)
      : Math.round(amount).toLocaleString();

    return `${symbols[currency]} ${formatted}`;
  }
}

/**
 * Detect user's preferred currency based on browser locale
 */
export function detectUserCurrency(): Currency {
  if (typeof window === 'undefined') return 'USD'; // SSR fallback

  try {
    const locale = navigator.language || 'en-US';

    // Kenyan users
    if (locale.includes('KE') || locale.includes('SW')) return 'KES';

    // European users
    if (
      locale.includes('DE') ||
      locale.includes('FR') ||
      locale.includes('IT') ||
      locale.includes('ES') ||
      locale.includes('NL')
    ) {
      return 'EUR';
    }

    // UK users
    if (locale.includes('GB')) return 'GBP';

    // Default to USD for international
    return 'USD';
  } catch (error) {
    console.error('Error detecting currency:', error);
    return 'USD';
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    KES: 'KES',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  return symbols[currency] || currency;
}

/**
 * Get currency flag emoji
 */
export function getCurrencyFlag(currency: Currency): string {
  const flags: Record<Currency, string> = {
    KES: '🇰🇪',
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
  };

  return flags[currency] || '';
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: Currency): string {
  const names: Record<Currency, string> = {
    KES: 'Kenyan Shilling',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
  };

  return names[currency] || currency;
}
