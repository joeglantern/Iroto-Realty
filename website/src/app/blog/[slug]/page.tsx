import Image from 'next/image';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

interface BlogPostDetailProps {
  params: {
    slug: string;
  };
}

export default function BlogPostDetail({ params }: BlogPostDetailProps) {
  const { slug } = params;
  
  // Mock blog data - in a real app, this would come from an API or CMS
  const blogPosts = [
    {
      id: '1',
      slug: 'discovering-lamu-island-paradise',
      title: 'Discovering Lamu Island: A Hidden Paradise in Kenya',
      excerpt: 'Explore the rich culture, stunning beaches, and historic architecture of Lamu Island, one of Kenya\'s most enchanting coastal destinations.',
      content: `
        <p>Lamu Island, a UNESCO World Heritage Site, is one of Kenya's most captivating destinations. This ancient Swahili settlement has preserved its rich cultural heritage for over 700 years, making it a living museum of East African coastal civilization.</p>
        
        <h2>A Journey Through History</h2>
        <p>Walking through Lamu's narrow stone streets feels like stepping back in time. The town's architecture tells the story of centuries of cultural exchange between African, Arab, Persian, and Indian influences. The coral stone buildings, intricately carved wooden doors, and traditional courtyards create an atmosphere unlike anywhere else in East Africa.</p>
        
        <h2>Cultural Experiences</h2>
        <p>Lamu offers visitors a chance to experience authentic Swahili culture. From traditional dhow sailing to learning about local crafts, the island provides immersive cultural experiences that connect visitors with the region's rich heritage.</p>
        
        <h2>Natural Beauty</h2>
        <p>Beyond its cultural significance, Lamu boasts pristine beaches, crystal-clear waters, and diverse marine life. The island's unspoiled natural environment provides the perfect backdrop for relaxation and adventure activities.</p>
      `,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
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
      content: `
        <p>Watamu Marine National Park is one of Kenya's premier marine conservation areas, protecting some of the most pristine coral reefs on the East African coast. This underwater paradise offers world-class snorkeling and diving experiences.</p>
        
        <h2>Marine Biodiversity</h2>
        <p>The park is home to over 600 species of fish, sea turtles, dolphins, and whale sharks. The coral reefs here are among the most diverse in the Indian Ocean, providing habitat for countless marine species.</p>
        
        <h2>Best Snorkeling Spots</h2>
        <p>The park features several excellent snorkeling locations, each offering unique underwater experiences. From shallow coral gardens perfect for beginners to deeper reef walls for experienced snorkelers.</p>
        
        <h2>Conservation Efforts</h2>
        <p>Local communities and conservation organizations work together to protect this marine ecosystem. Visitors can learn about ongoing conservation projects and how tourism supports marine protection efforts.</p>
      `,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      author: 'Michael Chen',
      publishedAt: 'March 10, 2024',
      category: 'Activities',
      readTime: '4 min read'
    }
  ];
  
  // Find the current blog post
  const currentPost = blogPosts.find(post => post.slug === slug) || blogPosts[0];
  
  // Get related posts (excluding current post)
  const relatedPosts = blogPosts.filter(post => post.slug !== slug).slice(0, 3);

  return (
    <PageLayout>
      <div>
        {/* Article Header */}
        <article className="bg-white">
          {/* Hero Image */}
          <div className="relative h-96 lg:h-[500px]">
            <Image
              src={currentPost.image}
              alt={currentPost.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          {/* Article Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16">
              {/* Article Meta */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <span className="px-4 py-2 bg-brown/10 text-brown text-sm font-medium rounded-full">
                    {currentPost.category}
                  </span>
                  <span className="text-sm text-gray-500">{currentPost.readTime}</span>
                </div>
                <div className="flex space-x-4">
                  <button className="text-gray-500 hover:text-brown">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 11h-4.23l1.52-4.94C16.38 5.03 15.54 4 14.38 4c-.58 0-1.14.24-1.52.65L7.11 10.3C6.85 10.63 6.8 11.15 7.11 11.53c.29.35.75.47 1.15.47h4.23l-1.52 4.94C10.62 18.97 11.46 20 12.62 20c.58 0 1.14-.24 1.52-.65l5.75-5.65c.26-.33.31-.85 0-1.23-.29-.35-.75-.47-1.12-.47z"/>
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-brown">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-bold text-black mb-8 leading-tight">
                {currentPost.title}
              </h1>
              
              {/* Author Info */}
              <div className="flex items-center space-x-4 pb-8 border-b border-gray-200 mb-12">
                <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {currentPost.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentPost.author}</p>
                  <p className="text-sm text-gray-500">Published on {currentPost.publishedAt}</p>
                </div>
              </div>
              
              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:text-black prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-brown hover:prose-a:text-brown/80"
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-black mb-12 text-center">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((post) => (
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
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                      <h3 className="text-xl font-bold text-black mt-3 mb-3 group-hover:text-brown transition-colors duration-200">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-block border-2 border-brown text-brown hover:bg-brown hover:text-white px-8 py-3 rounded-md font-semibold transition-colors duration-200"
              >
                View All Articles
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}