import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-20 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          {/* Logo Section */}
          <div className="flex justify-center md:justify-start ml-8 lg:ml-12 pt-1">
            <Link href="/" className="flex-shrink-0 transform-gpu origin-left">
              <Image
                src="/logo/iroto-logo-white.png"
                alt="Iroto Realty"
                width={180}
                height={60}
                className="h-16 w-auto scale-[4] transform lg:h-18 lg:scale-[5]"
              />
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-col space-y-3">
            {/* Facebook */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="text-white">irotorealty.com</span>
            </div>

            {/* Instagram */}
            <div className="flex items-center space-x-3">
              <Image
                src="/icons/instagram.png"
                alt="Instagram"
                width={32}
                height={32}
                className="w-8 h-8 flex-shrink-0"
              />
              <span className="text-white">irotorealty.com</span>
            </div>

            {/* Twitter/X */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black border border-white rounded flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <span className="text-white">irotorealty.com</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col space-y-3">
            <a href="mailto:eunice@irotorealty.com" className="flex items-center space-x-3 hover:text-gray-300 transition-colors duration-200">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                </svg>
              </div>
              <span className="text-white">eunice@irotorealty.com</span>
            </a>
            
            <a href="mailto:info@irotorealty.com" className="flex items-center space-x-3 hover:text-gray-300 transition-colors duration-200">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
                </svg>
              </div>
              <span className="text-white">info@irotorealty.com</span>
            </a>

            <a href="tel:+254712345679" className="flex items-center space-x-3 hover:text-gray-300 transition-colors duration-200">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-white">07123456789</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}