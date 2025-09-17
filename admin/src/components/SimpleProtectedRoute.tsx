'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function SimpleProtectedRoute({ children, requireAdmin = true }: SimpleProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAdmin } = useSimpleAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (requireAdmin && !isAdmin) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, isAdmin, requireAdmin, router]);

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we verify your authentication.</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  // Show protected content
  return <>{children}</>;
}