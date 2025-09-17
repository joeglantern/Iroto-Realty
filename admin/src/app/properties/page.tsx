'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { getProperties, getPropertyCategories, getPropertyTypes, createProperty, createPropertyCategory, generateSlug, deleteProperty, deletePropertyCategory, updateProperty, getProperty } from '@/lib/properties';
import { uploadFile, getStorageUrl, supabase } from '@/lib/supabase';
import type { Property, PropertyCategory, PropertyType } from '@/lib/supabase';

export default function Properties() {
  const { signOut, user, isAdmin } = useSimpleAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string, type: 'property' | 'category'} | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_info_1: '',
    property_info_2: '',
    category_id: '',
    property_type_text: '', // Free text input for property type
    specific_location: '',
    listing_type: 'rental' as 'rental' | 'sale' | 'both',
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

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

  // Supported image formats and max sizes
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_GALLERY_IMAGES = 15; // Reasonable limit for performance

  // Image compression and validation utility
  const processImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      console.log(`Processing image: ${file.name}, type: ${file.type}, size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      
      // Check file type (including file extension fallback for AVIF)
      const isAVIF = file.type === 'image/avif' || file.name.toLowerCase().endsWith('.avif');
      const isSupportedType = SUPPORTED_FORMATS.includes(file.type) || isAVIF;
      
      if (!isSupportedType) {
        reject(new Error(`Unsupported format: ${file.type}. Please use JPEG, PNG, WebP, or AVIF.`));
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`));
        return;
      }

      // Always convert AVIF to JPEG for Supabase compatibility
      if (isAVIF) {
        console.log('AVIF detected - will convert to JPEG for Supabase compatibility');
        // Continue to conversion process below
      }
      // If file is already reasonable size and JPEG/WebP, return as-is  
      else if (file.size <= 2 * 1024 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
        console.log('Small JPEG/WebP - using as-is');
        resolve(file);
        return;
      } else {
        console.log('Large file or PNG - will compress to JPEG');
      }
      
      // AVIF and large files need conversion to JPEG for Supabase compatibility

      // Compress if needed
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920px width, maintain aspect ratio)
        const maxWidth = 1920;
        const maxHeight = 1920;
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new filename with .jpg extension
              const newFileName = file.name.replace(/\.(avif|png|webp|jpe?g)$/i, '.jpg');
              const compressedFile = new File([blob], newFileName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              console.log(`Converted ${file.type} (${(file.size / 1024 / 1024).toFixed(1)}MB) to JPEG (${(blob.size / 1024 / 1024).toFixed(1)}MB)`);
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to convert image to JPEG'));
            }
          },
          'image/jpeg',
          0.85 // 85% quality - good balance of quality and file size
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesData, categoriesData, typesData] = await Promise.all([
        getProperties(),
        getPropertyCategories(),
        getPropertyTypes()
      ]);
      
      setProperties(propertiesData);
      setCategories(categoriesData);
      setPropertyTypes(typesData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      setUploading(true);
      console.log('Starting property creation...');

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

      console.log('Creating property with data:', propertyData);
      
      // Create property with more reasonable timeout
      console.log('Creating property...');
      const property = await createProperty(propertyData);
      
      console.log('Property created successfully:', property);

      // Upload hero image if provided
      if (heroImage && property) {
        console.log('Starting hero image upload...');
        
        try {
          // Process and validate hero image
          const processedHeroImage = await processImage(heroImage);
          const heroPath = `properties/hero/${property.id}/${Date.now()}-${processedHeroImage.name}`;
          console.log('Upload path:', heroPath);
          
          const uploadPromise = uploadFile('property-images', heroPath, processedHeroImage);
          const { data: uploadData, error: uploadError } = await Promise.race([
            uploadPromise,
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Hero image upload timed out after 60 seconds')), 60000)
            )
          ]);
          
          if (uploadError) {
            console.error('Hero image upload failed:', uploadError);
            alert(`Property created but hero image upload failed: ${uploadError.message}`);
          } else {
            console.log('Hero image uploaded successfully:', uploadData);
            
            // Update property with hero image path
            const updatePromise = supabase
              .from('properties')
              .update({ hero_image_path: heroPath })
              .eq('id', property.id);
              
            const { error: updateError } = await Promise.race([
              updatePromise,
              new Promise<any>((_, reject) => 
                setTimeout(() => reject(new Error('Hero image link update timed out')), 15000)
              )
            ]);
              
            if (updateError) {
              console.error('Error updating hero image path:', updateError);
              alert(`Property created but failed to link hero image: ${updateError.message}`);
            } else {
              console.log('Hero image path updated successfully');
            }
          }
        } catch (heroError) {
          console.error('Hero image process error:', heroError);
          alert(`Property created but hero image failed: ${heroError instanceof Error ? heroError.message : 'Unknown error'}`);
        }
      }

      // Upload gallery images if provided
      if (galleryImages.length > 0 && property) {
        console.log(`Starting gallery images upload (${galleryImages.length} images)...`);
        
        // Validate gallery image count
        if (galleryImages.length > MAX_GALLERY_IMAGES) {
          alert(`Too many gallery images (${galleryImages.length}). Maximum allowed is ${MAX_GALLERY_IMAGES}. Processing first ${MAX_GALLERY_IMAGES} images.`);
        }
        
        const imagesToProcess = galleryImages.slice(0, MAX_GALLERY_IMAGES);
        const maxConcurrent = 2; // Reduced for better performance with compression
        let completed = 0;
        let failed = 0;
        const failedImages: string[] = [];
        
        // Process images in batches
        for (let i = 0; i < imagesToProcess.length; i += maxConcurrent) {
          const batch = imagesToProcess.slice(i, i + maxConcurrent);
          const batchPromises = batch.map(async (image, batchIndex) => {
            const actualIndex = i + batchIndex;
            console.log(`Processing gallery image ${actualIndex + 1}/${imagesToProcess.length}...`);
            
            try {
              // Process and validate image first
              const processedImage = await processImage(image);
              const imagePath = `properties/gallery/${property.id}/${Date.now()}-${actualIndex}-${processedImage.name}`;
              console.log(`Uploading gallery image ${actualIndex + 1}/${imagesToProcess.length}:`, imagePath);
              
              const uploadPromise = uploadFile('property-images', imagePath, processedImage);
              const { data: uploadData, error: uploadError } = await Promise.race([
                uploadPromise,
                new Promise<any>((_, reject) => 
                  setTimeout(() => reject(new Error(`Gallery image ${actualIndex + 1} upload timed out after 45 seconds`)), 45000)
                )
              ]);
              
              if (uploadError) {
                console.error(`Gallery image ${actualIndex + 1} upload failed:`, uploadError);
                failed++;
                failedImages.push(`Image ${actualIndex + 1}: ${uploadError.message}`);
                return;
              }

              // Insert into property_images table
              const insertPromise = supabase
                .from('property_images')
                .insert({
                  property_id: property.id,
                  image_path: imagePath,
                  alt_text: `${property.title} - Image ${actualIndex + 1}`,
                  sort_order: actualIndex + 1,
                  is_active: true
                });
                
              const { error: insertError } = await Promise.race([
                insertPromise,
                new Promise<any>((_, reject) => 
                  setTimeout(() => reject(new Error(`Gallery image ${actualIndex + 1} database insert timed out`)), 15000)
                )
              ]);
              
              if (insertError) {
                console.error(`Error inserting gallery image ${actualIndex + 1} record:`, insertError);
                failed++;
                failedImages.push(`Image ${actualIndex + 1}: Database error`);
              } else {
                console.log(`Gallery image ${actualIndex + 1} uploaded and recorded successfully`);
                completed++;
              }
            } catch (error) {
              console.error(`Error processing gallery image ${actualIndex + 1}:`, error);
              failed++;
              const errorMsg = error instanceof Error ? error.message : 'Unknown error';
              failedImages.push(`Image ${actualIndex + 1}: ${errorMsg}`);
            }
          });
          
          await Promise.allSettled(batchPromises);
          
          // Small delay between batches to prevent overwhelming
          if (i + maxConcurrent < imagesToProcess.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        console.log(`Gallery upload completed: ${completed} successful, ${failed} failed`);
        if (failed > 0) {
          console.log('Failed images:', failedImages);
          alert(`Property created! ${completed} gallery images uploaded successfully, ${failed} failed.\n\nFailed images:\n${failedImages.slice(0, 3).join('\n')}${failedImages.length > 3 ? '\n...' : ''}`);
        }
      }

      alert('Property created successfully!');
      setShowUploadModal(false);
      resetForm();
      
      // Reload data with timeout
      try {
        await Promise.race([
          loadData(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Data reload timed out')), 15000)
          )
        ]);
      } catch (reloadError) {
        console.error('Failed to reload data:', reloadError);
        // Don't show error to user, just log it
      }
      
    } catch (error) {
      console.error('Error creating property:', error);
      
      if (error instanceof Error && error.message.includes('timed out')) {
        alert(`Operation timed out: ${error.message}. Please check your internet connection and try again.`);
      } else if (error instanceof Error && error.name === 'AbortError') {
        alert('Operation was cancelled due to timeout. Please try again with a better internet connection.');
      } else {
        console.error('Full error details:', JSON.stringify(error, null, 2));
        alert(`Error creating property: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
      }
    } finally {
      clearTimeout(timeoutId);
      setUploading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating category...');
      
      // Create category first
      const categoryData = {
        name: newCategory.name,
        slug: generateSlug(newCategory.name),
        description: newCategory.description,
        is_active: true,
        sort_order: categories.length
      };

      console.log('Category data:', categoryData);
      const category = await createPropertyCategory(categoryData);
      console.log('Category created:', category);

      // Upload category image if provided
      if (categoryImage && category) {
        console.log('Starting category image upload...');
        const imagePath = `categories/${category.id}/${Date.now()}-${categoryImage.name}`;
        console.log('Upload path:', imagePath);
        
        const { data: uploadData, error: uploadError } = await uploadFile('property-images', imagePath, categoryImage);
        
        if (uploadError) {
          console.error('Category image upload failed:', uploadError);
          alert(`Category created but image upload failed: ${uploadError.message}`);
        } else {
          console.log('Category image uploaded successfully:', uploadData);
          // Update category with hero image path using Supabase directly
          const { error: updateError } = await supabase
            .from('property_categories')
            .update({ hero_image_path: imagePath })
            .eq('id', category.id);
            
          if (updateError) {
            console.error('Error updating category image path:', updateError);
            alert(`Category created but failed to link image: ${updateError.message}`);
          } else {
            console.log('Category image path updated successfully');
          }
        }
      }
      
      alert('Category created successfully!');
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '' });
      setCategoryImage(null);
      loadData(); // Reload categories
    } catch (error) {
      console.error('Error creating category:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Error creating category: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      property_info_1: '',
      property_info_2: '',
      category_id: '',
      property_type_text: '',
      specific_location: '',
      listing_type: 'rental',
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
      status: 'draft',
      is_featured: false
    });
    setHeroImage(null);
    setGalleryImages([]);
  };

  // Edit handlers
  const handleEditClick = (propertyId: string) => {
    // Navigate to dedicated edit page
    window.location.href = `/properties/edit/${propertyId}`;
  };

  // Delete handlers
  const handleDeleteClick = (id: string, name: string, type: 'property' | 'category') => {
    setItemToDelete({ id, name, type });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      if (itemToDelete.type === 'property') {
        await deleteProperty(itemToDelete.id);
        alert('Property deleted successfully!');
      } else {
        await deletePropertyCategory(itemToDelete.id);
        alert('Category deleted successfully!');
      }
      
      setShowDeleteModal(false);
      setItemToDelete(null);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(`Error deleting ${itemToDelete.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <SimpleProtectedRoute>
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
              <div className="text-sm text-gray-600">
                {user?.email} ({isAdmin ? 'admin' : 'user'})
              </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">Manage properties and categories</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="px-3 sm:px-4 py-2 text-sm border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors text-center"
              >
                Manage Categories
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-3 sm:px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-center"
              >
                Add New Property
              </button>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6">
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties found. Create your first property!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {property.hero_image_path ? (
                          <img
                            src={getStorageUrl('property-images', property.hero_image_path)}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{property.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{property.property_categories?.name || 'No category'}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {property.listing_type === 'rental' && property.rental_price && `KES ${property.rental_price}/night`}
                          {property.listing_type === 'sale' && property.sale_price && `KES ${property.sale_price}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          property.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.status}
                        </span>
                        {property.is_featured && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-3 sm:space-x-2">
                        <button 
                          onClick={() => handleEditClick(property.id)}
                          className="text-sm px-3 py-1 text-primary hover:text-primary/80 border border-primary rounded hover:bg-primary/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(property.id, property.title, 'property')}
                          className="text-sm px-3 py-1 text-red-600 hover:text-red-800 border border-red-200 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Property Modal - I'll continue with the modal in the next part due to length limits */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Property</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={uploading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
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

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe the property features, amenities, and location highlights..."
                  />
                </div>

                {/* Property Info Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Info - Section 1</label>
                    <textarea
                      rows={4}
                      value={formData.property_info_1}
                      onChange={(e) => setFormData({ ...formData, property_info_1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Content for the first INFO section (left side)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This will appear in the first INFO box on the property page</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Info - Section 2</label>
                    <textarea
                      rows={4}
                      value={formData.property_info_2}
                      onChange={(e) => setFormData({ ...formData, property_info_2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Content for the second INFO section (right side)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">This will appear in the second INFO box on the property page</p>
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Add a YouTube video tour of the property</p>
                </div>

                {/* Listing Type & Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
                    <select 
                      value={formData.listing_type}
                      onChange={(e) => setFormData({ ...formData, listing_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="rental">Rental</option>
                      <option value="sale">Sale</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rental Price (KES/night)</label>
                    <input
                      type="number"
                      value={formData.rental_price}
                      onChange={(e) => setFormData({ ...formData, rental_price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="25000"
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

                {/* Property Details */}
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

                {/* Hero Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
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
                          const isAVIF = file.type === 'image/avif' || file.name.toLowerCase().endsWith('.avif');
                          const isSupportedType = SUPPORTED_FORMATS.includes(file.type) || isAVIF;
                          
                          if (!isSupportedType) {
                            alert(`Unsupported format: ${file.type}. Please use JPEG, PNG, WebP, or AVIF.`);
                            e.target.value = '';
                            return;
                          }
                          if (file.size > MAX_FILE_SIZE) {
                            alert(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`);
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
                    <p className="text-xs text-gray-500 mt-2">JPEG, PNG, WebP up to 10MB. Recommended: 1920x1080px. AVIF supported (auto-converted).</p>
                  </div>
                </div>

                {/* Gallery Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
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
                        const validFiles: File[] = [];
                        const errors: string[] = [];
                        
                        files.forEach((file, index) => {
                          const isAVIF = file.type === 'image/avif' || file.name.toLowerCase().endsWith('.avif');
                          const isSupportedType = SUPPORTED_FORMATS.includes(file.type) || isAVIF;
                          
                          if (!isSupportedType) {
                            errors.push(`File ${index + 1} (${file.name}): Unsupported format ${file.type}`);
                          } else if (file.size > MAX_FILE_SIZE) {
                            errors.push(`File ${index + 1} (${file.name}): Too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
                          } else {
                            validFiles.push(file);
                          }
                        });
                        
                        if (errors.length > 0) {
                          alert(`Some files were rejected:\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}\n\nPlease use JPEG, PNG, WebP, or AVIF files under 10MB.`);
                        }
                        
                        if (validFiles.length > MAX_GALLERY_IMAGES) {
                          alert(`Too many images selected (${validFiles.length}). Maximum allowed is ${MAX_GALLERY_IMAGES}. Using first ${MAX_GALLERY_IMAGES} images.`);
                          setGalleryImages(validFiles.slice(0, MAX_GALLERY_IMAGES));
                        } else {
                          setGalleryImages(validFiles);
                        }
                        
                        // Clear the input so the same files can be selected again if needed
                        e.target.value = '';
                      }}
                    />
                    <label 
                      htmlFor="property-gallery-images" 
                      className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      Choose Images
                    </label>
                    <p className="text-xs text-gray-500 mt-2">JPEG, PNG, WebP up to 10MB each. Max 15 images. AVIF supported (auto-converted).</p>
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

                {/* Amenities */}
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

                {/* SEO Section */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">SEO Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                      <input
                        type="text"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Luxury Villa in Watamu - Iroto Realty"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        rows={2}
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Discover luxury beachfront villa in Watamu with stunning ocean views..."
                        maxLength={160}
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
                    </div>
                  </div>
                </div>

                {/* Publishing Options */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Publishing Options</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div className="flex items-center">
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

                <div className="flex justify-end space-x-4 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? 'Creating...' : 'Create Property'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Manage Categories</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* Add New Category Form */}
              <form onSubmit={handleCategorySubmit} className="mb-6 pb-6 border-b">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Category</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., Kilifi"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      rows={2}
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Brief description of the location..."
                    />
                  </div>
                  
                  {/* Category Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Image (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
                        accept="image/*"
                        className="hidden"
                        id="category-image-upload"
                      />
                      <label htmlFor="category-image-upload" className="cursor-pointer">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                          {categoryImage ? categoryImage.name : 'Click to upload category image'}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Add Category
                  </button>
                </div>
              </form>

              {/* Existing Categories */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Existing Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary/80 text-sm">Edit</button>
                        <button 
                          onClick={() => handleDeleteClick(category.id, category.name, 'category')}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${itemToDelete?.type === 'property' ? 'Property' : 'Category'}`}
        message={`Are you sure you want to delete this ${itemToDelete?.type}?`}
        itemName={itemToDelete?.name}
        deleteButtonText={`Delete ${itemToDelete?.type === 'property' ? 'Property' : 'Category'}`}
        isDeleting={deleting}
      />
    </div>
    </SimpleProtectedRoute>
  );
}