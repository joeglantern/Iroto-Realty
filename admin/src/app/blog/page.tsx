'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { getBlogPosts, getBlogCategories, createBlogPost, createBlogCategory, deleteBlogCategory, generateSlug, deleteBlogPost, updateBlogPost, getBlogPost } from '@/lib/blog';
import { uploadFile, supabase } from '@/lib/supabase';
import type { BlogPost, BlogCategory } from '@/lib/supabase';
import RichTextEditor from '@/components/RichTextEditor';

function Blog() {
  const { signOut } = useSimpleAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Category delete modal states
  const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: 'Complete Guide: How to Create and Manage Blog Posts in Iroto Realty Admin',
    excerpt: '<p>Learn how to effectively create, format, and manage <strong>blog posts</strong> using our rich text editor. This comprehensive guide covers everything from basic formatting to advanced features.</p><ul><li>Rich text formatting options</li><li>Image upload best practices</li><li>SEO optimization tips</li></ul>',
    content: '<h1>How to Create and Manage Blog Posts</h1><p>Welcome to the <strong>Iroto Realty</strong> blog management system! This guide will help you create engaging, well-formatted blog posts that showcase our properties and expertise.</p><h2>Getting Started</h2><p>Creating a new blog post is simple and intuitive. Follow these steps to publish professional content:</p><ol><li><strong>Title</strong>: Create compelling headlines that capture attention</li><li><strong>Category</strong>: Choose the most relevant category for your post</li><li><strong>Content</strong>: Use our rich text editor for professional formatting</li><li><strong>Images</strong>: Upload high-quality photos to enhance your content</li></ol><h2>Rich Text Formatting Features</h2><p>Our editor supports various formatting options to make your content shine:</p><h3>Text Formatting</h3><ul><li><strong>Bold text</strong> for emphasis</li><li><em>Italic text</em> for subtle emphasis</li><li><u>Underlined text</u> for important points</li></ul><h3>Lists and Structure</h3><p>Create organized content with:</p><ul><li>Bullet points for easy reading</li><li>Numbered lists for step-by-step guides</li><li>Headers to organize your content</li></ul><h3>Links and References</h3><p>Add <a href="#">relevant links</a> to enhance your content and provide additional value to readers.</p><h2>Best Practices for Property Blogs</h2><p>When writing about properties, consider these tips:</p><ol><li><strong>Tell a Story</strong>: Make properties come alive with descriptive language</li><li><strong>Include Local Information</strong>: Highlight nearby amenities and attractions</li><li><strong>Use High-Quality Images</strong>: Showcase properties with professional photography</li><li><strong>SEO Optimization</strong>: Use relevant keywords naturally throughout your content</li></ol><h3>Image Guidelines</h3><p>For the best results with blog images:</p><ul><li>Use JPG, PNG, WebP, or AVIF formats</li><li>Keep file sizes under 10MB</li><li>Recommended size: 1200x600px for featured images</li><li>Ensure images are high-quality and properly lit</li></ul><h2>SEO and Meta Information</h2><p>Don\'t forget to optimize your posts for search engines:</p><ul><li><strong>Meta Description</strong>: Write compelling descriptions under 155 characters</li><li><strong>Focus Keywords</strong>: Choose 1-2 main keywords for each post</li><li><strong>Categories</strong>: Use consistent categorization for better organization</li></ul><p><em>Remember: Quality content that provides value to our clients is always the priority!</em></p>',
    category_id: '',
    author_name: 'Admin User',
    read_time: '5',
    meta_description: 'Learn how to create and manage professional blog posts using the Iroto Realty admin system. Complete guide with formatting tips, SEO best practices, and content guidelines.',
    focus_keyword: 'blog management guide',
    status: 'draft' as 'draft' | 'published',
    is_featured: false
  });
  
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);

  // Image format constants
  const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Memoized onChange handlers for rich text editors
  const handleExcerptChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, excerpt: value }));
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        getBlogPosts(),
        getBlogCategories()
      ]);
      
      setBlogPosts(postsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading blog data:', error);
      alert('Error loading blog data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;

    const isEditing = !!editingPost;
    
    try {
      setUploading(true);
      console.log(isEditing ? 'Starting blog post update...' : 'Starting blog post creation...');

      // Prepare post data
      const postData = {
        ...formData,
        slug: editingPost ? editingPost.slug : generateSlug(formData.title), // Keep existing slug when editing
      };

      let post;
      if (isEditing) {
        console.log('Updating blog post with data:', postData);
        post = await updateBlogPost(editingPost.id, postData);
        console.log('Blog post updated successfully:', post);
      } else {
        console.log('Creating blog post with data:', postData);
        post = await createBlogPost(postData);
        console.log('Blog post created successfully:', post);
      }

      // Upload featured image if provided
      if (featuredImage && post) {
        console.log('Starting featured image upload...');
        
        // Validate and process featured image
        const validationError = validateImageFile(featuredImage);
        if (validationError) {
          alert(`Featured image error: ${validationError}`);
          return;
        }
        
        const processedImage = await processImage(featuredImage);
        const imagePath = `blog/featured/${post.id}/${Date.now()}-${processedImage.name}`;
        console.log('Upload path:', imagePath);
        
        const { data: uploadData, error: uploadError } = await uploadFile('blog-images', imagePath, processedImage);
        
        if (uploadError) {
          console.error('Featured image upload failed:', uploadError);
          alert(`Blog post created but featured image upload failed: ${uploadError.message}`);
        } else {
          console.log('Featured image uploaded successfully:', uploadData);
          // Update post with featured image path
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ featured_image_path: imagePath })
            .eq('id', post.id);
            
          if (updateError) {
            console.error('Error updating featured image path:', updateError);
            alert(`Blog post created but failed to link featured image: ${updateError.message}`);
          } else {
            console.log('Featured image path updated successfully');
          }
        }
      }

      alert(isEditing ? 'Blog post updated successfully!' : 'Blog post created successfully!');
      setShowUploadModal(false);
      setShowEditModal(false);
      setEditingPost(null);
      resetForm();
      loadData(); // Reload data
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} blog post:`, error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      alert(`Error ${isEditing ? 'updating' : 'creating'} blog post: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category_id: '',
      author_name: '',
      read_time: '',
      meta_description: '',
      focus_keyword: '',
      status: 'draft',
      is_featured: false
    });
    setFeaturedImage(null);
  };

  // Edit handlers
  const handleEditClick = async (postId: string) => {
    try {
      setLoading(true);
      const post = await getBlogPost(postId);
      setEditingPost(post);
      
      // Pre-populate form with existing data
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category_id: post.category_id || '',
        author_name: post.author_name || '',
        read_time: post.read_time || '',
        meta_description: post.meta_description || '',
        focus_keyword: post.focus_keyword || '',
        status: post.status || 'draft',
        is_featured: post.is_featured || false
      });
      
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading blog post for edit:', error);
      alert('Error loading blog post details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (id: string, title: string) => {
    setPostToDelete({ id, title });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      setDeleting(true);
      await deleteBlogPost(postToDelete.id);
      alert('Blog post deleted successfully!');
      
      setShowDeleteModal(false);
      setPostToDelete(null);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert(`Error deleting blog post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (!deleting) {
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  // Category management functions
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      setUploading(true);
      
      const categoryData = {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        slug: generateSlug(newCategory.name)
      };

      const category = await createBlogCategory(categoryData);
      
      if (category) {
        setCategories([...categories, category]);
        setNewCategory({ name: '', description: '' });
        alert('Category created successfully!');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCategoryDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeletingCategory(true);
      await deleteBlogCategory(categoryToDelete.id);
      
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setShowCategoryDeleteModal(false);
      setCategoryToDelete(null);
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleCategoryDeleteModalClose = () => {
    if (!deletingCategory) {
      setShowCategoryDeleteModal(false);
      setCategoryToDelete(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
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
                <Link href="/blog" className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors">
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
              <Link href="/properties" className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors">
                Properties
              </Link>
              <Link href="/blog" className="block w-full text-left px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors">
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
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="mt-2 text-sm md:text-base text-gray-600">Create and manage blog posts</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
              <button 
                onClick={() => setShowCategoryModal(true)}
                className="px-3 sm:px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center"
              >
                Manage Categories
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="px-3 sm:px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-center"
              >
                Create New Post
              </button>
            </div>
          </div>
        </div>

        {/* Blog Posts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6">
            {blogPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No blog posts found. Create your first post!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div key={post.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{post.title}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1 space-y-1 sm:space-y-0">
                        <span className="truncate">{categories.find(c => c.id === post.category_id)?.name || 'No category'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(post.created_at)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">By {post.author_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                        {post.is_featured && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-3 sm:space-x-2">
                        <button 
                          onClick={() => handleEditClick(post.id)}
                          className="text-sm px-3 py-1 text-primary hover:text-primary/80 border border-primary rounded hover:bg-primary/10 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(post.id, post.title)}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New Blog Post</h3>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ultimate Guide to Coastal Living in Kenya"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Read Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.read_time}
                      onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="5"
                      min="1"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Feature this post</span>
                  </label>
                </div>

                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 mb-2">Drop featured image here or click to browse</p>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" 
                      className="hidden" 
                      id="blog-featured-image"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const validationError = validateImageFile(file);
                          if (validationError) {
                            alert(`Invalid featured image: ${validationError}`);
                            e.target.value = '';
                            return;
                          }
                          setFeaturedImage(file);
                        } else {
                          setFeaturedImage(null);
                        }
                      }}
                    />
                    <label 
                      htmlFor="blog-featured-image" 
                      className="inline-block px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      Choose Image
                    </label>
                    {featuredImage && (
                      <p className="text-sm text-green-600 mt-2">Selected: {featuredImage.name}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP, AVIF up to 10MB. Recommended: 1200x600px</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <RichTextEditor
                    value={formData.excerpt}
                    onChange={handleExcerptChange}
                    placeholder="Brief description of the blog post for preview..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your blog post content here..."
                  />
                </div>

                {/* SEO Section */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">SEO Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                      <textarea
                        rows={2}
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Brief description for search engines (150-160 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keyword</label>
                      <input
                        type="text"
                        value={formData.focus_keyword}
                        onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="main keyword for SEO"
                      />
                    </div>
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
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, status: 'draft' });
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    disabled={uploading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    onClick={() => setFormData({ ...formData, status: 'published' })}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Publishing...' : 'Publish Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Blog Post</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ultimate Guide to Coastal Living in Kenya"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

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
                      id="edit-featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700">Feature this post</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Write your blog post content here..."
                  />
                </div>

                <div className="flex justify-end space-x-4 border-t pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPost(null);
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
                    {uploading ? 'Updating...' : 'Update Post'}
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
              <h3 className="text-lg font-semibold text-gray-900">Manage Blog Categories</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={uploading}
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
                      placeholder="Travel & Lifestyle"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Brief description of this blog category..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>

              {/* Existing Categories */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Existing Categories</h4>
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm">No categories created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <h5 className="font-medium text-gray-900">{category.name}</h5>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setCategoryToDelete({ id: category.id, name: category.name });
                            setShowCategoryDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          disabled={deletingCategory}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showCategoryDeleteModal}
        onClose={handleCategoryDeleteModalClose}
        onConfirm={handleCategoryDelete}
        title="Delete Blog Category"
        message="Are you sure you want to delete this blog category? This action cannot be undone."
        itemName={categoryToDelete?.name}
        deleteButtonText="Delete Category"
        isDeleting={deletingCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post?"
        itemName={postToDelete?.title}
        deleteButtonText="Delete Post"
        isDeleting={deleting}
      />
    </div>
  );
}

export default function BlogPage() {
  return (
    <SimpleProtectedRoute>
      <Blog />
    </SimpleProtectedRoute>
  );
}