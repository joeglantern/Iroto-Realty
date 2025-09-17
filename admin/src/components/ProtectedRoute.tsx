'use client';

import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireSuperAdmin = false 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useSimpleAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not logged in
      if (!user) {
        router.push('/login');
        return;
      }

      // Require super admin but user is not super admin (treating super admin same as admin for now)
      if (requireSuperAdmin && !isAdmin) {
        router.push('/unauthorized');
        return;
      }

      // Require admin but user is not admin
      if (requireAdmin && !isAdmin) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, isAdmin, requireAdmin, requireSuperAdmin, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || (requireAdmin && !isAdmin) || (requireSuperAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}