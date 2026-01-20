/**
 * Hook to get the user's primary household.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyHouseholds, type Household } from '../services/user';
import { useAuth } from './useAuth';

interface UseHouseholdReturn {
  household: Household | null;
  households: Household[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useHousehold(): UseHouseholdReturn {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Track the user ID to detect when user changes
  const lastUserIdRef = useRef<string | null>(null);

  const fetchHouseholds = useCallback(async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setHouseholds([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyHouseholds();
      setHouseholds(data);
    } catch (err: unknown) {
      console.error('Failed to fetch households:', err);
      
      // If we get a 401 Unauthorized, the token is invalid - log out
      if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
        console.log('Token expired or invalid, logging out...');
        await logout();
        return;
      }
      
      setError(err instanceof Error ? err : new Error('Failed to fetch households'));
      setHouseholds([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, logout]);

  // Reset and refetch when auth state or user changes
  useEffect(() => {
    const currentUserId = user?.id || null;
    
    // If user changed, reset state before fetching
    if (lastUserIdRef.current !== currentUserId) {
      lastUserIdRef.current = currentUserId;
      setHouseholds([]);
      setError(null);
      setIsLoading(true);
    }
    
    fetchHouseholds();
  }, [fetchHouseholds, user?.id]);

  // Return the first household as the primary (user's main household)
  const household = households.length > 0 ? households[0] : null;

  return {
    household,
    households,
    isLoading: authLoading || isLoading,
    isAuthenticated,
    error,
    refetch: fetchHouseholds,
  };
}
