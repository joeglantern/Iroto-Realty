import { supabase } from './supabase'

// Analytics CRUD operations
export async function getAnalytics(dateRange: string = '30') {
  try {
    console.log('Fetching analytics data for', dateRange, 'days');
    
    // Calculate date filters
    const daysAgo = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const startDateStr = startDate.toISOString();

    // Fetch all analytics data in parallel
    const [
      dailyMetricsResult,
      popularPropertiesResult,
      popularBlogPostsResult,
      trafficSummaryResult,
      searchAnalyticsResult,
      propertyInquiriesResult,
      recentPageViewsResult
    ] = await Promise.all([
      // Daily metrics
      supabase
        .from('daily_metrics')
        .select('*')
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: false })
        .limit(parseInt(dateRange)),

      // Popular properties (using the view)
      supabase
        .from('popular_properties')
        .select('*')
        .limit(20),

      // Popular blog posts (using the view)  
      supabase
        .from('popular_blog_posts')
        .select('*')
        .limit(20),

      // Traffic summary (using the view)
      supabase
        .from('traffic_summary')
        .select('*')
        .gte('view_date', startDate.toISOString().split('T')[0])
        .order('view_date', { ascending: false })
        .limit(parseInt(dateRange)),

      // Search analytics (using the view)
      supabase
        .from('search_analytics')
        .select('*')
        .limit(50),

      // Recent property inquiries
      supabase
        .from('property_inquiries')
        .select(`
          *,
          properties(id, title, slug)
        `)
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: false })
        .limit(50),

      // Recent page views for quick stats
      supabase
        .from('page_views')
        .select('*')
        .gte('viewed_at', startDateStr)
        .order('viewed_at', { ascending: false })
        .limit(100)
    ]);

    // Check for errors
    const errors = [
      dailyMetricsResult.error,
      popularPropertiesResult.error,
      popularBlogPostsResult.error,
      trafficSummaryResult.error,
      searchAnalyticsResult.error,
      propertyInquiriesResult.error,
      recentPageViewsResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('Analytics fetch errors:', errors);
    }

    const result = {
      dailyMetrics: dailyMetricsResult.data || [],
      popularProperties: popularPropertiesResult.data || [],
      popularBlogPosts: popularBlogPostsResult.data || [],
      trafficSummary: trafficSummaryResult.data || [],
      searchAnalytics: searchAnalyticsResult.data || [],
      propertyInquiries: propertyInquiriesResult.data || [],
      recentPageViews: recentPageViewsResult.data || []
    };

    console.log('Analytics data fetched:', {
      dailyMetrics: result.dailyMetrics.length,
      popularProperties: result.popularProperties.length,
      popularBlogPosts: result.popularBlogPosts.length,
      trafficSummary: result.trafficSummary.length,
      searchAnalytics: result.searchAnalytics.length,
      propertyInquiries: result.propertyInquiries.length,
      recentPageViews: result.recentPageViews.length
    });

    return result;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

// Track page view (to be called from the website)
export async function trackPageView(data: {
  page_path: string;
  page_title?: string;
  referrer_url?: string;
  property_id?: string;
  blog_post_id?: string;
  session_id?: string;
  user_ip?: string;
  user_agent?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  city?: string;
  time_on_page?: number;
  scroll_depth?: number;
}) {
  try {
    const { data: result, error } = await supabase
      .from('page_views')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error tracking page view:', error);
    throw error;
  }
}

// Track property inquiry
export async function trackPropertyInquiry(data: {
  property_id: string;
  inquiry_type: 'view_details' | 'contact_form' | 'phone_call' | 'email_inquiry' | 'booking_request';
  source_page?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  message?: string;
  session_id?: string;
  user_ip?: string;
  user_agent?: string;
  referrer_url?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('property_inquiries')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error tracking property inquiry:', error);
    throw error;
  }
}

// Track search query
export async function trackSearchQuery(data: {
  query_text: string;
  filters_applied?: object;
  results_count?: number;
  result_clicked?: boolean;
  clicked_property_id?: string;
  click_position?: number;
  session_id?: string;
  user_ip?: string;
  page_path?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('search_queries')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error tracking search query:', error);
    throw error;
  }
}

// Update inquiry status (for admin use)
export async function updateInquiryStatus(id: string, updates: {
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  followed_up_at?: string;
  followed_up_by?: string;
  follow_up_required?: boolean;
}) {
  try {
    const { data, error } = await supabase
      .from('property_inquiries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    throw error;
  }
}

// Get inquiry details
export async function getInquiry(id: string) {
  try {
    const { data, error } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        properties(id, title, slug, hero_image_path)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    throw error;
  }
}

// Get all inquiries with pagination
export async function getInquiries(page: number = 1, limit: number = 20, status?: string) {
  try {
    let query = supabase
      .from('property_inquiries')
      .select(`
        *,
        properties(id, title, slug, hero_image_path)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    throw error;
  }
}

// Create daily metrics summary (typically run as a cron job)
export async function createDailyMetrics(date: string) {
  try {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    // Calculate metrics for the day
    const [pageViewsResult, inquiriesResult, searchesResult] = await Promise.all([
      // Page views
      supabase
        .from('page_views')
        .select('*')
        .gte('viewed_at', startOfDay)
        .lt('viewed_at', endOfDay),

      // Property inquiries
      supabase
        .from('property_inquiries')
        .select('*')
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay),

      // Searches
      supabase
        .from('search_queries')
        .select('*')
        .gte('searched_at', startOfDay)
        .lt('searched_at', endOfDay)
    ]);

    const pageViews = pageViewsResult.data || [];
    const inquiries = inquiriesResult.data || [];
    const searches = searchesResult.data || [];

    // Calculate metrics
    const metrics = {
      metric_date: date,
      total_page_views: pageViews.length,
      unique_visitors: new Set(pageViews.map(pv => pv.user_ip || pv.session_id)).size,
      property_views: pageViews.filter(pv => pv.property_id).length,
      blog_views: pageViews.filter(pv => pv.blog_post_id).length,
      total_inquiries: inquiries.length,
      contact_form_submissions: inquiries.filter(i => i.inquiry_type === 'contact_form').length,
      newsletter_signups: 0, // TODO: implement newsletter tracking
      properties_viewed: new Set(pageViews.filter(pv => pv.property_id).map(pv => pv.property_id)).size,
      total_searches: searches.length
    };

    // Find most viewed property
    if (pageViews.length > 0) {
      const propertyViews = pageViews
        .filter(pv => pv.property_id)
        .reduce((acc, pv) => {
          acc[pv.property_id] = (acc[pv.property_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const mostViewedPropertyId = Object.keys(propertyViews)
        .reduce((a, b) => propertyViews[a] > propertyViews[b] ? a : b);
      
      if (mostViewedPropertyId) {
        metrics.most_viewed_property_id = mostViewedPropertyId;
        metrics.most_viewed_property_views = propertyViews[mostViewedPropertyId];
      }
    }

    // Find top search term
    if (searches.length > 0) {
      const searchCounts = searches.reduce((acc, search) => {
        acc[search.query_text] = (acc[search.query_text] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topSearchTerm = Object.keys(searchCounts)
        .reduce((a, b) => searchCounts[a] > searchCounts[b] ? a : b);
      
      if (topSearchTerm) {
        metrics.top_search_term = topSearchTerm;
        metrics.top_search_count = searchCounts[topSearchTerm];
      }
    }

    // Insert or update daily metrics
    const { data, error } = await supabase
      .from('daily_metrics')
      .upsert(metrics, {
        onConflict: 'metric_date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating daily metrics:', error);
    throw error;
  }
}

export default {
  getAnalytics,
  trackPageView,
  trackPropertyInquiry,
  trackSearchQuery,
  updateInquiryStatus,
  getInquiry,
  getInquiries,
  createDailyMetrics
};