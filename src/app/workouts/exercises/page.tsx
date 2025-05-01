'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { clearCache, CACHE_KEYS } from '@/lib/cache';

interface Exercise {
  id: string;
  name: string;
  equipment?: string;
  category: string;
  description?: string;
}

export default function ExercisesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workoutId = searchParams.get('workoutId');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setExercises(data || []);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, []);
  
  const filteredExercises = exercises.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group exercises by category
  const groupedExercises: Record<string, Exercise[]> = {};
  
  filteredExercises.forEach(exercise => {
    const category = exercise.category || 'Other';
    if (!groupedExercises[category]) {
      groupedExercises[category] = [];
    }
    groupedExercises[category].push(exercise);
  });

  const handleToggleSelect = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };
  
  const handleAddExercises = async () => {
    if (!workoutId || selectedExercises.length === 0) return;
    
    try {
      // Get the highest position value for the current workout
      const { data: positionData } = await supabase
        .from('workout_exercises')
        .select('position')
        .eq('workout_id', workoutId)
        .order('position', { ascending: false })
        .limit(1);
      
      const highestPosition = positionData?.[0]?.position || 0;
      
      // Prepare data for insertion
      const exercisesToInsert = selectedExercises.map((exerciseId, index) => ({
        workout_id: workoutId,
        exercise_id: exerciseId,
        position: highestPosition + index + 1,
        sets: 3,
        reps: 10
      }));
      
      // Insert the exercises
      const { error } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert);
      
      if (error) throw error;
      
      // Clear cache
      clearCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`);
      
      // Navigate back to the workout page
      router.push(`/workouts/${workoutId}`);
    } catch (error) {
      console.error('Error adding exercises:', error);
    }
  };
  
  const handleGoToCustomExercise = () => {
    router.push(`/workouts/custom-exercise?workoutId=${workoutId}`);
  };
  
  const bottomActions = (
    <div className="fixed bottom-0 left-0 w-full p-4 bg-background">
      <button 
        className="btn-primary w-full py-3 rounded-full text-base"
        onClick={handleAddExercises}
        disabled={selectedExercises.length === 0}
      >
        ADD {selectedExercises.length > 0 ? `(${selectedExercises.length})` : ''}
      </button>
    </div>
  );
  
  return (
    <Layout title="SELECT EXERCISES" backUrl={`/workouts/${workoutId}`} bottomElement={bottomActions}>
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-card-bg rounded-xl border-none text-white text-base"
            placeholder="Search for an exercise..."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
      </div>
      <div className="mb-3 card border border-dashed border-text-light">
        <button 
          className="w-full flex items-center p-3"
          onClick={handleGoToCustomExercise}
        >
          <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-base">Add Custom Exercise</span>
        </button>
      </div>
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 mb-24">
          {Object.keys(groupedExercises).sort().map(category => (
            <div key={category}>
              <h2 className="text-base font-bold mb-1">{category}</h2>
              <div className="space-y-1">
                {groupedExercises[category].map(exercise => (
                  <div 
                    key={exercise.id}
                    className={`card flex items-center justify-between px-3 py-2 rounded-lg min-h-[44px] ${selectedExercises.includes(exercise.id) ? 'border-2 border-accent' : ''}`}
                    onClick={() => handleToggleSelect(exercise.id)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-600 rounded-md flex items-center justify-center mr-3 text-base font-bold">
                        {exercise.name.substring(0, 1)}
                      </div>
                      <span className="text-base">{exercise.name}</span>
                    </div>
                    {selectedExercises.includes(exercise.id) && (
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
} 