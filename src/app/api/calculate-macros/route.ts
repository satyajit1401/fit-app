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
    
    // Adjust calories based on goal
    let dailyCalories = adjustCaloriesForGoal(tdee, userDetails.goal);
    
    // If fat loss or muscle gain, consider the target weight
    if (userDetails.goal !== 'maintenance') {
      const weeklyDeficit = calculateWeeklyDeficit(userDetails);
      dailyCalories = Math.round(dailyCalories - (weeklyDeficit / 7));
    }

    // Calculate macros based on goal
    const { protein, carbs, fat } = calculateMacrosForGoal(dailyCalories, userDetails.weight, userDetails.goal);

    const response = {
      targetCalories: dailyCalories,
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
  const base = 10 * details.weight + 6.25 * details.height - 5 * details.age;
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

function adjustCaloriesForGoal(tdee: number, goal: Goal): number {
  switch (goal) {
    case 'fat_loss':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'muscle_gain':
      return Math.round(tdee * 1.1); // 10% surplus
    case 'maintenance':
    default:
      return Math.round(tdee);
  }
}

function calculateMacrosForGoal(calories: number, weight: number, goal: Goal) {
  let proteinMultiplier: number;
  let proteinPercentage: number;
  let carbsPercentage: number;
  let fatPercentage: number;

  switch (goal) {
    case 'fat_loss':
      proteinMultiplier = 2.5; // 2.5g per kg bodyweight
      proteinPercentage = 0.40;
      carbsPercentage = 0.30;
      fatPercentage = 0.30;
      break;
    case 'muscle_gain':
      proteinMultiplier = 2.2; // 2.2g per kg bodyweight
      proteinPercentage = 0.30;
      carbsPercentage = 0.50;
      fatPercentage = 0.20;
      break;
    case 'maintenance':
    default:
      proteinMultiplier = 2.0; // 2.0g per kg bodyweight
      proteinPercentage = 0.35;
      carbsPercentage = 0.40;
      fatPercentage = 0.25;
      break;
  }

  // Calculate protein based on body weight
  const proteinByWeight = Math.round(weight * proteinMultiplier);
  
  // Calculate protein based on percentage
  const proteinByPercentage = Math.round((calories * proteinPercentage) / 4);
  
  // Use the higher value for protein
  const protein = Math.max(proteinByWeight, proteinByPercentage);
  
  // Adjust remaining calories for carbs and fat
  const remainingCalories = calories - (protein * 4);
  const carbsCalories = remainingCalories * (carbsPercentage / (carbsPercentage + fatPercentage));
  const fatCalories = remainingCalories * (fatPercentage / (carbsPercentage + fatPercentage));

  return {
    protein,
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9),
  };
}

function calculateWeeklyDeficit(details: UserDetails): number {
  const weightDiff = details.weight - details.goalWeight;
  const weeks = details.timeToAchieve;
  // 7700 calories = 1kg of fat
  return (weightDiff * 7700) / weeks;
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