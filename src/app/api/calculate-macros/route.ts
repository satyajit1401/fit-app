import { NextResponse } from 'next/server';

type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance';

interface UserDetails {
  height: number;
  weight: number;
  goalWeight: number;
  timeToAchieve: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';
  goal: Goal;
}

export async function POST(request: Request) {
  try {
    const userDetails: UserDetails = await request.json();

    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = calculateBMR(userDetails);
    const tdee = calculateTDEE(bmr, userDetails.activityLevel);
    
    // Calculate weekly deficit/surplus
    const weeklyChange = calculateWeeklyDeficit(userDetails);
    const dailyCalorieAdjustment = weeklyChange / 7;
    
    // Set target calories based on TDEE and goal
    const targetCalories = Math.round(tdee + dailyCalorieAdjustment);

    // Calculate macros based on goal
    const { protein, carbs, fat } = calculateMacrosForGoal(targetCalories, userDetails.weight, userDetails.goal);

    const response = {
      targetCalories,
      targetProtein: protein,
      targetCarbs: carbs,
      targetFat: fat,
      weeklyWeightTargets: calculateWeeklyTargets(userDetails),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating macros:', error);
    return NextResponse.json(
      { error: 'Failed to calculate macros' },
      { status: 500 }
    );
  }
}

function calculateBMR(details: UserDetails): number {
  // Mifflin-St Jeor Equation
  const base = (10 * details.weight) + (6.25 * details.height) - (5 * details.age);
  return details.gender === 'male' ? base + 5 : base - 161;
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
    extra: 1.9,
  };
  return bmr * multipliers[activityLevel as keyof typeof multipliers];
}

function calculateWeeklyDeficit(details: UserDetails): number {
  const weightDiff = details.goalWeight - details.weight; // Note: positive for gain, negative for loss
  const weeks = details.timeToAchieve;
  // 7700 calories = 1kg of fat
  return (weightDiff * 7700) / weeks;
}

function calculateMacrosForGoal(calories: number, weight: number, goal: Goal) {
  // Calculate protein based on body weight (2.0-2.2g per kg)
  const proteinMultiplier = goal === 'fat_loss' ? 2.2 : 2.0;
  const protein = Math.round(weight * proteinMultiplier);
  
  // Calculate fat (0.8-1g per kg)
  const fatMultiplier = goal === 'fat_loss' ? 0.8 : 1.0;
  const fat = Math.round(weight * fatMultiplier);
  
  // Calculate remaining calories for carbs
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(remainingCalories / 4);

  return {
    protein,
    carbs,
    fat,
  };
}

function calculateWeeklyTargets(details: UserDetails): number[] {
  const weightDiff = details.weight - details.goalWeight;
  const weeklyChange = weightDiff / details.timeToAchieve;
  const targets = [];
  
  let currentWeight = details.weight;
  for (let i = 0; i < details.timeToAchieve; i++) {
    currentWeight -= weeklyChange;
    targets.push(Math.round(currentWeight * 10) / 10);
  }
  
  return targets;
} 