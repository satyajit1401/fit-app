'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';

export default function CustomExercisePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trackMuscularLoad: false,
    linkedExercise: '',
    equipment: '',
    muscleGroup: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save the exercise to the database
    router.back();
  };
  
  const infoIcon = (
    <button className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-text-light">
      <span className="text-text-light">i</span>
    </button>
  );
  
  return (
    <Layout title="CUSTOM EXERCISE" backUrl="/workouts/exercises">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 mb-24">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-text-light mb-1">EXERCISE NAME</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name your custom exercise"
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-text-light mb-1">DESCRIPTION</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a brief description of your custom exercise here."
                className="input-field h-32 resize-none"
              />
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Track Muscular Load</h2>
              {infoIcon}
            </div>
            
            <p className="text-text-light mb-6">
              In order to provide accurate Muscular Load, you can link your
              custom exercise to a similar existing exercise.
            </p>
            
            <button 
              type="button" 
              className="w-full p-4 bg-card border border-text-light rounded-xl flex justify-between items-center"
              onClick={() => router.push('/workouts/custom-exercise/link')}
            >
              <span>LINK AN EXERCISE</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="equipment" className="block text-text-light mb-1">EQUIPMENT</label>
              <div className="relative">
                <select
                  id="equipment"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  className="input-field appearance-none pr-10"
                  required
                >
                  <option value="" disabled>SELECT EQUIPMENT</option>
                  <option value="barbell">Barbell</option>
                  <option value="dumbbell">Dumbbell</option>
                  <option value="machine">Machine</option>
                  <option value="bodyweight">Bodyweight</option>
                  <option value="cable">Cable</option>
                  <option value="kettlebell">Kettlebell</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-text-light">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="muscleGroup" className="block text-text-light mb-1">MUSCLE GROUP</label>
              <div className="relative">
                <select
                  id="muscleGroup"
                  name="muscleGroup"
                  value={formData.muscleGroup}
                  onChange={handleChange}
                  className="input-field appearance-none pr-10"
                  required
                >
                  <option value="" disabled>SELECT MUSCLE GROUP</option>
                  <option value="chest">Chest</option>
                  <option value="back">Back</option>
                  <option value="legs">Legs</option>
                  <option value="shoulders">Shoulders</option>
                  <option value="arms">Arms</option>
                  <option value="core">Core</option>
                  <option value="cardio">Cardio</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-text-light">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="fixed bottom-20 left-0 w-full p-4">
          <button type="submit" className="btn-primary">SAVE TO LIBRARY</button>
        </div>
      </form>
    </Layout>
  );
} 