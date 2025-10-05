'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';

const currencies: Currency[] = ['KES', 'USD', 'EUR', 'GBP'];

export default function CurrencySwitcher() {
  const { currency, setCurrency, getCurrencyFlag, getCurrencySymbol } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-brown transition-colors duration-200 shadow-sm"
        aria-label="Change currency"
      >
        <span className="text-lg">{getCurrencyFlag()}</span>
        <span className="font-medium text-gray-700 text-sm">{getCurrencySymbol()}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {currencies.map((curr) => (
            <button
              key={curr}
              onClick={() => {
                setCurrency(curr);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 ${
                currency === curr ? 'bg-brown/5 border-l-4 border-brown' : 'border-l-4 border-transparent'
              }`}
            >
              <span className="text-xl">{getCurrencyFlag(curr)}</span>
              <div className="flex-1 text-left">
                <p className={`font-medium text-sm ${currency === curr ? 'text-brown' : 'text-gray-900'}`}>
                  {curr}
                </p>
                <p className="text-xs text-gray-500">{getCurrencySymbol(curr)}</p>
              </div>
              {currency === curr && (
                <svg className="w-5 h-5 text-brown" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
