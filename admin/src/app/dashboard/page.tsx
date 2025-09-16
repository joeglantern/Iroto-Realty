'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getProperties } from '@/lib/properties';
import { getBlogPosts } from '@/lib/blog';
import { getReviews } from '@/lib/reviews';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Property } from '@/lib/supabase';

function Dashboard() {
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'Total Properties', value: '0', change: 'Loading...', positive: true },
    { label: 'Active Listings', value: '0', change: 'Loading...', positive: true },
    { label: 'Blog Posts', value: '0', change: 'Loading...', positive: true },
    { label: 'Reviews', value: '0', change: 'Loading...', positive: true },
  ]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [properties, blogPosts, reviews] = await Promise.all([
        getProperties(),
        getBlogPosts(),
        getReviews()
      ]);

      // Calculate stats
      const totalProperties = properties?.length || 0;
      const activeListings = properties?.filter(p => p.availability_status === 'available').length || 0;
      const totalBlogPosts = blogPosts?.length || 0;
      const totalReviews = reviews?.length || 0;
      const featuredReviews = reviews?.filter(r => r.is_featured).length || 0;

      setStats([
        { label: 'Total Properties', value: totalProperties.toString(), change: `${activeListings} available`, positive: true },
        { label: 'Active Listings', value: activeListings.toString(), change: `${totalProperties - activeListings} unavailable`, positive: activeListings > 0 },
        { label: 'Blog Posts', value: totalBlogPosts.toString(), change: 'Content published', positive: true },
        { label: 'Reviews', value: totalReviews.toString(), change: `${featuredReviews} featured`, positive: true },
      ]);

      // Get recent properties (last 3)
      const sortedProperties = properties?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];
      setRecentProperties(sortedProperties.slice(0, 3));

      // Create recent activity from all data
      const activities = [];
      
      if (properties?.length) {
        const latestProperty = sortedProperties[0];
        activities.push({
          action: 'Property added',
          item: latestProperty.title,
          time: formatDate(latestProperty.created_at),
          type: 'success'
        });
      }

      if (blogPosts?.length) {
        const sortedPosts = blogPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latestPost = sortedPosts[0];
        activities.push({
          action: 'Blog post published',
          item: latestPost.title,
          time: formatDate(latestPost.created_at),
          type: 'info'
        });
      }

      if (reviews?.length) {
        const sortedReviews = reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const latestReview = sortedReviews[0];
        activities.push({
          action: 'Review received',
          item: `${latestReview.rating}-star from ${latestReview.reviewer_name}`,
          time: formatDate(latestReview.created_at),
          type: 'success'
        });
      }

      setRecentActivity(activities.slice(0, 4));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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
          <p className="text-gray-600">Loading dashboard...</p>
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
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <Image
                src="/logo/iroto-logo.png"
                alt="Iroto Realty"
                width={120}
                height={40}
                className="mr-4 md:mr-8"
              />
              
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
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/properties"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors"
                >
                  Properties
                </Link>
                <Link
                  href="/blog"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/reviews"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors"
                >
                  Reviews
                </Link>
                <Link
                  href="/analytics"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary rounded-md transition-colors"
                >
                  Analytics
                </Link>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-primary rounded-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
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
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/properties"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
              >
                Properties
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
              >
                Reviews
              </Link>
              <Link
                href="/analytics"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
              >
                Analytics
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">Manage your Iroto Realty content and properties</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.positive ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <svg className={`w-6 h-6 ${stat.positive ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <p className={`text-sm mt-3 ${stat.positive ? 'text-green-600' : 'text-yellow-600'}`}>
                {stat.change}
              </p>
            </div>
          ))}
        </div>

        {/* Overview Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Properties */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
              <Link href="/properties" className="text-primary hover:text-primary/80 text-sm font-medium">View All</Link>
            </div>
            <div className="space-y-4">
              {recentProperties.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No properties found. Add your first property!</p>
                </div>
              ) : (
                recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {property.hero_image_path && (
                        <Image
                          src={`https://ervkyybhqsihlkbbllhv.supabase.co/storage/v1/object/public/property-images/${property.hero_image_path}`}
                          alt={property.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{property.title}</h4>
                      <p className="text-sm text-gray-600">{property.specific_location}</p>
                      <p className="text-sm text-primary font-medium">{property.currency} {property.rental_price?.toLocaleString()}/night</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/properties`} className="text-gray-400 hover:text-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">No recent activity found.</p>
                </div>
              ) : (
                recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'info' ? 'bg-blue-400' :
                      'bg-yellow-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.action}: <span className="font-medium">{activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <Dashboard />
    </ProtectedRoute>
  );
}

