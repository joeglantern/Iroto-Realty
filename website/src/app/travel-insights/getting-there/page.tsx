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
                        Nairobi - Main international gateway, 15km from city center. Most international flights arrive here.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brown">Wilson Airport (WIL)</h4>
                      <p className="text-gray-600 text-sm">
                        Nairobi - Primary hub for domestic flights, 6km south of city center. Most coastal flights depart here.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brown">Moi International Airport (MBA)</h4>
                      <p className="text-gray-600 text-sm">
                        Mombasa - Coastal gateway with international and domestic flights. Closest to beach destinations.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brown">Malindi Airport (MYD)</h4>
                      <p className="text-gray-600 text-sm">
                        Malindi - Domestic flights from Nairobi, convenient for Watamu and northern coast properties.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Domestic Airlines</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Kenya Airways</span>
                      <span className="text-brown">Full service</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jambojet</span>
                      <span className="text-brown">Low cost</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safarilink</span>
                      <span className="text-brown">Safari destinations</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AirKenya Express</span>
                      <span className="text-brown">Game reserves</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fly540</span>
                      <span className="text-brown">Regional flights</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fly ALS</span>
                      <span className="text-brown">Charter & scheduled</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brown/10 rounded-lg p-6 mb-12">
                <h3 className="text-xl font-semibold text-black mb-3">✈️ Flight Tips & Costs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-black mb-2">Domestic Flight Costs (2024)</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Wilson to Mombasa: KES 8,000-15,000</li>
                      <li>• Wilson to Malindi: KES 10,000-18,000</li>
                      <li>• Wilson to Lamu: KES 12,000-20,000</li>
                      <li>• Baggage limit: 15kg (domestic flights)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-2">Booking Tips</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Book 1-2 weeks ahead for better rates</li>
                      <li>• Check-in opens 1 hour before departure</li>
                      <li>• Wilson Airport has limited parking</li>
                      <li>• Weather can affect small aircraft schedules</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ground Transport */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Ground Transportation in Kenya
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                <div>
                  <h3 className="text-2xl font-semibold text-black mb-6">SGR Train (Madaraka Express)</h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-brown pl-6">
                      <h4 className="font-semibold text-black mb-2">🚆 Nairobi ↔ Mombasa</h4>
                      <p className="text-gray-600 mb-2">
                        Modern standard gauge railway with comfortable seating and scenic views.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Duration:</strong> 4.5 hours (Express) | 6 hours (Regular)</p>
                        <p><strong>Economy Class:</strong> KES 1,500 (2024 rates)</p>
                        <p><strong>First Class:</strong> KES 4,500 (2024 rates)</p>
                        <p><strong>Departure:</strong> Syokimau (Nairobi) to Miritini (Mombasa)</p>
                      </div>
                    </div>

                    <div className="border-l-4 border-gray-300 pl-6">
                      <h4 className="font-semibold text-black mb-2">🚌 Bus Services</h4>
                      <p className="text-gray-600 mb-2">
                        Various operators with different comfort levels and pricing.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>Nairobi to Mombasa:</strong> KES 1,000-2,500</p>
                        <p><strong>Duration:</strong> 8-10 hours</p>
                        <p><strong>Operators:</strong> Modern Coast, Mash, Buscar</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-6">
                      <h4 className="font-semibold text-black mb-2">🚐 Matatu (Local Transport)</h4>
                      <p className="text-gray-600 mb-2">
                        Affordable public transport, though less comfortable for long distances.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p><strong>City transport:</strong> KES 50-200</p>
                        <p><strong>Intercity routes:</strong> KES 500-1,500</p>
                        <p><strong>Best for:</strong> Short distances and local experience</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative h-64 lg:h-96 rounded-lg overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: 'url("https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Getting to Coastal Destinations */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Reaching Coastal Destinations
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">🏝️ Lamu Island</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-brown mb-1">By Air (Recommended)</h4>
                      <p className="text-gray-600 text-sm mb-1">Direct flights to Lamu Airport from Wilson or Mombasa</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Cost:</strong> KES 12,000-20,000 | <strong>Duration:</strong> 1.5 hours</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-black mb-1">By Road + Boat</h4>
                      <p className="text-gray-600 text-sm mb-1">Drive to Mokowe jetty, then dhow to Lamu</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Road:</strong> 6-8 hours | <strong>Boat:</strong> 20 minutes</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-brown">
                      <p><strong>Note:</strong> No cars on Lamu Island - transport by foot, donkey, or dhow</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">🏖️ Watamu & Malindi</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-brown mb-1">By Air</h4>
                      <p className="text-gray-600 text-sm mb-1">Fly to Malindi Airport, then 20 minutes to Watamu</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Cost:</strong> KES 10,000-18,000 | <strong>Duration:</strong> 1 hour</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-black mb-1">By Road from Mombasa</h4>
                      <p className="text-gray-600 text-sm mb-1">Scenic coastal drive on well-maintained road</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Distance:</strong> 120km | <strong>Duration:</strong> 1.5-2 hours</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-black mb-1">By Matatu/Bus</h4>
                      <p className="text-gray-600 text-sm mb-1">Budget option via public transport</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Cost:</strong> KES 300-500 | <strong>Duration:</strong> 2-3 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">🌊 Diani Beach</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-brown mb-1">From Mombasa Airport</h4>
                      <p className="text-gray-600 text-sm mb-1">Direct transfer to South Coast beaches</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Taxi:</strong> KES 3,000-5,000 | <strong>Duration:</strong> 1 hour</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-black mb-1">Via Likoni Ferry</h4>
                      <p className="text-gray-600 text-sm mb-1">Cross Kilifi Creek by ferry, then road to Diani</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Ferry:</strong> Free for passengers | <strong>Total:</strong> 1-1.5 hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">🏙️ Nairobi Area</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-brown mb-1">Airport Transfers</h4>
                      <p className="text-gray-600 text-sm mb-1">From JKIA to city center or suburbs</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Taxi:</strong> KES 1,500-3,000 | <strong>Uber:</strong> KES 800-2,000</p>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-black mb-1">City Transport</h4>
                      <p className="text-gray-600 text-sm mb-1">Matatus, buses, boda bodas, ride-hailing apps</p>
                      <div className="text-xs text-gray-500">
                        <p><strong>Matatu:</strong> KES 50-200 | <strong>Uber/Bolt:</strong> KES 200-1,000</p>
                      </div>
                    </div>
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