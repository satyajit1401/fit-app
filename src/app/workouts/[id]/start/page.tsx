'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';

interface SetData {
  id: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutStartProps {
  params: {
    id: string;
  };
}

export default function WorkoutStartPage({ params }: WorkoutStartProps) {
  const router = useRouter();
  const workoutId = params.id;
  
  // Mock workout data
  const [workout, setWorkout] = useState({
    id: parseInt(workoutId),
    name: 'CHEST DAY',
    exercises: [
      {
        id: 7,
        name: 'Bench Press - Dumbbell',
        thumbnail: '/bench-press.jpg',
        sets: [
          { id: 1, reps: 12, weight: 37.5, completed: false },
          { id: 2, reps: 12, weight: 37.5, completed: false },
          { id: 3, reps: 12, weight: 37.5, completed: false },
        ]
      }
    ],
    startTime: new Date(),
    totalVolume: 0
  });
  
  const [restTimer, setRestTimer] = useState<number | null>(null);
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const calculateElapsedTime = () => {
    const now = new Date();
    const diffInMs = now.getTime() - workout.startTime.getTime();
    const diffInSec = Math.floor(diffInMs / 1000);
    return formatTime(diffInSec);
  };
  
  const markSetComplete = (exerciseId: number, setId: number) => {
    setWorkout(prev => {
      const newWorkout = { ...prev };
      const exercise = newWorkout.exercises.find(e => e.id === exerciseId);
      
      if (exercise) {
        const set = exercise.sets.find(s => s.id === setId);
        if (set) {
          set.completed = true;
          // Add to total volume
          newWorkout.totalVolume += set.reps * set.weight;
        }
      }
      
      return newWorkout;
    });
    
    // Start rest timer (60 seconds)
    setRestTimer(60);
    
    // Decrement timer
    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleAddSet = (exerciseId: number) => {
    setWorkout(prev => {
      const newWorkout = { ...prev };
      const exerciseIndex = newWorkout.exercises.findIndex(e => e.id === exerciseId);
      
      if (exerciseIndex >= 0) {
        const exercise = newWorkout.exercises[exerciseIndex];
        const lastSet = exercise.sets[exercise.sets.length - 1];
        
        exercise.sets.push({
          id: lastSet.id + 1,
          reps: lastSet.reps,
          weight: lastSet.weight,
          completed: false
        });
      }
      
      return newWorkout;
    });
  };
  
  const handleDeleteSet = (exerciseId: number, setId: number) => {
    setWorkout(prev => {
      const newWorkout = { ...prev };
      const exerciseIndex = newWorkout.exercises.findIndex(e => e.id === exerciseId);
      
      if (exerciseIndex >= 0) {
        const exercise = newWorkout.exercises[exerciseIndex];
        exercise.sets = exercise.sets.filter(s => s.id !== setId);
      }
      
      return newWorkout;
    });
  };
  
  const updateSetReps = (exerciseId: number, setId: number, newReps: number) => {
    setWorkout(prev => {
      const newWorkout = { ...prev };
      const exercise = newWorkout.exercises.find(e => e.id === exerciseId);
      
      if (exercise) {
        const set = exercise.sets.find(s => s.id === setId);
        if (set) {
          set.reps = newReps;
        }
      }
      
      return newWorkout;
    });
  };
  
  const updateSetWeight = (exerciseId: number, setId: number, newWeight: number) => {
    setWorkout(prev => {
      const newWorkout = { ...prev };
      const exercise = newWorkout.exercises.find(e => e.id === exerciseId);
      
      if (exercise) {
        const set = exercise.sets.find(s => s.id === setId);
        if (set) {
          set.weight = newWeight;
        }
      }
      
      return newWorkout;
    });
  };
  
  const handleFinishWorkout = () => {
    // In a real app, save the workout here
    router.push(`/workouts/${workoutId}/summary`);
  };
  
  return (
    <Layout 
      title={workout.name}
      backUrl={`/workouts/${workoutId}`}
      rightElement={
        <div className="flex flex-col items-end">
          <div className="text-accent text-xs">{calculateElapsedTime()}</div>
          <div className="text-xs text-text-light">{workout.totalVolume} kg</div>
        </div>
      }
    >
      {restTimer !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{restTimer}</div>
            <div className="text-text-light">Rest Timer</div>
            <button 
              className="mt-4 px-6 py-2 bg-card rounded-full text-white"
              onClick={() => setRestTimer(null)}
            >
              Skip
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-6 mb-24">
        {workout.exercises.map(exercise => (
          <div key={exercise.id} className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-600 rounded-md mr-4 overflow-hidden">
                  {exercise.thumbnail ? (
                    <img src={exercise.thumbnail} alt={exercise.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">W</div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-text-light">{exercise.sets.length} Sets</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-text-light text-sm mb-4">
                If lifting two dumbbells enter the combined weight of both.
              </div>
              
              <div className="flex justify-between mb-2">
                <div className="w-8"></div>
                <div className="w-1/3 text-center font-medium">REPS</div>
                <div className="w-1/3 text-center font-medium">WEIGHT (KG)</div>
                <div className="w-8"></div>
              </div>
              
              {exercise.sets.map((set, index) => (
                <div 
                  key={set.id} 
                  className={`flex items-center justify-between mb-2 p-2 ${set.completed ? 'bg-gray-700 bg-opacity-30 rounded-lg' : ''}`}
                  onClick={() => !set.completed && markSetComplete(exercise.id, set.id)}
                >
                  <div className="w-8 flex-shrink-0 text-text-light">{index + 1}</div>
                  
                  <div className="w-1/3 px-1">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSetReps(exercise.id, set.id, parseInt(e.target.value))}
                      className="w-full bg-card text-center py-2 rounded-lg"
                      disabled={set.completed}
                    />
                  </div>
                  
                  <div className="w-1/3 px-1">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => updateSetWeight(exercise.id, set.id, parseFloat(e.target.value))}
                      className="w-full bg-card text-center py-2 rounded-lg"
                      disabled={set.completed}
                      step="0.5"
                    />
                  </div>
                  
                  <button 
                    className="w-8 flex-shrink-0 text-text-light"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSet(exercise.id, set.id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button 
                className="w-full py-3 mt-2 flex items-center justify-center text-accent border border-accent rounded-lg"
                onClick={() => handleAddSet(exercise.id)}
              >
                ADD SET <span className="ml-2">+</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="fixed bottom-20 left-0 w-full p-4">
        <button className="btn-primary" onClick={handleFinishWorkout}>FINISH WORKOUT</button>
      </div>
    </Layout>
  );
} 