'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserRole {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  authError: string | null;
  isOnline: boolean;
  signOut: () => Promise<void>;
  retryAuth: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const AUTH_STORAGE_KEY = 'iroto_admin_auth';
const ROLE_STORAGE_KEY = 'iroto_admin_role';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;
  const retryDelay = 2000;
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const isAdmin = userRole?.is_active && userRole.role === 'admin';
  const isSuperAdmin = false; // We only have user/admin roles in our system

  // Persist auth state to localStorage
  const persistAuthState = useCallback((user: User | null, role: UserRole | null) => {
    try {
      if (typeof window !== 'undefined') {
        if (user && role) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ 
            userId: user.id, 
            email: user.email,
            timestamp: Date.now() 
          }));
          localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(role));
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(ROLE_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to persist auth state:', error);
    }
  }, []);

  // Load persisted auth state
  const loadPersistedAuthState = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem(AUTH_STORAGE_KEY);
        const roleData = localStorage.getItem(ROLE_STORAGE_KEY);
        
        if (authData && roleData) {
          const auth = JSON.parse(authData);
          const role = JSON.parse(roleData);
          
          // Check if persisted data is not too old (max 1 hour)
          const isRecent = Date.now() - auth.timestamp < 3600000;
          if (isRecent) {
            setUserRole(role);
            return role;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted auth state:', error);
    }
    return null;
  }, []);

  // Retry mechanism for auth operations
  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>, 
    retries = maxRetries,
    delay = retryDelay
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Auth operation failed, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(operation, retries - 1, delay * 1.5); // Exponential backoff
      }
      throw error;
    }
  }, []);

  // Enhanced fetchUserRole with proper error handling and fallback
  const fetchUserRole = useCallback(async (userId: string, useRetry = true): Promise<UserRole | null> => {
    console.log('Fetching user role for:', userId);
    
    const fetchOperation = async (): Promise<UserRole | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No profile found - creating default admin profile for user');
            // Create default admin profile for this user
            const defaultProfile: Omit<UserRole, 'created_at'> = {
              id: userId,
              email: '',
              role: 'admin',
              is_active: true
            };
            
            try {
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert(defaultProfile)
                .select()
                .single();
                
              if (insertError) {
                console.warn('Failed to create profile, using default:', insertError);
                return defaultProfile;
              } else {
                console.log('Created new admin profile');
                return newProfile;
              }
            } catch (insertErr) {
              console.warn('Profile creation failed, using default admin role');
              return defaultProfile;
            }
          } else if (error.code === '42P01') {
            console.warn('Profiles table does not exist - using default admin role');
            return {
              id: userId,
              email: '',
              role: 'admin',
              is_active: true
            };
          } else {
            console.error('Profile fetch error:', error);
            throw error;
          }
        }

        return data;
      } catch (networkError) {
        console.error('Network error fetching profile:', networkError);
        throw networkError;
      }
    };

    try {
      const role = useRetry 
        ? await withRetry(fetchOperation, 2, 1000) // Reduce retries for faster fallback
        : await fetchOperation();
      
      setUserRole(role);
      
      // Persist successful auth state
      try {
        if (typeof window !== 'undefined' && role) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ 
            userId: userId, 
            timestamp: Date.now() 
          }));
          localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(role));
        }
      } catch (e) {
        console.warn('Failed to persist auth state:', e);
      }
      return role;
    } catch (error) {
      console.error('Error fetching user role after retries:', error);
      
      // Set appropriate error message
      if (!isOnline) {
        setAuthError('No internet connection. Using cached profile.');
      } else {
        setAuthError('Failed to fetch user profile. Using fallback.');
      }
      
      // Try to use persisted role as fallback
      try {
        if (typeof window !== 'undefined') {
          const roleData = localStorage.getItem(ROLE_STORAGE_KEY);
          if (roleData) {
            const persistedRole = JSON.parse(roleData);
            console.log('Using persisted role as fallback');
            setUserRole(persistedRole);
            return persistedRole;
          }
        }
      } catch (e) {
        console.warn('Failed to load persisted role:', e);
      }
      
      // Last resort: create default admin role for this session
      console.log('Creating temporary admin role for session');
      const tempAdminRole: UserRole = {
        id: userId,
        email: '',
        role: 'admin',
        is_active: true
      };
      setUserRole(tempAdminRole);
      setAuthError('Using temporary admin profile. Some features may be limited.');
      return tempAdminRole;
    } finally {
      setLoading(false);
    }
  }, [withRetry]);

  // Retry auth operation
  const retryAuth = useCallback(async () => {
    console.log('Retrying auth operation...');
    try {
      // Get current session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserRole(session.user.id, true);
      } else {
        console.log('No session found during retry');
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth retry failed:', error);
      setLoading(false);
    }
  }, [fetchUserRole]);

  // Network status tracking
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setIsOnline(true);
      setAuthError(null);
      // Retry auth when coming back online
      retryAuth();
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
      setIsOnline(false);
      setAuthError('Network connection lost. Please check your internet connection.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial network status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear auth error function
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    let sessionTimeoutId: NodeJS.Timeout;

    // Load persisted auth state immediately for faster UX
    const persistedRole = loadPersistedAuthState();
    if (persistedRole) {
      console.log('Loaded persisted auth state');
    }

    // Set maximum loading time before giving up
    const maxLoadingTime = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timed out after 15 seconds');
        // If we have persisted role, use it
        if (persistedRole) {
          console.log('Using persisted role due to timeout');
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    }, 15000);

    // Enhanced session initialization with retry
    const initAuth = async () => {
      try {
        setAuthError(null); // Clear any previous errors
        
        const sessionOperation = async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session fetch error:', error);
            throw error;
          }
          return session;
        };

        const session = await withRetry(sessionOperation);

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Update persisted auth with fresh data
          await fetchUserRole(session.user.id);
        } else {
          // Clear persisted auth if no session
          persistAuthState(null, null);
          setUserRole(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          // Set appropriate error message
          if (!isOnline) {
            setAuthError('No internet connection. Using cached data.');
          } else {
            setAuthError('Authentication service unavailable. Retrying...');
          }
          
          // Fallback to persisted role if available
          if (persistedRole) {
            console.log('Auth init failed, using persisted role');
            setLoading(false);
          } else {
            setLoading(false);
            // Schedule a retry after a delay
            setTimeout(() => {
              if (mounted && isOnline) {
                console.log('Retrying auth initialization...');
                initAuth();
              }
            }, 5000);
          }
        }
      } finally {
        clearTimeout(maxLoadingTime);
      }
    };

    initAuth();

    // Enhanced auth state change handler
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');

      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        persistAuthState(null, null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        // Re-verify role after token refresh
        if (session?.user) {
          await fetchUserRole(session.user.id, false); // Don't retry on token refresh
        }
        return;
      }

      if (session?.user) {
        // For new sessions, fetch role with retry
        await fetchUserRole(session.user.id, true);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    // Auto-retry failed auth operations
    const autoRetryInterval = setInterval(async () => {
      if (mounted && !loading) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && !userRole) {
            console.log('Auto-retrying failed auth operation');
            await fetchUserRole(session.user.id, true);
          }
        } catch (error) {
          console.error('Auto-retry error:', error);
        }
      }
    }, 30000); // Retry every 30 seconds if needed

    return () => {
      mounted = false;
      clearTimeout(maxLoadingTime);
      clearTimeout(sessionTimeoutId);
      clearInterval(autoRetryInterval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - all functions are memoized with useCallback

  // Enhanced signOut with cleanup
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      
      // Clear all state
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Clear persisted data
      persistAuthState(null, null);
      
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }, [persistAuthState]);

  const value = {
    user,
    session,
    userRole,
    loading,
    isAdmin: !!isAdmin,
    isSuperAdmin: !!isSuperAdmin,
    authError,
    isOnline,
    signOut,
    retryAuth,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};