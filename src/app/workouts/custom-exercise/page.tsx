'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { clearCache, CACHE_KEYS } from '@/lib/cache';

export default function CustomExercisePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = searchParams.get('workoutId');
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Strength');
  const [equipment, setEquipment] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const categories = [
    'Strength', 
    'Cardio', 
    'Flexibility', 
    'Balance', 
    'Core', 
    'Upper Body', 
    'Lower Body', 
    'Full Body'
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter an exercise name');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create the custom exercise
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .insert([
          {
            name: name.trim(),
            category,
            equipment: equipment.trim() || null,
            description: description.trim() || null,
            is_custom: true
          }
        ])
        .select()
        .single();
      
      if (exerciseError) throw exerciseError;
      
      // If a workout ID was provided, add this exercise to the workout
      if (workoutId) {
        // Get the highest position in the workout
        const { data: positionData } = await supabase
          .from('workout_exercises')
          .select('position')
          .eq('workout_id', workoutId)
          .order('position', { ascending: false })
          .limit(1);
        
        const position = (positionData?.[0]?.position || 0) + 1;
        
        // Add the exercise to the workout
        const { error: workoutExerciseError } = await supabase
          .from('workout_exercises')
          .insert([
            {
              workout_id: workoutId,
              exercise_id: exerciseData.id,
              position,
              sets: 3,
              reps: 10
            }
          ]);
          
        if (workoutExerciseError) throw workoutExerciseError;
        
        // Clear the workout exercises cache
        clearCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`);
      }
      
      // Navigate back to the workout or exercises page
      if (workoutId) {
        router.push(`/workouts/${workoutId}`);
      } else {
        router.push('/workouts/exercises');
      }
    } catch (err) {
      console.error('Error creating exercise:', err);
      setError('Failed to create exercise. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <Layout title="CREATE CUSTOM EXERCISE" backUrl={workoutId ? `/workouts/exercises?workoutId=${workoutId}` : '/workouts/exercises'}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 space-y-6">
          <div>
            <label className="block text-text-light mb-2" htmlFor="exercise-name">
              EXERCISE NAME
            </label>
            <input
              id="exercise-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Single-Arm Push-Up"
              className="w-full bg-card-bg text-white border border-gray-700 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-text-light mb-2" htmlFor="exercise-category">
              CATEGORY
            </label>
            <select
              id="exercise-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-card-bg text-white border border-gray-700 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-text-light mb-2" htmlFor="exercise-equipment">
              EQUIPMENT (OPTIONAL)
            </label>
            <input
              id="exercise-equipment"
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              placeholder="e.g., Dumbbell, Barbell, Bodyweight"
              className="w-full bg-card-bg text-white border border-gray-700 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <div>
            <label className="block text-text-light mb-2" htmlFor="exercise-description">
              DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              id="exercise-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how to perform this exercise..."
              className="w-full bg-card-bg text-white border border-gray-700 rounded-md p-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          {error && (
            <p className="text-red-500">{error}</p>
          )}
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'CREATING...' : 'CREATE EXERCISE'}
          </button>
        </div>
      </form>
    </Layout>
  );
} 