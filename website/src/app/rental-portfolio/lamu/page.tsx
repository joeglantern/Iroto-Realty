import PageLayout from '@/components/layout/PageLayout';

export default function LamuProperties() {
  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-brown">Lamu</span> Island
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90">
              Where ancient Swahili culture meets modern luxury
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Discover our exclusive collection of luxury properties on this UNESCO World Heritage site, 
              where traditional dhows still sail and stone buildings tell stories of centuries past.
            </p>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Lamu Properties
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Handpicked luxury rentals in Lamu's most desirable locations
              </p>
            </div>
            
            {/* 3x2 Grid as per Figma design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {Array.from({ length: 6 }, (_, i) => (
                <div 
                  key={i} 
                  className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    <div 
                      className="w-full h-full bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundImage: `url("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")`
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-black mb-2">
                      Lamu Villa {i + 1}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Lamu Old Town
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-brown font-semibold text-lg">
                          From ${150 + (i * 50)}/night
                        </p>
                        <p className="text-gray-500 text-sm">
                          {Math.floor(Math.random() * 3) + 2} bedrooms • {Math.floor(Math.random() * 3) + 2} bathrooms
                        </p>
                      </div>
                      <button className="bg-brown hover:bg-brown/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Cards Section - Two rounded cards as per Figma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black">About Lamu</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Lamu is Kenya's oldest living town and a UNESCO World Heritage Site. This enchanting island 
                  preserves Swahili culture in its purest form, with no cars, ancient architecture, and 
                  traditional dhows sailing the waters. Experience authentic hospitality in luxury properties 
                  that honor the island's rich heritage.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black">Getting There</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Reach Lamu by flying to Lamu Airport or driving to Mokowe jetty, followed by a scenic 
                  boat ride across Lamu channel. The journey itself is part of the experience, with 
                  mangroves, fishing villages, and the anticipation of stepping into a world where time 
                  stands still.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Guest Reviews
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                What our guests say about their Lamu experience
              </p>
            </div>
            
            {/* Review Cards Carousel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-brown">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "An absolutely magical experience. The property was stunning and the cultural immersion 
                  was unlike anything we've experienced. Lamu is truly special."
                </p>
                <div className="font-semibold text-black">Sarah & Mike</div>
                <div className="text-gray-500 text-sm">UK</div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-brown">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The attention to detail and authentic Swahili hospitality made our stay unforgettable. 
                  We'll definitely be returning to this piece of paradise."
                </p>
                <div className="font-semibold text-black">Ahmed & Fatima</div>
                <div className="text-gray-500 text-sm">UAE</div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex text-brown">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Perfect blend of luxury and authenticity. The property exceeded our expectations 
                  and Lamu's charm is indescribable. A truly unique destination."
                </p>
                <div className="font-semibold text-black">James & Lisa</div>
                <div className="text-gray-500 text-sm">USA</div>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Video Section Placeholder */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Experience Lamu
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Watch our video tour of this magnificent destination
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">YouTube Video Placeholder</p>
                  <p className="text-sm text-gray-500 mt-2">Video integration coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}