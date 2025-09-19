'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProperties, getCategoryBySlug } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { Property, PropertyCategory } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';

interface PropertyCardProps {
  id: number;
  images: string[];
  title: string;
  location: string;
  price: string;
  slug: string;
  bedrooms: number;
  bathrooms: number;
}

function PropertyCard({ id, images, title, location, price, slug, bedrooms, bathrooms }: PropertyCardProps) {
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
        
        {/* FOR SALE Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-brown text-white px-3 py-1 rounded-full text-sm font-medium">
            FOR SALE
          </span>
        </div>
        
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

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  
  const [category, setCategory] = useState<PropertyCategory | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        const [categoryData, propertiesData] = await Promise.all([
          getCategoryBySlug(categorySlug),
          getProperties({ 
            listing_type: 'sale',
            category_slug: categorySlug 
          })
        ]);
        
        setCategory(categoryData);
        setProperties(propertiesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [categorySlug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen">
          {/* Hero Skeleton */}
          <section className="relative h-[60vh] bg-gray-300 animate-pulse"></section>
          
          {/* Content Skeleton */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto animate-pulse"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            </div>
          </section>
        </div>
      </PageLayout>
    );
  }

  if (!category) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">Category Not Found</h1>
            <p className="text-gray-600">The requested category could not be found.</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${category.hero_image_path ? getStorageUrl('property-images', category.hero_image_path) : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'}")`
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl lg:text-2xl text-white/90">
                {category.description}
              </p>
            )}
          </div>
        </section>

        {/* Properties Grid */}
        <section className="pb-20 pt-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Properties for Sale in {category.name}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our exclusive collection of luxury properties for sale in this beautiful destination.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4m6 0v-7a1 1 0 00-1-1h-4a1 1 0 00-1 1v7m5 0V9a1 1 0 00-1-1H9a1 1 0 00-1 1v12" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Available</h3>
                  <p className="text-gray-500">
                    We don't have any properties for sale in {category.name} at the moment. Please check back later or explore other destinations.
                  </p>
                </div>
              ) : (
                properties.map((property) => {
                  const propertyImages = (property as any).property_images?.length 
                    ? (property as any).property_images.map((img: any) => getStorageUrl('property-images', img.image_path))
                    : property.hero_image_path 
                      ? [getStorageUrl('property-images', property.hero_image_path)]
                      : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"];
                  
                  return (
                    <PropertyCard 
                      key={property.id}
                      id={parseInt(property.id)}
                      images={propertyImages}
                      title={property.title}
                      location={property.specific_location || category.name}
                      price={property.listing_type === 'sale' 
                        ? `${property.currency || 'KES'} ${property.sale_price?.toLocaleString()}`
                        : `From ${property.currency || 'KES'} ${property.rental_price?.toLocaleString()}/night`
                      }
                      slug={property.slug}
                      bedrooms={property.bedrooms || 0}
                      bathrooms={property.bathrooms || 0}
                    />
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
              Ready to Buy Your Dream Home?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Invest in luxury and lifestyle in {category.name}. Contact us to schedule a viewing or get more information about our properties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+254123456789" 
                className="inline-flex items-center justify-center px-8 py-3 bg-brown text-white font-semibold rounded-md hover:bg-brown/90 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us Now
              </a>
              <a 
                href="mailto:info@irotorealty.com" 
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-brown border-2 border-brown font-semibold rounded-md hover:bg-brown hover:text-white transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}