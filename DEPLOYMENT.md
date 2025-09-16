# Iroto Realty - Deployment Guide

This project consists of two separate Next.js applications that need to be deployed separately on Vercel.

## Project Structure
- `/website` - Public-facing website
- `/admin` - Admin dashboard for content management

## Pre-Deployment Checklist

### 1. Supabase Setup
Ensure your Supabase project is set up with:
- Database tables created (properties, blog_posts, reviews, etc.)
- Row Level Security (RLS) policies configured
- Storage buckets created (property-images, blog-images, review-images)

### 2. Environment Variables
Both applications require the same environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Deployment Steps

### Deploy Website (Public Site)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and import the repository
   - Set the **Root Directory** to `website`
   - Framework Preset: Next.js

2. **Environment Variables:**
   Add the following environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Domain Setup:**
   - Add your custom domain (e.g., `irotorealty.com`)
   - Configure DNS records as instructed by Vercel

### Deploy Admin Panel

1. **Create New Vercel Project:**
   - Import the same repository but as a new project
   - Set the **Root Directory** to `admin`
   - Framework Preset: Next.js

2. **Environment Variables:**
   Add the same environment variables as the website

3. **Build Settings:**
   Same as website deployment

4. **Domain Setup:**
   - Add subdomain for admin (e.g., `admin.irotorealty.com`)
   - Configure DNS records

## Post-Deployment

### 1. Test Both Applications
- ✅ Website loads and displays properties
- ✅ Search functionality works
- ✅ Property detail pages load
- ✅ Admin login works
- ✅ Admin can create/edit properties
- ✅ Admin can manage blog posts

### 2. SEO Setup
- Update sitemap.xml with production URLs
- Configure Google Analytics (if needed)
- Update meta tags with production domain

### 3. Performance Monitoring
- Monitor Core Web Vitals in Vercel dashboard
- Check image optimization is working
- Verify caching headers

## Troubleshooting

### Common Issues

**Build Errors:**
- Check all environment variables are set correctly
- Ensure Supabase connection is working
- Review build logs for specific errors

**Image Loading Issues:**
- Verify Supabase storage buckets are publicly accessible
- Check image paths in Next.js config

**Search Not Working:**
- Verify database has sample data
- Check Supabase RLS policies allow read access

## Security Notes

- Admin panel should have authentication enabled
- Use environment variables for all sensitive data
- Never commit `.env.local` files to git
- Supabase service role key should only be used server-side

## Support

For deployment issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally first with `npm run build`
4. Check Supabase dashboard for connection issues