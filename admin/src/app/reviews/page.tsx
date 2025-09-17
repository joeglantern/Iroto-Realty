'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { getReviews, createReview, deleteReview, updateReview, getReview } from '@/lib/reviews';
import { getProperties } from '@/lib/properties';
import { uploadFile, supabase } from '@/lib/supabase';
import type { Review, Property } from '@/lib/supabase';

function Reviews() {
  const { signOut } = useSimpleAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{id: string, reviewer: string} | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    reviewer_name: '',
    property_id: '',
    rating: '',
    comment: '',
    stay_date: '',
    is_featured: false
  });
  
  const [reviewerPhoto, setReviewerPhoto] = useState<File | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, propertiesData] = await Promise.all([
        getReviews(),
        getProperties()
      ]);
      
      setReviews(reviewsData || []);
      setProperties(propertiesData || []);
    } catch (error) {
      console.error('Error loading reviews data:', error);
      alert('Error loading reviews data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;

    try {
      setUploading(true);
      const isEditing = !!editingReview;
      console.log(isEditing ? 'Starting review update...' : 'Starting review creation...');

      const reviewData = {
        ...formData,
        rating: parseInt(formData.rating),
        stay_date: formData.stay_date || undefined,
        verified_stay: true,
        status: 'approved' as const,
        is_active: true
      };

      let review;
      if (isEditing) {
        console.log('Updating review with data:', reviewData);
        review = await updateReview(editingReview.id, reviewData);
        console.log('Review updated successfully:', review);
      } else {
        console.log('Creating review with data:', reviewData);
        review = await createReview(reviewData);
        console.log('Review created successfully:', review);
      }

      // Upload reviewer photo if provided
      if (reviewerPhoto && review) {
        console.log('Starting reviewer photo upload...');
        const photoPath = `reviews/avatars/${review.id}/${Date.now()}-${reviewerPhoto.name}`;
        console.log('Upload path:', photoPath);
        
        const { data: uploadData, error: uploadError } = await uploadFile('review-images', photoPath, reviewerPhoto);
        
        if (uploadError) {
          console.error('Reviewer photo upload failed:', uploadError);
          alert(`Review created but photo upload failed: ${uploadError.message}`);
        } else {
          console.log('Reviewer photo uploaded successfully:', uploadData);
          // Update review with photo path
          const { error: updateError } = await supabase
            .from('reviews')
            .update({ reviewer_avatar_path: photoPath })
            .eq('id', review.id);
            
          if (updateError) {
            console.error('Error updating reviewer photo path:', updateError);
            alert(`Review created but failed to link photo: ${updateError.message}`);
          } else {
            console.log('Reviewer photo path updated successfully');
          }
        }
      }

      alert(isEditing ? 'Review updated successfully!' : 'Review added successfully!');
      setShowUploadModal(false);
      setShowEditModal(false);
      setEditingReview(null);
      resetForm();
      loadData(); // Reload data
    } catch (error) {
      const action = editingReview ? 'updating' : 'creating';
      console.error(`Error ${action} review:`, error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      alert(`Error ${action} review: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reviewer_name: '',
      property_id: '',
      rating: '',
      comment: '',
      stay_date: '',
      is_featured: false
    });
    setReviewerPhoto(null);
  };

  // Edit handlers
  const handleEditClick = async (reviewId: string) => {
    try {
      setLoading(true);
      const review = await getReview(reviewId);
      setEditingReview(review);
      
      // Pre-populate form with existing data
      setFormData({
        reviewer_name: review.reviewer_name || '',
        property_id: review.property_id || '',
        rating: review.rating?.toString() || '',
        comment: review.comment || '',
        stay_date: review.stay_date || '',
        is_featured: review.is_featured || false
      });
      
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading review for edit:', error);
      alert('Error loading review details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (id: string, reviewer: string) => {
    setReviewToDelete({ id, reviewer });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      await deleteReview(reviewToDelete.id);
      alert('Review deleted successfully!');
      
      setShowDeleteModal(false);
      setReviewToDelete(null);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(`Error deleting review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (reviewId: string, currentStatus: boolean) => {
    try {
      await updateReview(reviewId, { is_featured: !currentStatus });
      alert(`Review ${!currentStatus ? 'marked as featured' : 'removed from featured'}!`);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error updating review:', error);
      alert(`Error updating review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const filteredReviews = reviews.filter(review => 
    selectedFilter === 'all' || 
    (selectedFilter === 'featured' && review.is_featured) ||
    (selectedFilter === 'regular' && !review.is_featured)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
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
                <Link href="/properties" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors">
                  Properties
                </Link>
                <Link href="/blog" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors">
                  Blog
                </Link>
                <Link href="/reviews" className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors">
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
              <Link href="/properties" className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
                Properties
              </Link>
              <Link href="/blog" className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
                Blog
              </Link>
              <Link href="/reviews" className="block w-full text-left px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors">
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Review Management</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">Create and manage customer reviews</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Reviews</option>
              <option value="featured">Featured Reviews</option>
              <option value="regular">Regular Reviews</option>
            </select>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Add New Review
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews found. Add your first review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{review.reviewer_name}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">For: <span className="font-medium">{properties.find(p => p.id === review.property_id)?.title || 'Unknown Property'}</span></p>
                        <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.is_featured && (
                          <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-medium">Featured</span>
                          </div>
                        )}
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Published
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleEditClick(review.id)}
                        className="px-3 py-1 text-primary border border-primary text-sm rounded hover:bg-primary/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(review.id, review.reviewer_name)}
                        className="px-3 py-1 text-red-600 text-sm hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleToggleFeatured(review.id, review.is_featured)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          review.is_featured 
                            ? 'text-yellow-700 border border-yellow-300 hover:bg-yellow-50' 
                            : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {review.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Review Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Review</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Name</label>
                    <input
                      type="text"
                      value={formData.reviewer_name}
                      onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                    <select 
                      value={formData.property_id}
                      onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a property</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select 
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select rating</option>
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Good</option>
                      <option value="2">2 Stars - Fair</option>
                      <option value="1">1 Star - Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stay Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.stay_date}
                      onChange={(e) => setFormData({ ...formData, stay_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">When did the guest stay at the property?</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                  <textarea
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Write the customer's review comment here..."
                    required
                  />
                </div>

                {/* Reviewer Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Photo (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-gray-600 mb-2">Drop reviewer photo here or click to browse</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id="reviewer-photo"
                      onChange={(e) => setReviewerPhoto(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="reviewer-photo" 
                      className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      Choose Photo
                    </label>
                    {reviewerPhoto && (
                      <p className="text-sm text-green-600 mt-2">Selected: {reviewerPhoto.name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB. Recommended: 200x200px</p>
                  </div>
                </div>

                {/* Featured Review Toggle */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Featured Review</h3>
                      <p className="text-sm text-gray-600">Featured reviews appear prominently on the homepage and property pages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Adding...' : 'Add Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Review</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReview(null);
                  resetForm();
                }}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Name</label>
                    <input
                      type="text"
                      value={formData.reviewer_name}
                      onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
                    <select 
                      value={formData.property_id}
                      onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a property</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select 
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select rating</option>
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Good</option>
                      <option value="2">2 Stars - Fair</option>
                      <option value="1">1 Star - Poor</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">Featured Review</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Review Comment</label>
                  <textarea
                    rows={4}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Write the customer's review comment here..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingReview(null);
                      resetForm();
                    }}
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
                    {uploading ? 'Updating...' : 'Update Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        itemName={reviewToDelete?.reviewer}
        deleteButtonText="Delete Review"
        isDeleting={deleting}
      />
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <SimpleProtectedRoute>
      <Reviews />
    </SimpleProtectedRoute>
  );
}