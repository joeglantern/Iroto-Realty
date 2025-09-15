# Iroto Realty Database Planning Document

Based on comprehensive analysis of the website and admin panel, this document outlines all database requirements for the CMS system.

## Overview
The Iroto Realty project requires a robust database to support:
- Property management and rental listings
- Blog content management 
- Customer review system
- User authentication and authorization
- Media management for images and videos
- SEO optimization features

---

## Website Pages Analysis

### Frontend Pages Requiring Database Support:

1. **Homepage (`/`)**
   - Hero carousel images
   - Featured properties carousel
   - Customer testimonials/reviews
   - Search functionality

2. **About Page (`/about`)**
   - Company story content
   - Team member profiles
   - Company values

3. **Blog Pages (`/blog`, `/blog/[slug]`)**
   - Blog posts with categories
   - Author information
   - Tags and SEO metadata
   - Related articles

4. **Property Pages (`/property/[slug]`)**
   - Property details and specifications
   - Image galleries
   - Video tours
   - Reviews and ratings
   - Amenities listing

5. **Rental Portfolio (`/rental-portfolio/*`)**
   - Property listings by location
   - Search and filtering
   - Property categories (Lamu, Watamu)

6. **Sales Collection (`/sales-collection`)**
   - Properties for sale
   - Investment opportunities

7. **Contact & Travel Insights**
   - Contact information
   - Travel guides and tips

---

## Admin Panel Analysis

### Admin Features Requiring Database Support:

1. **User Management**
   - Admin authentication
   - Role-based access control
   - User profiles and permissions

2. **Property Management**
   - CRUD operations for properties
   - Property categories and types
   - Image and video upload
   - SEO metadata
   - Publishing workflow (draft/published)
   - Featured property flagging

3. **Blog Management**
   - CRUD operations for blog posts
   - Categories and tags
   - Featured image uploads
   - SEO metadata
   - Publishing workflow
   - Author management

4. **Review Management**
   - Customer review creation
   - Rating system (1-5 stars)
   - Featured review flagging
   - Review moderation
   - Property association

5. **Media Management**
   - Image uploads and storage
   - Video URL management
   - Gallery management

---

## Core Database Requirements

### 1. **User & Authentication System**
- Admin user accounts
- Role-based permissions
- Session management
- Password security

### 2. **Property Management System**
- Property listings with rich content
- Multiple property types and categories
- Location-based organization
- Pricing for rentals and sales
- Amenities and specifications
- Media galleries
- SEO optimization
- Publishing workflow

### 3. **Content Management System**
- Blog posts with rich content
- Category and tag system
- Author management
- SEO optimization
- Featured content selection

### 4. **Review & Rating System**
- Customer reviews with ratings
- Property association
- Featured review system
- Review moderation

### 5. **Media Storage System**
- Image upload and management
- Video URL storage
- Gallery organization
- File metadata

### 6. **SEO & Metadata System**
- Meta titles and descriptions
- Focus keywords
- URL slugs
- Open Graph data

---

## Technical Considerations

### Database Technology
- **Recommended**: PostgreSQL (robust, scalable, excellent for complex queries)
- **Alternative**: MySQL (if preferred for simplicity)

### File Storage
- **Images**: Cloud storage (AWS S3, Supabase Storage, or similar)
- **Videos**: YouTube/Vimeo links (embedded)

### Key Features Needed
- Full-text search capabilities
- Image optimization and resizing
- SEO-friendly URL generation
- Audit trails for content changes
- Data validation and constraints
- Backup and recovery systems

---

## Next Steps

This document will be followed by detailed database schema planning in small, manageable chunks for your approval:

1. **Phase 1**: User Authentication & Authorization Tables
2. **Phase 2**: Property Management Tables  
3. **Phase 3**: Blog & Content Management Tables
4. **Phase 4**: Review & Rating Tables
5. **Phase 5**: Media & Asset Tables
6. **Phase 6**: SEO & Metadata Tables
7. **Phase 7**: System & Configuration Tables

Each phase will include:
- Detailed table schemas
- Relationships and constraints  
- Sample data structure
- Migration scripts
- Indexing strategy

---

## Questions for Consideration

1. Do you want multi-language support for content?
2. Should we implement content versioning/history?
3. Do you need advanced analytics tracking?
4. Should reviews support photo uploads from customers?
5. Do you want automated email notifications for new content?
6. Should we implement content scheduling for future publishing?

Please review this analysis and let me know if you'd like to proceed with Phase 1 or if there are any modifications needed.