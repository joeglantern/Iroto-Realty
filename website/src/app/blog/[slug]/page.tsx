'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogPostBySlug, getBlogPosts, getBlogCategories } from '@/lib/data';
import { getStorageUrl } from '@/lib/supabase';
import type { BlogPost, BlogCategory } from '@/lib/supabase';
import { renderRichText } from '@/utils/sanitizeHtml';
import PageLayout from '@/components/layout/PageLayout';

interface BlogPostDetailProps {
  params: {
    slug: string;
  };
}

export default function BlogPostDetail({ params }: BlogPostDetailProps) {
  const { slug } = params;
  
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Data loading
  useEffect(() => {
    async function loadBlogData() {
      try {
        setLoading(true);
        setNotFound(false);
        
        const [postData, categoriesData] = await Promise.all([
          getBlogPostBySlug(slug),
          getBlogCategories()
        ]);
        
        if (!postData) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        setCurrentPost(postData);
        setBlogCategories(categoriesData);
        
        // Get related posts (same category, excluding current post)
        const allPosts = await getBlogPosts({ category: postData.category_id });
        const related = allPosts.filter(post => post.slug !== slug).slice(0, 3);
        setRelatedPosts(related);
        
      } catch (error) {
        console.error('Error loading blog post:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    
    loadBlogData();
  }, [slug]);

  // Helper functions
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content ? content.split(' ').length : 0;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (imagePath) {
      return getStorageUrl('blog-images', imagePath);
    }
    return 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  };

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <div>
          {/* Loading skeleton */}
          <article className="bg-white">
            <div className="relative h-96 lg:h-[500px] bg-gray-300 animate-pulse"></div>
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-16 space-y-6">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="h-6 w-16 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </PageLayout>
    );
  }

  // Not found state
  if (notFound || !currentPost) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-2xl font-bold text-black mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you're looking for could not be found.</p>
            <Link
              href="/blog"
              className="inline-block bg-brown hover:bg-brown/90 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-200"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div>
        {/* Article Header */}
        <article className="bg-white">
          {/* Article Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16">
              {/* Article Meta */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <span className="px-4 py-2 bg-brown/10 text-brown text-sm font-medium rounded-full">
                    {blogCategories.find(cat => cat.id === currentPost.category_id)?.name || 'General'}
                  </span>
                  <span className="text-sm text-gray-500">{calculateReadTime(currentPost.content || '')}</span>
                </div>
                <div className="flex space-x-4">
                  <button className="text-gray-500 hover:text-brown">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7.11 10.3C6.85 10.63 6.8 11.15 7.11 11.53c.29.35.75.47 1.15.47h4.23l-1.52 4.94C10.62 18.97 11.46 20 12.62 20c.58 0 1.14-.24 1.52-.65l5.75-5.65c.26-.33.31-.85 0-1.23-.29-.35-.75-.47-1.12-.47z"/>
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-brown">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-bold text-black mb-8 leading-tight">
                {currentPost.title}
              </h1>
              
              {/* Featured Image */}
              <div className="relative h-64 md:h-80 lg:h-96 mb-8 rounded-xl overflow-hidden">
                <Image
                  src={getImageUrl(currentPost.featured_image_path)}
                  alt={currentPost.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Author Info */}
              <div className="flex items-center space-x-4 pb-8 border-b border-gray-200 mb-12">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {currentPost.author_name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentPost.author_name || 'Author'}</p>
                  <p className="text-sm text-gray-500">Published on {formatDate(currentPost.created_at)}</p>
                </div>
              </div>
              
              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:text-black prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-brown hover:prose-a:text-brown/80 rich-text-content"
                dangerouslySetInnerHTML={renderRichText(currentPost.content || '')}
              />
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-black mb-12 text-center">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
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
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {blogCategories.find(cat => cat.id === post.category_id)?.name || 'General'}
                      </span>
                      <h3 className="text-xl font-bold text-black mt-3 mb-3 group-hover:text-brown transition-colors duration-200">
                        {post.title}
                      </h3>
                      <div 
                        className="text-gray-600 text-sm leading-relaxed rich-text-content"
                        dangerouslySetInnerHTML={renderRichText(post.excerpt || '')}
                      />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-block border-2 border-brown text-brown hover:bg-brown hover:text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                View All Articles
              </Link>
            </div>
          </div>
        </section>
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