'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { getWorkoutById, getWorkoutExercises, WorkoutExercise } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { clearCache, CACHE_KEYS } from '@/lib/cache';

interface WorkoutDetailsProps {
  params: {
    id: string;
  };
}

export default function WorkoutDetailsPage({ params }: WorkoutDetailsProps) {
  const router = useRouter();
  const workoutId = params.id;
  const [workoutName, setWorkoutName] = useState('Loading...');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [editingSets, setEditingSets] = useState<{[key: string]: number}>({});
  const [editingReps, setEditingReps] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    const fetchWorkoutData = async () => {
      setLoading(true);
      
      try {
        // Fetch workout details
        const workout = await getWorkoutById(workoutId);
        if (workout) {
          setWorkoutName(workout.name);
        }
        
        // Fetch workout exercises
        const exercisesData = await getWorkoutExercises(workoutId);
        setExercises(exercisesData);
        
        // Initialize editing state
        const initialSets: {[key: string]: number} = {};
        const initialReps: {[key: string]: number} = {};
        exercisesData.forEach(ex => {
          initialSets[ex.id] = ex.sets;
          initialReps[ex.id] = ex.reps;
        });
        setEditingSets(initialSets);
        setEditingReps(initialReps);
      } catch (error) {
        console.error('Error fetching workout data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutData();
  }, [workoutId]);
  
  const handleToggleExpand = (exerciseId: string) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };
  
  const handleUpdateExercise = async (exerciseId: string) => {
    try {
      await supabase
        .from('workout_exercises')
        .update({
          sets: editingSets[exerciseId],
          reps: editingReps[exerciseId]
        })
        .eq('id', exerciseId);
      
      // Clear cache to ensure fresh data
      clearCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`);
      
      // Close expanded view
      setExpandedExerciseId(null);
      
      // Update local state
      setExercises(exercises.map(ex => 
        ex.id === exerciseId 
          ? {...ex, sets: editingSets[exerciseId], reps: editingReps[exerciseId]} 
          : ex
      ));
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };
  
  const handleAddExercise = () => {
    router.push(`/workouts/exercises?workoutId=${workoutId}`);
  };
  
  const rightElement = (
    <button>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    </button>
  );
  
  return (
    <Layout title={workoutName} backUrl="/workouts" rightElement={rightElement}>
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {exercises.length > 0 ? (
            exercises.map(exercise => (
              <div key={exercise.id} className="card">
                <div className="flex items-center justify-between p-4" onClick={() => handleToggleExpand(exercise.id)}>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-md mr-4 overflow-hidden">
                      {exercise.exercise?.name.substring(0, 1) || 'E'}
                    </div>
                    <div>
                      <h3 className="font-medium">{exercise.exercise?.name || 'Exercise'}</h3>
                      <p className="text-text-light">{exercise.sets} Sets x {exercise.reps} Reps</p>
                    </div>
                  </div>
                  <button className="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </button>
                </div>
                
                {expandedExerciseId === exercise.id && (
                  <div className="p-4 border-t border-gray-700">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-text-light mb-2">SETS</label>
                        <input
                          type="number"
                          min="1"
                          value={editingSets[exercise.id]}
                          onChange={(e) => setEditingSets({
                            ...editingSets,
                            [exercise.id]: parseInt(e.target.value) || 1
                          })}
                          className="w-full bg-card-bg text-white border border-gray-700 rounded-md p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-text-light mb-2">REPS</label>
                        <input
                          type="number"
                          min="1"
                          value={editingReps[exercise.id]}
                          onChange={(e) => setEditingReps({
                            ...editingReps,
                            [exercise.id]: parseInt(e.target.value) || 1
                          })}
                          className="w-full bg-card-bg text-white border border-gray-700 rounded-md p-2"
                        />
                      </div>
                      <button 
                        onClick={() => handleUpdateExercise(exercise.id)}
                        className="bg-accent text-white py-2 px-4 rounded-md w-full"
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-text-light py-10">
              No exercises added yet. Add your first exercise!
            </div>
          )}
          
          <button 
            className="w-full py-4 flex items-center justify-center text-accent font-medium"
            onClick={handleAddExercise}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ADD EXERCISE
          </button>
        </div>
      )}
      
      <div className="mt-auto">
        <Link href={`/workouts/${workoutId}/start`}>
          <button className="btn-primary">START WORKOUT</button>
        </Link>
      </div>
    </Layout>
  );
} 