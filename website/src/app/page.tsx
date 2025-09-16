'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getFeaturedProperties, getFeaturedReviews, getSearchSuggestions } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { Property, Review } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';

interface PropertyCardProps {
  id: string;
  images: string[];
  title: string;
  location: string;
  price: string;
  slug: string;
  listingType?: 'rental' | 'sale' | 'both';
}

function PropertyCard({ images, title, location, price, slug, listingType }: PropertyCardProps) {
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

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchData, setSearchData] = useState({
    search: '',
    location: '',
    type: '',
    maxPrice: ''
  });
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      title: 'IROTO',
      highlight: 'REALTY'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      title: 'IROTO',
      highlight: 'REALTY'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      title: 'IROTO',
      highlight: 'REALTY'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      title: 'IROTO',
      highlight: 'REALTY'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    // Redirect to search page with search params
    const params = new URLSearchParams();
    if (searchData.search) params.append('q', searchData.search);
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.type) params.append('type', searchData.type);
    if (searchData.maxPrice) params.append('maxPrice', searchData.maxPrice);
    
    window.location.href = `/search?${params.toString()}`;
  };

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchData.search.trim().length > 2) {
        setIsLoading(true);
        try {
          const results = await getSearchSuggestions(searchData.search, 5);
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

  // Handle keyboard navigation
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
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : prev);
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

  // Handle suggestion click
  const handleSuggestionClick = (property: Property) => {
    setShowSuggestions(false);
    window.location.href = `/property/${property.slug}`;
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
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-advance slides every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Carousel Images */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${slide.image}")` }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200 z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 transition-all duration-1000 text-white drop-shadow-lg">
          Find Your Perfect
        </h1>
        <h2 className="text-2xl lg:text-4xl font-bold mb-8 text-[#713900] drop-shadow-lg">
          Coastal Property
        </h2>
        
        {/* Professional Search Bar with Autocomplete */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="bg-white rounded-lg shadow-xl p-2 flex items-center">
              <div className="flex-1 flex items-center pl-4 relative">
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
                  placeholder="Search by location, property type, or keyword..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-base py-3"
                  autoComplete="off"
                />
                {isLoading && (
                  <div className="absolute right-4">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-brown rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Search Button */}
              <button
                type="submit"
                className="bg-brown hover:bg-brown/90 text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200 flex items-center shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
              >
                <div className="py-2">
                  {suggestions.map((property, index) => {
                    // Get property image
                    let imageUrl = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    if (property.hero_image_path) {
                      imageUrl = getStorageUrl('property-images', property.hero_image_path);
                    } else if ((property as any).property_images?.[0]?.image_path) {
                      imageUrl = getStorageUrl('property-images', (property as any).property_images[0].image_path);
                    }

                    const price = property.listing_type === 'sale'
                      ? `${property.currency || 'KES'} ${property.sale_price?.toLocaleString()}`
                      : `From ${property.currency || 'KES'} ${property.rental_price?.toLocaleString()}/night`;

                    return (
                      <div
                        key={property.id}
                        onClick={() => handleSuggestionClick(property)}
                        className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                          index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="w-16 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 mr-4">
                          <img
                            src={imageUrl}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {property.title}
                          </h4>
                          <p className="text-sm text-gray-500 truncate">
                            {property.specific_location || 'Kenya Coast'}
                          </p>
                          <p className="text-sm font-semibold text-brown">
                            {price}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {property.listing_type === 'sale' && (
                            <span className="bg-brown text-white px-2 py-1 rounded-full text-xs font-medium">
                              FOR SALE
                            </span>
                          )}
                          {property.listing_type === 'rental' && (
                            <span className="bg-gray-700 text-white px-2 py-1 rounded-full text-xs font-medium">
                              FOR RENT
                            </span>
                          )}
                          {property.listing_type === 'both' && (
                            <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              BOTH
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                  <p className="text-xs text-gray-500 text-center">
                    Press Enter to search for "{searchData.search}" • Use ↑↓ to navigate • Press Escape to close
                  </p>
                </div>
              </div>
            )}
            
            {/* Quick Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setSearchData({ ...searchData, search: 'Lamu' })}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200 text-sm"
              >
                Lamu Properties
              </button>
              <button
                type="button"
                onClick={() => setSearchData({ ...searchData, search: 'Watamu' })}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200 text-sm"
              >
                Watamu Properties
              </button>
              <button
                type="button"
                onClick={() => setSearchData({ ...searchData, search: 'villa' })}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200 text-sm"
              >
                Luxury Villas
              </button>
              <button
                type="button"
                onClick={() => setSearchData({ ...searchData, search: 'beachfront' })}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors duration-200 text-sm"
              >
                Beachfront
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}

function TestimonialsCarousel() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const featuredReviews = await getFeaturedReviews(6);
        setReviews(featuredReviews);
      } catch (error) {
        console.error('Error loading featured reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadReviews();
  }, []);

  // Transform reviews for display
  const testimonials = reviews.map(review => ({
    id: review.id,
    name: review.reviewer_name,
    location: review.reviewer_location || 'Valued Guest',
    avatar: review.reviewer_avatar_path 
      ? getStorageUrl('review-images', review.reviewer_avatar_path)
      : 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    text: review.comment,
    rating: review.rating,
    property: (review as any).properties?.title || 'Premium Property'
  }));

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  // Auto-advance testimonials every 4 seconds
  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(nextTestimonial, 4000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
            Guest Experiences
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stories from travelers who discovered Kenya's coastal beauty with us
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-8 animate-pulse">
                <div className="w-32 h-6 bg-gray-300 rounded-full mb-6"></div>
                <div className="flex mb-4 space-x-1">
                  {[...Array(5)].map((_, star) => (
                    <div key={star} className="w-5 h-5 bg-gray-300 rounded"></div>
                  ))}
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`bg-gray-50 rounded-lg p-8 border border-gray-100 hover:shadow-lg transition-all duration-300 ${
                  index === currentTestimonial ? 'ring-2 ring-[#713900] ring-opacity-20 bg-white shadow-lg' : ''
                }`}
              >
                {/* Property Badge */}
                <div className="mb-6">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-[#713900] bg-[#713900]/10 rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {testimonial.property}
                  </span>
                </div>

                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#713900] mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-black">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Dots */}
        {!loading && testimonials.length > 0 && (
          <div className="flex justify-center mt-12 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentTestimonial ? 'bg-[#713900] scale-125' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PropertiesCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const featuredProperties = await getFeaturedProperties(12);
        setProperties(featuredProperties);
      } catch (error) {
        console.error('Error loading featured properties:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProperties();
  }, []);

  // Transform properties for display
  const allProperties = properties.map(property => {
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
    
    const price = property.listing_type === 'sale' 
      ? property.sale_price 
        ? `${property.currency} ${property.sale_price?.toLocaleString()}`
        : 'Contact for price'
      : property.rental_price 
        ? `From ${property.currency} ${property.rental_price?.toLocaleString()}/night`
        : 'Contact for price';

    return {
      id: property.id,
      images,
      title: property.title,
      location: property.specific_location || 'Kenya Coast',
      price,
      slug: property.slug,
      listingType: property.listing_type
    };
  });

  const slidesCount = Math.ceil(allProperties.length / 6) || 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesCount);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (allProperties.length > 6) {
      const interval = setInterval(nextSlide, 6000);
      return () => clearInterval(interval);
    }
  }, [allProperties.length, slidesCount]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of premium properties in Kenya's most sought-after coastal destinations.
          </p>
        </div>
        
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Properties Grid - 3x2 layout matching design */}
          <div className="overflow-hidden">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg animate-pulse">
                    <div className="aspect-[4/3] bg-gray-300 rounded-t-lg"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allProperties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No featured properties available</p>
              </div>
            ) : (
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: slidesCount }, (_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {allProperties
                        .slice(slideIndex * 6, (slideIndex + 1) * 6)
                        .map((property) => (
                          <PropertyCard 
                            key={property.id}
                            id={property.id}
                            images={property.images}
                            title={property.title}
                            location={property.location}
                            price={property.price}
                            slug={property.slug}
                            listingType={property.listingType}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slide Indicators */}
          {!loading && allProperties.length > 6 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: slidesCount }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide ? 'bg-[#713900] scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {

  return (
    <PageLayout>
      <div>
        {/* Hero Carousel Section */}
        <HeroCarousel />

        {/* Featured Properties Carousel */}
        <PropertiesCarousel />

        {/* Testimonials Carousel */}
        <TestimonialsCarousel />
      </div>
    </PageLayout>
  );
}