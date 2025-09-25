'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { getProperties } from '@/lib/properties';
import { getBlogPosts } from '@/lib/blog';
import { getReviews } from '@/lib/reviews';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';
import type { Property } from '@/lib/supabase';
import {
  HomeIcon,
  EyeIcon,
  DocumentTextIcon,
  StarIcon,
  PlusIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

function Dashboard() {
  const { signOut } = useSimpleAuth();
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
      {/* Shared Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">Manage your Iroto Realty content and properties</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => {
            // Define icons for each stat
            const icons = [
              <HomeIcon key="home" className="w-6 h-6" />, // Total Properties
              <EyeIcon key="eye" className="w-6 h-6" />,   // Active Listings
              <DocumentTextIcon key="doc" className="w-6 h-6" />, // Blog Posts
              <StarIcon key="star" className="w-6 h-6" />  // Reviews
            ];
            
            // Define colors for each stat
            const colors = [
              { bg: 'bg-blue-100', text: 'text-blue-600' },    // Properties - Blue
              { bg: 'bg-green-100', text: 'text-green-600' },  // Active Listings - Green
              { bg: 'bg-purple-100', text: 'text-purple-600' }, // Blog Posts - Purple
              { bg: 'bg-yellow-100', text: 'text-yellow-600' }  // Reviews - Yellow
            ];

            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                  <div className={`p-3 rounded-full ${colors[index]?.bg || 'bg-gray-100'}`}>
                    <div className={colors[index]?.text || 'text-gray-600'}>
                      {icons[index]}
                    </div>
                  </div>
                </div>
                <p className={`text-sm mt-3 ${stat.positive ? 'text-green-600' : 'text-gray-500'}`}>
                {stat.change}
              </p>
            </div>
            );
          })}
        </div>

        {/* Overview Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Properties */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HomeIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
              </div>
              <Link href="/properties" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1">
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {recentProperties.length === 0 ? (
                <div className="text-center py-8">
                  <HomeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No properties found.</p>
                  <Link href="/properties" className="text-primary hover:text-primary/80 text-sm font-medium mt-2 inline-flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    Add your first property
                  </Link>
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
            <div className="flex items-center space-x-2 mb-4">
              <ClockIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No recent activity found.</p>
                  <p className="text-gray-400 text-xs mt-1">Activity will appear here as you manage your content</p>
                </div>
              ) : (
                recentActivity.map((activity, i) => {
                  // Define icons based on activity type
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'success':
                        return <PlusIcon className="w-4 h-4 text-green-600" />;
                      case 'info':
                        return <DocumentTextIcon className="w-4 h-4 text-blue-600" />;
                      case 'review':
                        return <StarIcon className="w-4 h-4 text-yellow-600" />;
                      case 'message':
                        return <ChatBubbleLeftRightIcon className="w-4 h-4 text-purple-600" />;
                      default:
                        return <ClockIcon className="w-4 h-4 text-gray-600" />;
                    }
                  };

                  return (
                  <div key={i} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full mt-0.5 ${
                        activity.type === 'success' ? 'bg-green-100' :
                        activity.type === 'info' ? 'bg-blue-100' :
                        activity.type === 'review' ? 'bg-yellow-100' :
                        activity.type === 'message' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {getActivityIcon(activity.type)}
                      </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.action}: <span className="font-medium">{activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  );
                })
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
    <SimpleProtectedRoute>
      <Dashboard />
    </SimpleProtectedRoute>
  );
}


