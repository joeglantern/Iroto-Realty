'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavigationItem } from '@/types';
import { getPropertyCategories } from '@/lib/data';

const baseNavigation: NavigationItem[] = [
  { label: 'HOME', href: '/' },
  { label: 'About Us', href: '/about' },
  {
    label: 'Rental Portfolio',
    href: '/rental-portfolio',
    children: [], // Will be populated dynamically
  },
  { label: 'Sales Collection', href: '/sales-collection' },
  {
    label: 'Travel Insights',
    href: '/travel-insights',
    children: [
      { label: 'Pre-Arrival Guide', href: '/travel-insights/pre-arrival' },
      { label: 'Getting there', href: '/travel-insights/getting-there' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Header() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navigation, setNavigation] = useState<NavigationItem[]>(baseNavigation);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch categories and update navigation
  useEffect(() => {
    async function loadCategories() {
      try {
        const categories = await getPropertyCategories();

        const updatedNavigation = baseNavigation.map(item => {
          if (item.label === 'Rental Portfolio') {
            return {
              ...item,
              children: categories.map(category => ({
                label: category.name,
                href: `/rental-portfolio/${category.slug}`
              }))
            };
          }
          return item;
        });

        setNavigation(updatedNavigation);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Keep base navigation as fallback
      }
    }

    loadCategories();
  }, []);

  const handleMouseEnter = (label: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // 150ms delay before closing
    setCloseTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 overflow-visible flex items-center justify-start ml-8 lg:ml-12">
            <Link href="/" className="flex items-center justify-center transform-gpu origin-left">
              <Image
                src="/logo/iroto-logo.png"
                alt="Iroto Realty"
                width={180}
                height={60}
                className="h-16 w-auto scale-[4] transform lg:h-18 lg:scale-[5]"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className="text-[#713900] hover:text-brown transition-colors duration-200 font-medium text-sm tracking-wide uppercase"
                >
                  {item.label}
                  {item.children && (
                    <svg
                      className="ml-1 inline-block w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.children && activeDropdown === item.label && (
                  <div 
                    className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-[#713900] hover:text-brown hover:bg-gray-50 transition-colors duration-200"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-[#713900] hover:text-brown hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="block h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={mobileMenuOpen 
                  ? "M6 18L18 6M6 6l12 12" 
                  : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="block px-3 py-3 text-base font-medium text-[#713900] hover:text-brown hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <div className="pl-4 border-l-2 border-gray-100 ml-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-3 py-2 text-sm text-[#713900] hover:text-brown hover:bg-gray-50 transition-colors duration-200 touch-manipulation"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}