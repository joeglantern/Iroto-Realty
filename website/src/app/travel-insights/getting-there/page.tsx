import PageLayout from '@/components/layout/PageLayout';

export default function GettingThere() {
  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Getting <span className="text-brown">There</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90">
              Your complete transportation guide to Kenya's coastal destinations
            </p>
          </div>
        </section>

        {/* Flight Information */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Flying to Kenya
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Main Airports</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-brown">Jomo Kenyatta International (NBO)</h4>
                      <p className="text-gray-600 text-sm">
                        Nairobi - Main international gateway. Connect to coastal destinations 
                        via domestic flights or road transport.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brown">Moi International Airport (MBA)</h4>
                      <p className="text-gray-600 text-sm">
                        Mombasa - Direct international flights available. Closest to coastal destinations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brown">Lamu Airport (LAU)</h4>
                      <p className="text-gray-600 text-sm">
                        Lamu Island - Domestic flights from Nairobi and Mombasa. Perfect for Lamu properties.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Major Airlines</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Kenya Airways</span>
                      <span className="text-brown">National carrier</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emirates</span>
                      <span className="text-brown">Via Dubai</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Turkish Airlines</span>
                      <span className="text-brown">Via Istanbul</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Qatar Airways</span>
                      <span className="text-brown">Via Doha</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KLM</span>
                      <span className="text-brown">Via Amsterdam</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brown/10 rounded-lg p-6 mb-12">
                <h3 className="text-xl font-semibold text-black mb-3">✈️ Flight Tips</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Book flights 2-3 months in advance for better prices</li>
                  <li>• Consider flying into Mombasa to save travel time to coast</li>
                  <li>• Domestic flights to Lamu run multiple times daily</li>
                  <li>• Check baggage weight limits for domestic connections</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Getting to Lamu */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Getting to Lamu
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-6">Transportation Options</h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-brown pl-6">
                      <h4 className="font-semibold text-black mb-2">✈️ By Air (Recommended)</h4>
                      <p className="text-gray-600 mb-2">
                        Fly directly to Lamu Airport (LAU) from Nairobi (1.5 hours) or Mombasa (45 minutes).
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Airlines:</strong> Safarilink, Fly540</p>
                        <p><strong>Duration:</strong> NBO-LAU: 1.5hrs | MBA-LAU: 45min</p>
                        <p><strong>Cost:</strong> $150-250 USD</p>
                      </div>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-6">
                      <h4 className="font-semibold text-black mb-2">🚗 By Road + Boat</h4>
                      <p className="text-gray-600 mb-2">
                        Drive to Mokowe jetty, then take a boat to Lamu. Scenic but time-consuming.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Road:</strong> Nairobi to Mokowe (6-8 hours)</p>
                        <p><strong>Boat:</strong> Mokowe to Lamu (20 minutes)</p>
                        <p><strong>Total Cost:</strong> $50-100 USD including fuel</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: 'url("https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-black mb-4">Transport on Lamu Island</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-2xl">🚶</span>
                    </div>
                    <h4 className="font-semibold text-black mb-2">Walking</h4>
                    <p className="text-gray-600 text-sm">
                      The traditional way to explore Lamu's narrow streets and stone architecture.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-2xl">🫏</span>
                    </div>
                    <h4 className="font-semibold text-black mb-2">Donkey</h4>
                    <p className="text-gray-600 text-sm">
                      Historic transport method, mainly for goods. A unique cultural experience.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-2xl">⛵</span>
                    </div>
                    <h4 className="font-semibold text-black mb-2">Dhow</h4>
                    <p className="text-gray-600 text-sm">
                      Traditional sailing vessels for coastal trips and sunset cruises.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting to Watamu */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Getting to Watamu
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
                <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: 'url("https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-6">Transportation Options</h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-brown pl-6">
                      <h4 className="font-semibold text-black mb-2">🚗 By Road from Mombasa</h4>
                      <p className="text-gray-600 mb-2">
                        Most convenient option. Scenic coastal drive along well-maintained roads.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Distance:</strong> 120km (75 miles)</p>
                        <p><strong>Duration:</strong> 1.5-2 hours</p>
                        <p><strong>Cost:</strong> Taxi $50-80 | Rental car $30-50/day</p>
                      </div>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-6">
                      <h4 className="font-semibold text-black mb-2">🚌 By Bus/Matatu</h4>
                      <p className="text-gray-600 mb-2">
                        Budget-friendly public transport option. Adventure but less comfort.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Route:</strong> Mombasa to Malindi, then Watamu</p>
                        <p><strong>Duration:</strong> 2-3 hours</p>
                        <p><strong>Cost:</strong> $3-5 USD</p>
                      </div>
                    </div>

                    <div className="border-l-4 border-brown pl-6">
                      <h4 className="font-semibold text-black mb-2">🚁 By Helicopter</h4>
                      <p className="text-gray-600 mb-2">
                        Luxury option with spectacular aerial views of the coast.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Duration:</strong> 45 minutes</p>
                        <p><strong>Cost:</strong> $300-500 USD</p>
                        <p><strong>Booking:</strong> Through luxury hotels or tour operators</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-black mb-4">Local Transportation in Watamu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-brown mb-2">Getting Around</h4>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li>• Tuk-tuks for short distances ($1-3)</li>
                      <li>• Bicycle rentals ($5-10/day)</li>
                      <li>• Beach walks along the coastline</li>
                      <li>• Hotel shuttle services</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brown mb-2">Nearby Attractions</h4>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li>• Malindi town (20 minutes drive)</li>
                      <li>• Arabuko Sokoke Forest (30 minutes)</li>
                      <li>• Gedi Ruins (15 minutes)</li>
                      <li>• Various beach clubs and resorts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Travel Tips */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Transportation Tips
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-brown mb-4">💡 Pro Tips</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Book domestic flights early, especially during peak season
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Consider flight + accommodation packages for better deals
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Download offline maps before traveling to remote areas
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Carry cash for tuk-tuks and local transport
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-brown mb-4">⚠️ Important Notes</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Road conditions can vary; allow extra time for journeys
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Weather can affect small aircraft schedules
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Arrange airport transfers in advance for peace of mind
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Keep travel documents easily accessible
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact for Assistance */}
        <section className="py-20 bg-brown">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Need Transportation Assistance?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Our team can help arrange your travel and provide personalized recommendations
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <a
                href="/contact"
                className="inline-block bg-white hover:bg-gray-100 text-brown px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                Contact Us
              </a>
              <a
                href="mailto:eunice@irotorealty.com"
                className="inline-block border-2 border-white hover:bg-white hover:text-brown text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                Email for Assistance
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}