'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthStatus() {
  const { authError, isOnline, clearAuthError, retryAuth } = useAuth();

  if (!authError) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 max-w-sm z-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
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
          <div className="ml-3 flex-1">
            <p className="text-sm text-yellow-700 font-medium">
              {!isOnline ? 'Connection Issue' : 'Auth Warning'}
            </p>
            <p className="text-xs text-yellow-600 mt-1">{authError}</p>
            {isOnline && (
              <button
                onClick={retryAuth}
                className="text-xs text-yellow-800 hover:text-yellow-900 underline mt-2"
              >
                Retry now
              </button>
            )}
          </div>
          <div className="ml-2">
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
    </div>
  );
}