'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProperties, getCategoryBySlug, getSearchSuggestions } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { Property, PropertyCategory } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';

interface PropertyCardProps {
  id: string;
  images: string[];
  title: string;
  location: string;
  price: string;
  slug: string;
}

function PropertyCard({ id, images, title, location, price, slug }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <a href={`/property/${slug}`} className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 block">
      <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
          style={{
            backgroundImage: `url("${images[currentImageIndex]}")`
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        
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

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                setCurrentImageIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
        
        {/* Eye Icon - Visual indicator only since whole card is clickable */}
        <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
          <svg className="w-5 h-5 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-black mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-sm mb-2">
          {location}
        </p>
        <p className="text-brown font-semibold">
          {price}
        </p>
      </div>
    </a>
  );
}

export default function LamuProperties() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [category, setCategory] = useState<PropertyCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    search: '',
    location: 'Lamu',
    type: 'rental',
    maxPrice: ''
  });
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create search parameters
    const params = new URLSearchParams();
    if (searchData.search) params.append('search', searchData.search);
    params.append('location', 'Lamu');
    params.append('type', 'rental');
    
    // Navigate to search page with results
    router.push(`/search${params.toString() ? '?' + params.toString() : ''}`);
  };

  // Debounced search for suggestions (Lamu rental properties only)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchData.search.length > 2) {
        try {
          setIsLoading(true);
          const results = await getSearchSuggestions(searchData.search, { type: 'rental', location: 'Lamu' });
          setSuggestions(results);
          setShowSuggestions(true);
          setSelectedSuggestionIndex(-1);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchData.search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selectedProperty = suggestions[selectedSuggestionIndex];
          window.location.href = `/property/${selectedProperty.slug}`;
        } else {
          handleSearchSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load category data and properties in parallel
        const [categoryData, lamuProperties] = await Promise.all([
          getCategoryBySlug('lamu'),
          getProperties({
            listing_type: 'rental',
            category_slug: 'lamu'
          })
        ]);
        
        setCategory(categoryData);
        setProperties(lamuProperties);
      } catch (error) {
        console.error('Error loading Lamu data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Transform properties for display
  const transformedProperties = properties.map(property => {
    // Combine hero image and gallery images
    const images = [];
    
    // Add hero image first if available
    if (property.hero_image_path) {
      images.push(getStorageUrl('property-images', property.hero_image_path));
    }
    
    // Add gallery images if available
    if ((property as any).property_images && Array.isArray((property as any).property_images)) {
      const galleryImages = (property as any).property_images
        .filter((img: any) => img.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((img: any) => getStorageUrl('property-images', img.image_path));
      
      images.push(...galleryImages);
    }
    
    // Fallback to placeholder if no images
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
    }
    
    const price = property.rental_price 
      ? `From ${property.currency} ${property.rental_price?.toLocaleString()}/night`
      : 'Contact for price';

    return {
      id: property.id,
      images,
      title: property.title,
      location: property.specific_location || 'Lamu Island',
      price,
      slug: property.slug
    };
  });

  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${
                category?.hero_image_path 
                  ? getStorageUrl('property-images', category.hero_image_path)
                  : 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
              }")`
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-brown">{category?.name || 'Lamu'}</span> {category?.name === 'Lamu' ? 'Island' : ''}
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90">
              Where ancient Swahili culture meets modern luxury
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              {category?.description || 
                'Discover our exclusive collection of luxury properties on this UNESCO World Heritage site, where traditional dhows still sail and stone buildings tell stories of centuries past.'
              }
            </p>
            
            {/* Search Bar for Lamu Properties */}
            <div className="max-w-2xl mx-auto px-2 sm:px-0 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="bg-white rounded-lg shadow-xl p-1 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                  <div className="flex-1 flex items-center pl-3 sm:pl-4 relative min-h-[48px]">
                    <input
                      ref={searchInputRef}
                      type="text"
                      name="search"
                      value={searchData.search}
                      onChange={handleSearchChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true);
                      }}
                      placeholder="Search Lamu rental properties..."
                      className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm sm:text-base py-2 sm:py-3"
                      autoComplete="off"
                    />
                    {isLoading && (
                      <div className="absolute right-3 sm:right-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-brown rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Search Button */}
                  <button
                    type="submit"
                    className="bg-brown hover:bg-brown/90 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-md font-semibold transition-colors duration-200 flex items-center justify-center shadow-md min-h-[44px]"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm sm:text-base">Search</span>
                  </button>
                </div>

                {/* Loading State for Suggestions */}
                {isLoading && searchData.search.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                    <div className="py-8 px-4 text-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-brown rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm text-gray-500">Searching Lamu properties...</p>
                    </div>
                  </div>
                )}

                {/* Empty State for Suggestions */}
                {showSuggestions && !isLoading && suggestions.length === 0 && searchData.search.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                    <div className="py-8 px-4 text-center">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 mb-1">No Lamu properties found</p>
                      <p className="text-xs text-gray-500 mb-4">Try searching for a different property type</p>
                      <button
                        onClick={() => {
                          setSearchData({ ...searchData, search: '' });
                          setShowSuggestions(false);
                        }}
                        className="text-xs text-brown hover:text-brown/80 font-medium"
                      >
                        Clear search
                      </button>
                    </div>
                  </div>
                )}

                {/* Autocomplete Suggestions */}
                {showSuggestions && !isLoading && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden max-h-96 sm:max-h-80"
                    style={{ 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
                    }}
                  >
                    <div className="max-h-72 sm:max-h-64 overflow-y-auto py-2">
                      {suggestions.map((property, index) => {
                        // Get property image with fallbacks
                        let imageUrl = '';
                        
                        if (property.hero_image_path) {
                          imageUrl = getStorageUrl('property-images', property.hero_image_path);
                        } else if ((property as any).property_images?.[0]?.image_path) {
                          imageUrl = getStorageUrl('property-images', (property as any).property_images[0].image_path);
                        } else {
                          imageUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                        }
                        
                        return (
                          <button
                            key={property.id}
                            onClick={() => window.location.href = `/property/${property.slug}`}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 flex items-center space-x-3 ${
                              index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                              <img 
                                src={imageUrl} 
                                alt={property.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{property.title}</p>
                              <p className="text-xs text-gray-500 truncate">Lamu Island</p>
                              {property.rental_price && (
                                <p className="text-xs text-brown font-medium">KES {property.rental_price.toLocaleString()}/night</p>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <span className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-medium">
                                RENTAL
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Results count footer */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {suggestions.length} Lamu propert{suggestions.length === 1 ? 'y' : 'ies'} found
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                {category?.name || 'Lamu'} Properties
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Handpicked luxury rentals in {category?.name || 'Lamu'}'s most desirable locations
              </p>
            </div>
            
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                    <div className="aspect-[4/3] bg-gray-300"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))
              ) : transformedProperties.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No properties available in {category?.name || 'Lamu'} at the moment.
                  </p>
                </div>
              ) : (
                transformedProperties.map((property) => (
                  <PropertyCard 
                    key={property.id}
                    id={property.id}
                    images={property.images}
                    title={property.title}
                    location={property.location}
                    price={property.price}
                    slug={property.slug}
                  />
                ))
              )}
            </div>

            {/* Info Cards Section - Two rounded cards as per Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black">About Lamu</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Lamu is Kenya's oldest living town and a UNESCO World Heritage Site. This enchanting island 
                  preserves Swahili culture in its purest form, with no cars, ancient architecture, and 
                  traditional dhows sailing the waters. Experience authentic hospitality in luxury properties 
                  that honor the island's rich heritage.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black">Getting There</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Reach Lamu by flying to Lamu Airport or driving to Mokowe jetty, followed by a scenic 
                  boat ride across Lamu channel. The journey itself is part of the experience, with 
                  mangroves, fishing villages, and the anticipation of stepping into a world where time 
                  stands still.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Guest Reviews
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                What our guests say about their Lamu experience
              </p>
            </div>
            
            {/* Review Cards Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-brown">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "An absolutely magical experience. The property was stunning and the cultural immersion 
                  was unlike anything we've experienced. Lamu is truly special."
                </p>
                <div className="font-semibold text-black">Sarah & Mike</div>
                <div className="text-gray-500 text-sm">UK</div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-brown">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The attention to detail and authentic Swahili hospitality made our stay unforgettable. 
                  We'll definitely be returning to this piece of paradise."
                </p>
                <div className="font-semibold text-black">Ahmed & Fatima</div>
                <div className="text-gray-500 text-sm">UAE</div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-brown">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Perfect blend of luxury and authenticity. The property exceeded our expectations 
                  and Lamu's charm is indescribable. A truly unique destination."
                </p>
                <div className="font-semibold text-black">James & Lisa</div>
                <div className="text-gray-500 text-sm">USA</div>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Video Section Placeholder */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Experience Lamu
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Watch our video tour of this magnificent destination
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">YouTube Video Placeholder</p>
                  <p className="text-sm text-gray-500 mt-2">Video integration coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}