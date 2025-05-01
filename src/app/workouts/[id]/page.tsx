'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { getWorkoutById, getWorkoutExercises, WorkoutExercise } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { clearCache, CACHE_KEYS, saveToCache } from '@/lib/cache';

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
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    const fetchWorkoutData = async () => {
      setLoading(true);
      
      try {
        console.log(`[Page] Fetching workout details for ID: ${workoutId}`);
        
        // Make a direct supabase request to get exercises - bypassing all caching
        const directRequest = async () => {
          console.log(`[Page] Making direct supabase request for exercises`);
          return await supabase
            .from('workout_exercises')
            .select(`
              *,
              exercise:exercise_id (*)
            `)
            .eq('workout_id', workoutId);
        };
        
        // Fetch workout details
        const workout = await getWorkoutById(workoutId);
        if (workout) {
          setWorkoutName(workout.name);
          console.log(`[Page] Got workout name: ${workout.name}`);
        } else {
          console.error('[Page] No workout found with ID:', workoutId);
        }
        
        // Set up a timeout to prevent infinite loading state
        const loadingTimeout = setTimeout(() => {
          console.log('[Page] Loading timeout reached, stopping spinner');
          setLoading(false);
        }, 5000); // 5 second maximum loading time
        
        // Try direct request first
        console.log('[Page] Attempting direct request to supabase');
        const { data: directData, error: directError } = await directRequest();
        
        // Clear the timeout since we got a response
        clearTimeout(loadingTimeout);
        
        // If direct request worked, use that data
        if (directData && directData.length > 0 && !directError) {
          console.log(`[Page] Direct request successful, got ${directData.length} exercises`);
          setExercises(directData);
          
          // Initialize editing state
          const initialSets: {[key: string]: number} = {};
          const initialReps: {[key: string]: number} = {};
          directData.forEach(ex => {
            initialSets[ex.id] = ex.sets;
            initialReps[ex.id] = ex.reps;
          });
          setEditingSets(initialSets);
          setEditingReps(initialReps);
          
          // Update cache with this data
          saveToCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`, directData);
          
          setLoading(false);
          return;
        }
        
        // If direct request failed, fall back to regular API
        console.log('[Page] Direct request failed, falling back to regular API');
        const exercisesData = await getWorkoutExercises(workoutId, true);
        
        console.log(`[Page] API returned ${exercisesData?.length || 0} exercises`);
        
        if (exercisesData && exercisesData.length > 0) {
          console.log('[Page] Setting exercises data in state');
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
        } else {
          console.log('[Page] No exercise data found, will retry');
          
          // Retry after a delay with direct request again
          setTimeout(async () => {
            console.log('[Page] Retrying with direct request');
            const { data: retryData, error: retryError } = await directRequest();
            
            if (retryData && retryData.length > 0 && !retryError) {
              console.log(`[Page] Retry successful, got ${retryData.length} exercises`);
              setExercises(retryData);
              
              const initialSets: {[key: string]: number} = {};
              const initialReps: {[key: string]: number} = {};
              retryData.forEach(ex => {
                initialSets[ex.id] = ex.sets;
                initialReps[ex.id] = ex.reps;
              });
              setEditingSets(initialSets);
              setEditingReps(initialReps);
              
              // Update cache
              saveToCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`, retryData);
            } else {
              console.error('[Page] All attempts failed to get workout exercises');
            }
          }, 1000);
        }
      } catch (error) {
        console.error('[Page] Error fetching workout data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Always clear existing cache for this workout's exercises
    if (typeof window !== 'undefined') {
      try {
        console.log(`[Page] Clearing cache for workout exercises: ${workoutId}`);
        clearCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`);
      } catch (e) {
        console.error('[Page] Error clearing cache:', e);
      }
    }
    
    // Fetch data immediately when component mounts
    fetchWorkoutData();
    
    // Add event listener for when user navigates back to this page
    const handleFocus = () => {
      console.log('[Page] Window focus event, refetching data');
      // Clear cache before refetching
      if (typeof window !== 'undefined') {
        clearCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`);
      }
      fetchWorkoutData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [workoutId]);
  
  const handleToggleExpand = (exerciseId: string) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };
  
  const handleUpdateAllExercises = async () => {
    try {
      // Create an array of promises for updating each exercise
      const updatePromises = exercises.map(exercise => 
        supabase
          .from('workout_exercises')
          .update({
            sets: editingSets[exercise.id],
            reps: editingReps[exercise.id]
          })
          .eq('id', exercise.id)
      );
      
      // Wait for all updates to complete
      await Promise.all(updatePromises);
      
      // Clear cache to ensure fresh data
      clearCache(`${CACHE_KEYS.WORKOUT_EXERCISES}${workoutId}`);
      
      // Update local state
      setExercises(exercises.map(ex => ({
        ...ex, 
        sets: editingSets[ex.id],
        reps: editingReps[ex.id]
      })));
      
      // Reset changes flag
      setHasChanges(false);
      
      // Show visual feedback instead of alert
      // Briefly flash the button green or something similar
    } catch (error) {
      console.error('Error updating exercises:', error);
    }
  };
  
  const handleAddSet = (exerciseId: string) => {
    // Increment the number of sets
    const updatedSets = editingSets[exerciseId] + 1;
    setEditingSets({
      ...editingSets,
      [exerciseId]: updatedSets
    });
    setHasChanges(true);
  };
  
  const handleRemoveSet = (exerciseId: string) => {
    // Decrement the number of sets (minimum 1)
    const currentSets = editingSets[exerciseId];
    if (currentSets > 1) {
      setEditingSets({
        ...editingSets,
        [exerciseId]: currentSets - 1
      });
      setHasChanges(true);
    }
  };
  
  const handleChangeReps = (exerciseId: string, value: number) => {
    setEditingReps({
      ...editingReps,
      [exerciseId]: value
    });
    setHasChanges(true);
  };
  
  const handleChangeSets = (exerciseId: string, value: number) => {
    setEditingSets({
      ...editingSets,
      [exerciseId]: value
    });
    setHasChanges(true);
  };
  
  const handleAddExercise = () => {
    router.push(`/workouts/exercises?workoutId=${workoutId}`);
  };
  
  return (
    <Layout title={workoutName} backUrl="/workouts">
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {exercises.length > 0 ? (
            exercises.map(exercise => (
              <div key={exercise.id} className="card flex flex-col rounded-lg bg-[#1E2128] border border-[#2C3038] shadow-sm">
                <div className="flex items-center justify-between px-4 py-3" onClick={() => handleToggleExpand(exercise.id)}>
                  <div>
                    <h3 className="font-medium text-base">{exercise.exercise?.name || 'Exercise'}</h3>
                    <p className="text-[#9DA1A8] text-sm mt-0.5">{editingSets[exercise.id]} Sets × {editingReps[exercise.id]} Reps</p>
                  </div>
                  <button className="text-[#9DA1A8]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </button>
                </div>
                
                {expandedExerciseId === exercise.id && (
                  <div className="px-4 pt-2 pb-3 border-t border-[#2C3038] mt-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex-1 text-center font-medium text-xs text-[#9DA1A8]">SETS</div>
                      <div className="flex-1 text-center font-medium text-xs text-[#9DA1A8]">REPS</div>
                      <div className="w-8"></div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex-1 pr-2">
                        <input
                          type="number"
                          min="1"
                          value={editingSets[exercise.id]}
                          onChange={(e) => handleChangeSets(exercise.id, parseInt(e.target.value) || 1)}
                          className="bg-white text-black border border-[#DFE1E5] rounded-lg py-1.5 px-2 w-full text-center text-sm shadow-sm"
                        />
                      </div>
                      <div className="flex-1 px-2">
                        <input
                          type="number"
                          min="1"
                          value={editingReps[exercise.id]}
                          onChange={(e) => handleChangeReps(exercise.id, parseInt(e.target.value) || 1)}
                          className="bg-white text-black border border-[#DFE1E5] rounded-lg py-1.5 px-2 w-full text-center text-sm shadow-sm"
                        />
                      </div>
                      <div className="w-8 pl-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSet(exercise.id);
                          }}
                          className="bg-[#2C3038] hover:bg-[#3A3E47] text-white p-1.5 rounded-lg text-xs w-full flex items-center justify-center shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleAddSet(exercise.id)}
                      className="w-full py-1.5 flex items-center justify-center text-[#45D67B] font-medium text-xs border border-[#45D67B] rounded-lg hover:bg-[#2C3038] transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      ADD SET
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-[#9DA1A8] py-10">
              No exercises added yet. Add your first exercise!
            </div>
          )}
          
          <button 
            className="w-full py-3 flex items-center justify-center text-[#45D67B] font-medium text-base mt-3"
            onClick={handleAddExercise}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ADD EXERCISE
          </button>
        </div>
      )}
      
      <div className="mt-8 flex flex-col gap-3">
        <button 
          onClick={handleUpdateAllExercises}
          className="w-full py-3.5 rounded-full text-base font-medium bg-gradient-to-b from-[#45D67B] to-[#2DCB6C] text-white shadow-lg"
        >
          SAVE
        </button>
        <Link href={`/workouts/${workoutId}/start`}>
          <button className="w-full py-3.5 rounded-full text-base font-medium bg-gradient-to-b from-[#45D67B] to-[#2DCB6C] text-white shadow-lg">
            START WORKOUT
          </button>
        </Link>
      </div>
    </Layout>
  );
} 