'use client';

import PageLayout from '@/components/layout/PageLayout';
import { House, Suitcase, CurrencyDollar, UsersThree, MapPin, CheckSquare, ShieldCheck } from '@phosphor-icons/react';

export default function About() {
  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/About Us_.jpg")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-[#713900]">
              About <span className="text-[#713900]">Iroto Realty</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90">
              Your trusted partner in premium Kenyan real estate
            </p>
          </div>
        </section>

        {/* Company Story Section */}
        <section className="pb-20 pt-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                  Our Story
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  At Iroto Realty, we are passionate about helping people discover beautiful homes, rentals, 
                  and unique properties along Kenya's coast. Our work is rooted in over seven years of 
                  firsthand experience living and engaging with the coastal lifestyle, giving us a unique 
                  understanding of the region's charm, culture, and investment potential.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Think of Iroto Realty as the go-to place for dreamy coastal living, whether you're looking to
                  stay, invest, or just get inspired. We don't just list properties; we open doors to experiences, 
                  investments, and lifestyles that capture the spirit of coastal living.
                </p>
                <p className="text-lg text-gray-600">
                  Our approach is built on transparency, trust, and local insight. Every property we represent 
                  is carefully vetted to ensure quality and authenticity, and we provide clear, honest guidance 
                  throughout the process, whether renting for a weekend or buying for a lifetime.
                </p>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-20 bg-brown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                What We Do
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                We specialize in connecting you with exceptional coastal properties and experiences
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <House size={32} className="text-brown" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Luxury & Stylish Homes</h3>
                <p className="text-white/80">
                  From private villas to elegant holiday houses that embody coastal sophistication.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Suitcase size={32} className="text-brown" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Short-Term Stays</h3>
                <p className="text-white/80">
                  Curated rentals perfect for holidays, retreats, or special events along the coast.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <CurrencyDollar size={32} className="text-brown" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Sales & Investments</h3>
                <p className="text-white/80">
                  Unique properties, including houses and land, for buyers looking to invest in the coast.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <UsersThree size={32} className="text-brown" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Retreats & Events</h3>
                <p className="text-white/80">
                  Connecting clients with spaces ideal for hosting intimate gatherings and wellness experiences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Why Choose Iroto Realty
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The qualities that set us apart in coastal real estate
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Local Knowledge</h3>
                <p className="text-gray-600">
                  Over seven years of coastal living gives us insider understanding of the market and lifestyle.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckSquare size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Handpicked Properties</h3>
                <p className="text-gray-600">
                  We showcase only properties that reflect style, quality, and the essence of coastal charm.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Integrity & Service</h3>
                <p className="text-gray-600">
                  Transparency and personal attention define how we do business, building lasting relationships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experienced professionals dedicated to your success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team member cards would go here - placeholder for now */}
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-black mb-2">Eunice</h3>
                <p className="text-brown font-medium mb-2">Founder & CEO</p>
                <p className="text-gray-600 text-sm">
                  Leading Iroto Realty with over seven years of firsthand coastal living experience and deep understanding of the region.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-black mb-2">Team Member</h3>
                <p className="text-brown font-medium mb-2">Property Specialist</p>
                <p className="text-gray-600 text-sm">
                  Expert in coastal property curation, ensuring each property reflects quality and coastal charm.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-black mb-2">Team Member</h3>
                <p className="text-brown font-medium mb-2">Client Experience</p>
                <p className="text-gray-600 text-sm">
                  Providing transparent guidance and personalized attention throughout every client journey.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}