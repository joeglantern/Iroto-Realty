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
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;
  const retryDelay = 2000;
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Centralized loading state management
  const setLoadingWithTimeout = useCallback((isLoading: boolean, timeoutMs = 15000) => {
    setLoading(isLoading);
    
    if (isLoading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set maximum loading time
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('Loading timeout reached, forcing loading to false');
        setLoading(false);
        setAuthError('Authentication took too long. Please try refreshing the page.');
      }, timeoutMs);
    } else {
      // Clear timeout when loading is done
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = undefined;
      }
    }
  }, []);

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
      setLoadingWithTimeout(false);
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
        setLoadingWithTimeout(false);
      }
    } catch (error) {
      console.error('Auth retry failed:', error);
      setLoadingWithTimeout(false);
    }
  }, [fetchUserRole, setLoadingWithTimeout]);

  // Network status tracking
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setIsOnline(true);
      setAuthError(null);
      // Only retry if we have a session but no userRole
      setTimeout(() => {
        // Use timeout to avoid immediate retry loops
        if (user && !userRole && !loading) {
          console.log('Network restored, retrying auth...');
          retryAuth();
        }
      }, 1000);
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
  }, [user, userRole, loading, retryAuth]); // Added proper dependencies

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

    // Loading timeout is now handled by setLoadingWithTimeout
    // Start loading with timeout
    setLoadingWithTimeout(true, 15000);

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
          setLoadingWithTimeout(false);
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
            setLoadingWithTimeout(false);
          } else {
            setLoadingWithTimeout(false);
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
        // Loading timeout is handled by setLoadingWithTimeout
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
        setLoadingWithTimeout(false);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
        // Don't fetch role on token refresh if we already have it
        // This prevents unnecessary loading states
        if (session?.user && !userRole) {
          console.log('Token refreshed but no userRole, fetching...');
          await fetchUserRole(session.user.id, false); // Don't retry on token refresh
        }
        return;
      }

      if (session?.user) {
        // For new sessions, fetch role with retry
        await fetchUserRole(session.user.id, true);
      } else {
        setUserRole(null);
        setLoadingWithTimeout(false);
      }
    });

    // Disabled auto-retry to prevent infinite loops
    // Only retry on explicit user action or network reconnection
    // const autoRetryInterval = setInterval(async () => {
    //   // This was causing infinite loading loops
    // }, 30000);

    return () => {
      mounted = false;
      clearTimeout(sessionTimeoutId);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [setLoadingWithTimeout]); // Added setLoadingWithTimeout dependency

  // Enhanced signOut with cleanup
  const signOut = useCallback(async () => {
    try {
      setLoadingWithTimeout(true, 5000); // Shorter timeout for signout
      await supabase.auth.signOut();
      
      // Clear all state
      setUser(null);
      setSession(null);
      setUserRole(null);
      setAuthError(null);
      
      // Clear persisted data
      persistAuthState(null, null);
      
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoadingWithTimeout(false);
    }
  }, [persistAuthState, setLoadingWithTimeout]);

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