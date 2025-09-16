'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        router.push('/properties');
      } else {
        router.push('/login');
      }
    }
  }, [loading, isAdmin, router]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-bold">IR</span>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
