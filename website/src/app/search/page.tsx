'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { searchProperties, getAvailableAmenities } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { Property } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

interface PropertyCardProps {
  id: string;
  images: string[];
  title: string;
  location: string;
  price: string;
  slug: string;
  bedrooms: number;
  beds: number;
  listingType?: 'rental' | 'sale' | 'both';
}

function PropertyCard({ images, title, location, price, slug, bedrooms, beds, listingType }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link href={`/property/${slug}`} className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 block">
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
          style={{
            backgroundImage: `url("${images[currentImageIndex]}")`
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        
        {/* Listing Type Badge */}
        {listingType && (
          <div className="absolute top-4 left-4">
            {listingType === 'sale' && (
              <span className="bg-brown text-white px-3 py-1 rounded-full text-sm font-medium">
                FOR SALE
              </span>
            )}
            {listingType === 'rental' && (
              <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                FOR RENT
              </span>
            )}
            {listingType === 'both' && (
              <div className="flex flex-col gap-1">
                <span className="bg-brown text-white px-2 py-1 rounded-full text-xs font-medium">
                  FOR SALE
                </span>
                <span className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-medium">
                  FOR RENT
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.preventDefault();
            prevImage();
          }}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            nextImage();
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1}/{images.length}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-black mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-3">
          {location}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brown font-semibold text-lg">
              {price}
            </p>
            <p className="text-gray-500 text-sm">
              {bedrooms} bedrooms • {beds} beds
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface FilterState {
  listingType: 'all' | 'rental' | 'sale' | 'both';
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  beds: string;
  maxGuests: string;
  amenities: string[];
  hasVideo: 'all' | 'yes' | 'no';
  isFeatured: 'all' | 'yes' | 'no';
  propertyAge: 'all' | 'new' | 'recent' | 'older';
  sortBy: 'newest' | 'price_low' | 'price_high' | 'bedrooms';
}

// Custom Dropdown Component
interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
}

function CustomDropdown({ value, onChange, options, placeholder, className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setSelectedLabel(selected?.label || placeholder);
  }, [value, options, placeholder]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-gray-200 rounded-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:border-brown focus:outline-none focus:border-brown transition-colors duration-200 flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {selectedLabel}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-brown hover:text-white transition-colors duration-150 ${
                  value === option.value ? 'bg-brown text-white' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Custom Filter Pill Component
interface FilterPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

function FilterPill({ label, isActive, onClick, children }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border-2 ${
        isActive 
          ? 'bg-brown text-white border-brown shadow-md' 
          : 'bg-white text-gray-700 border-gray-200 hover:border-brown hover:text-brown'
      }`}
    >
      {children || label}
    </button>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    listingType: (searchParams.get('type') as any) || 'all',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    beds: searchParams.get('beds') || '',
    maxGuests: searchParams.get('maxGuests') || '',
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    hasVideo: (searchParams.get('hasVideo') as any) || 'all',
    isFeatured: (searchParams.get('isFeatured') as any) || 'all',
    propertyAge: (searchParams.get('propertyAge') as any) || 'all',
    sortBy: (searchParams.get('sortBy') as any) || 'newest'
  });

  // Load available amenities on component mount
  useEffect(() => {
    const loadAmenities = async () => {
      const amenities = await getAvailableAmenities();
      setAvailableAmenities(amenities);
    };
    loadAmenities();
  }, []);

  // Perform search
  const performSearch = async () => {
    setLoading(true);
    try {
      const searchFilters: {
        listing_type?: 'rental' | 'sale' | 'both';
        location?: string;
        min_price?: number;
        max_price?: number;
        bedrooms?: number;
        beds?: number;
        max_guests?: number;
        amenities?: string[];
        has_video?: boolean;
        is_featured?: boolean;
        created_after?: string;
        created_before?: string;
      } = {};
      
      if (filters.listingType !== 'all') {
        searchFilters.listing_type = filters.listingType;
      }
      
      if (filters.location) {
        searchFilters.location = filters.location;
      }
      
      if (filters.minPrice) {
        searchFilters.min_price = parseInt(filters.minPrice);
      }
      
      if (filters.maxPrice) {
        searchFilters.max_price = parseInt(filters.maxPrice);
      }
      
      if (filters.bedrooms) {
        searchFilters.bedrooms = parseInt(filters.bedrooms);
      }
      
      if (filters.beds) {
        searchFilters.beds = parseInt(filters.beds);
      }

      if (filters.maxGuests) {
        searchFilters.max_guests = parseInt(filters.maxGuests);
      }

      if (filters.amenities.length > 0) {
        searchFilters.amenities = filters.amenities;
      }

      // Video filter
      if (filters.hasVideo !== 'all') {
        searchFilters.has_video = filters.hasVideo === 'yes';
      }

      // Featured filter
      if (filters.isFeatured !== 'all') {
        searchFilters.is_featured = filters.isFeatured === 'yes';
      }

      // Property age filter
      if (filters.propertyAge !== 'all') {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        
        switch (filters.propertyAge) {
          case 'new':
            searchFilters.created_after = thirtyDaysAgo.toISOString();
            break;
          case 'recent':
            searchFilters.created_after = sixMonthsAgo.toISOString();
            searchFilters.created_before = thirtyDaysAgo.toISOString();
            break;
          case 'older':
            searchFilters.created_before = sixMonthsAgo.toISOString();
            break;
        }
      }

      const results = await searchProperties(searchQuery, searchFilters);
      
      // Sort results
      const sortedResults = [...results];
      switch (filters.sortBy) {
        case 'price_low':
          sortedResults.sort((a, b) => {
            const priceA = a.listing_type === 'sale' ? (a.sale_price || 0) : (a.rental_price || 0);
            const priceB = b.listing_type === 'sale' ? (b.sale_price || 0) : (b.rental_price || 0);
            return priceA - priceB;
          });
          break;
        case 'price_high':
          sortedResults.sort((a, b) => {
            const priceA = a.listing_type === 'sale' ? (a.sale_price || 0) : (a.rental_price || 0);
            const priceB = b.listing_type === 'sale' ? (b.sale_price || 0) : (b.rental_price || 0);
            return priceB - priceA;
          });
          break;
        case 'bedrooms':
          sortedResults.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
          break;
        default: // newest
          // Already sorted by created_at desc in the API
          break;
      }

      setProperties(sortedResults);
      setTotalResults(sortedResults.length);
    } catch (error) {
      console.error('Search error:', error);
      setProperties([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Update URL when filters change
  const updateURL = (newFilters: FilterState, newQuery?: string) => {
    const params = new URLSearchParams();
    
    const queryToUse = newQuery !== undefined ? newQuery : searchQuery;
    if (queryToUse) params.set('q', queryToUse);
    if (newFilters.listingType !== 'all') params.set('type', newFilters.listingType);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms);
    if (newFilters.beds) params.set('beds', newFilters.beds);
    if (newFilters.maxGuests) params.set('maxGuests', newFilters.maxGuests);
    if (newFilters.amenities.length > 0) params.set('amenities', newFilters.amenities.join(','));
    if (newFilters.hasVideo !== 'all') params.set('hasVideo', newFilters.hasVideo);
    if (newFilters.isFeatured !== 'all') params.set('isFeatured', newFilters.isFeatured);
    if (newFilters.propertyAge !== 'all') params.set('propertyAge', newFilters.propertyAge);
    if (newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy);

    const newURL = `${pathname}?${params.toString()}`;
    router.replace(newURL, { scroll: false });
  };

  // Search on load and when filters change
  useEffect(() => {
    performSearch();
  }, [searchQuery, filters]);

  // Update URL when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(filters, searchQuery);
    performSearch();
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      listingType: 'all',
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      beds: '',
      maxGuests: '',
      amenities: [],
      hasVideo: 'all',
      isFeatured: 'all',
      propertyAge: 'all',
      sortBy: 'newest'
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-black mb-6">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Property Search'}
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-2 flex items-center">
                <div className="flex-1 flex items-center pl-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by location, property type, or keyword..."
                    className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-base py-2"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brown hover:bg-brown/90 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Horizontal Filters Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white border-b border-gray-200 pb-4">
            {/* Filter Pills Row */}
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Property Type Filter */}
              <CustomDropdown
                value={filters.listingType}
                onChange={(value) => handleFilterChange('listingType', value)}
                options={[
                  { value: 'all', label: 'Property type' },
                  { value: 'rental', label: 'For Rent' },
                  { value: 'sale', label: 'For Sale' },
                  { value: 'both', label: 'Both Rent & Sale' }
                ]}
                placeholder="Property type"
                className="min-w-[140px]"
              />

              {/* Price Range Filter */}
              <CustomDropdown
                value={filters.maxPrice ? `0-${filters.maxPrice}` : ''}
                onChange={(value) => {
                  if (value) {
                    const [min, max] = value.split('-');
                    handleFilterChange('minPrice', min);
                    handleFilterChange('maxPrice', max);
                  } else {
                    handleFilterChange('minPrice', '');
                    handleFilterChange('maxPrice', '');
                  }
                }}
                options={[
                  { value: '', label: 'Price' },
                  { value: '0-50000', label: 'Up to 50K' },
                  { value: '50000-100000', label: '50K - 100K' },
                  { value: '100000-200000', label: '100K - 200K' },
                  { value: '200000-500000', label: '200K - 500K' },
                  { value: '500000-999999999', label: '500K+' }
                ]}
                placeholder="Price"
                className="min-w-[120px]"
              />

              {/* Bedrooms Filter */}
              <CustomDropdown
                value={filters.bedrooms}
                onChange={(value) => handleFilterChange('bedrooms', value)}
                options={[
                  { value: '', label: 'Bedrooms' },
                  { value: '1', label: '1+' },
                  { value: '2', label: '2+' },
                  { value: '3', label: '3+' },
                  { value: '4', label: '4+' },
                  { value: '5', label: '5+' }
                ]}
                placeholder="Bedrooms"
                className="min-w-[110px]"
              />

              {/* Bathrooms Filter */}
              <CustomDropdown
                value={filters.beds}
                onChange={(value) => handleFilterChange('beds', value)}
                options={[
                  { value: '', label: 'Bathrooms' },
                  { value: '1', label: '1+' },
                  { value: '2', label: '2+' },
                  { value: '3', label: '3+' },
                  { value: '4', label: '4+' }
                ]}
                placeholder="Bathrooms"
                className="min-w-[110px]"
              />

              {/* Location Filter */}
              <div className="flex-1 min-w-[180px] max-w-[300px]">
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Location"
                  className="w-full bg-white border-2 border-gray-200 rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 placeholder-gray-500 hover:border-brown focus:outline-none focus:border-brown transition-colors duration-200"
                />
              </div>

              {/* More Filters Button */}
              <FilterPill
                label="More"
                isActive={showAdvancedFilters}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <div className="flex items-center">
                  More
                  <svg 
                    className={`ml-1 w-4 h-4 transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </FilterPill>

              {/* Clear Filters Button */}
              {(filters.listingType !== 'all' || filters.location || filters.minPrice || filters.maxPrice || filters.bedrooms || filters.beds || filters.maxGuests || filters.amenities.length > 0 || filters.hasVideo !== 'all' || filters.isFeatured !== 'all' || filters.propertyAge !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 border-2 border-red-200 hover:border-red-300 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear all
                </button>
              )}
            </div>

            {/* Advanced Filters (Expandable) */}
            {showAdvancedFilters && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Custom Price Range */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Min Price (KES)</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min price"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 placeholder-gray-400 hover:border-brown focus:outline-none focus:border-brown transition-colors duration-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Max Price (KES)</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max price"
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 placeholder-gray-400 hover:border-brown focus:outline-none focus:border-brown transition-colors duration-200"
                    />
                  </div>

                  {/* Max Guests */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Max Guests</label>
                    <CustomDropdown
                      value={filters.maxGuests}
                      onChange={(value) => handleFilterChange('maxGuests', value)}
                      options={[
                        { value: '', label: 'Any' },
                        { value: '2', label: '2+ guests' },
                        { value: '4', label: '4+ guests' },
                        { value: '6', label: '6+ guests' },
                        { value: '8', label: '8+ guests' },
                        { value: '10', label: '10+ guests' }
                      ]}
                      placeholder="Max guests"
                    />
                  </div>

                  {/* Quick Location Buttons */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Popular Locations</label>
                    <div className="flex flex-wrap gap-3">
                      {['Lamu', 'Watamu', 'Mombasa', 'Malindi', 'Kilifi'].map((loc) => (
                        <FilterPill
                          key={loc}
                          label={loc}
                          isActive={filters.location === loc}
                          onClick={() => handleFilterChange('location', filters.location === loc ? '' : loc)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Special Features Filters */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Has Video Tour</label>
                    <CustomDropdown
                      value={filters.hasVideo}
                      onChange={(value) => handleFilterChange('hasVideo', value)}
                      options={[
                        { value: 'all', label: 'Any' },
                        { value: 'yes', label: 'With Video' },
                        { value: 'no', label: 'No Video' }
                      ]}
                      placeholder="Video filter"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Featured Properties</label>
                    <CustomDropdown
                      value={filters.isFeatured}
                      onChange={(value) => handleFilterChange('isFeatured', value)}
                      options={[
                        { value: 'all', label: 'Any' },
                        { value: 'yes', label: 'Featured Only' },
                        { value: 'no', label: 'Regular Only' }
                      ]}
                      placeholder="Featured filter"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Property Age</label>
                    <CustomDropdown
                      value={filters.propertyAge}
                      onChange={(value) => handleFilterChange('propertyAge', value)}
                      options={[
                        { value: 'all', label: 'Any Age' },
                        { value: 'new', label: 'New (Last 30 days)' },
                        { value: 'recent', label: 'Recent (1-6 months)' },
                        { value: 'older', label: 'Older (6+ months)' }
                      ]}
                      placeholder="Property age"
                    />
                  </div>

                  {/* Amenities */}
                  {availableAmenities.length > 0 && (
                    <div className="lg:col-span-4 space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Amenities 
                        {filters.amenities.length > 0 && (
                          <span className="ml-2 text-brown">({filters.amenities.length} selected)</span>
                        )}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {availableAmenities.slice(0, 15).map((amenity) => (
                          <FilterPill
                            key={amenity}
                            label={amenity}
                            isActive={filters.amenities.includes(amenity)}
                            onClick={() => toggleAmenity(amenity)}
                          />
                        ))}
                      </div>
                      {availableAmenities.length > 15 && (
                        <p className="text-sm text-gray-500">
                          Showing top 15 amenities. Refine your search to see more specific options.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              {loading ? (
                <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
              ) : (
                <p className="text-gray-600 font-medium">
                  {totalResults} {totalResults === 1 ? 'property' : 'properties'} found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              )}
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">Sort by:</span>
              <CustomDropdown
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                  { value: 'bedrooms', label: 'Most Bedrooms' }
                ]}
                placeholder="Sort by"
                className="min-w-[160px]"
              />
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                  <div className="aspect-[4/3] bg-gray-300"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No properties found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? `We couldn't find any properties matching "${searchQuery}". Try adjusting your search or filters.`
                  : "No properties match your current filters. Try adjusting your criteria."
                }
              </p>
              <button
                onClick={clearFilters}
                className="bg-brown text-white px-6 py-2 rounded-md hover:bg-brown/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => {
                // Prepare images
                const images = [];
                if (property.hero_image_path) {
                  images.push(getStorageUrl('property-images', property.hero_image_path));
                }
                if ((property as any).property_images?.length) {
                  const galleryImages = (property as any).property_images
                    .filter((img: any) => img.is_active)
                    .map((img: any) => getStorageUrl('property-images', img.image_path));
                  images.push(...galleryImages);
                }
                if (images.length === 0) {
                  images.push('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
                }

                const price = property.listing_type === 'sale'
                  ? `${property.currency || 'KES'} ${property.sale_price?.toLocaleString()}`
                  : `From ${property.currency || 'KES'} ${property.rental_price?.toLocaleString()}/night`;

                return (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    images={images}
                    title={property.title}
                    location={property.specific_location || 'Kenya Coast'}
                    price={price}
                    slug={property.slug}
                    bedrooms={property.bedrooms || 0}
                    beds={property.beds || 0}
                    listingType={property.listing_type}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown mx-auto mb-4"></div>
            <p className="text-gray-600">Loading search...</p>
          </div>
        </div>
      </PageLayout>
    }>
      <SearchPageContent />
    </Suspense>
  );
}