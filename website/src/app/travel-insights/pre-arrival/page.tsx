import PageLayout from '@/components/layout/PageLayout';

export default function PreArrivalGuide() {
  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Pre-Arrival <span className="text-brown">Guide</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90">
              Everything you need to prepare for your Kenyan coastal adventure
            </p>
          </div>
        </section>

        {/* Visa & Documentation */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Visa & Documentation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Visa Requirements</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Valid passport with at least 6 months validity
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Tourist visa required for most nationalities
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Apply online at evisa.go.ke before travel
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Single entry visa valid for 90 days: $51 USD
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Health Requirements</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Yellow fever vaccination certificate required
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Malaria prophylaxis recommended
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Travel insurance strongly advised
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-brown rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      Check with your doctor for latest recommendations
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-brown/10 rounded-lg p-6 mb-12">
                <h3 className="text-xl font-semibold text-black mb-3">💡 Pro Tip</h3>
                <p className="text-gray-700">
                  Apply for your eVisa at least 7 days before travel to avoid any delays. Keep both digital 
                  and printed copies of your visa approval with you during travel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What to Pack */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                What to Pack
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">Sun Protection</h3>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• High SPF sunscreen (50+)</li>
                    <li>• Wide-brimmed hat</li>
                    <li>• Sunglasses (UV protection)</li>
                    <li>• Light, long-sleeved shirts</li>
                    <li>• After-sun lotion</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">Electronics</h3>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• Universal power adapter</li>
                    <li>• Waterproof phone case</li>
                    <li>• Portable charger/power bank</li>
                    <li>• Camera for memories</li>
                    <li>• Headphones</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">Documents</h3>
                  <ul className="space-y-1 text-gray-600 text-sm">
                    <li>• Passport & visa copies</li>
                    <li>• Travel insurance documents</li>
                    <li>• Vaccination certificates</li>
                    <li>• Flight confirmations</li>
                    <li>• Emergency contacts</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-black mb-6">Clothing Essentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-black mb-3">Beach & Activities</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Swimwear (2-3 sets)</li>
                      <li>• Beach cover-ups</li>
                      <li>• Flip-flops/sandals</li>
                      <li>• Water shoes (for reef walking)</li>
                      <li>• Quick-dry shorts/pants</li>
                      <li>• Moisture-wicking t-shirts</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-black mb-3">Cultural Sites & Evenings</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Modest clothing for towns/mosques</li>
                      <li>• Light cardigan for evenings</li>
                      <li>• Comfortable walking shoes</li>
                      <li>• Dress/shirt for nice dinners</li>
                      <li>• Light rain jacket</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Health & Safety */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-8">
                Health & Safety
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Health Precautions</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Use insect repellent to prevent mosquito bites</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Drink bottled or boiled water</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Pack basic first aid supplies</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Consider bringing anti-diarrheal medication</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-black mb-4">Safety Tips</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Keep copies of important documents separate</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Avoid displaying expensive jewelry or electronics</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Use hotel safes for valuables</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brown mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Inform someone of your daily plans</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Emergency Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-red-700"><strong>Police:</strong> 999 or 112</p>
                    <p className="text-red-700"><strong>Medical Emergency:</strong> 999</p>
                  </div>
                  <div>
                    <p className="text-red-700"><strong>Tourist Helpline:</strong> +254 20 2711262</p>
                    <p className="text-red-700"><strong>Your Embassy:</strong> Research before travel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Money & Communication */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-6">Money Matters</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-black mb-1">Currency Exchange</h4>
                      <p className="text-gray-600 text-sm">
                        Exchange money at banks, authorized bureaux de change, or use ATMs. 
                        Airport rates are usually less favorable.
                      </p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-black mb-1">Credit Cards</h4>
                      <p className="text-gray-600 text-sm">
                        Major credit cards accepted at hotels and restaurants. Notify your bank 
                        of travel plans to avoid card blocks.
                      </p>
                    </div>
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-black mb-1">Tipping</h4>
                      <p className="text-gray-600 text-sm">
                        10-15% at restaurants, $5-10/day for hotel staff, $10-20/day for guides. 
                        Small tips for helpful services are appreciated.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-black mb-6">Communication</h2>
                  <div className="space-y-4">
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-black mb-1">Mobile/Internet</h4>
                      <p className="text-gray-600 text-sm">
                        Major telecom providers: Safaricom, Airtel. Buy local SIM cards for 
                        cheaper rates. WiFi available at most hotels.
                      </p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-4">
                      <h4 className="font-semibold text-black mb-1">Calling Codes</h4>
                      <p className="text-gray-600 text-sm">
                        Kenya country code: +254. Remove the first 0 from local numbers 
                        when calling internationally.
                      </p>
                    </div>
                    <div className="border-l-4 border-brown pl-4">
                      <h4 className="font-semibold text-black mb-1">Language Apps</h4>
                      <p className="text-gray-600 text-sm">
                        Download offline translation apps. Basic Swahili phrases will be 
                        warmly received by locals.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}