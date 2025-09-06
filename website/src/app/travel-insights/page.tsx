import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';

export default function TravelInsights() {
  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Travel <span className="text-brown">Insights</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90">
              Everything you need to know for your Kenyan coastal adventure
            </p>
          </div>
        </section>

        {/* Travel Guides Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Plan Your Journey
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive guides to help you make the most of your visit to Kenya's coast
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Pre-Arrival Guide */}
              <Link href="/travel-insights/pre-arrival" className="group">
                <div className="relative h-80 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                    style={{
                      backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="text-white">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2">Pre-Arrival Guide</h3>
                      <p className="text-lg mb-4 text-white/90">Essential preparation for your Kenyan coastal experience</p>
                      <div className="inline-flex items-center text-brown bg-white px-4 py-2 rounded-md font-semibold group-hover:bg-brown group-hover:text-white transition-colors duration-300">
                        Read Guide
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Getting There */}
              <Link href="/travel-insights/getting-there" className="group">
                <div className="relative h-80 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                    style={{
                      backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="text-white">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2">Getting There</h3>
                      <p className="text-lg mb-4 text-white/90">Transportation options and travel routes to our destinations</p>
                      <div className="inline-flex items-center text-brown bg-white px-4 py-2 rounded-md font-semibold group-hover:bg-brown group-hover:text-white transition-colors duration-300">
                        Read Guide
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Essential Travel Tips
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Quick insights for a smooth and memorable experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Climate</h3>
                <p className="text-gray-600">
                  Kenya's coast enjoys warm tropical weather year-round. Pack light, breathable clothing 
                  and don't forget sunscreen and a hat.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Currency</h3>
                <p className="text-gray-600">
                  Kenyan Shilling (KES) is the local currency. USD is widely accepted. 
                  ATMs are available in major towns, but bring cash for smaller establishments.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Language</h3>
                <p className="text-gray-600">
                  English and Swahili are official languages. Most people in tourist areas speak English, 
                  but learning basic Swahili phrases is appreciated.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Safety</h3>
                <p className="text-gray-600">
                  Kenya's coastal areas are generally safe for tourists. Follow standard travel precautions 
                  and respect local customs and traditions.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Culture</h3>
                <p className="text-gray-600">
                  Rich Swahili culture with Islamic influences. Dress modestly when visiting towns, 
                  especially in Lamu. Remove shoes when entering mosques.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Activities</h3>
                <p className="text-gray-600">
                  Snorkeling, diving, dhow sailing, deep-sea fishing, cultural tours, and beach relaxation. 
                  Book water activities in advance during peak season.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Best Time to Visit */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                  Best Time to Visit
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Kenya's coast is a year-round destination, but timing your visit can enhance your experience 
                  based on weather patterns and seasonal activities.
                </p>
                <div className="space-y-4">
                  <div className="border-l-4 border-brown pl-4">
                    <h4 className="font-semibold text-black mb-1">December - March (Peak Season)</h4>
                    <p className="text-gray-600 text-sm">
                      Dry season with excellent weather. Perfect for beaches and water activities. Higher prices and crowds.
                    </p>
                  </div>
                  <div className="border-l-4 border-gray-300 pl-4">
                    <h4 className="font-semibold text-black mb-1">April - May (Low Season)</h4>
                    <p className="text-gray-600 text-sm">
                      Long rains period. Some services may be limited, but great for budget travelers and fewer crowds.
                    </p>
                  </div>
                  <div className="border-l-4 border-brown pl-4">
                    <h4 className="font-semibold text-black mb-1">June - November (High Season)</h4>
                    <p className="text-gray-600 text-sm">
                      Dry season with cooler temperatures. Ideal for all activities. Great weather with moderate crowds.
                    </p>
                  </div>
                </div>
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
      </div>
    </PageLayout>
  );
}