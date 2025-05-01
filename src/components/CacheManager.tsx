'use client';

import { useEffect } from 'react';
import { clearAllCache } from '@/lib/cache';

/**
 * Client component that handles cache clearing on app startup 
 * to prevent stale data issues.
 */
export default function CacheManager() {
  useEffect(() => {
    // Clear all cache on app startup in development mode
    // or if there's a version mismatch (for production)
    if (typeof window !== 'undefined') {
      const appVersion = '1.0'; // Update this when making cache-breaking changes
      const storedVersion = localStorage.getItem('fitapp_version');
      
      if (process.env.NODE_ENV === 'development' || storedVersion !== appVersion) {
        console.log('[App] Clearing all cache on startup');
        clearAllCache();
        localStorage.setItem('fitapp_version', appVersion);
      }
    }
  }, []);
  
  return null;
} 