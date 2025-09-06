import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

interface PropertyDetailProps {
  params: {
    slug: string;
  };
}

export default function PropertyDetail({ params }: PropertyDetailProps) {
  const { slug } = params;
  
  // Mock property data - in a real app, this would come from an API or database
  const property = {
    id: slug,
    title: "Baobab House",
    location: slug.includes('lamu') ? 'Lamu' : 'Watamu',
    description: "Lorem Ipsum, Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
    price: "From KES 25,000/night",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["WiFi", "Pool", "Kitchen", "AC", "Parking", "Beach Access"],
    reviews: [
      {
        id: 1,
        text: "Lorem Ipsum, Lorem Ipsum Lorem Ipsum LoremIpsum Lorem IpsumLorem Ipsum",
        author: "Sarah M."
      },
      {
        id: 2,
        text: "Lorem Ipsum, Lorem Ipsum Lorem Ipsum LoremIpsum Lorem IpsumLorem Ips",
        author: "John D."
      }
    ]
  };

  const heroImage = property.location === 'Lamu' 
    ? 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
    : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${heroImage}")` }}
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Location Dropdown */}
          <div className="absolute top-8 right-8 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Pre-Arrival Guide</div>
                <div className="text-sm text-gray-600">Getting there</div>
              </div>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl lg:text-6xl font-bold text-brown">
              {property.location.toUpperCase()}
            </h1>
          </div>
        </section>

        {/* Property Info Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Property Details */}
              <div>
                <h2 className="text-3xl font-bold text-brown mb-6">
                  {property.title}
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  {property.description}
                </p>
                
                {/* Amenities Icons */}
                <div className="grid grid-cols-3 gap-4 text-gray-600">
                  {property.amenities.slice(0, 6).map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-brown/20 rounded flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 bg-brown rounded-sm"></div>
                      </div>
                      <span className="text-sm font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Column - Video */}
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={property.videoUrl}
                  title="Property Tour Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {property.images.map((image, index) => (
                <div key={index} className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`Property image ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-100 rounded-3xl p-12 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">INFO</h3>
                </div>
              </div>
              <div className="bg-gray-100 rounded-3xl p-12 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">INFO</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-black">Reviews</h2>
              <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {property.reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {review.text}
                  </p>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-brown rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {review.author.charAt(0)}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{review.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}