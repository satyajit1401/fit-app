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

export interface NutritionTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWater: number;
  weeklyWeightTargets: number[];
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

export const getWorkoutExercises = async (workoutId: string, forceFetch: boolean = false): Promise<WorkoutExercise[]> => {
  try {
    console.log(`[API] getWorkoutExercises for workoutId ${workoutId}, forceFetch: ${forceFetch}`);
    
    // Direct API request first - don't rely on cache for initial load
    const cacheKey = `${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`;
    
    // Make direct API request
    console.log(`[API] Making direct API request for workout exercises: ${workoutId}`);
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercise_id (*)
      `)
      .eq('workout_id', workoutId);
    
    // If we get data from the API, use it and update cache
    if (data && data.length > 0) {
      console.log(`[API] Received ${data.length} exercises from API, updating cache`);
      saveToCache(cacheKey, data);
      return data;
    }
    
    // If API request failed or returned empty, check cache as fallback
    if (error || !data || data.length === 0) {
      console.log(`[API] API request failed or empty result: ${error?.message || 'No data'}`);
      console.log(`[API] Checking cache for workout exercises`);
      
      const cachedData = getFromCache<WorkoutExercise[]>(cacheKey);
      if (cachedData && cachedData.length > 0) {
        console.log(`[API] Returning ${cachedData.length} exercises from cache as fallback`);
        return cachedData;
      }
      
      // If we're here, both API and cache failed
      console.log(`[API] Both API and cache failed to return workout exercises`);
      return [];
    }
    
    // Default return (should not reach here normally)
    return data || [];
  } catch (error) {
    console.error(`[API] Error in getWorkoutExercises:`, error);
    
    // Last resort - try cache in case of exception
    try {
      const cacheKey = `${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`;
      const cachedData = getFromCache<WorkoutExercise[]>(cacheKey);
      if (cachedData && cachedData.length > 0) {
        console.log(`[API] Returning ${cachedData.length} exercises from cache after error`);
        return cachedData;
      }
    } catch (e) {
      console.error(`[API] Cache fallback also failed:`, e);
    }
    
    return [];
  }
};

// Helper function to refresh workout exercises in the background
const refreshWorkoutExercises = async (workoutId: string): Promise<void> => {
  try {
    // Fetch fresh data from API
    const { data } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercise_id (*)
      `)
      .eq('workout_id', workoutId);
    
    // Save to cache if we have data
    if (data) {
      saveToCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`, data);
    }
  } catch (error) {
    console.error('Error refreshing workout exercises:', error);
  }
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
    .order('meal_date', { ascending: false });
  
  if (date) {
    query = query.eq('meal_date', date);
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

export async function getNutritionTargets(userId: string): Promise<NutritionTargets | null> {
  try {
    const { data, error } = await supabase
      .from('nutrition_targets')
      .select('*')
      .eq('user_id', userId)
      .single();
    console.log('getNutritionTargets: fetched data', data, error);
    if (error) throw error;
    return data ? {
      targetCalories: data.target_calories,
      targetProtein: data.target_protein,
      targetCarbs: data.target_carbs,
      targetFat: data.target_fat,
      targetWater: data.target_water,
      weeklyWeightTargets: data.weekly_weight_targets || [],
    } : null;
  } catch (error) {
    console.error('Error fetching nutrition targets:', error);
    return null;
  }
}

export async function updateNutritionTargets(targets: NutritionTargets, userId: string): Promise<boolean> {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('nutrition_targets')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing targets:', fetchError);
      throw fetchError;
    }

    const { data, error } = await supabase
      .from('nutrition_targets')
      .upsert({
        ...(existingData?.id ? { id: existingData.id } : {}),
        user_id: userId,
        target_calories: Math.round(targets.targetCalories),
        target_protein: Math.round(targets.targetProtein),
        target_carbs: Math.round(targets.targetCarbs),
        target_fat: Math.round(targets.targetFat),
        target_water: targets.targetWater,
        weekly_weight_targets: targets.weeklyWeightTargets,
      });
    console.log('updateNutritionTargets: upsert result', data, error);
    if (error) {
      console.error('Error updating targets:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error in updateNutritionTargets:', error);
    return false;
  }
}

export async function saveMealToBackend(meal: {
  meal_type: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  user_id: string;
  date?: string;
  time?: string;
}): Promise<boolean> {
  try {
    const today = meal.date || new Date().toISOString().split('T')[0];
    const now = meal.time || new Date().toTimeString().slice(0, 8); // 'HH:MM:SS'
    const { error } = await supabase.from('nutrition_log').insert([
      {
        user_id: meal.user_id,
        meal_type: meal.meal_type,
        calories: meal.calories,
        protein_g: meal.protein,
        carbs_g: meal.carbs,
        fat_g: meal.fat,
        meal_date: today,
        meal_time: now,
        notes: meal.description,
      },
    ]);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving meal:', error);
    return false;
  }
}

export async function getAllPastMeals(userId: string): Promise<{ meal_type: string; notes: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; meal_date: string; meal_time: string; }[]> {
  try {
    const { data, error } = await supabase
      .from('nutrition_log')
      .select('meal_type, notes, calories, protein_g, carbs_g, fat_g, meal_date, meal_time')
      .eq('user_id', userId)
      .order('meal_date', { ascending: false })
      .order('meal_time', { ascending: false });
    if (error) throw error;
    // Remove duplicates by meal_type + notes
    const uniqueMeals: Record<string, any> = {};
    for (const meal of data || []) {
      const key = meal.meal_type + '|' + meal.notes;
      if (!uniqueMeals[key]) uniqueMeals[key] = meal;
    }
    return Object.values(uniqueMeals);
  } catch (error) {
    console.error('Error fetching past meals:', error);
    return [];
  }
}

export async function updateMealInBackend(id: string, updates: {
  meal_type?: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  meal_date?: string;
  meal_time?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nutrition_log')
      .update({
        ...(updates.meal_type !== undefined && { meal_type: updates.meal_type }),
        ...(updates.description !== undefined && { notes: updates.description }),
        ...(updates.calories !== undefined && { calories: updates.calories }),
        ...(updates.protein !== undefined && { protein_g: updates.protein }),
        ...(updates.carbs !== undefined && { carbs_g: updates.carbs }),
        ...(updates.fat !== undefined && { fat_g: updates.fat }),
        ...(updates.meal_date !== undefined && { meal_date: updates.meal_date }),
        ...(updates.meal_time !== undefined && { meal_time: updates.meal_time }),
      })
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating meal:', error);
    return false;
  }
}

export const getExercises = async (): Promise<Exercise[]> => {
  const cachedData = getFromCache<Exercise[]>(CACHE_KEYS.EXERCISES);
  if (cachedData) {
    return cachedData;
  }
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
  if (data) {
    saveToCache(CACHE_KEYS.EXERCISES, data);
  }
  return data || [];
};
