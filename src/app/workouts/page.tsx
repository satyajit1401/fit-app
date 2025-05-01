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
  
  return (
    <Layout title="STRENGTH TRAINER">
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <div className="flex-1 pb-2 text-center text-[#45D67B] border-b-2 border-[#45D67B] font-medium">
            MY WORKOUTS
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {loading && (
          <div className="text-center py-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        )}
        {!loading && workouts.length > 0 && workouts.map(workout => (
          <Link href={`/workouts/${workout.id}`} key={workout.id} className="block">
            <div className="card flex items-center justify-between px-4 py-3 rounded-lg min-h-[52px] bg-[#1E2128] border border-[#2C3038] shadow-sm">
              <span className="font-medium text-base">{workout.name}</span>
              <span className="text-[#9DA1A8] text-lg">⋯</span>
            </div>
          </Link>
        ))}
        {!loading && workouts.length === 0 && (
          <div className="text-center text-[#9DA1A8] py-10">
            No workouts found. Create your first workout!
          </div>
        )}
      </div>
      <div className="mt-10">
        <Link href="/workouts/create">
          <button className="w-full py-3.5 rounded-full text-base font-medium bg-gradient-to-b from-[#45D67B] to-[#2DCB6C] text-white shadow-lg">
            CREATE NEW WORKOUT
          </button>
        </Link>
      </div>
    </Layout>
  );
} 