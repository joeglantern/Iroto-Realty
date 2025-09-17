'use client';

import { useState, useEffect } from 'react';

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has visited before in this session
    const hasVisited = sessionStorage.getItem('iroto-visited');
    
    if (hasVisited) {
      setIsFirstVisit(false);
      setIsLoading(false);
    } else {
      // Mark as visited for this session
      sessionStorage.setItem('iroto-visited', 'true');
      setIsFirstVisit(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return {
    shouldShowLoading: isFirstVisit && isLoading,
    handleLoadingComplete
  };
}