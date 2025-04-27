'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';

interface WorkoutSummaryProps {
  params: {
    id: string;
  };
}

export default function WorkoutSummaryPage({ params }: WorkoutSummaryProps) {
  const router = useRouter();
  const workoutId = params.id;
  
  // Mock workout summary data
  const workoutSummary = {
    id: parseInt(workoutId),
    name: 'CHEST DAY',
    duration: '32:15',
    totalVolume: 1350,
    exercises: [
      {
        id: 7,
        name: 'Bench Press - Dumbbell',
        sets: 3,
        totalVolume: 1350,
        isPR: true
      }
    ]
  };
  
  const handleDone = () => {
    router.push('/workouts');
  };
  
  return (
    <Layout title="WORKOUT COMPLETE" backUrl="/workouts">
      <div className="space-y-6 mb-24">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">{workoutSummary.name}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background rounded-lg p-4 text-center">
              <div className="text-accent text-xl font-bold">{workoutSummary.duration}</div>
              <div className="text-text-light text-sm">Duration</div>
            </div>
            <div className="bg-background rounded-lg p-4 text-center">
              <div className="text-accent text-xl font-bold">{workoutSummary.totalVolume} kg</div>
              <div className="text-text-light text-sm">Total Volume</div>
            </div>
          </div>
          
          <h3 className="text-lg font-bold mb-2">Exercises</h3>
          
          {workoutSummary.exercises.map(exercise => (
            <div key={exercise.id} className="border-t border-gray-700 py-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-medium">{exercise.name}</h4>
                  <p className="text-text-light text-sm">{exercise.sets} sets</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{exercise.totalVolume} kg</div>
                  {exercise.isPR && (
                    <span className="text-accent text-sm">NEW PR!</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button className="btn-secondary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            SHARE WORKOUT
          </button>
        </div>
      </div>
      
      <div className="fixed bottom-20 left-0 w-full p-4">
        <button className="btn-primary" onClick={handleDone}>DONE</button>
      </div>
    </Layout>
  );
} 