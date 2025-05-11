'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { getWorkoutById, getWorkoutExercises, WorkoutExercise } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { clearCache, saveToCache } from '@/lib/cache';

// Define constants
const WORKOUT_EXERCISES_CACHE_PREFIX = 'workout_exercises_';

interface WorkoutDetailsProps {
  params: {
    id: string;
  };
}

export default function WorkoutDetailsPage({ params }: WorkoutDetailsProps) {
  console.log('🔍 WorkoutDetailsPage rendering with workout ID:', params.id);
  
  const router = useRouter();
  const workoutId = params.id;
  const [workoutName, setWorkoutName] = useState('Loading...');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [editingSetsArray, setEditingSetsArray] = useState<{[key: string]: { reps: number; weight: number; }[]}>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Immediate API call for workout details
  useEffect(() => {
    console.log('🚀 Initiating workout details fetch for ID:', workoutId);
    
    const loadWorkoutDetails = async () => {
      try {
        console.log('📊 Calling getWorkoutById API...');
        const workout = await getWorkoutById(workoutId);
        
        console.log('📥 Workout details received:', workout);
        if (workout) {
          console.log('✅ Setting workout name:', workout.name);
          setWorkoutName(workout.name);
        } else {
          console.error('❌ No workout found for ID:', workoutId);
        }
      } catch (error) {
        console.error('❌ Error loading workout details:', error);
      }
    };
    
    loadWorkoutDetails();
  }, [workoutId]);
  
  // Separate effect for loading exercises (runs in parallel with workout details)
  useEffect(() => {
    console.log('🚀 Initiating exercises fetch for workout ID:', workoutId);
    
    const fetchExercises = async () => {
      setLoading(true);
      
      try {
        // Direct query to Supabase for better performance
        console.log('📊 Making direct Supabase query for exercises...');
        console.log('📊 Query parameters:', { workoutId });
        
        const { data, error } = await supabase
          .from('workout_exercises')
          .select(`
            *,
            exercise:exercise_id (*)
          `)
          .eq('workout_id', workoutId)
          .order('id');
        
        console.log('📥 Supabase query response:', { data, error });
        
        if (error) {
          console.error('❌ Supabase query error:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          console.log(`✅ Received ${data.length} exercises from Supabase`);
          console.log('📊 First exercise sample:', data[0]);
          
          setExercises(data);
          
          // Initialize editing state
          const initialSetsArray: {[key: string]: { reps: number; weight: number; }[]} = {};
          data.forEach(ex => {
            const sets = ex.sets || 1;
            const reps = ex.reps || 10;
            const weight = ex.weight || 0;
            initialSetsArray[ex.id] = Array.from({ length: sets }, () => ({ reps, weight }));
          });
          
          console.log('📊 Setting initial state with:', { initialSetsArray });
          
          setEditingSetsArray(initialSetsArray);
        } else {
          console.warn('⚠️ No exercises found for workout ID:', workoutId);
        }
      } catch (error) {
        console.error('❌ Error fetching exercises directly:', error);
        
        // Fallback to API method if direct query fails
        try {
          console.log('🔄 Falling back to getWorkoutExercises API...');
          
          const fallbackData = await getWorkoutExercises(workoutId);
          console.log('📥 Fallback API response:', fallbackData);
          
          if (fallbackData && fallbackData.length > 0) {
            console.log(`✅ Received ${fallbackData.length} exercises from fallback API`);
            
            setExercises(fallbackData);
            
            const initialSetsArray: {[key: string]: { reps: number; weight: number; }[]} = {};
            fallbackData.forEach(ex => {
              const sets = ex.sets || 1;
              const reps = ex.reps || 10;
              const weight = ex.weight || 0;
              initialSetsArray[ex.id] = Array.from({ length: sets }, () => ({ reps, weight }));
            });
            
            setEditingSetsArray(initialSetsArray);
          } else {
            console.error('❌ Fallback API returned no exercises');
          }
        } catch (fallbackError) {
          console.error('❌ Fallback API method also failed:', fallbackError);
        }
      } finally {
        console.log('✅ Setting loading state to false');
        setLoading(false);
      }
    };
    
    fetchExercises();
    
  }, [workoutId]);
  
  useEffect(() => {
    console.log('📊 Current exercises state:', exercises);
    console.log('📊 Current editing states:', {
      sets: editingSetsArray
    });
  }, [exercises, editingSetsArray]);
  
  const handleToggleExpand = (exerciseId: string) => {
    console.log('👆 Toggling exercise expand state:', exerciseId);
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };
  
  const handleUpdateAllExercises = async () => {
    console.log('💾 Saving exercise changes to database');
    
    try {
      // Create an array of promises for updating each exercise
      const updatePromises = exercises.map(exercise => {
        const setsArr = editingSetsArray[exercise.id] || [{ reps: 10, weight: 0 }];
        return supabase
          .from('workout_exercises')
          .update({
            sets: setsArr.length,
            reps: setsArr[0].reps,
            weight: setsArr[0].weight
          })
          .eq('id', exercise.id);
      });
      
      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      console.log('📊 Update results:', results);
      
      // Update local state
      setExercises(exercises.map(ex => ({
        ...ex, 
        sets: editingSetsArray[ex.id]?.length || 0,
        reps: editingSetsArray[ex.id]?.[0].reps || 10,
        weight: editingSetsArray[ex.id]?.[0].weight || 0
      })));
      
      // Reset changes flag
      setHasChanges(false);
      console.log('✅ Exercise updates completed successfully');
    } catch (error) {
      console.error('❌ Error updating exercises:', error);
    }
  };
  
  const handleAddSet = (exerciseId: string) => {
    // Increment the number of sets
    const updatedSets = editingSetsArray[exerciseId]?.length || 0 + 1;
    console.log('➕ Adding set for exercise:', exerciseId, 'New count:', updatedSets);
    
    setEditingSetsArray({
      ...editingSetsArray,
      [exerciseId]: [...(editingSetsArray[exerciseId] || []), { reps: 10, weight: 0 }]
    });
    setHasChanges(true);
  };
  
  const handleRemoveSet = (exerciseId: string) => {
    // Decrement the number of sets (minimum 1)
    const currentSets = editingSetsArray[exerciseId]?.length || 0;
    if (currentSets > 1) {
      console.log('➖ Removing set for exercise:', exerciseId, 'New count:', currentSets - 1);
      
      setEditingSetsArray({
        ...editingSetsArray,
        [exerciseId]: editingSetsArray[exerciseId].slice(0, -1)
      });
      setHasChanges(true);
    } else {
      console.log('⚠️ Cannot remove set: already at minimum (1)');
    }
  };
  
  const handleAddExercise = () => {
    console.log('➕ Adding new exercise to workout:', workoutId);
    router.push(`/workouts/exercises?workoutId=${workoutId}`);
  };
  
  console.log('📊 Render state:', {
    workoutId,
    workoutName,
    exercisesCount: exercises.length,
    loading,
    expandedExerciseId
  });
  
  return (
    <Layout title={workoutName} backUrl="/workouts">
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <div className="mt-4 text-sm text-gray-400">Loading workout exercises...</div>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {exercises.length > 0 ? (
            exercises.map(exercise => (
              <div key={exercise.id} className="card flex flex-col rounded-lg bg-[#1E2128] border border-[#2C3038] shadow-sm">
                <div className="flex items-center justify-between px-4 py-3" onClick={() => handleToggleExpand(exercise.id)}>
                  <div>
                    <h3 className="font-medium text-base">{exercise.exercise?.name || 'Exercise'}</h3>
                    <p className="text-[#9DA1A8] text-sm mt-0.5">{editingSetsArray[exercise.id]?.length || 0} {editingSetsArray[exercise.id]?.length === 1 ? 'Set' : 'Sets'} • {exercise.reps} Reps • {exercise.weight} lbs</p>
                  </div>
                  <button className="text-[#9DA1A8]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                  </button>
                </div>
                
                {expandedExerciseId === exercise.id && (
                  <div className="px-4 pt-2 pb-3 border-t border-[#2C3038] mt-0">
                    {exercise.exercise?.image_url && (
                      <img src={exercise.exercise.image_url} alt={exercise.exercise.name} className="w-full h-32 object-cover rounded mb-2" />
                    )}
                    {exercise.exercise?.description && (
                      <div className="text-xs text-[#9DA1A8] mb-2">{exercise.exercise.description}</div>
                    )}
                    <div className="flex font-medium text-xs text-[#9DA1A8] mb-2">
                      <div className="flex-1 text-center">REPS</div>
                      <div className="flex-1 text-center">WEIGHT ({'kg'})</div>
                      <div className="w-8"></div>
                    </div>
                    {editingSetsArray[exercise.id]?.map((set, idx) => (
                      <div key={idx} className="flex items-center mb-2">
                        <div className="flex-1 pr-2">
                          <input
                            type="number"
                            min="1"
                            value={set.reps}
                            onChange={e => {
                              const newSets = [...editingSetsArray[exercise.id]];
                              newSets[idx].reps = parseInt(e.target.value) || 1;
                              setEditingSetsArray({ ...editingSetsArray, [exercise.id]: newSets });
                              setHasChanges(true);
                            }}
                            className="bg-white text-black border border-[#DFE1E5] rounded-lg py-1.5 px-2 w-full text-center text-sm shadow-sm"
                          />
                        </div>
                        <div className="flex-1 px-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={set.weight}
                            onChange={e => {
                              const newSets = [...editingSetsArray[exercise.id]];
                              newSets[idx].weight = parseFloat(e.target.value) || 0;
                              setEditingSetsArray({ ...editingSetsArray, [exercise.id]: newSets });
                              setHasChanges(true);
                            }}
                            className="bg-white text-black border border-[#DFE1E5] rounded-lg py-1.5 px-2 w-full text-center text-sm shadow-sm"
                          />
                        </div>
                        <div className="w-8 pl-2">
                          {editingSetsArray[exercise.id].length > 1 && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                const newSets = editingSetsArray[exercise.id].filter((_, i) => i !== idx);
                                setEditingSetsArray({ ...editingSetsArray, [exercise.id]: newSets });
                                setHasChanges(true);
                              }}
                              className="bg-[#2C3038] hover:bg-[#3A3E47] text-white p-1.5 rounded-lg text-xs w-full flex items-center justify-center shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setEditingSetsArray({
                          ...editingSetsArray,
                          [exercise.id]: [...editingSetsArray[exercise.id], { reps: editingSetsArray[exercise.id][0]?.reps || 10, weight: editingSetsArray[exercise.id][0]?.weight || 0 }]
                        });
                        setHasChanges(true);
                      }}
                      className="w-full py-1.5 flex items-center justify-center text-[#45D67B] font-medium text-xs border border-[#45D67B] rounded-lg hover:bg-[#2C3038] transition-colors mt-2"
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
              <p className="mb-2">No exercises added yet to this workout.</p>
              <p className="text-sm">Workout ID: {workoutId}</p>
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
          disabled={!hasChanges}
          className={`w-full py-3.5 rounded-full text-base font-medium ${hasChanges ? 'bg-gradient-to-b from-[#45D67B] to-[#2DCB6C]' : 'bg-gray-400'} text-white shadow-lg`}
        >
          SAVE {hasChanges && '(CHANGES PENDING)'}
        </button>
        <Link href={`/workouts/${workoutId}/start`}>
          <button className="w-full py-3.5 rounded-full text-base font-medium bg-gradient-to-b from-[#45D67B] to-[#2DCB6C] text-white shadow-lg">
            START WORKOUT
          </button>
        </Link>
        
        <div className="mt-6 p-4 border border-gray-700 rounded-lg text-xs text-gray-400 bg-[#1A1D24]">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <p>Workout ID: {workoutId}</p>
          <p>Exercises Count: {exercises.length}</p>
          <p>Loading State: {loading ? 'True' : 'False'}</p>
        </div>
      </div>
    </Layout>
  );
} 