'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getProperty, updateProperty, getPropertyCategories, getPropertyTypes } from '@/lib/properties';
import { uploadFile, getStorageUrl, supabase } from '@/lib/supabase';
import type { Property, PropertyCategory, PropertyType } from '@/lib/supabase';

export default function EditProperty() {
  const { signOut } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [property, setProperty] = useState<any>(null);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Form state - exactly matching the main properties page form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_info_1: '',
    property_info_2: '',
    category_id: '',
    property_type_text: '',
    specific_location: '',
    listing_type: 'rental' as 'rental' | 'sale',
    rental_price: '',
    sale_price: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    video_url: '',
    amenities: '',
    meta_title: '',
    meta_description: '',
    focus_keyword: '',
    status: 'draft' as 'draft' | 'published',
    is_featured: false
  });
  
  // Image states
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  
  // Image format constants
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [propertyId]);

  // Image processing functions
  const validateImageFile = (file: File): string | null => {
    if (!SUPPORTED_FORMATS.includes(file.type) && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      return `Unsupported format. Please use: ${SUPPORTED_FORMATS.join(', ')}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  };

  const processImage = async (file: File): Promise<File> => {
    const isAVIF = file.type === 'image/avif' || file.name.toLowerCase().endsWith('.avif');
    
    if (isAVIF) {
      console.log('Converting AVIF to JPEG for Supabase compatibility');
      return convertToJPEG(file);
    }

    if (file.size > MAX_FILE_SIZE) {
      console.log('Compressing large image');
      return compressImage(file);
    }

    return file;
  };

  const convertToJPEG = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.(avif)$/i, '.jpg'), {
                type: 'image/jpeg'
              });
              resolve(newFile);
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, 'image/jpeg', 0.85);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: file.type
              });
              resolve(newFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, file.type, 0.85);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [propertyData, categoriesData, typesData] = await Promise.all([
        getProperty(propertyId),
        getPropertyCategories(),
        getPropertyTypes()
      ]);
      
      if (!propertyData) {
        setError('Property not found');
        return;
      }
      
      setProperty(propertyData);
      setCategories(categoriesData || []);
      setPropertyTypes(typesData || []);
      
      // Pre-populate form with existing data
      setFormData({
        title: propertyData.title || '',
        description: propertyData.description || '',
        property_info_1: propertyData.property_info_1 || '',
        property_info_2: propertyData.property_info_2 || '',
        category_id: propertyData.category_id || '',
        property_type_text: propertyData.property_type_text || '',
        specific_location: propertyData.specific_location || '',
        listing_type: propertyData.listing_type || 'rental',
        rental_price: propertyData.rental_price?.toString() || '',
        sale_price: propertyData.sale_price?.toString() || '',
        bedrooms: propertyData.bedrooms?.toString() || '',
        bathrooms: propertyData.bathrooms?.toString() || '',
        max_guests: propertyData.max_guests?.toString() || '',
        video_url: propertyData.video_url || '',
        amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities.join(', ') : '',
        meta_title: propertyData.meta_title || '',
        meta_description: propertyData.meta_description || '',
        focus_keyword: propertyData.focus_keyword || '',
        status: propertyData.status || 'draft',
        is_featured: propertyData.is_featured || false
      });
      
      // Set existing images
      setExistingImages(propertyData.property_images || []);
      
    } catch (error) {
      console.error('Error loading property data:', error);
      setError('Error loading property data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      console.log('Starting property update...');

      // Prepare property data
      const propertyData = {
        ...formData,
        rental_price: formData.rental_price ? parseFloat(formData.rental_price) : undefined,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        max_guests: formData.max_guests ? parseInt(formData.max_guests) : undefined,
        amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : [],
        currency: 'KES',
        is_active: true
      };

      console.log('Updating property with data:', propertyData);
      const updatedProperty = await updateProperty(propertyId, propertyData);
      console.log('Property updated successfully:', updatedProperty);

      // Upload hero image if provided
      if (heroImage && updatedProperty) {
        console.log('Starting hero image upload...');
        
        // Validate and process hero image
        const validationError = validateImageFile(heroImage);
        if (validationError) {
          alert(`Hero image error: ${validationError}`);
          return;
        }
        
        const processedHeroImage = await processImage(heroImage);
        const heroPath = `properties/hero/${updatedProperty.id}/${Date.now()}-${processedHeroImage.name}`;
        console.log('Upload path:', heroPath);
        
        const { data: uploadData, error: uploadError } = await uploadFile('property-images', heroPath, processedHeroImage);
        
        if (uploadError) {
          console.error('Hero image upload failed:', uploadError);
          alert(`Property updated but hero image upload failed: ${uploadError.message}`);
        } else {
          console.log('Hero image uploaded successfully:', uploadData);
          // Update property with hero image path
          const { error: updateError } = await supabase
            .from('properties')
            .update({ hero_image_path: heroPath })
            .eq('id', updatedProperty.id);
            
          if (updateError) {
            console.error('Error updating hero image path:', updateError);
            alert(`Property updated but failed to link hero image: ${updateError.message}`);
          } else {
            console.log('Hero image path updated successfully');
          }
        }
      }

      // Upload gallery images if provided
      if (galleryImages.length > 0 && updatedProperty) {
        console.log('Starting gallery images upload...');
        
        // Validate all gallery images first
        for (const image of galleryImages) {
          const validationError = validateImageFile(image);
          if (validationError) {
            alert(`Gallery image error (${image.name}): ${validationError}`);
            return;
          }
        }
        
        // Process and upload gallery images
        for (const [index, image] of galleryImages.entries()) {
          console.log(`Processing gallery image ${index + 1}/${galleryImages.length}: ${image.name}`);
          
          const processedImage = await processImage(image);
          const galleryPath = `properties/gallery/${updatedProperty.id}/${Date.now()}-${index}-${processedImage.name}`;
          console.log('Uploading gallery image:', galleryPath);
          
          const { data: uploadData, error: uploadError } = await uploadFile('property-images', galleryPath, processedImage);
          
          if (uploadError) {
            console.error('Gallery image upload failed:', uploadError);
            alert(`Gallery image ${index + 1} upload failed: ${uploadError.message}`);
          } else {
            console.log('Gallery image uploaded successfully:', uploadData);
            // Add to property_images table
            const { error: insertError } = await supabase
              .from('property_images')
              .insert({
                property_id: updatedProperty.id,
                image_path: galleryPath,
                alt_text: formData.title,
                sort_order: index + 1
              });
              
            if (insertError) {
              console.error('Error inserting gallery image record:', insertError);
              alert(`Gallery image uploaded but failed to link: ${insertError.message}`);
            } else {
              console.log('Gallery image record inserted successfully');
            }
          }
        }
      }

      alert('Property updated successfully!');
      router.push('/properties'); // Navigate back to properties list
      
    } catch (error) {
      console.error('Error updating property:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      alert(`Error updating property: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <Link href="/properties" className="text-primary hover:underline">
              Back to Properties
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Navigation */}
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center mr-4 md:mr-8">
                  <Image
                    src="/logo/iroto-logo.png"
                    alt="Iroto Realty"
                    width={120}
                    height={40}
                    className="mr-4"
                  />
                </Link>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-primary focus:outline-none focus:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-8">
                  <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors">
                    Overview
                  </Link>
                  <Link href="/properties" className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors">
                    Properties
                  </Link>
                  <Link href="/blog" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors">
                    Blog
                  </Link>
                  <Link href="/reviews" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors">
                    Reviews
                  </Link>
                  <Link href="/analytics" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors">
                    Analytics
                  </Link>
                </nav>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <button 
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-4 py-2 space-y-1">
                <Link href="/dashboard" className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
                  Overview
                </Link>
                <Link href="/properties" className="block w-full text-left px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors">
                  Properties
                </Link>
                <Link href="/blog" className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
                  Blog
                </Link>
                <Link href="/reviews" className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
                  Reviews
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <Link href="/properties" className="text-gray-500 hover:text-gray-700">
                    Properties
                  </Link>
                </li>
                <li>
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </li>
                <li>
                  <span className="text-gray-900 font-medium">Edit Property</span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Update property details, images, and settings
                </p>
                {property && (
                  <p className="mt-1 text-sm text-gray-500">
                    Editing: <span className="font-medium">{property.title}</span>
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/properties"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Form Container */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Property Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Beautiful Villa in Watamu"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Describe your property in detail..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Info 1</label>
                      <textarea
                        rows={3}
                        value={formData.property_info_1}
                        onChange={(e) => setFormData({ ...formData, property_info_1: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Additional property information, highlights, features..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Info 2</label>
                      <textarea
                        rows={3}
                        value={formData.property_info_2}
                        onChange={(e) => setFormData({ ...formData, property_info_2: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="More details, nearby attractions, local information..."
                      />
                    </div>
                  </div>
                </div>

                {/* Category and Location */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Category & Location
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select 
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                      <input
                        type="text"
                        value={formData.property_type_text}
                        onChange={(e) => setFormData({ ...formData, property_type_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Villa, House, Apartment, Resort, Cottage, etc."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specific Location</label>
                    <input
                      type="text"
                      value={formData.specific_location}
                      onChange={(e) => setFormData({ ...formData, specific_location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Beach front, near town center, etc."
                    />
                  </div>
                </div>

                {/* Listing Type and Pricing */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Listing Type & Pricing
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="listing_type"
                          value="rental"
                          checked={formData.listing_type === 'rental'}
                          onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as 'rental' | 'sale' })}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">Rental</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="listing_type"
                          value="sale"
                          checked={formData.listing_type === 'sale'}
                          onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as 'rental' | 'sale' })}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sale</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental Price (KES per night)</label>
                      <input
                        type="number"
                        value={formData.rental_price}
                        onChange={(e) => setFormData({ ...formData, rental_price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (KES)</label>
                      <input
                        type="number"
                        value={formData.sale_price}
                        onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="15000000"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Property Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                      <input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                      <input
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests</label>
                      <input
                        type="number"
                        value={formData.max_guests}
                        onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (Optional)</label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <input
                      type="text"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="WiFi, Pool, Kitchen, AC, Parking, Beach Access (comma separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter amenities separated by commas</p>
                  </div>
                </div>

                {/* Image Management */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Images
                  </h3>

                  {/* Existing Images Display */}
                  {existingImages.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((image, index) => (
                          <div key={image.id} className="relative">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={getStorageUrl('property-images', image.image_path)}
                                alt={image.alt_text || 'Property image'}
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // TODO: Implement image deletion
                                console.log('Delete image:', image.id);
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hero Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Hero Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 mb-2">{heroImage ? heroImage.name : 'Drop hero image here or click to browse'}</p>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" 
                        className="hidden" 
                        id="property-hero-image"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const validationError = validateImageFile(file);
                            if (validationError) {
                              alert(`Invalid hero image: ${validationError}`);
                              e.target.value = '';
                              return;
                            }
                            setHeroImage(file);
                          } else {
                            setHeroImage(null);
                          }
                        }}
                      />
                      <label 
                        htmlFor="property-hero-image" 
                        className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        Choose Image
                      </label>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP, AVIF up to 10MB. Recommended: 1920x1080px</p>
                    </div>
                  </div>

                  {/* Gallery Images Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Gallery Images</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 mb-2">
                        {galleryImages.length > 0 ? `${galleryImages.length} images selected` : 'Drop gallery images here or click to browse'}
                      </p>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" 
                        multiple
                        className="hidden" 
                        id="property-gallery-images"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          
                          // Validate all files
                          const invalidFiles: string[] = [];
                          const validFiles: File[] = [];
                          
                          files.forEach(file => {
                            const validationError = validateImageFile(file);
                            if (validationError) {
                              invalidFiles.push(`${file.name}: ${validationError}`);
                            } else {
                              validFiles.push(file);
                            }
                          });
                          
                          if (invalidFiles.length > 0) {
                            alert(`Invalid gallery images:\n${invalidFiles.join('\n')}`);
                            e.target.value = '';
                            return;
                          }
                          
                          setGalleryImages(validFiles);
                        }}
                      />
                      <label 
                        htmlFor="property-gallery-images" 
                        className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        Choose Images
                      </label>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP, AVIF up to 10MB each. Multiple images allowed.</p>
                      {galleryImages.length > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {galleryImages.map((file, index) => (
                              <div key={index} className="relative">
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newImages = galleryImages.filter((_, i) => i !== index);
                                    setGalleryImages(newImages);
                                  }}
                                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    SEO Settings
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Beautiful Villa in Watamu - Perfect Beach Getaway"
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea
                      rows={3}
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Discover luxury accommodation in Watamu with stunning ocean views, private beach access, and world-class amenities."
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keyword</label>
                    <input
                      type="text"
                      value={formData.focus_keyword}
                      onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="watamu villa rental"
                    />
                    <p className="text-xs text-gray-500 mt-1">Main keyword for SEO optimization</p>
                  </div>
                </div>

                {/* Status and Publishing */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Status & Publishing
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                        Featured Property
                      </label>
                      <p className="ml-2 text-xs text-gray-500">(appears prominently on homepage)</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}