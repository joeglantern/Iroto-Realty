# Improved Project Prompt for Iroto Realty Website

## Project Brief

**Objective:** Build a fully responsive real estate website for Iroto Realty using Next.js 14+ with TypeScript, exactly matching the provided Figma designs. The project consists of TWO SEPARATE applications: the main public website and an admin dashboard (deployed independently).

## Design Requirements

### Brand Identity
- **Company:** Iroto Realty
- **Logo:** Brown house icon with "IROTO REALTY" text (provided)
- **Font:** ANDIKA (Andika font family) - use throughout entire website
- **Color Palette (STRICT - only these 3 colors):**
  - Primary: `#713900` (Brown/Bronze - logo color)
  - Secondary: `#0C0C0C` (Black)
  - Background: `#FFFFFF` (White)

### Visual Guidelines
- White background for all pages
- Black text for navigation titles
- Brown highlights on hover/click states (using logo color #713900)
- Headlines like "WATAMU", "LAMU" in brown color
- Clean, minimal design with focus on property imagery

## Technical Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (configured with custom brand colors)
- **UI Components:** Custom components following design system
- **Fonts:** ANDIKA font family (must be implemented)

### Backend & Database
- **Backend:** Supabase (PostgreSQL database, Auth, Storage)
- **Authentication:** Supabase Auth for admin dashboard only
- **File Storage:** Supabase Storage for images/videos
- **API:** Next.js API routes + Supabase client
- **Deployment:** Two separate Vercel deployments sharing one Supabase instance

### Deployment Architecture
- **Main Website:** `www.irotorealty.com` (public, no authentication)
- **Admin Dashboard:** `admin.irotorealty.com` (private, authentication required)
- **Shared Database:** Single Supabase instance for both applications
- **Shared Storage:** Single Supabase Storage bucket for media files

## Project Structure (Two Separate Applications)

### Directory Layout
```
iroto-realty/
├── website/          # Main public website (www.irotorealty.com)
└── admin/            # Admin dashboard (admin.irotorealty.com)
```

### 1. Main Website Application (`/website/`)
**Public-facing website with read-only data consumption**

#### Pages:
1. **Homepage**
   - Hero section with location imagery
   - Featured properties grid (3x2 layout as shown in designs)
   - Navigation: HOME | About Us | Rental Portfolio ▼ | Sales Collection | Travel Insights ▼ | Contact Us

2. **Rental Portfolio**
   - Dynamic location pages (Lamu, Watamu)
   - Property listing with filtering
   - Individual property details with galleries

3. **Property Details Pages** (Match Figma designs exactly)
   - Location hero banners (Lamu/Watamu with dropdown navigation)
   - Property information sections
   - YouTube video integration placeholder
   - Image galleries (3x2 grid layout)
   - Two rounded information cards ("INFO" sections)
   - Reviews carousel
   - Footer with social media links

4. **Additional Pages**
   - About Us
   - Sales Collection  
   - Travel Insights (blog)
   - How To Get There
   - Contact Us

#### API Routes (Read-Only):
- `/api/properties` - Fetch properties for display
- `/api/content` - Fetch page content
- `/api/contact` - Handle contact form submissions

### 2. Admin Dashboard Application (`/admin/`)
**Separate application for content management**

#### Features:
- **Authentication:** Secure admin login (Supabase Auth)
- **Property Management:** Full CRUD operations for properties
- **Content Management:** Dynamic content editing for all pages
- **Media Library:** Image/video upload and management
- **Category Management:** Property types, locations, amenities
- **Review Moderation:** Approve/reject customer reviews
- **SEO Management:** Meta tags, descriptions, alt texts
- **User Management:** Admin user roles and permissions

#### API Routes (Full CRUD):
- `/api/auth/*` - Authentication endpoints
- `/api/properties/*` - Property management
- `/api/content/*` - Content management
- `/api/media/*` - File uploads and media management
- `/api/users/*` - User management

## Key Features Required

### Responsive Design
- **Mobile-first approach**
- **Breakpoints:** Mobile (320-768px), Tablet (768-1024px), Desktop (1024px+)
- **Touch-optimized** interface for mobile devices
- **Adaptive layouts** that work seamlessly across all devices

### Dynamic Content System
- All text content must be manageable through admin dashboard
- Property information, descriptions, and details fully dynamic
- Location-based content management
- Category and tag system for properties

### Image Management
- Multiple image upload per property
- Image optimization and compression
- Gallery lightbox functionality
- Alt text management for SEO

### Performance Requirements
- Fast loading times with Next.js optimization
- Image lazy loading and optimization
- SEO-friendly URL structure
- Server-side rendering for property pages

## Database Structure Needed

### Core Tables
- **Properties:** Full property details (title, description, price, location, etc.)
- **Locations:** Watamu, Lamu, etc. with hero images
- **Categories:** Property types and classifications  
- **Images:** Multiple images per property with ordering
- **Reviews:** Customer testimonials and ratings
- **Content:** Dynamic page content management
- **Admin Users:** Dashboard user management

## Development Approach

### Phase 1: Foundation & Setup
- Create two separate Next.js projects (`website/` and `admin/`)
- Configure ANDIKA font family for both applications
- Set up shared Supabase project and database schema
- Create basic layout components matching designs
- Set up shared TypeScript types

### Phase 2: Main Website Development
- Build homepage exactly matching Figma design
- Implement property listing and detail pages
- Create responsive navigation and footer
- Build image galleries and video integration
- Implement read-only API endpoints

### Phase 3: Admin Dashboard Development
- Set up separate admin application with authentication
- Develop comprehensive CMS for property management
- Build content management system
- Create media library with upload functionality
- Implement user authentication and permissions
- Build all CRUD API endpoints

### Phase 4: Integration & Testing
- Ensure data synchronization between applications
- Test admin changes reflect on main website
- Cross-browser and device testing

### Phase 5: Deployment & Launch
- Deploy main website to www.irotorealty.com
- Deploy admin dashboard to admin.irotorealty.com
- Configure domains and SSL certificates
- Set up monitoring and analytics for both applications

## Design Adherence Requirements

- **Pixel-perfect implementation** of provided Figma designs
- **Exact color matching** - no deviations from the 3-color palette
- **ANDIKA font** implementation throughout
- **Consistent spacing and typography** as shown in designs
- **Hover states** and interactions matching brown highlight specification

## Success Criteria

1. **Main Website:**
   - Looks identical to Figma designs on all devices
   - Dynamic property system with image galleries
   - Mobile-responsive design with smooth performance
   - SEO-optimized with proper meta tags and structure
   - Fast loading times and optimized images

2. **Admin Dashboard:**
   - Fully functional CMS for content management
   - Secure authentication and user management
   - Intuitive interface for property and content management
   - Media library with file upload capabilities
   - Real-time content updates reflected on main website

3. **Integration:**
   - Seamless data flow between admin and main website
   - Separate deployments with shared database
   - Independent scaling and maintenance capabilities

## Files Provided
- **Design Guide:** `/Users/qc/Desktop/Files/Iroto Realty/Design Guide/`
  - `Desktop - 15.png` (Style guide with colors, fonts, logo)
  - `Home page.jpg` (Homepage layout)
  - `Property Details.jpg` (Property page layout)
  - `Property details2.jpg` (Alternative property layout)
  - `Property details3.jpg` (Property page with real images)

## Getting Started

**IMPORTANT:** This project requires creating TWO separate Next.js applications:

1. **Start with Main Website (`/website/`):**
   - Examine design files closely
   - Set up Next.js with TypeScript and Tailwind
   - Implement public-facing pages with exact brand compliance
   - Focus on read-only data consumption from Supabase

2. **Then Build Admin Dashboard (`/admin/`):**
   - Create separate Next.js application
   - Implement comprehensive CMS functionality
   - Build all CRUD operations and file upload systems
   - Set up authentication and user management

3. **Deploy Separately:**
   - Main website: `www.irotorealty.com`
   - Admin dashboard: `admin.irotorealty.com`
   - Both applications share the same Supabase database

**Remember:** The admin dashboard should never be accessible from the main website - they are completely separate applications with different domains and deployment pipelines.