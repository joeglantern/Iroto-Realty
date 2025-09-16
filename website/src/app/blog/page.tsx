'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogPosts, getBlogCategories } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { BlogPost, BlogCategory } from '@/lib/supabase';
import PageLayout from '@/components/layout/PageLayout';

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  // Data loading
  useEffect(() => {
    async function loadBlogData() {
      try {
        setLoading(true);
        const [postsData, categoriesData] = await Promise.all([
          getBlogPosts({ featured: false }),
          getBlogCategories()
        ]);
        setBlogPosts(postsData);
        setBlogCategories(categoriesData);
        setFilteredPosts(postsData);
      } catch (error) {
        console.error('Error loading blog data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadBlogData();
  }, []);

  // Category filtering
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPosts(blogPosts);
    } else {
      const categoryId = blogCategories.find(cat => cat.name === selectedCategory)?.id;
      setFilteredPosts(blogPosts.filter(post => post.category_id === categoryId));
    }
  }, [selectedCategory, blogPosts, blogCategories]);

  // Helper function to calculate read time
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content ? content.split(' ').length : 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get image URL
  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (imagePath) {
      return getStorageUrl('blog-images', imagePath);
    }
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  // Get categories for display
  const displayCategories = ['All', ...blogCategories.map(cat => cat.name)];

  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Our <span className="text-brown">Blog</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90">
              Discover stories, insights, and guides about Kenya's coastal paradise
            </p>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {loading ? (
                // Loading skeleton for categories
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-10 w-24 bg-gray-300 rounded-full animate-pulse"></div>
                ))
              ) : (
                displayCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full border-2 border-brown font-medium transition-colors duration-200 ${
                      selectedCategory === category
                        ? 'bg-brown text-white'
                        : 'text-brown hover:bg-brown hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))
              )}
            </div>

            {/* Featured Article */}
            {loading ? (
              <div className="mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1 space-y-4">
                    <div className="flex space-x-2">
                      <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="h-6 w-24 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-16 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-12 w-32 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <div className="aspect-[4/3] bg-gray-300 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="px-3 py-1 bg-brown/10 text-brown text-sm font-medium rounded-full">
                        Featured
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                        {blogCategories.find(cat => cat.id === filteredPosts[0].category_id)?.name || 'General'}
                      </span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {filteredPosts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brown rounded-full flex items-center justify-center text-white font-semibold">
                          {filteredPosts[0].author_name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{filteredPosts[0].author_name || 'Author'}</p>
                          <p className="text-sm text-gray-500">{formatDate(filteredPosts[0].created_at)}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{calculateReadTime(filteredPosts[0].content || '')}</span>
                    </div>
                    <Link
                      href={`/blog/${filteredPosts[0].slug}`}
                      className="inline-block bg-brown hover:bg-brown/90 text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200"
                    >
                      Read Article
                    </Link>
                  </div>
                  <div className="order-1 lg:order-2">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={getImageUrl(filteredPosts[0].featured_image_path)}
                        alt={filteredPosts[0].title}
                        width={600}
                        height={450}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                // Loading skeleton for blog grid
                Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                    <div className="aspect-[4/3] bg-gray-300"></div>
                    <div className="p-6 space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-300 rounded-full"></div>
                        <div className="h-4 w-16 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="h-3 w-20 bg-gray-300 rounded"></div>
                          <div className="h-3 w-16 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredPosts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Blog Posts Found</h3>
                  <p className="text-gray-500">
                    {selectedCategory === 'All' 
                      ? "We don't have any blog posts at the moment. Please check back later."
                      : `No blog posts found in the "${selectedCategory}" category. Try selecting a different category.`
                    }
                  </p>
                </div>
              ) : (
                filteredPosts.slice(1).map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-[4/3] overflow-hidden">
                        <Image
                          src={getImageUrl(post.featured_image_path)}
                          alt={post.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            {blogCategories.find(cat => cat.id === post.category_id)?.name || 'General'}
                          </span>
                          <span className="text-xs text-gray-500">{calculateReadTime(post.content || '')}</span>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3 group-hover:text-brown transition-colors duration-200">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-brown rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {post.author_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{post.author_name || 'Author'}</p>
                            <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))
              )}
            </div>

            {/* Load More Button */}
            {!loading && filteredPosts.length > 6 && (
              <div className="text-center mt-16">
                <button className="border-2 border-brown text-brown hover:bg-brown hover:text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200">
                  Load More Articles
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}