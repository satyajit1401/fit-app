# Fitness App API Documentation

This document provides details about all the API endpoints and functions used in the Fitness App. All API calls are simple REST calls to Supabase.

## Authentication APIs

### User Authentication
Authentication is handled through Supabase authentication services.

- `signIn(email, password)`: Signs in a user
- `signUp(email, password, fullName, username)`: Registers a new user
- `signOut()`: Signs out the current user
- `getCurrentUser()`: Gets the current authenticated user
- `ensureAuthenticated()`: Ensures a user is authenticated before making requests

## Workout APIs

### Workouts

- `getWorkouts(options?)`: Fetches all workouts with optional pagination
  - Parameters:
    - `options`: Optional pagination parameters (page, pageSize)
  - Returns: Array of Workout objects

- `getWorkoutById(id)`: Fetches a specific workout by ID
  - Parameters:
    - `id`: Workout ID
  - Returns: Single Workout object or null

### Exercises

- `getExercises()`: Fetches all exercises
  - Returns: Array of Exercise objects

- `getWorkoutExercises(workoutId)`: Fetches all exercises for a specific workout
  - Parameters:
    - `workoutId`: Workout ID
  - Returns: Array of WorkoutExercise objects with nested exercise details

- `addExerciseToWorkout(workoutExercise)`: Adds an exercise to a workout
  - Parameters:
    - `workoutExercise`: Object containing workout_id, exercise_id, position, sets, reps, weight
  - Returns: Boolean indicating success

- `updateWorkoutExercise(id, updates)`: Updates a workout exercise
  - Parameters:
    - `id`: WorkoutExercise ID
    - `updates`: Object with fields to update (sets, reps, weight, position)
  - Returns: Boolean indicating success

## Nutrition APIs

- `getNutritionLogs(date?, includeDeleted?)`: Fetches nutrition logs for a user
  - Parameters:
    - `date`: Optional date to filter by
    - `includeDeleted`: Whether to include soft-deleted items
  - Returns: Array of NutritionLog objects

- `getNutritionTargets(userId, date?)`: Fetches nutrition targets for a user
  - Parameters:
    - `userId`: User ID
    - `date`: Optional date for the targets
  - Returns: NutritionTargets object or null

- `updateNutritionTargets(targets, userId, date?)`: Updates nutrition targets
  - Parameters:
    - `targets`: NutritionTargets object
    - `userId`: User ID
    - `date`: Optional date for the targets
  - Returns: Boolean indicating success

- `saveMealToBackend(meal)`: Saves a meal to the nutrition log
  - Parameters:
    - `meal`: Object with meal details
  - Returns: Boolean indicating success

- `updateMealInBackend(id, updates)`: Updates a meal in the nutrition log
  - Parameters:
    - `id`: Meal ID
    - `updates`: Object with fields to update
  - Returns: Boolean indicating success

- `softDeleteMeal(mealId)`: Soft deletes a meal (marks as deleted)
  - Parameters:
    - `mealId`: Meal ID
  - Returns: Boolean indicating success

- `getAllPastMeals(userId)`: Gets all past meals for a user
  - Parameters:
    - `userId`: User ID
  - Returns: Array of meal objects

## Water Intake APIs

- `getWaterIntake(userId, date)`: Fetches water intake for a user on a specific date
  - Parameters:
    - `userId`: User ID
    - `date`: Date string
  - Returns: Number representing water intake amount

- `updateWaterIntake(userId, date, amount)`: Updates water intake
  - Parameters:
    - `userId`: User ID
    - `date`: Date string
    - `amount`: Water intake amount
  - Returns: Boolean indicating success

## Progress APIs

- `getProgress()`: Fetches progress tracking data for the user
  - Returns: Array of Progress objects

## Data Types

### Workout
```typescript
interface Workout {
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
```

### Exercise
```typescript
interface Exercise {
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
```

### WorkoutExercise
```typescript
interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  position?: number;
  exercise?: Exercise;
}
```

### NutritionLog
```typescript
interface NutritionLog {
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
```

### NutritionTargets
```typescript
interface NutritionTargets {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWater: number;
  weeklyWeightTargets: number[];
}
```

### Progress
```typescript
interface Progress {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  notes?: string;
}
``` 