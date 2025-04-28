'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { getWorkouts, Workout } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      setLoading(true);
      const data = await getWorkouts();
      setWorkouts(data);
      setLoading(false);
    };
    
    if (user) {
      fetchWorkouts();
    }
  }, [user]);
  
  const rightElement = (
    <Link href="/workouts/create">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </Link>
  );
  
  return (
    <Layout title="STRENGTH TRAINER" rightElement={rightElement}>
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <div className="flex-1 pb-2 text-center text-accent border-b-2 border-accent font-medium">
            MY WORKOUTS
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        )}
        
        {!loading && workouts.length > 0 && workouts.map(workout => (
          <Link href={`/workouts/${workout.id}`} key={workout.id}>
            <div className="card flex items-center justify-between p-6">
              <span className="font-medium">{workout.name}</span>
              <span className="text-text-light">⋯</span>
            </div>
          </Link>
        ))}
        
        {!loading && workouts.length === 0 && (
          <div className="text-center text-text-light py-10">
            No workouts found. Create your first workout!
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <Link href="/workouts/create">
          <button className="btn-primary">CREATE NEW WORKOUT</button>
        </Link>
      </div>
    </Layout>
  );
} 