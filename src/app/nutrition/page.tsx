'use client';

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';

export default function NutritionPage() {
  const [date, setDate] = useState(new Date());
  
  // Mock nutrition data
  const nutritionData = {
    targetCalories: 2500,
    targetProtein: 180,
    targetCarbs: 250,
    targetFat: 80,
    targetWater: 3000, // ml
    
    consumedCalories: 1850,
    consumedProtein: 120,
    consumedCarbs: 180,
    consumedFat: 65,
    consumedWater: 2000, // ml
    
    meals: [
      {
        id: 1,
        name: 'Breakfast',
        time: '08:30',
        calories: 550,
        protein: 35,
        carbs: 60,
        fat: 20,
        items: [
          { id: 1, name: 'Oatmeal with Berries', quantity: 1, calories: 300 },
          { id: 2, name: 'Protein Shake', quantity: 1, calories: 250 }
        ]
      },
      {
        id: 2,
        name: 'Lunch',
        time: '13:00',
        calories: 700,
        protein: 45,
        carbs: 70,
        fat: 25,
        items: [
          { id: 3, name: 'Chicken Salad', quantity: 1, calories: 450 },
          { id: 4, name: 'Brown Rice', quantity: 1, calories: 200 },
          { id: 5, name: 'Greek Yogurt', quantity: 1, calories: 50 }
        ]
      },
      {
        id: 3,
        name: 'Snack',
        time: '16:30',
        calories: 300,
        protein: 15,
        carbs: 30,
        fat: 10,
        items: [
          { id: 6, name: 'Protein Bar', quantity: 1, calories: 200 },
          { id: 7, name: 'Apple', quantity: 1, calories: 100 }
        ]
      },
      {
        id: 4,
        name: 'Dinner',
        time: '19:00',
        calories: 300,
        protein: 25,
        carbs: 20,
        fat: 10,
        items: [
          { id: 8, name: 'Grilled Salmon', quantity: 1, calories: 300 }
        ]
      }
    ]
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  const calculatePercentage = (consumed: number, target: number) => {
    return Math.min(Math.round((consumed / target) * 100), 100);
  };
  
  const formatMacro = (value: number) => {
    return value.toFixed(0) + 'g';
  };
  
  const rightElement = (
    <Link href="/nutrition/add-meal">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </Link>
  );
  
  return (
    <Layout title="NUTRITION" rightElement={rightElement}>
      <div className="mb-6">
        <h2 className="text-center text-xl font-medium">{formatDate(date)}</h2>
      </div>
      
      <div className="card p-5 mb-6">
        <div className="flex justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Daily Targets</h3>
          </div>
          <div className="text-text-light">
            <span className="text-accent font-bold">{nutritionData.consumedCalories}</span>
            {' / '}
            {nutritionData.targetCalories} cal
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Calories</span>
            <span>{calculatePercentage(nutritionData.consumedCalories, nutritionData.targetCalories)}%</span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full" 
              style={{ width: `${calculatePercentage(nutritionData.consumedCalories, nutritionData.targetCalories)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xs text-text-light mb-1">Protein</div>
            <div className="font-medium">
              <span className="text-accent">{formatMacro(nutritionData.consumedProtein)}</span>
              {' / '}
              {formatMacro(nutritionData.targetProtein)}
            </div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xs text-text-light mb-1">Carbs</div>
            <div className="font-medium">
              <span className="text-accent">{formatMacro(nutritionData.consumedCarbs)}</span>
              {' / '}
              {formatMacro(nutritionData.targetCarbs)}
            </div>
          </div>
          <div className="bg-background rounded-lg p-3 text-center">
            <div className="text-xs text-text-light mb-1">Fat</div>
            <div className="font-medium">
              <span className="text-accent">{formatMacro(nutritionData.consumedFat)}</span>
              {' / '}
              {formatMacro(nutritionData.targetFat)}
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Water</span>
            <span>{nutritionData.consumedWater} / {nutritionData.targetWater} ml</span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full" 
              style={{ width: `${calculatePercentage(nutritionData.consumedWater, nutritionData.targetWater)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mb-20">
        <h3 className="text-lg font-medium">Today's Meals</h3>
        
        {nutritionData.meals.map(meal => (
          <div key={meal.id} className="card">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h4 className="font-medium">{meal.name}</h4>
                <div className="text-text-light text-sm">{meal.time}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{meal.calories} cal</div>
                <div className="text-text-light text-xs">
                  P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {meal.items.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                  <div>{item.name}</div>
                  <div className="text-text-light">{item.calories} cal</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <Link href="/nutrition/add-meal">
          <button className="w-full py-4 flex items-center justify-center text-accent font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            ADD MEAL
          </button>
        </Link>
      </div>
    </Layout>
  );
} 