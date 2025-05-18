'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export default function CreateWorkoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Custom');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a workout name');
      return;
    }
    
    if (!user) {
      setError('You must be logged in to create a workout');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Create the workout using Supabase
      const { data, error } = await supabase
        .from('workouts')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            type: type || 'Custom',
            difficulty: difficulty || 'Intermediate',
            user_id: user.id
          }
        ])
        .select();
      
      if (error) {
        console.error('Error creating workout:', error);
        setError('Failed to create workout. Please try again.');
        return;
      }
      
      console.log('Workout created successfully:', data);
      
      // Navigate to the new workout
      if (data && data.length > 0) {
        router.push(`/workouts/${data[0].id}`);
      } else {
        router.push('/workouts');
      }
    } catch (err) {
      console.error('Error creating workout:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
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