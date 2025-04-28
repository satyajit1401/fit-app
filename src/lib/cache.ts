/**
 * Cache utilities for storing API data in localStorage
 */

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Cache keys
export const CACHE_KEYS = {
  WORKOUTS: 'fitapp_workouts',
  WORKOUT: 'fitapp_workout_',
  WORKOUT_EXERCISES: 'fitapp_workout_exercises_',
  PROGRESS: 'fitapp_progress',
  NUTRITION_LOGS: 'fitapp_nutrition_logs_',
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Save data to localStorage
 */
export const saveToCache = <T>(key: string, data: T): void => {
  try {
    if (typeof window === 'undefined') return;
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error saving data to cache:', error);
  }
};

/**
 * Get data from localStorage
 * Returns null if cache is expired or not found
 */
export const getFromCache = <T>(key: string): T | null => {
  try {
    if (typeof window === 'undefined') return null;
    
    const cacheData = localStorage.getItem(key);
    if (!cacheData) return null;
    
    const cacheItem: CacheItem<T> = JSON.parse(cacheData);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - cacheItem.timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Error retrieving data from cache:', error);
    return null;
  }
};

/**
 * Clear specific cache by key
 */
export const clearCache = (key: string): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear all app-related cache
 */
export const clearAllCache = (): void => {
  try {
    if (typeof window === 'undefined') return;
    
    Object.values(CACHE_KEYS).forEach(keyPrefix => {
      // Clear exact keys
      localStorage.removeItem(keyPrefix);
      
      // Clear keys with prefixes
      if (keyPrefix.endsWith('_')) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(keyPrefix)) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}; 