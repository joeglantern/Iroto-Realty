'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getPropertyCategories, getFeaturedProperties, getSearchSuggestions } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { PropertyCategory, Property } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

interface PropertyCardProps {
  id: number;
  images: string[];
  title: string;
  location: string;
  price: string;
  slug: string;
  bedrooms: number;
  bathrooms: number;
  listingType?: 'rental' | 'sale' | 'both';
}

function PropertyCard({ id, images, title, location, price, slug, bedrooms, bathrooms, listingType = 'rental' }: PropertyCardProps) {
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
              {bedrooms} bedrooms • {bathrooms} bathrooms
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}

interface CategoryCarouselProps {
  categories: PropertyCategory[];
}

function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Show 2 cards on desktop, 1 on mobile
  const cardsPerView = typeof window !== 'undefined' && window.innerWidth >= 768 ? 2 : 1;
  const maxIndex = Math.max(0, categories.length - cardsPerView);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Touch event handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true); // Pause auto-play during touch
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsPaused(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < maxIndex) {
      nextSlide();
    } else if (isLeftSwipe && currentIndex >= maxIndex) {
      // Loop to beginning
      setIsTransitioning(true);
      setCurrentIndex(0);
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (isRightSwipe && currentIndex > 0) {
      prevSlide();
    } else if (isRightSwipe && currentIndex <= 0) {
      // Loop to end
      setIsTransitioning(true);
      setCurrentIndex(maxIndex);
      setTimeout(() => setIsTransitioning(false), 300);
    }
    
    // Resume auto-play after a delay
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Auto-play functionality with progress
  useEffect(() => {
    if (categories.length <= cardsPerView || isPaused || isTransitioning) {
      return;
    }

    let progressInterval: NodeJS.Timeout;
    let slideInterval: NodeJS.Timeout;

    // Reset progress
    setProgress(0);

    // Update progress every 50ms
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1; // 1% every 50ms = 5 seconds total
      });
    }, 50);

    // Move to next slide after 5 seconds
    slideInterval = setTimeout(() => {
      nextSlide();
      setProgress(0);
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(slideInterval);
    };
  }, [categories.length, cardsPerView, isPaused, isTransitioning, currentIndex]);

  // Reset progress when paused/unpaused
  useEffect(() => {
    if (isPaused) {
      setProgress(0);
    }
  }, [isPaused]);

  useEffect(() => {
    const handleResize = () => {
      const newCardsPerView = window.innerWidth >= 768 ? 2 : 1;
      const newMaxIndex = Math.max(0, categories.length - newCardsPerView);
      if (currentIndex > newMaxIndex) {
        setCurrentIndex(newMaxIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories.length, currentIndex]);

  if (categories.length === 0) return null;

  // If we have 2 or fewer categories, show them in a simple grid
  if (categories.length <= 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div 
        className="overflow-hidden rounded-lg"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
            touchAction: 'pan-y pinch-zoom' // Allow vertical scroll but prevent default horizontal behavior
          }}
        >
          {categories.map((category) => (
            <div 
              key={category.id}
              className="w-full md:w-1/2 flex-shrink-0 px-4"
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {categories.length > cardsPerView && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 z-10"
          >
            <svg className="w-6 h-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 z-10"
          >
            <svg className="w-6 h-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator with Progress */}
      {categories.length > cardsPerView && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`relative w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-brown scale-110' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              {/* Progress ring for active dot */}
              {index === currentIndex && !isPaused && categories.length > cardsPerView && (
                <div className="absolute inset-0 rounded-full">
                  <svg className="w-3 h-3 transform -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="rgba(139, 69, 19, 0.3)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="rgba(139, 69, 19, 0.8)"
                      strokeWidth="3"
                      strokeDasharray="62.83"
                      strokeDashoffset={62.83 - (62.83 * progress) / 100}
                      className="transition-all duration-75 ease-linear"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryCardProps {
  category: PropertyCategory;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/rental-portfolio/${category.slug}`} className="group block">
      <div className="relative h-96 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
          style={{
            backgroundImage: `url("${category.hero_image_path ? getStorageUrl('property-images', category.hero_image_path) : 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}")`
          }}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">{category.name}</h3>
            <p className="text-lg mb-6">{category.description || 'Luxury awaits'}</p>
            <div className="inline-flex items-center text-brown bg-white px-6 py-2 rounded-md font-semibold group-hover:bg-brown group-hover:text-white transition-colors duration-300">
              View Properties
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RentalPortfolio() {
  const router = useRouter();
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    search: '',
    location: '',
    type: 'rental',
    maxPrice: ''
  });
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    // Create search parameters
    const params = new URLSearchParams();
    if (searchData.search) params.append('q', searchData.search);
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.type) params.append('type', searchData.type);
    
    // Navigate to search page with results
    window.location.href = `/search?${params.toString()}`;
  };

  // Debounced search for suggestions (rental properties only)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchData.search.trim().length > 2) {
        setIsLoading(true);
        try {
          const results = await getSearchSuggestions(searchData.search, 5);
          // Filter for rental properties
          const rentalResults = results.filter(property => 
            property.listing_type === 'rental' || property.listing_type === 'both'
          );
          setSuggestions(rentalResults);
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
        const [categoryData, propertiesData] = await Promise.all([
          getPropertyCategories(),
          getFeaturedProperties(6)
        ]);
        setCategories(categoryData);
        setFeaturedProperties(propertiesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <PageLayout>
      <div>
        {/* Hero Section with Embedded Search */}
        <section className="relative h-[70vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Rental <span className="text-brown">Portfolio</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8">
              Discover luxury vacation rentals in Kenya's premier coastal destinations
            </p>
            
            {/* Advanced Search Bar with Autocomplete */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="bg-white rounded-full shadow-xl p-1.5 sm:p-2 flex items-center gap-1 sm:gap-2">
                  <div className="flex-1 flex items-center pl-4 sm:pl-5 relative min-h-[40px] sm:min-h-[48px]">
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
                      placeholder="Search properties..."
                      className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-base sm:text-lg py-2 sm:py-3"
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
                    className="bg-brown hover:bg-brown/90 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full font-semibold transition-colors duration-200 flex items-center justify-center shadow-md flex-shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>

                {/* Loading State for Suggestions */}
                {isLoading && searchData.search.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                    <div className="py-6 sm:py-8 px-4 text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-300 border-t-brown rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-sm sm:text-base text-gray-500">Searching properties...</p>
                    </div>
                  </div>
                )}

                {/* Empty State for Suggestions */}
                {showSuggestions && !isLoading && suggestions.length === 0 && searchData.search.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] overflow-hidden">
                    <div className="py-6 sm:py-8 px-4 text-center">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm sm:text-base font-medium text-gray-900 mb-1">No properties found</p>
                      <p className="text-xs sm:text-sm text-gray-500 mb-4">Try searching for a different location or property type</p>
                      <button
                        onClick={() => {
                          setSearchData({ ...searchData, search: '' });
                          setShowSuggestions(false);
                        }}
                        className="text-xs sm:text-sm text-brown hover:text-brown/80 font-medium"
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
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] overflow-hidden max-h-[70vh] sm:max-h-96"
                    style={{ 
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' 
                    }}
                  >
                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto py-2">
                      {suggestions.map((property, index) => {
                        // Get property image with fallbacks
                        let imageUrl = '';
                        
                        if (property.hero_image_path) {
                          imageUrl = getStorageUrl('property-images', property.hero_image_path);
                        } else if ((property as any).property_images?.[0]?.image_path) {
                          imageUrl = getStorageUrl('property-images', (property as any).property_images[0].image_path);
                        } else {
                          // Fallback based on property type or location
                          if (property.title.toLowerCase().includes('lamu')) {
                            imageUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                          } else if (property.title.toLowerCase().includes('watamu')) {
                            imageUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                          } else {
                            imageUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                          }
                        }
                        
                        return (
                          <div
                            key={property.id}
                            onClick={() => window.location.href = `/property/${property.slug}`}
                            className={`flex items-start sm:items-center px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                              index === selectedSuggestionIndex 
                                ? 'bg-blue-50 border-l-blue-500' 
                                : 'border-l-transparent hover:border-l-gray-300'
                            }`}
                          >
                            <div className="w-16 h-12 sm:w-20 sm:h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-3 sm:mr-4 relative">
                              <img
                                src={imageUrl}
                                alt={property.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-gray-900 text-base sm:text-lg truncate pr-2">
                                  {property.title}
                                </h4>
                                <span className="bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium flex-shrink-0">
                                  FOR RENT
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm sm:text-base">
                                <p className="text-gray-500 truncate flex items-center">
                                  <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {property.specific_location || 'Kenya Coast'}
                                </p>
                                <p className="font-semibold text-brown ml-2 text-sm sm:text-base">
                                  {property.rental_price ? `From KES ${property.rental_price.toLocaleString()}/night` : 'Contact for price'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Enhanced Footer with Better Instructions */}
                    <div className="border-t border-gray-200 px-4 sm:px-5 py-3 bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center text-xs sm:text-sm text-gray-500">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {suggestions.length} propert{suggestions.length === 1 ? 'y' : 'ies'} found
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                          <kbd className="px-1.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">↑↓</kbd> navigate • 
                          <kbd className="px-1.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ml-1">Enter</kbd> search • 
                          <kbd className="px-1.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ml-1">Esc</kbd> close
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 sm:hidden">
                          Tap any property to view details
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
              
            </div>
          </div>
        </section>

        {/* Location Selection */}
        <section className="pb-20 pt-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Choose Your Destination
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore our exclusive collection of luxury properties in Kenya's most sought-after locations
              </p>
            </div>
            
            {loading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No destinations available at the moment.</p>
              </div>
            ) : (
              <CategoryCarousel categories={categories} />
            )}
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Featured Properties
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Handpicked luxury rentals that reflect style, quality, and the essence of coastal charm
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                    <div className="aspect-[4/3] bg-gray-300"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-5 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : featuredProperties.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No featured properties available at the moment.</p>
                </div>
              ) : (
                featuredProperties.map((property) => {
                  const propertyImages = (property as any).property_images?.length 
                    ? (property as any).property_images.map((img: any) => getStorageUrl('property-images', img.image_path))
                    : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"];
                  
                  return (
                    <PropertyCard 
                      key={property.id}
                      id={parseInt(property.id)}
                      images={propertyImages}
                      title={property.title}
                      location={property.specific_location || 'Kenya'}
                      price={property.listing_type === 'sale' 
                        ? `KES ${property.sale_price?.toLocaleString()}`
                        : `From KES ${property.rental_price?.toLocaleString()}/night`
                      }
                      slug={property.slug}
                      bedrooms={property.bedrooms || 0}
                      bathrooms={property.bathrooms || 0}
                      listingType={property.listing_type}
                    />
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Why Choose Our Rentals
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4m6 0v-7a1 1 0 00-1-1h-4a1 1 0 00-1 1v7m5 0V9a1 1 0 00-1-1H9a1 1 0 00-1 1v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Luxury Properties</h3>
                <p className="text-gray-600">
                  Carefully selected premium properties with exceptional amenities and stunning locations.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Local Expertise</h3>
                <p className="text-gray-600">
                  Over seven years of coastal living gives us insider understanding of the region's charm, culture, and lifestyle.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">24/7 Support</h3>
                <p className="text-gray-600">
                  Round-the-clock assistance to ensure your stay is comfortable and memorable.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}