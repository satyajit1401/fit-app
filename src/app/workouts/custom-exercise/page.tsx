'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { addExerciseToWorkout } from '@/lib/api';
import { supabase } from '@/lib/supabase';

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
      setError('Exercise name is required.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Insert the exercise using Supabase
      const { data, error } = await supabase
        .from('exercises')
        .insert([
          {
            name,
            description,
            category: category || 'Other',
            equipment_required: equipment ? [equipment] : [],
            is_custom: true
          }
        ])
        .select();
      
      if (error) {
        console.error('Error creating exercise:', error);
        setError('Failed to create exercise. Please try again.');
        return;
      }
      
      console.log('Exercise created successfully:', data);
      
      // If we have a workoutId, we need to add this exercise to the workout
      if (workoutId && data && data.length > 0) {
        // Get current highest position
        const response = await fetch(`/api/workouts/${workoutId}/highest-position`);
        const positionData = await response.json();
        const position = positionData.position + 1;
        
        // Add exercise to workout
        const success = await addExerciseToWorkout({
          workout_id: workoutId,
          exercise_id: data[0].id,
          position,
          sets: 3,
          reps: 10
        });
        
        if (!success) {
          console.error('Error adding exercise to workout');
          setError('Exercise created but could not add to workout.');
          return;
        }
      }
      
      // Navigate back
      router.push(workoutId ? `/workouts/${workoutId}` : '/workouts');
    } catch (err) {
      console.error('Error creating custom exercise:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const bottomActions = (
    <div className="fixed bottom-0 left-0 w-full p-4 bg-background border-t border-gray-800 shadow-lg">
      <button
        type="submit"
        form="custom-exercise-form"
        className="btn-primary w-full py-4 rounded-full text-base font-medium bg-gradient-to-b from-[#45D67B] to-[#2DCB6C] text-white shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? 'CREATING...' : 'CREATE & ADD EXERCISE'}
      </button>
    </div>
  );
  
  return (
    <Layout 
      title="CREATE CUSTOM EXERCISE" 
      backUrl={workoutId ? `/workouts/exercises?workoutId=${workoutId}` : '/workouts/exercises'}
      bottomElement={bottomActions}
    >
      <form id="custom-exercise-form" onSubmit={handleSubmit} className="flex flex-col h-full mb-24">
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
      </form>
    </Layout>
  );
} 