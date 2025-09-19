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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const shareOnWhatsApp = () => {
    if (!currentPost) return;
    const url = window.location.href;
    const text = `Check out this article: "${currentPost.title}"\n\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      const url = window.location.href;
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
        {/* Floating Share Buttons */}
        <div className="fixed right-8 top-1/3 transform -translate-y-1/2 z-40 hidden xl:block">
          <div className="flex flex-col space-y-3">
            <button
              onClick={shareOnWhatsApp}
              className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
              title="Share on WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </button>
            <button
              onClick={copyToClipboard}
              className={`w-12 h-12 ${copied ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-700'} text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg`}
              title={copied ? 'Copied!' : 'Copy link'}
            >
              {copied ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Share Menu */}
        <div className="xl:hidden">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-brown text-white rounded-full flex items-center justify-center shadow-lg z-40"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
          
          {showShareMenu && (
            <div className="fixed bottom-20 right-6 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-40">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={shareOnWhatsApp}
                  className="flex items-center space-x-3 text-gray-700 hover:text-green-500 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Article Header */}
        <article className="bg-white">
          {/* Main Content with Sidebar Layout */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Main Article Content - Centered and Focused */}
              <div className="flex-1 max-w-4xl mx-auto lg:mx-0">
                <div className="py-6 sm:py-8 lg:py-12">
                  {/* Breadcrumb Navigation */}
                  <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                    <a href="/" className="hover:text-brown transition-colors">Home</a>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <a href="/blog" className="hover:text-brown transition-colors">Blog</a>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-900 truncate max-w-[200px] sm:max-w-none">{currentPost.title}</span>
                  </nav>

                  {/* Article Header */}
                  <header className="max-w-4xl mb-8 sm:mb-12">
                    {/* Category Tag */}
                    <div className="mb-4 sm:mb-6">
                      <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-brown/10 text-brown text-xs sm:text-sm font-semibold rounded-full">
                        {blogCategories.find(cat => cat.id === currentPost.category_id)?.name || 'General'}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                      {currentPost.title}
                    </h1>
                    
                    {/* Article Meta & Author Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brown to-brown/80 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-semibold">
                          {currentPost.author_name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-gray-900">{currentPost.author_name || 'Author'}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {formatDate(currentPost.created_at)} • {calculateReadTime(currentPost.content || '')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Article Actions */}
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                          onClick={shareOnWhatsApp}
                          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          <span>Share</span>
                        </button>
                        <button
                          onClick={copyToClipboard}
                          className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                            copied 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {copied ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </header>
                  
                  {/* Featured Image */}
                  <div className="relative aspect-[16/9] mb-8 sm:mb-12 rounded-lg sm:rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src={getImageUrl(currentPost.featured_image_path)}
                      alt={currentPost.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  
                  {/* Article Content */}
                  <div className="max-w-4xl">
                    <div 
                      className="prose prose-base sm:prose-lg lg:prose-xl max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-brown hover:prose-a:text-brown/80 prose-strong:text-gray-900 prose-blockquote:border-brown prose-blockquote:text-gray-700 rich-text-content"
                      dangerouslySetInnerHTML={renderRichText(currentPost.content || '')}
                    />
                  </div>
              </div>
              </div>

              {/* Sidebar with Related Articles */}
              <div className="w-full lg:w-80 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-8 space-y-6 lg:space-y-8 py-6 lg:py-12">
                  {/* Related Articles Sidebar */}
                  <div className="bg-gray-50 rounded-xl lg:rounded-2xl p-4 sm:p-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Related Articles</h2>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {relatedPosts.slice(0, 4).map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                          <article className="space-y-3">
                            <div className="aspect-[16/9] overflow-hidden rounded-lg">
                              <Image
                                src={getImageUrl(post.featured_image_path)}
                                alt={post.title}
                                width={300}
                                height={200}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <span className="px-2 py-1 bg-white text-gray-600 text-xs font-medium rounded-full">
                                {blogCategories.find(cat => cat.id === post.category_id)?.name || 'General'}
                              </span>
                              <h3 className="text-base sm:text-lg font-semibold text-black mt-2 mb-2 group-hover:text-brown transition-colors duration-200 line-clamp-2">
                                {post.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                {post.excerpt ? post.excerpt.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : ''}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                                {formatDate(post.created_at)}
                              </p>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      <Link
                        href="/blog"
                        className="w-full inline-block text-center border-2 border-brown text-brown hover:bg-brown hover:text-white px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
                      >
                        View All Articles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

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