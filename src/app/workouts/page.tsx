'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { getWorkouts, Workout } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;
  
  const { user, refreshSession } = useAuth();
  
  const fetchWorkouts = async (pageToFetch = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure user is authenticated
      if (!user) {
        await refreshSession();
        return;
      }
      
      const data = await getWorkouts({ page: pageToFetch, pageSize });
      
      if (pageToFetch === 0) {
        setWorkouts(data);
      } else {
        setWorkouts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === pageSize);
      setPage(pageToFetch);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data load
  useEffect(() => {
    if (user) {
      fetchWorkouts(0);
    }
  }, [user]);
  
  // Load more function
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchWorkouts(page + 1);
    }
  };
  
  // Retry handler
  const handleRetry = () => {
    fetchWorkouts(0);
  };
  
  return (
    <Layout title="STRENGTH TRAINER">
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <div className="flex-1 pb-2 text-center text-[#45D67B] border-b-2 border-[#45D67B] font-medium">
            MY WORKOUTS
          </div>
        </div>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 mb-4">
          <p className="text-red-200 mb-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-red-800 text-white py-1 px-3 rounded-md text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Workouts list */}
      <div className="flex flex-col gap-3">
        {/* Initial loading state */}
        {loading && page === 0 && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[#1E2128]/50 border border-[#2C3038] h-[52px] rounded-lg"></div>
            ))}
          </div>
        )}
        
        {/* Workouts list */}
        {workouts.map(workout => (
          <Link href={`/workouts/${workout.id}`} key={workout.id} className="block">
            <div className="card flex items-center justify-between px-4 py-3 rounded-lg min-h-[52px] bg-[#1E2128] border border-[#2C3038] shadow-sm">
              <span className="font-medium text-base">{workout.name}</span>
              <span className="text-[#9DA1A8] text-lg">⋯</span>
            </div>
          </Link>
        ))}
        
        {/* Empty state */}
        {!loading && workouts.length === 0 && (
          <div className="text-center text-[#9DA1A8] py-10">
            No workouts found. Create your first workout!
          </div>
        )}
        
        {/* Load more button */}
        {!loading && hasMore && workouts.length > 0 && (
          <button 
            onClick={loadMore}
            className="mt-4 py-2 w-full border border-[#2C3038] rounded-lg text-[#9DA1A8] hover:bg-[#1E2128]"
          >
            Load More
          </button>
        )}
        
        {/* Load more loading indicator */}
        {loading && page > 0 && (
          <div className="text-center py-4">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Create new workout button */}
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