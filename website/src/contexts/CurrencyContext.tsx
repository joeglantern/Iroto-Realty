'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Currency,
  ExchangeRate,
  getExchangeRates,
  detectUserCurrency,
  convertCurrency as convertCurrencyUtil,
  formatPrice as formatPriceUtil,
  getCurrencySymbol,
  getCurrencyFlag,
  getCurrencyName,
} from '@/lib/currency';

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: ExchangeRate[];
  loading: boolean;
  convertPrice: (amount: number, fromCurrency?: Currency) => number;
  formatPrice: (amount: number, fromCurrency?: Currency, showDecimals?: boolean) => string;
  getCurrencySymbol: (curr?: Currency) => string;
  getCurrencyFlag: (curr?: Currency) => string;
  getCurrencyName: (curr?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = 'preferredCurrency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize currency from localStorage or auto-detect
  useEffect(() => {
    const storedCurrency = localStorage.getItem(STORAGE_KEY) as Currency;
    const initialCurrency = storedCurrency || detectUserCurrency();
    setCurrencyState(initialCurrency);
  }, []);

  // Load exchange rates on mount
  useEffect(() => {
    async function loadExchangeRates() {
      try {
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Error loading exchange rates:', error);
      } finally {
        setLoading(false);
      }
    }

    loadExchangeRates();
  }, []);

  // Update localStorage when currency changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  };

  // Helper to convert price from base currency (KES) to user's currency
  const convertPrice = (amount: number, fromCurrency: Currency = 'KES'): number => {
    return convertCurrencyUtil(amount, fromCurrency, currency, exchangeRates);
  };

  // Helper to format price with conversion
  const formatPrice = (
    amount: number,
    fromCurrency: Currency = 'KES',
    showDecimals: boolean = false
  ): string => {
    const convertedAmount = convertCurrencyUtil(amount, fromCurrency, currency, exchangeRates);
    return formatPriceUtil(convertedAmount, currency, { showDecimals });
  };

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    exchangeRates,
    loading,
    convertPrice,
    formatPrice,
    getCurrencySymbol: (curr?: Currency) => getCurrencySymbol(curr || currency),
    getCurrencyFlag: (curr?: Currency) => getCurrencyFlag(curr || currency),
    getCurrencyName: (curr?: Currency) => getCurrencyName(curr || currency),
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
