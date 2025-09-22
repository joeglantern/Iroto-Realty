import PageLayout from '@/components/layout/PageLayout';
import { getTravelSections } from '@/lib/travel-sections';
import RichTextRenderer from '@/components/RichTextRenderer';

export default async function GettingThere() {
  // Get dynamic content from CMS
  const sections = await getTravelSections('getting_there');
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

        {/* Dynamic CMS Sections */}
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <section
              key={section.id}
              className={`py-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6">
                    {section.title}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
                  <RichTextRenderer content={section.content} />
                </div>
              </div>
            </section>
          ))
        ) : (
          /* Fallback when no content exists */
          <section className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-gray-50 rounded-lg p-12">
                <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Getting There Guide Coming Soon</h3>
                <p className="text-lg text-gray-600 mb-6">
                  We're preparing your complete transportation guide with all the essential information.
                </p>
                <p className="text-gray-500">
                  Check back soon for flight information, ground transport options, and travel tips.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}