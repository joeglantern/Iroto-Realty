'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const { user, userRole, loading, isAdmin, isSuperAdmin, authError, isOnline, retryAuth, clearAuthError } = useAuth();
  const router = useRouter();
  const [showRetry, setShowRetry] = useState(false);
  const [retrying, setRetrying] = useState(false);

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

  // Show retry option after some time
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowRetry(true);
      }, 8000);
      return () => clearTimeout(timer);
    } else {
      setShowRetry(false);
    }
  }, [loading]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retryAuth();
      // If still loading after retry, show it worked
      setTimeout(() => {
        if (loading) {
          setRetrying(false);
        }
      }, 3000);
    } catch (error) {
      console.error('Retry failed:', error);
      setRetrying(false);
    }
  };

  // Show loading while checking auth with enhanced UX
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {retrying ? 'Reconnecting...' : 'Loading your dashboard'}
          </h2>
          <p className="text-gray-600 mb-6">
            {retrying 
              ? 'Attempting to restore your session...' 
              : 'Verifying your authentication...'
            }
          </p>
          
          {/* Show auth error if present */}
          {authError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {!isOnline ? (
                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{authError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={clearAuthError}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {showRetry && !retrying && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Taking longer than expected?</p>
              <button
                onClick={handleRetry}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors"
              >
                Retry Connection
              </button>
              <p className="text-xs text-gray-400">
                Or <button 
                  onClick={() => window.location.reload()} 
                  className="underline hover:no-underline"
                >
                  refresh the page
                </button>
              </p>
            </div>
          )}
          
          {retrying && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Retrying...</span>
            </div>
          )}
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