'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

interface WorkoutDetailsProps {
  params: {
    id: string;
  };
}

export default function WorkoutDetailsPage({ params }: WorkoutDetailsProps) {
  const router = useRouter();
  const workoutId = params.id;
  
  // Mock workout details
  const workout = {
    id: parseInt(workoutId),
    name: 'CHEST DAY',
    exercises: [
      {
        id: 7,
        name: 'Bench Press - Dumbbell',
        sets: 3,
        thumbnail: '/bench-press.jpg'
      }
    ]
  };
  
  const rightElement = (
    <button>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
    </button>
  );
  
  return (
    <Layout title={workout.name} backUrl="/workouts" rightElement={rightElement}>
      <div className="space-y-4 mb-6">
        {workout.exercises.map(exercise => (
          <div key={exercise.id} className="card">
            <div className="flex items-center justify-between p-4">
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
                  <p className="text-text-light">{exercise.sets} Sets</p>
                </div>
              </div>
              <button className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        
        <button className="w-full py-4 flex items-center justify-center text-accent font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          ADD EXERCISE
        </button>
      </div>
      
      <div className="mt-auto">
        <Link href={`/workouts/${workoutId}/start`}>
          <button className="btn-primary">START WORKOUT</button>
        </Link>
      </div>
    </Layout>
  );
} 