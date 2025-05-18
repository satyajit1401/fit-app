import { supabase } from './supabase';

// Workout types
export interface Workout {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
  created_at?: string;
  user_id?: string;
  type?: string;
  estimated_duration?: number;
  is_public?: boolean;
  equipment_needed?: string[];
  tags?: string[];
  thumbnail_url?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category?: string;
  description?: string;
  equipment_required?: string[];
  instructions?: string;
  image_url?: string;
  muscle_group?: string;
  difficulty?: string;
  video_url?: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  position?: number;
  isPending?: boolean;
  exercise?: Exercise;
  sets_data?: string;
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
  meal_type: string;
  food_items?: any;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  meal_date: string;
  meal_time?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export interface NutritionTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWater: number;
  weeklyWeightTargets: number[];
}

export interface WaterIntake {
  id: string;
  user_id: string;
  date: string;
  amount: number;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

// Workout APIs
export const getWorkouts = async (options?: PaginationOptions): Promise<Workout[]> => {
  try {
    let query = supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Add pagination if needed
    if (options?.page !== undefined && options?.pageSize) {
      const from = options.page * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching workouts:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getWorkouts:', error);
    return [];
  }
};

export const getWorkoutById = async (id: string): Promise<Workout | null> => {
  try {
    if (!id) {
      console.error('Missing workout ID');
      return null;
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
    
    return data;
  } catch (error) {
    console.error('Unexpected error in getWorkoutById:', error);
    return null;
  }
};

export const getWorkoutExercises = async (workoutId: string): Promise<WorkoutExercise[]> => {
  try {
    if (!workoutId) {
      console.error('Missing workout ID for exercises');
      return [];
    }
    
    console.log('Fetching workout exercises for ID:', workoutId);
    
    const { data, error } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercises(*)
      `)
      .eq('workout_id', workoutId)
      .order('position');
    
    if (error) {
      console.error('Error fetching workout exercises:', error);
      return [];
    }
    
    console.log(`Received ${data?.length || 0} exercises`);
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getWorkoutExercises:', error);
    return [];
  }
};

// Get all exercises
export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getExercises:', error);
    return [];
  }
};

// Add a new exercise to a workout
export const addExerciseToWorkout = async (workoutExercise: {
  workout_id: string;
  exercise_id: string;
  position: number;
  sets: number;
  reps: number;
  weight?: number;
}): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('workout_exercises')
      .insert([workoutExercise])
      .select();
    
    if (error) {
      console.error('Error adding exercise to workout:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in addExerciseToWorkout:', error);
    return false;
  }
};

// Update workout exercise
export const updateWorkoutExercise = async (
  id: string,
  updates: {
    sets?: number;
    reps?: number;
    weight?: number;
    position?: number;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('workout_exercises')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating workout exercise:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error in updateWorkoutExercise:', error);
    return false;
  }
};

// Progress APIs
export const getProgress = async (): Promise<Progress[]> => {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching progress:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getProgress:', error);
    return [];
  }
};

// Nutrition APIs
export const getNutritionLogs = async (date?: string, includeDeleted: boolean = false): Promise<NutritionLog[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found when fetching nutrition logs');
      return [];
    }
    
    let query = supabase
      .from('nutrition_log')
      .select('*');
    
    if (date) {
      query = query.eq('meal_date', date);
    }
    
    if (!includeDeleted) {
      query = query.eq('is_deleted', false);
    }
    
    const { data, error } = await query.order('meal_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching nutrition logs:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getNutritionLogs:', error);
    return [];
  }
};

// Helper function to ensure user is authenticated before making requests
export const ensureAuthenticated = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data?.user?.id) {
      console.error('User is not authenticated');
      return null;
    }
    return data.user.id;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
};

// Consolidated API call for workout details and exercises
export const getWorkoutWithExercises = async (workoutId: string): Promise<{workout: Workout | null, exercises: WorkoutExercise[]}> => {
  try {
    if (!workoutId) {
      console.error('Missing workout ID');
      return { workout: null, exercises: [] };
    }
    
    // First, get the workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', workoutId)
      .single();
    
    if (workoutError) {
      console.error('Error fetching workout:', workoutError);
      return { workout: null, exercises: [] };
    }
    
    // Then get exercises in the same function
    const { data: exercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .select(`
        *,
        exercise:exercises(*)
      `)
      .eq('workout_id', workoutId)
      .order('position');
    
    if (exercisesError) {
      console.error('Error fetching workout exercises:', exercisesError);
      return { workout, exercises: [] };
    }
    
    return { 
      workout, 
      exercises: exercises || [] 
    };
  } catch (error) {
    console.error('Error in getWorkoutWithExercises:', error);
    return { workout: null, exercises: [] };
  }
};

// Optimized version of getNutritionTargets
export async function getNutritionTargets(userId: string, date?: string): Promise<NutritionTargets | null> {
  try {
    const queryDate = date || new Date().toISOString().split('T')[0];
    
    // Single query with proper ordering and filtering
    const { data, error } = await supabase
      .from('nutrition_targets')
      .select('*')
      .eq('user_id', userId)
      .lte('start_date', queryDate)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }

    if (!data) return null;
    
    return {
      targetCalories: data.target_calories,
      targetProtein: data.target_protein,
      targetCarbs: data.target_carbs,
      targetFat: data.target_fat,
      targetWater: data.target_water,
      weeklyWeightTargets: data.weekly_weight_targets || [],
    };
  } catch (error) {
    console.error('Error fetching nutrition targets:', error);
    return null;
  }
}

export async function updateNutritionTargets(targets: NutritionTargets, userId: string, date?: string): Promise<boolean> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('nutrition_targets')
      .upsert({
        user_id: userId,
        start_date: targetDate,
        target_calories: Math.round(targets.targetCalories),
        target_protein: Math.round(targets.targetProtein),
        target_carbs: Math.round(targets.targetCarbs),
        target_fat: Math.round(targets.targetFat),
        target_water: targets.targetWater,
        weekly_weight_targets: targets.weeklyWeightTargets,
      }, {
        onConflict: 'user_id,start_date'
      });

    if (error) {
      console.error('Error upserting targets:', error);
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
    
    // Validate meal_type
    const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout'];
    const mealType = validMealTypes.includes(meal.meal_type) ? meal.meal_type : 'Snack';
    
    const { error } = await supabase.from('nutrition_log').insert([
      {
        user_id: meal.user_id,
        meal_type: mealType,
        calories: meal.calories,
        protein_g: meal.protein,
        carbs_g: meal.carbs,
        fat_g: meal.fat,
        meal_date: today,
        meal_time: now,
        notes: meal.description,
      },
    ]);
    
    if (error) {
      console.error('Error saving meal:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveMealToBackend:', error);
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

export async function getWaterIntake(userId: string, date: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('water_intake')
      .select('amount')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return 0;
      }
      throw error;
    }

    return data?.amount || 0;
  } catch (error) {
    console.error('Error fetching water intake:', error);
    return 0;
  }
}

export async function updateWaterIntake(userId: string, date: string, amount: number): Promise<boolean> {
  try {
    const { data: existingData, error: fetchError } = await supabase
      .from('water_intake')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing water intake:', fetchError);
      throw fetchError;
    }

    const { error } = await supabase
      .from('water_intake')
      .upsert({
        ...(existingData?.id ? { id: existingData.id } : {}),
        user_id: userId,
        date: date,
        amount: amount,
      });

    if (error) {
      console.error('Error updating water intake:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateWaterIntake:', error);
    return false;
  }
}

// Soft delete a meal (set is_deleted=true)
export async function softDeleteMeal(mealId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('nutrition_log')
      .update({ is_deleted: true })
      .eq('id', mealId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error soft deleting meal:', error);
    return false;
  }
}

// Add batched version of adding exercises
export const addExercisesToWorkoutBatch = async (workoutId: string, exerciseIds: string[]): Promise<boolean> => {
  try {
    if (!workoutId || !exerciseIds.length) {
      return false;
    }
    
    // Get the highest position value for proper ordering
    const { data: positionData, error: positionError } = await supabase
      .from('workout_exercises')
      .select('position')
      .eq('workout_id', workoutId)
      .order('position', { ascending: false })
      .limit(1);
    
    if (positionError) {
      console.error('Error getting highest position:', positionError);
      return false;
    }
    
    const highestPosition = positionData.length > 0 ? positionData[0].position : 0;
    
    // Prepare exercises to insert
    const exercisesToInsert = exerciseIds.map((exerciseId, index) => ({
      workout_id: workoutId,
      exercise_id: exerciseId,
      position: highestPosition + index + 1,
      sets: 3,
      reps: 10
    }));
    
    // Batch insert all exercises
    const { error: insertError } = await supabase
      .from('workout_exercises')
      .insert(exercisesToInsert);
    
    if (insertError) {
      console.error('Error batch inserting exercises:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in addExercisesToWorkoutBatch:', error);
    return false;
  }
};

// Get all exercises with filtering options
export const getExercisesFiltered = async (filters?: { 
  category?: string; 
  searchTerm?: string;
  limit?: number;
}): Promise<Exercise[]> => {
  try {
    let query = supabase
      .from('exercises')
      .select('*');
    
    // Apply filters if provided
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.searchTerm) {
      query = query.ilike('name', `%${filters.searchTerm}%`);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getExercisesFiltered:', error);
    return [];
  }
};

// Add batched version of updating exercises
export const updateWorkoutExercisesBatch = async (updates: Array<{
  id: string;
  sets: number;
  reps: number;
  weight: number;
  sets_data?: string;
}>): Promise<boolean> => {
  try {
    if (!updates.length) {
      console.log('No updates to process');
      return true; // Nothing to update
    }
    
    console.log('Processing batch updates for exercises:', updates);
    
    // Process updates in batches to avoid hitting request size limits
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1}:`, batch);
      
      // Create a transaction for each batch
      for (const update of batch) {
        console.log(`Updating exercise ID ${update.id} with sets=${update.sets}, reps=${update.reps}, weight=${update.weight}`);
        
        const { data, error } = await supabase
          .from('workout_exercises')
          .update({
            sets: update.sets,
            reps: update.reps,
            weight: update.weight,
            sets_data: update.sets_data
          })
          .eq('id', update.id)
          .select();
        
        if (error) {
          console.error(`Error updating exercise ID ${update.id}:`, error);
          return false;
        }
        
        console.log(`Successfully updated exercise ID ${update.id}:`, data);
      }
    }
    
    console.log('All exercise updates completed successfully');
    return true;
  } catch (error) {
    console.error('Error in updateWorkoutExercisesBatch:', error);
    return false;
  }
};
