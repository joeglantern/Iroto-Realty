'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const { user, userRole, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Access Denied
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You don't have permission to access the admin panel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {user && userRole && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Your Account Details:</h3>
              <div className="text-xs text-yellow-700 space-y-1">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {userRole.role}</p>
                <p><strong>Status:</strong> {userRole.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">To access the admin panel, you need:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>An active account with 'admin' or 'super_admin' role</li>
                <li>Contact a super admin to upgrade your account</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={signOut}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
              <Link
                href="/login"
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}