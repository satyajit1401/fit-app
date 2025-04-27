'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Mock data for exercises
const exercisesList = [
  { id: 1, name: 'Arnold Press - Seated - Dumbbell', equipment: 'Dumbbell', group: 'A' },
  { id: 2, name: 'Around the World - Dumbbell', equipment: 'Dumbbell', group: 'A' },
  { id: 3, name: 'Assault Bike', equipment: 'Machine', group: 'A' },
  { id: 4, name: 'Back Extensions', equipment: 'Machine', group: 'B' },
  { id: 5, name: 'Back Squat - Barbell', equipment: 'Barbell', group: 'B' },
  { id: 6, name: 'Back Squat - Concentric - Barbell', equipment: 'Barbell', group: 'B' },
  { id: 7, name: 'Bench Press - Dumbbell', equipment: 'Dumbbell', group: 'C' },
];

export default function ExercisesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredExercises = exercisesList.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group exercises by first letter for alphabetical listing
  const groupedExercises: Record<string, typeof exercisesList> = {};
  
  filteredExercises.forEach(exercise => {
    if (!groupedExercises[exercise.group]) {
      groupedExercises[exercise.group] = [];
    }
    groupedExercises[exercise.group].push(exercise);
  });

  const handleAddExercise = (exerciseId: number) => {
    // In a real app, would add this exercise to the workout
    // For now, just navigate back to the workout page
    router.back();
  };
  
  const bottomActions = (
    <div className="fixed bottom-0 left-0 w-full p-4 grid grid-cols-2 gap-4 bg-background">
      <button className="btn-secondary">SUPERSET</button>
      <button className="btn-primary">ADD</button>
    </div>
  );
  
  return (
    <Layout title="SELECT EXERCISES" backUrl="/workouts" bottomElement={bottomActions}>
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 bg-card rounded-xl border-none text-white"
            placeholder="Search for an exercise..."
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
      </div>
      
      <div className="mb-4 card border border-dashed border-text-light">
        <button className="w-full flex items-center p-2">
          <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-lg">Add Custom Exercise</span>
        </button>
      </div>
      
      <div className="space-y-4 mb-32">
        {Object.keys(groupedExercises).sort().map(group => (
          <div key={group}>
            <h2 className="text-xl font-bold mb-2">{group}</h2>
            <div className="space-y-2">
              {groupedExercises[group].map(exercise => (
                <div 
                  key={exercise.id}
                  className="card flex items-center justify-between p-4"
                  onClick={() => handleAddExercise(exercise.id)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center mr-4">
                      {exercise.equipment === 'Dumbbell' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                      ) : (
                        <span>W</span>
                      )}
                    </div>
                    <span>{exercise.name}</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-text-light border border-text-light">
                    i
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
} 