'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { getWorkoutWithExercises, WorkoutExercise, updateWorkoutExercisesBatch } from '@/lib/api';
import { supabase } from '@/lib/supabase';

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
  const [error, setError] = useState<string | null>(null);
  
  // Load workout details and exercises in a single API call
  useEffect(() => {
    console.log('🚀 Initiating workout fetch for ID:', workoutId);
    
    const loadWorkoutWithExercises = async () => {
      try {
        setLoading(true);
        console.log('📊 Calling getWorkoutWithExercises API...');
        
        // Get workout and exercises in a single call
        const { workout, exercises } = await getWorkoutWithExercises(workoutId);
        
        if (workout) {
          console.log('✅ Setting workout name:', workout.name);
          setWorkoutName(workout.name);
        } else {
          console.error('❌ No workout found for ID:', workoutId);
        }
        
        console.log(`✅ Received ${exercises.length} exercises`);
        
        // Check for pending exercises in session storage
        if (typeof window !== 'undefined') {
          const pendingExercisesData = sessionStorage.getItem('pendingExercises');
          if (pendingExercisesData) {
            try {
              const pendingData = JSON.parse(pendingExercisesData);
              
              // Only process if the pending exercises are for this workout
              if (pendingData.workoutId === workoutId) {
                console.log('📊 Adding pending exercises to state:', pendingData.exercises);
                
                // Generate temporary IDs for pending exercises
                const pendingExercises = await Promise.all(
                  pendingData.exercises.map(async (exercise: { 
                    workout_id: string; 
                    exercise_id: string; 
                    position: number; 
                    sets: number; 
                    reps: number; 
                  }) => {
                    // Fetch exercise details for each pending exercise
                    const { data: exerciseData } = await supabase
                      .from('exercises')
                      .select('*')
                      .eq('id', exercise.exercise_id)
                      .single();
                    
                    return {
                      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                      workout_id: workoutId,
                      exercise_id: exercise.exercise_id,
                      sets: exercise.sets,
                      reps: exercise.reps,
                      weight: 0,
                      position: exercise.position,
                      exercise: exerciseData,
                      isPending: true
                    };
                  })
                );
                
                // Combine existing and pending exercises
                const combinedExercises = [...exercises, ...pendingExercises];
                setExercises(combinedExercises);
                
                // Initialize editing state with both existing and pending exercises
                const initialSetsArray: {[key: string]: { reps: number; weight: number; }[]} = {};
                combinedExercises.forEach(ex => {
                  const sets = ex.sets || 1;
                  const reps = ex.reps || 10;
                  const weight = ex.weight || 0;
                  initialSetsArray[ex.id] = Array.from({ length: sets }, () => ({ reps, weight }));
                });
                
                setEditingSetsArray(initialSetsArray);
                setHasChanges(true); // Mark that we have pending changes
                
                // Clear the pending exercises
                sessionStorage.removeItem('pendingExercises');
                
                console.log('📊 Combined exercises:', combinedExercises);
              }
            } catch (e) {
              console.error('Error handling pending exercises:', e);
              sessionStorage.removeItem('pendingExercises');
            }
          } else {
            // No pending exercises, just set the regular exercises
            setExercises(exercises);
            
            // Initialize editing state
            const initialSetsArray: {[key: string]: { reps: number; weight: number; }[]} = {};
            exercises.forEach(ex => {
              const sets = ex.sets || 1;
              const reps = ex.reps || 10;
              const weight = ex.weight || 0;
              initialSetsArray[ex.id] = Array.from({ length: sets }, () => ({ reps, weight }));
            });
            
            setEditingSetsArray(initialSetsArray);
          }
        }
      } catch (error) {
        console.error('❌ Error loading workout with exercises:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkoutWithExercises();
  }, [workoutId]);
  
  useEffect(() => {
    console.log('📊 Current exercises state:', exercises);
    console.log('📊 Current editing states:', {
      sets: editingSetsArray
    });
  }, [exercises, editingSetsArray]);
  
  const handleToggleExpand = (exerciseId: string) => {
    console.log('👆 Toggling exercise expand state:', exerciseId);
    console.log('👆 Current exercise data:', exercises.find(ex => ex.id === exerciseId));
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };
  
  const handleUpdateAllExercises = async () => {
    console.log('💾 Saving exercise changes to database');
    setLoading(true);
    setError(null); // Clear any previous error messages
    
    try {
      // Group exercises by whether they're pending or existing
      const pendingExercises = exercises.filter(ex => ex.isPending);
      const existingExercises = exercises.filter(ex => !ex.isPending);
      
      console.log('Existing exercises to update:', existingExercises);
      console.log('Pending exercises to insert:', pendingExercises);
      console.log('Current editing state:', editingSetsArray);
      
      // Handle existing exercises - update them using batch function
      if (existingExercises.length > 0) {
        const exercisesToUpdate = existingExercises.map(exercise => {
          const setsArr = editingSetsArray[exercise.id] || [{ reps: 10, weight: 0 }];
          
          // Calculate average reps and weight from all sets
          const totalReps = setsArr.reduce((sum, set) => sum + set.reps, 0);
          const totalWeight = setsArr.reduce((sum, set) => sum + set.weight, 0);
          const avgReps = Math.round(totalReps / setsArr.length);
          const avgWeight = Math.round(totalWeight / setsArr.length * 10) / 10; // Round to 1 decimal
          
          // Now we also include the sets_data field to store detailed information for each set
          return {
            id: exercise.id,
            sets: setsArr.length,
            reps: avgReps,
            weight: avgWeight,
            sets_data: JSON.stringify(setsArr) // Store the detailed set information
          };
        });
        
        console.log('Formatted exercises for update:', exercisesToUpdate);
        
        // Try the batch update first
        const updateSuccess = await updateWorkoutExercisesBatch(exercisesToUpdate);
        
        if (!updateSuccess) {
          console.log('❌ Batch update failed, trying alternate API endpoint...');
          
          // If batch update fails, try the direct API endpoint
          try {
            const response = await fetch(`/api/workouts/${workoutId}/update-exercise`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ exercises: exercisesToUpdate }),
            });
            
            const result = await response.json();
            console.log('API update result:', result);
            
            if (!response.ok) {
              console.error('❌ API update failed:', result);
              setError('Failed to update exercises. Please try again.');
              setLoading(false);
              return;
            }
          } catch (apiError) {
            console.error('❌ Error calling update API:', apiError);
            setError('Failed to update exercises. Please try again.');
            setLoading(false);
            return;
          }
        } else {
          console.log('✅ Batch update completed successfully');
        }
        
        // Verification: Make a direct query to check if updates were applied
        if (exercisesToUpdate.length > 0) {
          const firstExercise = exercisesToUpdate[0];
          console.log('Verifying update for exercise ID:', firstExercise.id);
          
          const { data: verificationData, error: verificationError } = await supabase
            .from('workout_exercises')
            .select('*')
            .eq('id', firstExercise.id)
            .single();
            
          if (verificationError) {
            console.error('Verification error:', verificationError);
          } else {
            console.log('Verification data:', verificationData);
            console.log('Expected sets:', firstExercise.sets, 'Actual:', verificationData.sets);
            console.log('Expected reps:', firstExercise.reps, 'Actual:', verificationData.reps);
            console.log('Expected weight:', firstExercise.weight, 'Actual:', verificationData.weight);
            console.log('Expected sets_data:', firstExercise.sets_data, 'Actual:', verificationData.sets_data);
            
            // Additional fallback if verification fails
            if (verificationData.sets !== firstExercise.sets || 
                verificationData.reps !== firstExercise.reps || 
                verificationData.weight !== firstExercise.weight ||
                verificationData.sets_data !== firstExercise.sets_data) {
              console.log('⚠️ Verification failed, forcing direct update...');
              
              // Try a direct update to this specific exercise
              const { error: directUpdateError } = await supabase
                .from('workout_exercises')
                .update({
                  sets: firstExercise.sets,
                  reps: firstExercise.reps,
                  weight: firstExercise.weight,
                  sets_data: firstExercise.sets_data
                })
                .eq('id', firstExercise.id);
              
              if (directUpdateError) {
                console.error('❌ Direct update failed:', directUpdateError);
              } else {
                console.log('✅ Direct update succeeded');
              }
            }
          }
        }
      }
      
      // Handle pending exercises - insert them
      if (pendingExercises.length > 0) {
        const exercisesToInsert = pendingExercises.map(exercise => {
          const setsArr = editingSetsArray[exercise.id] || [{ reps: 10, weight: 0 }];
          
          // Calculate average reps and weight
          const totalReps = setsArr.reduce((sum, set) => sum + set.reps, 0);
          const totalWeight = setsArr.reduce((sum, set) => sum + set.weight, 0);
          const avgReps = Math.round(totalReps / setsArr.length);
          const avgWeight = Math.round(totalWeight / setsArr.length * 10) / 10;
          
          return {
            workout_id: workoutId,
            exercise_id: exercise.exercise_id,
            position: exercise.position,
            sets: setsArr.length,
            reps: avgReps,
            weight: avgWeight,
            sets_data: JSON.stringify(setsArr)
          };
        });
        
        console.log('Exercises to insert:', exercisesToInsert);
        
        const { data: insertedData, error: insertError } = await supabase
          .from('workout_exercises')
          .insert(exercisesToInsert)
          .select();
          
        if (insertError) {
          console.error('❌ Error inserting new exercises:', insertError);
          setError('Failed to add new exercises. Please try again.');
          setLoading(false);
          return;
        }
        
        console.log('✅ Inserted exercises:', insertedData);
      }
      
      // Reload exercises
      console.log('Reloading exercises after updates...');
      const { exercises: updatedExercises } = await getWorkoutWithExercises(workoutId);
      console.log('Updated exercises from database:', updatedExercises);
      
      setExercises(updatedExercises);
      
      // Recreate editing state array with real IDs and saved sets data if available
      const freshSetsArray: {[key: string]: { reps: number; weight: number; }[]} = {};
      updatedExercises.forEach(ex => {
        if (ex.sets_data) {
          try {
            // Try to parse the sets_data JSON if it exists
            freshSetsArray[ex.id] = JSON.parse(ex.sets_data);
          } catch (e) {
            // Fallback to creating sets from basic data if sets_data can't be parsed
            const sets = ex.sets || 1;
            const reps = ex.reps || 10;
            const weight = ex.weight || 0;
            freshSetsArray[ex.id] = Array.from({ length: sets }, () => ({ reps, weight }));
          }
        } else {
          // Use default data if sets_data doesn't exist
          const sets = ex.sets || 1;
          const reps = ex.reps || 10;
          const weight = ex.weight || 0;
          freshSetsArray[ex.id] = Array.from({ length: sets }, () => ({ reps, weight }));
        }
      });
      
      setEditingSetsArray(freshSetsArray);
      
      // Reset changes flag
      setHasChanges(false);
      console.log('✅ Exercise updates completed successfully');
    } catch (error) {
      console.error('❌ Error updating exercises:', error);
      setError('An unexpected error occurred while saving your changes. Please try again.');
    } finally {
      setLoading(false);
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
            exercises.map(exercise => {
              console.log('Rendering exercise:', exercise);
              console.log('Exercise details:', exercise.exercise);
              
              // Handle case where exercise might be returned as an array
              const exerciseData = Array.isArray(exercise.exercise) ? 
                exercise.exercise[0] : exercise.exercise;
              
              return (
              <div key={exercise.id} className="card flex flex-col rounded-lg bg-[#1E2128] border border-[#2C3038] shadow-sm">
                <div className="flex items-center justify-between px-4 py-3" onClick={() => handleToggleExpand(exercise.id)}>
                  <div>
                    <h3 className="font-medium text-base">{exerciseData?.name || 'Exercise'}</h3>
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
                    {exerciseData?.image_url && (
                      <img src={exerciseData.image_url} alt={exerciseData.name} className="w-full h-32 object-cover rounded mb-2" />
                    )}
                    {exerciseData?.description && (
                      <div className="text-xs text-[#9DA1A8] mb-2">{exerciseData.description}</div>
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
              );
            })
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-3">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {hasChanges && (
          <button 
            onClick={handleUpdateAllExercises}
            disabled={loading}
            className="w-full py-3.5 rounded-full text-base font-medium bg-gradient-to-b from-[#45D67B] to-[#2DCB6C] text-white shadow-lg flex justify-center items-center"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                SAVING...
              </>
            ) : (
              'SAVE CHANGES'
            )}
          </button>
        )}
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