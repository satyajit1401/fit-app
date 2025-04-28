'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { clearCache, CACHE_KEYS } from '@/lib/cache';

export default function CreateWorkoutPage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a workout name');
      return;
    }
    
    if (!user) {
      setError('You need to be logged in to create a workout');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create a new workout in the database
      const { data, error: supabaseError } = await supabase
        .from('workouts')
        .insert([
          { 
            name: name.trim(),
            user_id: user.id,
            description: '',
            is_public: true
          }
        ])
        .select()
        .single();
      
      if (supabaseError) throw supabaseError;
      
      // Clear the workouts cache to ensure fresh data is loaded
      clearCache(CACHE_KEYS.WORKOUTS);
      
      // Redirect to the new workout page
      router.push(`/workouts/${data.id}`);
    } catch (err) {
      console.error('Error creating workout:', err);
      setError('Failed to create workout. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <Layout title="CREATE WORKOUT" backUrl="/workouts">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1">
          <div className="mb-6">
            <label className="block text-text-light mb-2" htmlFor="workout-name">
              WORKOUT NAME
            </label>
            <input
              id="workout-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Upper Body Strength"
              className="w-full bg-card-bg text-white border border-gray-700 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
            />
            {error && (
              <p className="text-red-500 mt-2">{error}</p>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? 'CREATING...' : 'CREATE WORKOUT'}
          </button>
        </div>
      </form>
    </Layout>
  );
} 