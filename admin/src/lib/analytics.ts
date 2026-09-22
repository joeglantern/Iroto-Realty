'use server'

import { sql } from './db'
import { requireAdmin } from './session'

// Each query is isolated so one failing view doesn't blank the whole dashboard.
async function orEmpty<T>(query: Promise<T[]>): Promise<T[]> {
  try {
    return await query
  } catch {
    return []
  }
}

export async function getAnalytics(dateRange: string = '30') {
  await requireAdmin()

  const days = parseInt(dateRange) || 30
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString()
  const startDay = startDateStr.split('T')[0]

  const [
    dailyMetrics,
    popularProperties,
    popularBlogPosts,
    trafficSummary,
    searchAnalytics,
    propertyInquiries,
    recentPageViews
  ] = await Promise.all([
    orEmpty(sql`
      select * from daily_metrics where metric_date >= ${startDay}
      order by metric_date desc limit ${days}`),
    orEmpty(sql`select * from popular_properties limit 20`),
    orEmpty(sql`select * from popular_blog_posts limit 20`),
    orEmpty(sql`
      select * from traffic_summary where view_date >= ${startDay}
      order by view_date desc limit ${days}`),
    orEmpty(sql`select * from search_analytics limit 50`),
    orEmpty(sql`
      select i.*,
        (select json_build_object('id', p.id, 'title', p.title, 'slug', p.slug) from properties p where p.id = i.property_id) as properties
      from property_inquiries i
      where i.created_at >= ${startDateStr}
      order by i.created_at desc limit 50`),
    orEmpty(sql`
      select * from page_views where viewed_at >= ${startDateStr}
      order by viewed_at desc limit 100`)
  ])

  return {
    dailyMetrics,
    popularProperties,
    popularBlogPosts,
    trafficSummary,
    searchAnalytics,
    propertyInquiries,
    recentPageViews
  }
}
