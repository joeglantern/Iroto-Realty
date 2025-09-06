# Iroto Realty Website - Project Plan & Architecture

## Project Overview

**Client:** Iroto Realty  
**Technology Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Supabase  
**Design System:** Based on Figma designs with strict adherence to brand guidelines  
**Deployment:** Vercel (Main Website + Admin Dashboard - Separate deployments) + Supabase (Backend/Database)

## Brand Guidelines

### Colors
- **Primary:** `#713900` (Brown/Bronze)
- **Secondary:** `#0C0C0C` (Black) 
- **Background:** `#FFFFFF` (White)

### Typography
- **Font Family:** ANDIKA (Andika font)
- **Usage:** All text elements throughout the website

### UI Guidelines
- White background with black navbar titles
- Brown highlight when clicked/hovered (logo color)
- Headlines like "WATAMU" in brown (logo color)
- Strict 3-color palette adherence

## Project Architecture (Separate Deployments)

### Directory Structure Overview
```
iroto-realty/
├── website/                     # Main public website
└── admin/                       # Admin dashboard (separate deployment)
```

### Main Website Structure

```
website/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Homepage
│   │   ├── about/               # About Us page  
│   │   ├── rental-portfolio/    # Rental Portfolio (dynamic)
│   │   │   ├── page.tsx         # Portfolio listing
│   │   │   ├── [location]/      # Location-based properties
│   │   │   └── [slug]/          # Individual property details
│   │   ├── sales-collection/    # Sales Collection
│   │   ├── travel-insights/     # Travel Insights blog
│   │   ├── how-to-get-there/    # Location guides
│   │   ├── contact/             # Contact Us
│   │   ├── api/                 # API routes for website
│   │   │   ├── properties/      # Read-only property endpoints
│   │   │   ├── content/         # Read-only content endpoints
│   │   │   └── contact/         # Contact form submission
│   │   ├── globals.css          # Global styles
│   │   └── layout.tsx           # Root layout
│   ├── components/              # Website components
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/              # Layout components (Header, Footer, Nav)
│   │   ├── property/            # Property display components
│   │   └── forms/               # Contact forms
│   ├── lib/                     # Website utilities
│   │   ├── supabase/            # Supabase client (read-only)
│   │   ├── utils/               # Helper functions
│   │   └── constants/           # App constants
│   ├── types/                   # Shared TypeScript types
│   └── hooks/                   # Custom React hooks
├── public/                      # Static assets
│   ├── images/                  # Static images
│   ├── icons/                   # Icon assets
│   └── logo/                    # Brand assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### Admin Dashboard Structure

```
admin/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Admin login page
│   │   ├── dashboard/           # Main dashboard
│   │   │   ├── page.tsx         # Dashboard overview
│   │   │   ├── properties/      # Property management
│   │   │   │   ├── page.tsx     # Properties list
│   │   │   │   ├── new/         # Add new property
│   │   │   │   └── [id]/        # Edit property
│   │   │   ├── content/         # Content management
│   │   │   │   ├── pages/       # Page content editor
│   │   │   │   ├── blog/        # Blog post management
│   │   │   │   └── locations/   # Location content
│   │   │   ├── media/           # Media library
│   │   │   ├── reviews/         # Review moderation
│   │   │   ├── users/           # User management
│   │   │   └── settings/        # Site settings
│   │   ├── api/                 # Admin API routes
│   │   │   ├── auth/            # Authentication
│   │   │   ├── properties/      # Property CRUD
│   │   │   ├── content/         # Content CRUD
│   │   │   ├── media/           # File upload/management
│   │   │   ├── reviews/         # Review management
│   │   │   └── users/           # User management
│   │   ├── globals.css          # Admin-specific styles
│   │   └── layout.tsx           # Admin layout
│   ├── components/              # Admin components
│   │   ├── ui/                  # Base admin UI components
│   │   ├── layout/              # Admin layout (Sidebar, Header)
│   │   ├── forms/               # Admin forms
│   │   ├── tables/              # Data tables
│   │   ├── editors/             # Content editors
│   │   └── media/               # Media management components
│   ├── lib/                     # Admin utilities
│   │   ├── supabase/            # Supabase client (full access)
│   │   ├── auth/                # Authentication utilities
│   │   ├── validation/          # Form validation schemas
│   │   └── utils/               # Helper functions
│   ├── types/                   # Admin-specific types
│   └── hooks/                   # Admin hooks
├── public/                      # Admin static assets
├── package.json                 # Separate dependencies
├── next.config.js              # Admin-specific config
├── tailwind.config.js          # Admin theme config
└── tsconfig.json               # TypeScript config
```

### Database Schema (Supabase)

```sql
-- Locations (Watamu, Lamu, etc.)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  hero_image VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Categories
CREATE TABLE property_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  location_id UUID REFERENCES locations(id),
  category_id UUID REFERENCES property_categories(id),
  property_type ENUM('rental', 'sale') NOT NULL,
  price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm INTEGER,
  featured_image VARCHAR(500),
  video_url VARCHAR(500),
  amenities JSON,
  contact_info JSON,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Images
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(100) NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Blog Posts (Travel Insights)
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  location_id UUID REFERENCES locations(id),
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Site Content (Dynamic content management)
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR(100) NOT NULL, -- 'about', 'contact', 'hero', etc.
  content JSON NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role ENUM('admin', 'editor') DEFAULT 'editor',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Key Features & Pages

#### 1. Homepage
- Hero section with location imagery (Lamu/Watamu)
- Featured properties grid (3x2 layout)
- Navigation: HOME | About Us | Rental Portfolio ▼ | Sales Collection | Travel Insights ▼ | Contact Us

#### 2. Rental Portfolio
- Dynamic location pages (Lamu, Watamu)
- Property filtering and search
- Individual property detail pages with:
  - Hero image/video
  - Property description
  - Image gallery (3x2 grid)
  - Information sections (2 rounded info cards)
  - Reviews carousel
  - Contact information

#### 3. Property Details Pages
- Location-based hero sections
- Property information with icons
- YouTube video integration
- Image galleries with lightbox
- Reviews and testimonials
- Contact forms

#### 4. Admin Dashboard (Separate Application)
- Deployed independently at admin.irotorealty.com
- Property management (CRUD operations)
- Image upload and management
- Content management system
- Location and category management
- Review moderation
- Site analytics
- User management and permissions

### Component Architecture

#### Main Website Components
```typescript
// Layout Components
- Header/Navigation
- Footer
- PageLayout

// Property Components  
- PropertyCard
- PropertyGrid
- PropertyDetails
- PropertyGallery
- PropertySearch
- PropertyFilters

// UI Components
- Button
- Input
- Modal
- Card
- Badge
- ImageGallery
- VideoPlayer
- ReviewSlider
- ContactForm
```

#### Admin Dashboard Components
```typescript
// Layout Components
- AdminLayout
- AdminSidebar
- AdminHeader
- AdminBreadcrumb

// Management Components
- PropertyForm
- PropertyTable
- ContentEditor
- RichTextEditor
- ImageUploader
- MediaLibrary
- DataTable
- StatusBadge

// Dashboard Components
- DashboardStats
- RecentActivity
- QuickActions
- ChartWidgets
```

### Responsive Design Strategy

#### Breakpoints (Tailwind CSS)
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** 1024px+

#### Mobile Adaptations
- Collapsible navigation menu
- Stacked property grids (1 column)
- Touch-optimized image galleries
- Simplified admin interface

### Admin Dashboard Features

#### Property Management
- Add/Edit/Delete properties
- Bulk property operations
- Image upload with drag-and-drop
- Property status management (active/inactive)
- SEO optimization fields

#### Content Management
- Dynamic page content editing
- Blog post management
- Location content updates
- Review moderation
- Site-wide settings

#### Media Library
- Centralized image management
- Image optimization and compression
- CDN integration via Supabase Storage
- Alt text management

### Authentication & Security

#### Admin Authentication
- Supabase Auth integration
- Role-based access control (Admin/Editor)
- Session management
- Password reset functionality

#### Security Measures
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- Image upload restrictions
- Rate limiting on API endpoints

### Performance Optimizations

#### Frontend
- Next.js Image optimization
- Static generation where possible
- Dynamic imports for heavy components
- Lazy loading for images and content

#### Backend
- Database indexing on frequently queried fields
- Image compression and WebP conversion
- CDN integration for static assets
- Caching strategies for dynamic content

### SEO Strategy

#### Technical SEO
- Dynamic meta tags per page/property
- Structured data (JSON-LD) for properties
- XML sitemap generation
- robots.txt optimization

#### Content SEO
- Location-based URL structure
- Image alt text management
- Property schema markup
- Blog content for location guides

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Next.js project setup with TypeScript
- [ ] Tailwind CSS configuration with custom colors
- [ ] Supabase project setup and database schema
- [ ] Basic layout components (Header, Footer, Navigation)
- [ ] Authentication system

### Phase 2: Core Website (Week 3-4)
- [ ] Homepage implementation
- [ ] Property listing and detail pages
- [ ] Location-based routing
- [ ] Image gallery components
- [ ] Review system

### Phase 3: Admin Dashboard - Separate Application (Week 5-6)
- [ ] Set up separate Next.js project for admin
- [ ] Admin authentication and authorization system
- [ ] Property management interface (CRUD)
- [ ] Content management system
- [ ] Media library and upload system
- [ ] Dashboard analytics and overview
- [ ] User management system

### Phase 4: Content & Polish (Week 7-8)
- [ ] Content population and testing
- [ ] Mobile responsiveness refinement
- [ ] Performance optimization
- [ ] SEO implementation
- [ ] Testing and bug fixes

### Phase 5: Deployment & Launch (Week 9)
- [ ] Production deployment setup for main website (www.irotorealty.com)
- [ ] Production deployment setup for admin dashboard (admin.irotorealty.com)
- [ ] Domain configuration and SSL certificates
- [ ] Environment-specific configurations
- [ ] Performance monitoring for both applications
- [ ] User training and documentation
- [ ] Go-live and monitoring

## Technical Considerations

### Image Management Strategy
- Supabase Storage for all images
- Automatic WebP conversion
- Responsive image serving
- Lazy loading implementation

### SEO & Performance
- Server-side rendering for property pages
- Static generation for blog content
- Image optimization and compression
- Core Web Vitals optimization

### Scalability Considerations
- Database indexing strategy
- CDN integration for global reach
- Caching layers for frequently accessed data
- Modular component architecture

This comprehensive plan provides a solid foundation for building a professional, scalable real estate website that exactly matches your Figma designs while providing powerful admin capabilities for content management.