/**
 * Minimal cache utilities for storing API data in memory
 */

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Cache keys
export const CACHE_KEYS = {
  WORKOUTS: 'workouts',
  WORKOUT: 'workout_',
  EXERCISES: 'exercises',
};

// In-memory cache
const memoryCache: Record<string, { data: any; timestamp: number }> = {};

/**
 * Save data to memory cache
 */
export const saveToCache = <T>(key: string, data: T): void => {
  try {
    memoryCache[key] = {
      data,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error saving data to cache:', error);
  }
};

/**
 * Get data from memory cache
 * Returns null if cache is expired or not found
 */
export const getFromCache = <T>(key: string): T | null => {
  try {
    const cacheItem = memoryCache[key];
    if (!cacheItem) return null;
    
    const now = Date.now();
    
    // Check if cache is expired
    if (now - cacheItem.timestamp > CACHE_EXPIRATION) {
      delete memoryCache[key];
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
    delete memoryCache[key];
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = (): void => {
  try {
    for (const key in memoryCache) {
      delete memoryCache[key];
    }
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
}; 