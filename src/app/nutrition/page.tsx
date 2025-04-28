'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getNutritionLogs, NutritionLog } from '@/lib/api';

interface MealGroup {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: NutritionLog[];
}

export default function NutritionPage() {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const { user } = useAuth();

  // Target nutrition values - these would normally come from user settings
  const targetNutrition = {
    targetCalories: 2500,
    targetProtein: 180,
    targetCarbs: 250,
    targetFat: 80,
    targetWater: 3000, // ml
  };
  
  useEffect(() => {
    const fetchNutritionData = async () => {
      setLoading(true);
      if (user) {
        const formattedDate = date.toISOString().split('T')[0];
        const logs = await getNutritionLogs(formattedDate);
        setNutritionLogs(logs);
      }
      setLoading(false);
    };
    
    fetchNutritionData();
  }, [user, date]);
  
  // Calculate total nutrition values
  const totals = nutritionLogs.reduce((acc, item) => {
    return {
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fats || 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Group nutrition logs by meal type
  const mealGroups = nutritionLogs.reduce<Record<string, MealGroup>>((acc, item) => {
    const mealType = item.meal_type || 'Other';
    
    if (!acc[mealType]) {
      acc[mealType] = {
        name: mealType,
        time: '12:00', // Default time
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        items: []
      };
    }
    
    acc[mealType].calories += item.calories || 0;
    acc[mealType].protein += item.protein || 0;
    acc[mealType].carbs += item.carbs || 0;
    acc[mealType].fat += item.fats || 0;
    acc[mealType].items.push(item);
    
    return acc;
  }, {});
  
  const meals = Object.values(mealGroups);
  
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
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="card p-5 mb-6">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium">Daily Targets</h3>
              </div>
              <div className="text-text-light">
                <span className="text-accent font-bold">{totals.calories}</span>
                {' / '}
                {targetNutrition.targetCalories} cal
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Calories</span>
                <span>{calculatePercentage(totals.calories, targetNutrition.targetCalories)}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full" 
                  style={{ width: `${calculatePercentage(totals.calories, targetNutrition.targetCalories)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-background rounded-lg p-3 text-center">
                <div className="text-xs text-text-light mb-1">Protein</div>
                <div className="font-medium">
                  <span className="text-accent">{formatMacro(totals.protein)}</span>
                  {' / '}
                  {formatMacro(targetNutrition.targetProtein)}
                </div>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <div className="text-xs text-text-light mb-1">Carbs</div>
                <div className="font-medium">
                  <span className="text-accent">{formatMacro(totals.carbs)}</span>
                  {' / '}
                  {formatMacro(targetNutrition.targetCarbs)}
                </div>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <div className="text-xs text-text-light mb-1">Fat</div>
                <div className="font-medium">
                  <span className="text-accent">{formatMacro(totals.fat)}</span>
                  {' / '}
                  {formatMacro(targetNutrition.targetFat)}
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Water</span>
                <span>0 / {targetNutrition.targetWater} ml</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full" 
                  style={{ width: `0%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-20">
            <h3 className="text-lg font-medium">Today's Meals</h3>
            
            {meals.length > 0 ? (
              meals.map((meal, index) => (
                <div key={index} className="card">
                  <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{meal.name}</h4>
                      <div className="text-text-light text-sm">{meal.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{meal.calories} cal</div>
                      <div className="text-text-light text-xs">
                        P: {meal.protein.toFixed(0)}g · C: {meal.carbs.toFixed(0)}g · F: {meal.fat.toFixed(0)}g
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {meal.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between py-2 border-b border-gray-700 last:border-0">
                        <div>{item.food_item}</div>
                        <div className="text-text-light">{item.calories} cal</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-text-light py-10">
                No meals logged for today. Start tracking your nutrition!
              </div>
            )}
            
            <Link href="/nutrition/add-meal">
              <button className="w-full py-4 flex items-center justify-center text-accent font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                ADD MEAL
              </button>
            </Link>
          </div>
        </>
      )}
    </Layout>
  );
} 