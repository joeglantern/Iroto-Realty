'use client';

import { useState, useEffect } from 'react';
import { LAUNCH_CELEBRATION_ENABLED } from '@/lib/launch';

const VISITED_KEY = 'iroto-visited';

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // While the launch celebration is on it plays on every visit and reload.
    if (LAUNCH_CELEBRATION_ENABLED) return;

    // ?intro in the URL replays the intro (handy for demos)
    const forceIntro = new URLSearchParams(window.location.search).has('intro');
    const hasVisited = !forceIntro && sessionStorage.getItem(VISITED_KEY);

    if (hasVisited) {
      setIsFirstVisit(false);
      setIsLoading(false);
    }
  }, []);

  // Marked only once the intro has finished, so this check gives the same answer
  // however many times the effect above runs.
  const handleLoadingComplete = () => {
    sessionStorage.setItem(VISITED_KEY, 'true');
    setIsLoading(false);
  };

  return {
    shouldShowLoading: isFirstVisit && isLoading,
    handleLoadingComplete
  };
}
