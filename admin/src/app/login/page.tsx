'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

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

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Login timed out. Please check your internet connection and try again.');
    }, 30000); // 30 second timeout

    try {
      if (isSignUp) {
        const signUpPromise = supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              email: email
            }
          }
        });

        const { data, error } = await Promise.race([
          signUpPromise,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Sign up timed out after 20 seconds')), 20000)
          )
        ]);
        
        if (error) throw error;
        
        if (data.user) {
          setError('Account created! Please check your email for verification. Contact admin to grant access.');
          setIsSignUp(false);
        }
      } else {
        const signInPromise = supabase.auth.signInWithPassword({
          email,
          password,
        });

        const { data, error } = await Promise.race([
          signInPromise,
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Sign in timed out after 20 seconds')), 20000)
          )
        ]);

        if (error) throw error;

        if (data.user) {
          // Check if user is admin with timeout
          const rolePromise = supabase
            .from('profiles')
            .select('role, is_active')
            .eq('id', data.user.id)
            .single();

          const { data: roleData, error: roleError } = await Promise.race([
            rolePromise,
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Profile check timed out after 10 seconds')), 10000)
            )
          ]);

          if (roleError) {
            console.error('Error checking user role:', roleError);
            setError('Failed to verify admin access. Please try again.');
            await supabase.auth.signOut();
            return;
          }
          
          if (roleData && roleData.is_active && roleData.role === 'admin') {
            // Clear timeout before navigation
            clearTimeout(timeoutId);
            router.push('/properties');
          } else {
            setError('Access denied. Admin privileges required.');
            await supabase.auth.signOut();
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      if (error.message && error.message.includes('timed out')) {
        setError(`Login timed out: ${error.message}. Please check your internet connection and try again.`);
      } else if (error.message && error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message && error.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else {
        setError(error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      clearTimeout(timeoutId);
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
          <div className="flex items-center justify-center">
            <Image
              src="/logo/iroto-logo.png"
              alt="Iroto Realty"
              width={120}
              height={40}
              className="h-16 w-auto"
            />
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