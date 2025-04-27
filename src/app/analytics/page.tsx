'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('workout');
  const [timeframe, setTimeframe] = useState('7');
  
  // Mock analytics data
  const workoutAnalytics = {
    totalWorkouts: 12,
    totalVolume: 24600,
    avgDuration: 48,
    prCount: 5,
    volumeByDay: [
      { date: '2023-01-01', volume: 2100 },
      { date: '2023-01-02', volume: 0 },
      { date: '2023-01-03', volume: 2350 },
      { date: '2023-01-04', volume: 0 },
      { date: '2023-01-05', volume: 2500 },
      { date: '2023-01-06', volume: 0 },
      { date: '2023-01-07', volume: 2300 }
    ]
  };
  
  const nutritionAnalytics = {
    avgCalories: 2250,
    calorieCompliance: 86,
    proteinAvg: 165,
    carbsAvg: 220,
    fatAvg: 70,
    waterCompliance: 72,
    fullyLoggedDays: 5,
    caloriesByDay: [
      { date: '2023-01-01', calories: 2300, target: 2500 },
      { date: '2023-01-02', calories: 2200, target: 2500 },
      { date: '2023-01-03', calories: 2400, target: 2500 },
      { date: '2023-01-04', calories: 2150, target: 2500 },
      { date: '2023-01-05', calories: 2250, target: 2500 },
      { date: '2023-01-06', calories: 2300, target: 2500 },
      { date: '2023-01-07', calories: 2150, target: 2500 }
    ]
  };
  
  return (
    <Layout title="ANALYTICS">
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 pb-2 text-center ${
              activeTab === 'workout' ? 'text-accent border-b-2 border-accent font-medium' : 'text-text-light'
            }`}
            onClick={() => setActiveTab('workout')}
          >
            WORKOUT
          </button>
          <button
            className={`flex-1 pb-2 text-center ${
              activeTab === 'nutrition' ? 'text-accent border-b-2 border-accent font-medium' : 'text-text-light'
            }`}
            onClick={() => setActiveTab('nutrition')}
          >
            NUTRITION
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="w-full p-3 bg-card rounded-xl border border-gray-700 text-white appearance-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="14">Last 14 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>
      
      {activeTab === 'workout' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">Total Workouts</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.totalWorkouts}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">Volume Lifted</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.totalVolume} kg</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">Avg Duration</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.avgDuration} min</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-text-light mb-1">New PRs</div>
              <div className="text-2xl font-bold text-accent">{workoutAnalytics.prCount}</div>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4">Workout Volume Trend</h3>
            <div className="h-48 flex items-end space-x-2">
              {workoutAnalytics.volumeByDay.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-text-light mb-1">{day.volume > 0 ? day.volume : ''}</div>
                  <div 
                    className={`w-full ${day.volume > 0 ? 'bg-accent' : 'bg-gray-700'} rounded-t-sm`} 
                    style={{ height: `${day.volume > 0 ? (day.volume / 3000 * 100) : 5}%` }}
                  ></div>
                  <div className="text-xs text-text-light mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4">Recent Personal Records</h3>
            <div className="space-y-4">
              <div className="flex justify-between p-2 border-b border-gray-700">
                <div>
                  <div className="font-medium">Bench Press - Dumbbell</div>
                  <div className="text-text-light">40kg × 10 reps</div>
                </div>
                <div className="flex items-center">
                  <span className="text-accent">+2.5kg</span>
                </div>
              </div>
              <div className="flex justify-between p-2 border-b border-gray-700">
                <div>
                  <div className="font-medium">Back Squat - Barbell</div>
                  <div className="text-text-light">100kg × 8 reps</div>
                </div>
                <div className="flex items-center">
                  <span className="text-accent">+5kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#2A3035" 
                    strokeWidth="10" 
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#2ECB70" 
                    strokeWidth="10" 
                    strokeDasharray="283" 
                    strokeDashoffset={283 - (283 * nutritionAnalytics.calorieCompliance / 100)} 
                    transform="rotate(-90 50 50)" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-accent">{nutritionAnalytics.calorieCompliance}%</div>
                  <div className="text-text-light text-sm">Compliance</div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-text-light">Well done! You stayed within range {nutritionAnalytics.fullyLoggedDays} of 7 days.</p>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4">Macro Split</h3>
            <div className="flex space-x-1 h-6 mb-3">
              <div 
                className="bg-green-500 rounded-l-full" 
                style={{ width: `${(nutritionAnalytics.proteinAvg * 4) / ((nutritionAnalytics.proteinAvg * 4) + (nutritionAnalytics.carbsAvg * 4) + (nutritionAnalytics.fatAvg * 9)) * 100}%` }}
              ></div>
              <div 
                className="bg-blue-500" 
                style={{ width: `${(nutritionAnalytics.carbsAvg * 4) / ((nutritionAnalytics.proteinAvg * 4) + (nutritionAnalytics.carbsAvg * 4) + (nutritionAnalytics.fatAvg * 9)) * 100}%` }}
              ></div>
              <div 
                className="bg-yellow-500 rounded-r-full" 
                style={{ width: `${(nutritionAnalytics.fatAvg * 9) / ((nutritionAnalytics.proteinAvg * 4) + (nutritionAnalytics.carbsAvg * 4) + (nutritionAnalytics.fatAvg * 9)) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-text-light">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Protein {Math.round((nutritionAnalytics.proteinAvg * 4) / ((nutritionAnalytics.proteinAvg * 4) + (nutritionAnalytics.carbsAvg * 4) + (nutritionAnalytics.fatAvg * 9)) * 100)}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                <span>Carbs {Math.round((nutritionAnalytics.carbsAvg * 4) / ((nutritionAnalytics.proteinAvg * 4) + (nutritionAnalytics.carbsAvg * 4) + (nutritionAnalytics.fatAvg * 9)) * 100)}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span>Fat {Math.round((nutritionAnalytics.fatAvg * 9) / ((nutritionAnalytics.proteinAvg * 4) + (nutritionAnalytics.carbsAvg * 4) + (nutritionAnalytics.fatAvg * 9)) * 100)}%</span>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4">Daily Calories</h3>
            <div className="h-48 flex items-end space-x-2">
              {nutritionAnalytics.caloriesByDay.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-text-light mb-1">{Math.round(day.calories / 100) * 100}</div>
                  <div 
                    className={`w-full ${day.calories <= day.target ? 'bg-green-500' : 'bg-red-500'} rounded-t-sm`} 
                    style={{ height: `${(day.calories / 3000) * 100}%` }}
                  ></div>
                  <div className="text-xs text-text-light mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-4">
            <h3 className="text-lg font-bold mb-4">Water Intake Compliance</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2A3035"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="10"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * nutritionAnalytics.waterCompliance / 100)}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute text-xl font-bold text-blue-400">{nutritionAnalytics.waterCompliance}%</div>
              </div>
            </div>
            <div className="text-center text-text-light">
              <p>Aim to drink at least 3L every day.</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 