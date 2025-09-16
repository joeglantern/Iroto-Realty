'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProperties, getPropertyCategories, getFeaturedProperties } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { Property, PropertyCategory } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

interface PropertyCardProps {
  id: string;
  images: string[];
  title: string;
  location: string;
  price: string;
  slug: string;
  forSale?: boolean;
}

function PropertyCard({ id, images, title, location, price, slug, forSale = false }: PropertyCardProps) {
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
        
        {/* For Sale Badge */}
        {forSale && (
          <div className="absolute top-4 left-4">
            <span className="bg-brown text-white px-3 py-1 rounded-full text-sm font-medium">
              FOR SALE
            </span>
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
    setIsPaused(true);
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
      setIsTransitioning(true);
      setCurrentIndex(0);
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (isRightSwipe && currentIndex > 0) {
      prevSlide();
    } else if (isRightSwipe && currentIndex <= 0) {
      setIsTransitioning(true);
      setCurrentIndex(maxIndex);
      setTimeout(() => setIsTransitioning(false), 300);
    }
    
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Auto-play functionality with progress
  useEffect(() => {
    if (categories.length <= cardsPerView || isPaused || isTransitioning) {
      return;
    }

    let progressInterval: NodeJS.Timeout;
    let slideInterval: NodeJS.Timeout;

    setProgress(0);

    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    slideInterval = setTimeout(() => {
      nextSlide();
      setProgress(0);
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(slideInterval);
    };
  }, [categories.length, cardsPerView, isPaused, isTransitioning, currentIndex]);

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
            touchAction: 'pan-y pinch-zoom'
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
    <Link href={`/sales-collection/${category.slug}`} className="group block">
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
            <p className="text-lg mb-6">{category.description || 'Premium properties await'}</p>
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

export default function SalesCollection() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    search: '',
    location: '',
    type: 'sale'
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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
    if (searchData.location) params.append('location', searchData.location);
    if (searchData.type) params.append('type', searchData.type);
    
    // Navigate to search results
    router.push(`/sales-collection${params.toString() ? '?' + params.toString() : ''}`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [saleProperties, categoryData, featuredData] = await Promise.all([
          getProperties({ listing_type: 'sale' }),
          getPropertyCategories(),
          getFeaturedProperties(6)
        ]);
        setProperties(saleProperties);
        setCategories(categoryData);
        setFeaturedProperties(featuredData.filter(p => p.listing_type === 'sale' || p.listing_type === 'both'));
      } catch (error) {
        console.error('Error loading data:', error);
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
      images.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
    }
    
    const price = property.sale_price 
      ? `${property.currency} ${property.sale_price?.toLocaleString()}`
      : 'Contact for price';

    return {
      id: property.id,
      images,
      title: property.title,
      location: property.specific_location || 'Kenya Coast',
      price,
      slug: property.slug,
      forSale: true
    };
  });

  return (
    <PageLayout>
      <div>
        {/* Hero Section with Embedded Search */}
        <section className="relative h-[70vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Sales <span className="text-brown">Collection</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8">
              Own your dream home in Kenya's most prestigious coastal locations
            </p>
            
            {/* Embedded Search Form */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {/* Search Input */}
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      id="search"
                      name="search"
                      value={searchData.search}
                      onChange={handleSearchChange}
                      placeholder="Search properties for sale..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-brown transition-colors duration-200 text-gray-900"
                    />
                  </div>

                  {/* Location Filter */}
                  <div>
                    <select
                      id="location"
                      name="location"
                      value={searchData.location}
                      onChange={handleSearchChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-brown transition-colors duration-200 text-gray-900"
                    >
                      <option value="">All Locations</option>
                      <option value="Lamu">Lamu</option>
                      <option value="Watamu">Watamu</option>
                      <option value="Malindi">Malindi</option>
                      <option value="Diani">Diani</option>
                      <option value="Nairobi">Nairobi</option>
                    </select>
                  </div>

                  {/* Search Button */}
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-brown text-white px-6 py-3 rounded-lg hover:bg-brown/90 transition-colors duration-200 font-semibold flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </button>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setSearchData({ ...searchData, search: 'beachfront' })}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-brown hover:text-white transition-colors duration-200"
                    >
                      Beachfront
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchData({ ...searchData, search: 'villa' })}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-brown hover:text-white transition-colors duration-200"
                    >
                      Villa
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchData({ ...searchData, search: 'luxury' })}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-brown hover:text-white transition-colors duration-200"
                    >
                      Luxury
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchData({ ...searchData, search: 'ocean view' })}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-brown hover:text-white transition-colors duration-200"
                    >
                      Ocean View
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Browse by Location */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Browse by Destination
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore luxury properties for sale in Kenya's most sought-after coastal and urban locations
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

        {/* Featured Properties for Sale */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Featured Properties for Sale
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Handpicked luxury properties for purchase in Kenya's most beautiful destinations
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
                  <p className="text-gray-500 text-lg">No featured properties for sale at the moment.</p>
                </div>
              ) : (
                featuredProperties.map((property) => {
                  const propertyImages = (property as any).property_images?.length 
                    ? (property as any).property_images.map((img: any) => getStorageUrl('property-images', img.image_path))
                    : property.hero_image_path 
                      ? [getStorageUrl('property-images', property.hero_image_path)]
                      : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"];
                  
                  return (
                    <PropertyCard 
                      key={property.id}
                      id={property.id}
                      images={propertyImages}
                      title={property.title}
                      location={property.specific_location || 'Kenya'}
                      price={property.listing_type === 'sale' 
                        ? `${property.currency || 'KES'} ${property.sale_price?.toLocaleString()}`
                        : `From ${property.currency || 'KES'} ${property.rental_price?.toLocaleString()}/night`
                      }
                      slug={property.slug}
                      forSale={true}
                    />
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* All Properties for Sale */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                All Properties for Sale
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse our complete collection of luxury properties available for purchase
              </p>
            </div>
            
            {/* Properties For Sale Grid */}
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
                  <p className="text-gray-500 text-lg">No properties for sale at the moment.</p>
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
                    forSale={true}
                  />
                ))
              )}
            </div>

          </div>
        </section>

        {/* Why Choose Our Properties */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Why Choose Our Properties for Sale
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Premium Properties</h3>
                <p className="text-gray-600">
                  Carefully selected luxury homes with exceptional finishes and prime coastal locations.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Legal Security</h3>
                <p className="text-gray-600">
                  Complete due diligence, secure transactions, and comprehensive legal support.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Expert Guidance</h3>
                <p className="text-gray-600">
                  Professional support throughout the entire purchase process from viewing to keys.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Our Properties */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                  Why Choose Our Properties
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our carefully selected properties offer the perfect combination of luxury, location, 
                  and lifestyle in Kenya's most beautiful coastal destinations.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-brown rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">Premium Finishes</h4>
                      <p className="text-gray-600 text-sm">High-quality materials and modern amenities throughout</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-brown rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">Stunning Locations</h4>
                      <p className="text-gray-600 text-sm">Beachfront and ocean view properties in exclusive areas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-brown rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">Turnkey Ready</h4>
                      <p className="text-gray-600 text-sm">Move-in ready homes with everything you need included</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Purchase Process */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Purchase Process
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A simple, transparent process to help you find and purchase your dream coastal property
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Consultation</h3>
                <p className="text-gray-600 text-sm">
                  Discuss your property needs and lifestyle preferences with our experts.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Property Tour</h3>
                <p className="text-gray-600 text-sm">
                  Visit selected properties and experience their potential firsthand.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Due Diligence</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive legal and technical verification of your chosen property.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Completion</h3>
                <p className="text-gray-600 text-sm">
                  Finalize the purchase and receive the keys to your new coastal home.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-brown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Buy?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Contact our property specialists to find your perfect coastal home
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <a
                href="/contact"
                className="inline-block bg-white hover:bg-gray-100 text-brown px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                Schedule Consultation
              </a>
              <a
                href="mailto:eunice@irotorealty.com"
                className="inline-block border-2 border-white hover:bg-white hover:text-brown text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}