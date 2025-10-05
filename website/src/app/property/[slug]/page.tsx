'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPropertyBySlug, getPropertyReviews } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { Property, Review } from '@/lib/supabase';
import { renderRichText } from '@/utils/sanitizeHtml';
import PageLayout from '@/components/layout/PageLayout';

interface PropertyDetailProps {
  params: {
    slug: string;
  };
}

// Convert YouTube URLs to embed format
function convertToEmbedUrl(url: string): string {
  if (!url) return '';

  // Handle different YouTube URL formats
  const patterns = [
    // Standard YouTube URLs: https://www.youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    // YouTube mobile URLs: https://m.youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    // YouTube short URLs: https://youtu.be/VIDEO_ID
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    // Already embed URLs: https://www.youtube.com/embed/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // If it's not a YouTube URL, return as-is (for other video platforms)
  return url;
}

export default function PropertyDetail({ params }: PropertyDetailProps) {
  const { slug } = params;
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    async function loadPropertyData() {
      try {
        setLoading(true);
        const [propertyData, reviewsData] = await Promise.all([
          getPropertyBySlug(slug),
          getPropertyReviews(slug) // This will need to be updated to work with property ID
        ]);

        if (!propertyData) {
          setError('Property not found');
          return;
        }

        setProperty(propertyData);
        
        // Get reviews by property ID instead of slug
        const propertyReviews = await getPropertyReviews(propertyData.id);
        setReviews(propertyReviews);
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property data');
      } finally {
        setLoading(false);
      }
    }

    loadPropertyData();
  }, [slug]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  useEffect(() => {
    if (isGalleryOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isGalleryOpen, selectedImageIndex]);

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#713900] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading property details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !property) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The property you are looking for does not exist.'}</p>
            <Link href="/" className="bg-[#713900] text-white px-6 py-3 rounded-lg hover:bg-[#713900]/90 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Process property data for display
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
  
  // Fallback images if none available
  if (images.length === 0) {
    images.push(
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    );
  }

  const heroImage = images[0];
  
  const price = property.listing_type === 'sale' 
    ? property.sale_price 
      ? `${property.currency} ${property.sale_price?.toLocaleString()}`
      : 'Contact for price'
    : property.rental_price 
      ? `From ${property.currency} ${property.rental_price?.toLocaleString()}/night`
      : 'Contact for price';


  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${heroImage}")` }}
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Location Dropdown */}
          <div className="absolute top-8 right-8 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Pre-Arrival Guide</div>
                <div className="text-sm text-gray-600">Getting there</div>
              </div>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl lg:text-6xl font-bold text-brown">
              {(property.specific_location || property.title).toUpperCase()}
            </h1>
          </div>
        </section>

        {/* Property Info Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Property Details */}
              <div>
                <h2 className="text-3xl font-bold text-brown mb-4">
                  {property.title}
                </h2>
                
                {/* Price and Property Details */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#713900] mb-2">{price}</div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {property.bedrooms && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H7C4.79086 21 3 19.2091 3 17V10.7076C3 9.30887 3.73061 8.01175 4.92679 7.28679L9.92679 4.25649C11.2011 3.48421 12.7989 3.48421 14.0732 4.25649L19.0732 7.28679C20.2694 8.01175 21 9.30887 21 10.7076V17C21 19.2091 19.2091 21 17 21H15M9 21V17C9 15.3431 10.3431 14 12 14V14C13.6569 14 15 15.3431 15 17V21M9 21H15" />
                        </svg>
                        {property.bedrooms} bedrooms
                      </span>
                    )}
                    {property.beds && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 9m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M22 17v-3h-20" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 8v9" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14h10v-2a3 3 0 0 0 -3 -3h-7v5z" />
                        </svg>
                        {property.beds} beds
                      </span>
                    )}
                    {property.max_guests && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Up to {property.max_guests} guests
                      </span>
                    )}
                    {property.specific_location && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.specific_location}
                      </span>
                    )}
                  </div>
                </div>
                
                <div 
                  className="text-gray-700 text-lg leading-relaxed mb-8 prose prose-gray max-w-none rich-text-content"
                  dangerouslySetInnerHTML={renderRichText(property.description)}
                />
                
                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 gap-3 text-gray-600">
                      {property.amenities.slice(0, 8).map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-[#713900]/20 rounded flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 bg-[#713900] rounded-sm"></div>
                          </div>
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column - Video */}
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {property.video_url ? (
                  <iframe
                    src={convertToEmbedUrl(property.video_url)}
                    title="Property Tour Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">No video available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brown mb-8 text-center">Property Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image: string, index: number) => (
                <div 
                  key={index} 
                  className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden cursor-pointer group relative"
                  onClick={() => openGallery(index)}
                >
                  <Image
                    src={image}
                    alt={`${property.title} - Image ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* First INFO Section */}
              <div className="bg-gray-100 rounded-3xl p-12 min-h-[300px] flex flex-col justify-center">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">INFO</h3>
                </div>
                <div 
                  className="text-gray-700 leading-relaxed prose prose-gray max-w-none rich-text-content"
                  dangerouslySetInnerHTML={renderRichText(
                    property.property_info_1, 
                    'Additional property information will be available soon.'
                  )}
                />
              </div>
              
              {/* Second INFO Section */}
              <div className="bg-gray-100 rounded-3xl p-12 min-h-[300px] flex flex-col justify-center">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">INFO</h3>
                </div>
                <div 
                  className="text-gray-700 leading-relaxed prose prose-gray max-w-none rich-text-content"
                  dangerouslySetInnerHTML={renderRichText(
                    property.property_info_2, 
                    'More details about this property will be available soon.'
                  )}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-black">Reviews</h2>
              <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {reviews.length > 0 ? reviews.map((review: Review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                  {/* Rating Stars */}
                  <div className="flex mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#713900] mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    "{review.comment}"
                  </p>
                  
                  <div className="flex items-center">
                    {review.reviewer_avatar_path ? (
                      <img 
                        src={getStorageUrl('review-images', review.reviewer_avatar_path)}
                        alt={review.reviewer_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-[#713900] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {review.reviewer_name.charAt(0)}
                      </div>
                    )}
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">{review.reviewer_name}</span>
                      {review.reviewer_location && (
                        <p className="text-xs text-gray-500">{review.reviewer_location}</p>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No reviews available for this property yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Photo Gallery Modal */}
        {isGalleryOpen && selectedImageIndex !== null && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {selectedImageIndex > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {selectedImageIndex < images.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Main Image */}
            <div className="relative max-w-7xl max-h-full flex items-center justify-center">
              <Image
                src={images[selectedImageIndex]}
                alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain rounded-lg"
                priority
              />
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} of {images.length}
            </div>

            {/* Thumbnail Strip */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-screen-lg overflow-x-auto px-4">
              {images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex 
                      ? 'border-white scale-110' 
                      : 'border-gray-400 hover:border-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
// Add custom CSS for rich text content
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .rich-text-content ul {
      list-style-type: disc !important;
      margin-left: 1.5rem !important;
      margin-bottom: 1rem !important;
    }
    
    .rich-text-content ol {
      list-style-type: decimal !important;
      margin-left: 1.5rem !important;
      margin-bottom: 1rem !important;
    }
    
    .rich-text-content li {
      margin-bottom: 0.5rem !important;
      display: list-item !important;
    }
    
    .rich-text-content p {
      margin-bottom: 1rem !important;
    }
    
    .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 {
      font-weight: bold !important;
      margin-bottom: 0.75rem !important;
      margin-top: 1.5rem !important;
    }
    
    .rich-text-content h1 { font-size: 1.875rem !important; }
    .rich-text-content h2 { font-size: 1.5rem !important; }
    .rich-text-content h3 { font-size: 1.25rem !important; }
    
    .rich-text-content strong, .rich-text-content b {
      font-weight: bold !important;
    }
    
    .rich-text-content em, .rich-text-content i {
      font-style: italic !important;
    }
    
    .rich-text-content u {
      text-decoration: underline !important;
    }
    
    .rich-text-content a {
      color: #713900 !important;
      text-decoration: underline !important;
    }
  `;
  document.head.appendChild(style);
}
