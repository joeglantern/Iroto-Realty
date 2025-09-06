import PageLayout from '@/components/layout/PageLayout';

export default function SalesCollection() {
  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Sales <span className="text-brown">Collection</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90">
              Invest in Kenya's most prestigious coastal properties
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Discover exclusive opportunities to own luxury real estate in prime locations 
              along Kenya's stunning coastline.
            </p>
          </div>
        </section>

        {/* Investment Opportunities */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Investment Opportunities
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Premium properties for sale in Kenya's most desirable coastal destinations
              </p>
            </div>
            
            {/* Properties For Sale Grid */}
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
                        backgroundImage: `url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")`
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-brown text-white px-3 py-1 rounded-full text-sm font-medium">
                        FOR SALE
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-black mb-2">
                      Luxury Property {i + 1}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {i % 2 === 0 ? 'Lamu Waterfront' : 'Watamu Beachfront'}
                    </p>
                    <div className="mb-4">
                      <p className="text-brown font-bold text-2xl">
                        ${(500 + (i * 150)).toLocaleString()}K
                      </p>
                      <p className="text-gray-500 text-sm">
                        {Math.floor(Math.random() * 4) + 3} bedrooms • {Math.floor(Math.random() * 4) + 2} bathrooms • {(150 + (i * 50))}m²
                      </p>
                    </div>
                    <button className="w-full bg-brown hover:bg-brown/90 text-white py-2 rounded-md font-medium transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Investment Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">High ROI</h3>
                <p className="text-gray-600">
                  Excellent investment returns in Kenya's growing coastal property market with strong rental yields.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Prime Locations</h3>
                <p className="text-gray-600">
                  Strategically located properties in the most sought-after areas of Kenya's coast.
                </p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">Secure Investment</h3>
                <p className="text-gray-600">
                  Transparent processes, legal security, and comprehensive due diligence for peace of mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Market Insights */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                  Kenya Coastal Real Estate Market
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Kenya's coastal property market has shown consistent growth, driven by increasing 
                  tourism, infrastructure development, and international investment interest.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-brown rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">Growing Tourism Sector</h4>
                      <p className="text-gray-600 text-sm">Increasing visitor numbers driving rental demand</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-brown rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">Infrastructure Development</h4>
                      <p className="text-gray-600 text-sm">Improved roads, airports, and utilities enhancing property values</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-brown rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">International Interest</h4>
                      <p className="text-gray-600 text-sm">Growing global recognition of Kenya's coastal potential</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-96 rounded-lg overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Investment Process */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Investment Process
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A streamlined process to secure your coastal property investment
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Consultation</h3>
                <p className="text-gray-600 text-sm">
                  Discuss your investment goals and property preferences with our experts.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Property Tour</h3>
                <p className="text-gray-600 text-sm">
                  Visit selected properties and experience their potential firsthand.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Due Diligence</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive legal and technical verification of your chosen property.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">Completion</h3>
                <p className="text-gray-600 text-sm">
                  Finalize the purchase and begin your coastal property ownership journey.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-brown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Invest?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Contact our investment specialists to explore exclusive coastal property opportunities
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <a
                href="/contact"
                className="inline-block bg-white hover:bg-gray-100 text-brown px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                Schedule Consultation
              </a>
              <a
                href="mailto:eunice@irotorealty.com"
                className="inline-block border-2 border-white hover:bg-white hover:text-brown text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}