'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', session.user.id)
          .single();
        
        if (roleData && roleData.is_active && roleData.role === 'admin') {
          router.push('/properties');
        } else {
          setError('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
        }
      }
    };
    
    checkAuth();
  }, [router]);

  // Hidden signup activation (click logo 5 times)
  const [clickCount, setClickCount] = useState(0);
  const handleLogoClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        setShowSignUp(true);
        setError('');
        return 0;
      }
      return newCount;
    });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              email: email
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          setError('Account created! Please check your email for verification. Contact admin to grant access.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if user is admin
          const { data: roleData } = await supabase
            .from('profiles')
            .select('role, is_active')
            .eq('id', data.user.id)
            .single();
          
          if (roleData && roleData.is_active && roleData.role === 'admin') {
            router.push('/properties');
          } else {
            setError('Access denied. Admin privileges required.');
            await supabase.auth.signOut();
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div 
          className="flex justify-center cursor-pointer"
          onClick={handleLogoClick}
        >
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">IR</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iroto Realty Admin
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? 'Create admin account' : 'Sign in to your admin account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
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
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </div>

            {showSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need to create an account? Sign up'}
                </button>
              </div>
            )}
          </form>

          {showSignUp && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> New accounts are created with 'user' role. 
                Contact a super admin to upgrade to 'admin' role for access to this panel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}