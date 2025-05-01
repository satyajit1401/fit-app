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
  EXERCISES: 'fitapp_exercises',
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

/**
 * Pre-warm the cache with initial data
 * Used to ensure critical data is loaded immediately after login
 */
export const prewarmCache = async (userId: string): Promise<void> => {
  try {
    if (typeof window === 'undefined') return;
    
    // Check if cache is already initialized
    const isCacheInitialized = localStorage.getItem('fitapp_cache_initialized');
    if (isCacheInitialized) return;
    
    console.log('Prewarming cache with initial data...');
    
    // Import necessary functions
    const { getWorkouts, getExercises } = await import('./api');
    
    // Fetch and cache workouts
    const workouts = await getWorkouts();
    saveToCache(CACHE_KEYS.WORKOUTS, workouts);
    
    // Fetch and cache exercises (important for workout details)
    const exercises = await getExercises();
    saveToCache(CACHE_KEYS.EXERCISES, exercises);
    
    // For each workout, pre-cache the workout exercises
    if (workouts.length > 0) {
      const { getWorkoutExercises } = await import('./api');
      
      // Only prefetch the first few workouts to avoid too many requests
      const workoutsToPreload = workouts.slice(0, 3);
      for (const workout of workoutsToPreload) {
        await getWorkoutExercises(workout.id);
      }
    }
    
    // Mark cache as initialized
    localStorage.setItem('fitapp_cache_initialized', 'true');
    console.log('Cache prewarming complete');
  } catch (error) {
    console.error('Error prewarming cache:', error);
  }
};

/**
 * Reset cache initialization flag
 * Call this on logout to ensure cache is reinitialized on next login
 */
export const resetCacheInitialization = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('fitapp_cache_initialized');
  } catch (error) {
    console.error('Error resetting cache initialization:', error);
  }
}; 