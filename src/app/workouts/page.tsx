'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function WorkoutsPage() {
  const [activeTab, setActiveTab] = useState('my');
  
  // Mock data for workouts
  const myWorkouts = [
    { id: 1, name: 'CHEST DAY' },
    { id: 2, name: 'LEG DAY' },
    { id: 3, name: 'BACK & BICEPS' },
  ];
  
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
          <button
            className={`flex-1 pb-2 text-center ${
              activeTab === 'whoop' ? 'text-accent border-b-2 border-accent font-medium' : 'text-text-light'
            }`}
            onClick={() => setActiveTab('whoop')}
          >
            WHOOP WORKOUTS
          </button>
          <button
            className={`flex-1 pb-2 text-center ${
              activeTab === 'my' ? 'text-accent border-b-2 border-accent font-medium' : 'text-text-light'
            }`}
            onClick={() => setActiveTab('my')}
          >
            MY WORKOUTS
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {activeTab === 'my' && myWorkouts.map(workout => (
          <Link href={`/workouts/${workout.id}`} key={workout.id}>
            <div className="card flex items-center justify-between p-6">
              <span className="font-medium">{workout.name}</span>
              <span className="text-text-light">⋯</span>
            </div>
          </Link>
        ))}
        
        {activeTab === 'whoop' && (
          <div className="text-center text-text-light py-10">
            No WHOOP workouts available
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <Link href="/workouts/quick-start">
          <button className="btn-primary">CREATE NEW WORKOUT</button>
        </Link>
      </div>
    </Layout>
  );
} 