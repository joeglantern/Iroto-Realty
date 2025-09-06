import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishedAt: string;
  category: string;
  readTime: string;
  slug: string;
}

export default function Blog() {
  // Mock blog data - in a real app, this would come from an API or CMS
  const blogPosts: BlogPost[] = [
    {
      id: '1',
      slug: 'discovering-lamu-island-paradise',
      title: 'Discovering Lamu Island: A Hidden Paradise in Kenya',
      excerpt: 'Explore the rich culture, stunning beaches, and historic architecture of Lamu Island, one of Kenya\'s most enchanting coastal destinations.',
      content: '',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Sarah Johnson',
      publishedAt: 'March 15, 2024',
      category: 'Travel Guide',
      readTime: '5 min read'
    },
    {
      id: '2',
      slug: 'watamu-marine-national-park-guide',
      title: 'Watamu Marine National Park: A Snorkeling Paradise',
      excerpt: 'Dive into the crystal-clear waters of Watamu Marine National Park and discover vibrant coral reefs and exotic marine life.',
      content: '',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Michael Chen',
      publishedAt: 'March 10, 2024',
      category: 'Activities',
      readTime: '4 min read'
    },
    {
      id: '3',
      slug: 'luxury-villa-investment-kenya',
      title: 'Investing in Luxury Villas: Kenya\'s Coastal Real Estate Boom',
      excerpt: 'Learn about the growing opportunities in Kenya\'s luxury real estate market and why coastal properties are attracting international investors.',
      content: '',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'David Mbugua',
      publishedAt: 'March 5, 2024',
      category: 'Investment',
      readTime: '7 min read'
    },
    {
      id: '4',
      slug: 'kenyan-coastal-cuisine-guide',
      title: 'A Culinary Journey: Traditional Coastal Cuisine of Kenya',
      excerpt: 'Savor the flavors of the Kenyan coast with our guide to traditional Swahili dishes and the best local restaurants.',
      content: '',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Amina Hassan',
      publishedAt: 'February 28, 2024',
      category: 'Culture',
      readTime: '6 min read'
    },
    {
      id: '5',
      slug: 'sustainable-tourism-kenya-coast',
      title: 'Sustainable Tourism: Protecting Kenya\'s Coastal Ecosystem',
      excerpt: 'Discover how responsible tourism practices are helping preserve the natural beauty and cultural heritage of Kenya\'s coast.',
      content: '',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'James Kimani',
      publishedAt: 'February 20, 2024',
      category: 'Sustainability',
      readTime: '5 min read'
    },
    {
      id: '6',
      slug: 'best-time-visit-kenya-coast',
      title: 'When to Visit: A Seasonal Guide to Kenya\'s Coast',
      excerpt: 'Plan your perfect coastal getaway with our comprehensive guide to weather patterns, wildlife migrations, and seasonal activities.',
      content: '',
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Grace Wanjiku',
      publishedAt: 'February 15, 2024',
      category: 'Travel Guide',
      readTime: '4 min read'
    }
  ];

  const categories = ['All', 'Travel Guide', 'Activities', 'Investment', 'Culture', 'Sustainability'];

  return (
    <PageLayout>
      <div>
        {/* Hero Section */}
        <section className="relative h-96 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
          
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Our <span className="text-brown">Blog</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/90">
              Discover stories, insights, and guides about Kenya's coastal paradise
            </p>
          </div>
        </section>

        {/* Blog Content */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-6 py-2 rounded-full border-2 border-brown text-brown hover:bg-brown hover:text-white transition-colors duration-200 font-medium"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Featured Article */}
            <div className="mb-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-3 py-1 bg-brown/10 text-brown text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      {blogPosts[0].category}
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brown rounded-full flex items-center justify-center text-white font-semibold">
                        {blogPosts[0].author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{blogPosts[0].author}</p>
                        <p className="text-sm text-gray-500">{blogPosts[0].publishedAt}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{blogPosts[0].readTime}</span>
                  </div>
                  <Link
                    href={`/blog/${blogPosts[0].slug}`}
                    className="inline-block bg-brown hover:bg-brown/90 text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200"
                  >
                    Read Article
                  </Link>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src={blogPosts[0].image}
                      alt={blogPosts[0].title}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(1).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="aspect-[4/3] overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-500">{post.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-3 group-hover:text-brown transition-colors duration-200">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-brown rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-500">{post.publishedAt}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-16">
              <button className="border-2 border-brown text-brown hover:bg-brown hover:text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200">
                Load More Articles
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}