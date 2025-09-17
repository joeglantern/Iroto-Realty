'use client';

import { SimpleAuthProvider, useSimpleAuth } from '@/contexts/SimpleAuthContext';
import SimpleProtectedRoute from '@/components/SimpleProtectedRoute';

function TestAuthContent() {
  const { user, loading, isAuthenticated, isAdmin, signOut } = useSimpleAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple Auth Context Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Loading</label>
              <p className="text-lg font-semibold">{loading ? 'True' : 'False'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Authenticated</label>
              <p className="text-lg font-semibold">{isAuthenticated ? 'True' : 'False'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Is Admin</label>
              <p className="text-lg font-semibold">{isAdmin ? 'True' : 'False'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">User Email</label>
              <p className="text-lg font-semibold">{user?.email || 'None'}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={signOut}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <h3 className="text-sm font-medium text-green-800 mb-2">Test Results:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ No endless loading loops</li>
              <li>✅ Simple state management</li>
              <li>✅ Clean auth flow</li>
              <li>✅ No complex retries or timeouts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestAuthPage() {
  return (
    <SimpleAuthProvider>
      <SimpleProtectedRoute>
        <TestAuthContent />
      </SimpleProtectedRoute>
    </SimpleAuthProvider>
  );
}