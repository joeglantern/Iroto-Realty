import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';

export default function NotFound() {
  return (
    <PageLayout>
      <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-lg">
          <p className="text-8xl font-bold text-brown mb-4">404</p>
          <h1 className="text-3xl font-bold text-black mb-4">Page Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-3 bg-brown text-white rounded-md font-semibold hover:bg-brown/90 transition-colors duration-200"
            >
              Go Home
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-brown text-brown rounded-md font-semibold hover:bg-brown/5 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
