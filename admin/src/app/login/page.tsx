'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { hasAdminAccess } from '@/lib/admin-access';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: session } = await authClient.getSession();
      if (session) {
        if (await hasAdminAccess()) {
          router.push('/properties');
        } else {
          setError('Access denied. Admin privileges required.');
          await authClient.signOut();
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await authClient.signIn.email({ email, password });

      if (error) {
        if (error.status === 401 || error.code === 'INVALID_EMAIL_OR_PASSWORD') {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.status === 429) {
          setError('Too many attempts. Please wait a minute and try again.');
        } else {
          setError(error.message || 'Authentication failed. Please try again.');
        }
        return;
      }

      if (data?.user) {
        if (await hasAdminAccess()) {
          router.push('/properties');
        } else {
          setError('Access denied. Admin privileges required.');
          await authClient.signOut();
        }
      }
    } catch (error: any) {
      setError('Could not reach the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center">
            <Image
              src="/logo/iroto-logo.png"
              alt="Iroto Realty"
              width={600}
              height={200}
              className="h-32 sm:h-48 md:h-64 w-auto"
            />
          </div>
        </div>
        <h2 className="mt-2 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Iroto Realty Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your admin account
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="admin@iroto.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
