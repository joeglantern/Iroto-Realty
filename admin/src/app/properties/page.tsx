'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties, getPropertyCategories, getPropertyTypes, createProperty, createPropertyCategory, generateSlug } from '@/lib/properties';
import { uploadFile, getStorageUrl, supabase } from '@/lib/supabase';
import type { Property, PropertyCategory, PropertyType } from '@/lib/supabase';

export default function Properties() {
  const { signOut, userRole, user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
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
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);

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

    try {
      setUploading(true);
      console.log('Starting property creation...');

      // Create property first to get ID - let the database generate the slug automatically
      const propertyData = {
        ...formData,
        // Remove manual slug generation - database trigger will handle this
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
      const property = await createProperty(propertyData);
      console.log('Property created successfully:', property);

      // Upload hero image if provided
      if (heroImage && property) {
        console.log('Starting hero image upload...');
        const heroPath = `properties/hero/${property.id}/${Date.now()}-${heroImage.name}`;
        console.log('Upload path:', heroPath);
        
        const { data: uploadData, error: uploadError } = await uploadFile('property-images', heroPath, heroImage);
        
        if (uploadError) {
          console.error('Hero image upload failed:', uploadError);
          // Don't fail the entire operation for image upload issues
          alert(`Property created but hero image upload failed: ${uploadError.message}`);
        } else {
          console.log('Hero image uploaded successfully:', uploadData);
          // Update property with hero image path using Supabase directly
          const { error: updateError } = await supabase
            .from('properties')
            .update({ hero_image_path: heroPath })
            .eq('id', property.id);
            
          if (updateError) {
            console.error('Error updating hero image path:', updateError);
            alert(`Property created but failed to link hero image: ${updateError.message}`);
          } else {
            console.log('Hero image path updated successfully');
          }
        }
      }

      alert('Property created successfully!');
      setShowUploadModal(false);
      resetForm();
      loadData(); // Reload data
    } catch (error) {
      console.error('Error creating property:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      alert(`Error creating property: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
    } finally {
      setUploading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPropertyCategory({
        name: newCategory.name,
        slug: generateSlug(newCategory.name),
        description: newCategory.description,
        is_active: true,
        sort_order: categories.length
      });
      
      alert('Category created successfully!');
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '' });
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
              <div className="text-sm text-gray-600">
                {user?.email} ({userRole?.role})
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
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">Manage properties and categories</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
            >
              Manage Categories
            </button>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Add New Property
            </button>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {properties.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No properties found. Create your first property!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
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
                      <div>
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-500">{property.property_categories?.name || 'No category'}</p>
                        <p className="text-sm text-gray-500">
                          {property.listing_type === 'rental' && property.rental_price && `KES ${property.rental_price}/night`}
                          {property.listing_type === 'sale' && property.sale_price && `KES ${property.sale_price}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
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
                      <div className="flex space-x-2">
                        <button className="text-primary hover:text-primary/80">Edit</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
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
                      accept="image/*" 
                      className="hidden" 
                      id="property-hero-image"
                      onChange={(e) => setHeroImage(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="property-hero-image" 
                      className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      Choose Image
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB. Recommended: 1920x1080px</p>
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
                      accept="image/*" 
                      multiple
                      className="hidden" 
                      id="property-gallery-images"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setGalleryImages(files);
                      }}
                    />
                    <label 
                      htmlFor="property-gallery-images" 
                      className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      Choose Images
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB each. Multiple images allowed.</p>
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
                        <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}