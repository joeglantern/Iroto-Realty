'use client';

import { createContext, useContext } from 'react';
import { authClient } from '@/lib/auth-client';

type AuthSession = typeof authClient.$Infer.Session;

interface SimpleAuthContextType {
  user: AuthSession['user'] | null;
  session: AuthSession['session'] | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession();

  const user = data?.user ?? null;
  const isAuthenticated = !!user;
  // Only admins can sign in (checked at login), and every server action re-checks the role.
  const isAdmin = isAuthenticated;

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
    }
  };

  const value: SimpleAuthContextType = {
    user,
    session: data?.session ?? null,
    loading: isPending,
    isAuthenticated,
    isAdmin,
    signOut,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
