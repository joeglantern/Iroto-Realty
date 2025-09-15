'use client';

import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';

interface PropertyCardProps {
  id: number;
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

export default function SalesCollection() {
  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Sales <span className="text-brown">Collection</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90">
              Own your dream home in Kenya's most prestigious coastal locations
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Discover beautiful properties for sale in prime beachfront and coastal locations 
              along Kenya's stunning coastline.
            </p>
          </div>
        </section>

        {/* Properties for Sale */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Properties for Sale
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Luxury properties available for purchase in Kenya's most beautiful coastal locations
              </p>
            </div>
            
            {/* Properties For Sale Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {Array.from({ length: 6 }, (_, i) => {
                const propertyImages = [
                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                ];
                
                return (
                  <PropertyCard 
                    key={i}
                    id={i + 1}
                    images={propertyImages}
                    title={`Luxury Property ${i + 1}`}
                    location={i % 2 === 0 ? 'Lamu Waterfront' : 'Watamu Beachfront'}
                    price={`USD ${(500 + (i * 150)).toLocaleString()}K`}
                    slug={`luxury-property-${i + 1}`}
                    forSale={true}
                  />
                );
              })}
            </div>

            {/* Property Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Luxury Properties</h3>
                <p className="text-gray-600">
                  Premium homes with high-end finishes and modern amenities in coastal Kenya's most desirable areas.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Prime Locations</h3>
                <p className="text-gray-600">
                  Beautiful properties in the most sought-after coastal locations with stunning ocean views and beach access.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Trusted Process</h3>
                <p className="text-gray-600">
                  Professional service with transparent processes, legal security, and comprehensive support throughout your purchase.
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