'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For demo purposes, simple check
    if (credentials.email === 'admin@irotorealty.com' && credentials.password === 'admin123') {
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      alert('Invalid credentials. Use admin@irotorealty.com / admin123');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 md:space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/logo/iroto-logo.png"
            alt="Iroto Realty"
            width={180}
            height={72}
            className="mx-auto mb-6 md:mb-8 w-auto h-16 md:h-20"
            priority
          />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm md:text-base text-gray-600">Access your Iroto Realty dashboard</p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="admin@irotorealty.com"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500 mt-4">
              Demo credentials: admin@irotorealty.com / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
