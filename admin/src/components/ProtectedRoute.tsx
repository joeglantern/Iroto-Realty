'use client';

import { useAuth } from '@/contexts/AuthContext';
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
  const { user, userRole, loading, isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not logged in
      if (!user) {
        router.push('/login');
        return;
      }

      // Require super admin but user is not super admin
      if (requireSuperAdmin && !isSuperAdmin) {
        router.push('/unauthorized');
        return;
      }

      // Require admin but user is not admin
      if (requireAdmin && !isAdmin) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, userRole, loading, isAdmin, isSuperAdmin, requireAdmin, requireSuperAdmin, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || (requireAdmin && !isAdmin) || (requireSuperAdmin && !isSuperAdmin)) {
    return null;
  }

  return <>{children}</>;
}