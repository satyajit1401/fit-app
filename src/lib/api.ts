import { supabase } from './supabase';
import { getFromCache, saveToCache, CACHE_KEYS } from './cache';

// Workout types
export interface Workout {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  created_at?: string;
  user_id?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  description?: string;
  equipment?: string;
  instructions?: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  exercise?: Exercise;
}

export interface Progress {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  notes?: string;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  food_item: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

// Workout APIs
export const getWorkouts = async (): Promise<Workout[]> => {
  // Try to get from cache first
  const cachedData = getFromCache<Workout[]>(CACHE_KEYS.WORKOUTS);
  if (cachedData) {
    return cachedData;
  }
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
  
  // Save to cache
  if (data) {
    saveToCache(CACHE_KEYS.WORKOUTS, data);
  }
  
  return data || [];
};

export const getWorkoutById = async (id: string): Promise<Workout | null> => {
  // Try to get from cache first
  const cacheKey = `${CACHE_KEYS.WORKOUT}${id}`;
  const cachedData = getFromCache<Workout>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching workout:', error);
    return null;
  }
  
  // Save to cache
  if (data) {
    saveToCache(cacheKey, data);
  }
  
  return data;
};

export const getWorkoutExercises = async (workoutId: string): Promise<WorkoutExercise[]> => {
  // Try to get from cache first
  const cacheKey = `${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`;
  const cachedData = getFromCache<WorkoutExercise[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  const { data, error } = await supabase
    .from('workout_exercises')
    .select(`
      *,
      exercise:exercise_id (*)
    `)
    .eq('workout_id', workoutId);
  
  if (error) {
    console.error('Error fetching workout exercises:', error);
    return [];
  }
  
  // Save to cache
  if (data) {
    saveToCache(cacheKey, data);
  }
  
  return data || [];
};

// Progress APIs
export const getProgress = async (): Promise<Progress[]> => {
  // Try to get from cache first
  const cachedData = getFromCache<Progress[]>(CACHE_KEYS.PROGRESS);
  if (cachedData) {
    return cachedData;
  }
  
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching progress:', error);
    return [];
  }
  
  // Save to cache
  if (data) {
    saveToCache(CACHE_KEYS.PROGRESS, data);
  }
  
  return data || [];
};

// Nutrition APIs
export const getNutritionLogs = async (date?: string): Promise<NutritionLog[]> => {
  // Try to get from cache first
  const cacheKey = date ? `${CACHE_KEYS.NUTRITION_LOGS}${date}` : CACHE_KEYS.NUTRITION_LOGS;
  const cachedData = getFromCache<NutritionLog[]>(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  let query = supabase
    .from('nutrition_log')
    .select('*')
    .order('date', { ascending: false });
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching nutrition logs:', error);
    return [];
  }
  
  // Save to cache
  if (data) {
    saveToCache(cacheKey, data);
  }
  
  return data || [];
}; 