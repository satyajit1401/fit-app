'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth-context';
import { getNutritionLogs, NutritionLog, getNutritionTargets, updateNutritionTargets, saveMealToBackend, getAllPastMeals, updateMealInBackend, getWaterIntake, updateWaterIntake, softDeleteMeal } from '@/lib/api';
import DateNavigation from '@/components/nutrition/DateNavigation';
import PersonalizationModal from '@/components/nutrition/PersonalizationModal';
import AddMealModal from '@/components/nutrition/AddMealModal';

interface MealGroup {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: NutritionLog[];
}

interface TargetNutrition {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWater: number;
  weeklyWeightTargets: number[];
}

// Extend NutritionLog for local use to include optional fields
interface NutritionLogDisplay extends NutritionLog {
  meal_time?: string;
  notes?: string;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

const DEFAULT_TARGETS = {
  targetCalories: 2500,
  targetProtein: 150,
  targetCarbs: 200,
  targetFat: 67,
  targetWater: 3000,
  weeklyWeightTargets: [],
};

export default function NutritionPage() {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [savingTargets, setSavingTargets] = useState(false);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLogDisplay[]>([]);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isCopyMealOpen, setIsCopyMealOpen] = useState(false);
  const { user, loading: userLoading } = useAuth();
  const [waterIntake, setWaterIntake] = useState(0);
  const [isEditingWater, setIsEditingWater] = useState(false);

  const [targetNutrition, setTargetNutrition] = useState<TargetNutrition>(DEFAULT_TARGETS);
  
  const [pastMeals, setPastMeals] = useState<any[]>([]);
  const [selectedMealIndex, setSelectedMealIndex] = useState<number | null>(null);
  const [isEditMealOpen, setIsEditMealOpen] = useState(false);
  const [editMealData, setEditMealData] = useState<NutritionLogDisplay | null>(null);
  
  // Load saved targets from database on component mount or date change
  useEffect(() => {
    const loadTargets = async () => {
      if (user) {
        setLoading(true);
        try {
          const formattedDate = date.toISOString().split('T')[0];
          console.log('Loading targets for date:', formattedDate);
          const targets = await getNutritionTargets(user.id, formattedDate);
          console.log('Loaded targets from database:', targets);
          if (targets) {
            setTargetNutrition(targets);
          } else {
            setTargetNutrition(DEFAULT_TARGETS);
          }
        } catch (error) {
          console.error('Error loading targets:', error);
          setTargetNutrition(DEFAULT_TARGETS);
        } finally {
          setLoading(false);
        }
      } else {
        setTargetNutrition(DEFAULT_TARGETS);
      }
    };
    loadTargets();
  }, [user, date]);
  
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
  
  // Load water intake when date changes
  useEffect(() => {
    const loadWaterIntake = async () => {
      if (user) {
        const formattedDate = date.toISOString().split('T')[0];
        const intake = await getWaterIntake(user.id, formattedDate);
        setWaterIntake(intake);
      }
    };
    loadWaterIntake();
  }, [user, date]);
  
  // Calculate total nutrition values
  const totals = nutritionLogs.reduce((acc, item) => {
    return {
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein ?? item.protein_g ?? 0),
      carbs: acc.carbs + (item.carbs ?? item.carbs_g ?? 0),
      fat: acc.fat + (item.fat_g ?? item.fats ?? 0),
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Group nutrition logs by meal type
  const mealGroups = nutritionLogs.reduce<Record<string, MealGroup>>((acc, item) => {
    const mealType = item.meal_type || 'Other';
    
    if (!acc[mealType]) {
      acc[mealType] = {
        name: mealType,
        time: item.meal_time || '12:00',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        items: []
      };
    }
    
    acc[mealType].calories += item.calories || 0;
    acc[mealType].protein += item.protein ?? item.protein_g ?? 0;
    acc[mealType].carbs += item.carbs ?? item.carbs_g ?? 0;
    acc[mealType].fat += item.fats ?? item.fat_g ?? 0;
    acc[mealType].items.push(item);
    
    return acc;
  }, {});
  
  const meals = Object.values(mealGroups);
  
  const calculatePercentage = (consumed: number, target: number) => {
    return Math.min(Math.round((consumed / target) * 100), 100);
  };
  
  const formatMacro = (value: number) => {
    return value.toFixed(0) + 'g';
  };

  const handlePersonalizationSave = async (data: TargetNutrition) => {
    console.log('Main page: handlePersonalizationSave called', data);
    setSavingTargets(true);
    try {
      if (!user) throw new Error('No user');
      const formattedDate = date.toISOString().split('T')[0];
      
      // Save the targets
      const success = await updateNutritionTargets(data, user.id, formattedDate);
      if (!success) {
        throw new Error('Failed to save targets');
      }

      // Force a refresh of the data
      setLoading(true);
      const latest = await getNutritionTargets(user.id, formattedDate);
      console.log('Latest targets after save:', latest);
      
      if (latest) {
        setTargetNutrition(latest);
      } else {
        setTargetNutrition(data); // Fallback to the data we just saved
      }
      
      setIsPersonalizationOpen(false);
    } catch (error) {
      console.error('Error saving targets:', error);
    } finally {
      setLoading(false);
      setSavingTargets(false);
    }
  };

  // Add a function to refresh targets
  const refreshTargets = async () => {
    if (!user) return;
    const formattedDate = date.toISOString().split('T')[0];
    const targets = await getNutritionTargets(user.id, formattedDate);
    if (targets) {
      setTargetNutrition(targets);
    }
  };

  // Centralized function to refresh meals
  const refreshMeals = async () => {
    if (!user) return;
    setLoading(true); // Show loading state
    try {
      const formattedDate = date.toISOString().split('T')[0];
      // Force fetch from backend, bypass cache
      const logs = await getNutritionLogs(formattedDate, false /* includeDeleted */, true /* forceFetch */);
      setNutritionLogs(logs);
    } catch (error) {
      console.error('Error refreshing meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (data: any) => {
    if (!user) return;
    setLoading(true);
    try {
      const meal = {
        meal_type: data.name || 'Meal',
        description: data.description || '',
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        user_id: user.id,
      };
      const success = await saveMealToBackend(meal);
      if (success) {
        // Optimistically add the meal to the state
        setNutritionLogs(prev => [
          {
            id: Math.random().toString(36).substr(2, 9), // Temporary ID
            user_id: user.id,
            date: date.toISOString().split('T')[0],
            meal_type: meal.meal_type,
            food_item: '',
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fat,
            is_deleted: false,
            notes: meal.description,
            meal_time: new Date().toTimeString().slice(0, 8),
            protein_g: meal.protein,
            carbs_g: meal.carbs,
            fat_g: meal.fat,
          },
          ...prev,
        ]);
        setIsAddMealOpen(false);
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCopyMealModal = async () => {
    setIsCopyMealOpen(true);
    if (!user) return;
    const meals = await getAllPastMeals(user.id);
    setPastMeals(meals);
    setSelectedMealIndex(null);
  };

  const handleCopyMeal = async () => {
    if (selectedMealIndex === null) return;
    const meal = pastMeals[selectedMealIndex];
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 8);
    if (!user) return;
    const success = await saveMealToBackend({
      meal_type: meal.meal_type,
      description: meal.notes || '',
      calories: meal.calories,
      protein: meal.protein_g,
      carbs: meal.carbs_g,
      fat: meal.fat_g,
      user_id: user.id,
      date: today,
      time: now,
    });
    if (success) {
      await refreshMeals();
    }
    setIsCopyMealOpen(false);
  };

  const handleEditMeal = (meal: NutritionLogDisplay) => {
    setEditMealData(meal);
    setIsEditMealOpen(true);
  };

  const handleSaveEditMeal = async (data: any) => {
    if (!editMealData) return;
    setLoading(true);
    try {
      const updates = {
        meal_type: data.name || editMealData.meal_type,
        description: data.description || editMealData.notes || '',
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
      };
      await updateMealInBackend(editMealData.id, updates);
      // Optimistically update the meal in the state
      setNutritionLogs(prev => prev.map(log =>
        log.id === editMealData.id
          ? {
              ...log,
              meal_type: updates.meal_type,
              notes: updates.description,
              calories: updates.calories,
              protein: updates.protein,
              carbs: updates.carbs,
              fats: updates.fat,
              protein_g: updates.protein,
              carbs_g: updates.carbs,
              fat_g: updates.fat,
            }
          : log
      ));
      setIsEditMealOpen(false);
      setEditMealData(null);
    } catch (error) {
      console.error('Error saving meal edit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWaterIntakeChange = async (value: number) => {
    if (!user) return;
    setWaterIntake(value);
    const formattedDate = date.toISOString().split('T')[0];
    await updateWaterIntake(user.id, formattedDate, value);
  };

  const handleWaterInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const value = Math.min(Math.max(0, Number(e.target.value)), targetNutrition.targetWater);
    setWaterIntake(value);
    const formattedDate = date.toISOString().split('T')[0];
    await updateWaterIntake(user.id, formattedDate, value);
  };

  const handleDeleteMeal = async (mealId: string) => {
    setLoading(true);
    try {
      await softDeleteMeal(mealId);
      // Optimistically remove the meal from the state
      setNutritionLogs(prev => prev.filter(log => log.id !== mealId));
    } catch (error) {
      console.error('Error deleting meal:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (userLoading || !user) {
    return <div className="flex justify-center py-10">Loading user...</div>;
  }
  
  return (
    <Layout title="NUTRITION">
      <DateNavigation currentDate={date} onDateChange={setDate} />
      
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
                <h3 className="text-lg font-medium">Daily Targets <span className="text-xs text-text-light">({targetNutrition.targetCalories} kcal / {targetNutrition.targetProtein}g P / {targetNutrition.targetCarbs}g C / {targetNutrition.targetFat}g F)</span></h3>
              </div>
              <button
                onClick={() => setIsPersonalizationOpen(true)}
                disabled={savingTargets}
                className="text-accent font-medium disabled:opacity-50"
              >
                {savingTargets ? 'Saving...' : 'Personalize'}
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Calories</span>
                <span>{calculatePercentage(totals.calories, targetNutrition.targetCalories)}%</span>
              </div>
              <div className="flex justify-end text-xs text-text-light mb-1">
                <span>{totals.calories} / {targetNutrition.targetCalories} kcal</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full" 
                  style={{ width: `${calculatePercentage(totals.calories, targetNutrition.targetCalories)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
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
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Water</span>
                <div className="flex items-center gap-2">
                  {isEditingWater ? (
                    <input
                      type="number"
                      value={waterIntake}
                      onChange={handleWaterInputChange}
                      onBlur={() => setIsEditingWater(false)}
                      className="w-20 p-1 bg-background rounded text-right"
                      min={0}
                      max={targetNutrition.targetWater}
                    />
                  ) : (
                    <span onClick={() => setIsEditingWater(true)} className="cursor-pointer">
                      {waterIntake} / {targetNutrition.targetWater} ml
                    </span>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={targetNutrition.targetWater}
                  value={waterIntake}
                  onChange={(e) => handleWaterIntakeChange(Number(e.target.value))}
                  className="w-full h-2 bg-background rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #60A5FA ${(waterIntake / targetNutrition.targetWater) * 100}%, #2A3035 ${(waterIntake / targetNutrition.targetWater) * 100}%)`
                  }}
                />
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-text-light">
                  <span>0ml</span>
                  <span>{targetNutrition.targetWater}ml</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
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
                    {meal.items.map((item, itemIndex) => {
                      const displayItem = item as NutritionLogDisplay;
                      return (
                        <div key={itemIndex} className="flex flex-col py-2 border-b border-gray-700 last:border-0">
                          <div className="flex justify-between">
                            <div>{displayItem.notes}</div>
                            <div className="text-text-light">{displayItem.calories} cal</div>
                            <button
                              className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Edit"
                              onClick={() => handleEditMeal(displayItem)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2h6" />
                              </svg>
                            </button>
                            <button
                              className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              title="Delete"
                              onClick={() => handleDeleteMeal(displayItem.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-xs text-text-light flex justify-between">
                            <span>Time: {displayItem.meal_time || '--:--'}</span>
                            <span>P: {(displayItem.protein ?? displayItem.protein_g ?? 0).toFixed(0)}g · C: {(displayItem.carbs ?? displayItem.carbs_g ?? 0).toFixed(0)}g · F: {(displayItem.fats ?? displayItem.fat_g ?? 0).toFixed(0)}g</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-text-light py-10">
                No meals logged for today. Start tracking your nutrition!
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddMealOpen(true)}
                className="w-full py-4 flex items-center justify-center text-accent font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                ADD MEAL
              </button>
              <button
                onClick={openCopyMealModal}
                className="w-full py-4 flex items-center justify-center text-accent font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" />
                </svg>
                COPY MEAL
              </button>
            </div>
          </div>
        </>
      )}

      <PersonalizationModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        onSave={handlePersonalizationSave}
        initialData={targetNutrition}
      />

      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => setIsAddMealOpen(false)}
        onSave={handleAddMeal}
        targetValues={{
          targetCalories: targetNutrition.targetCalories,
          targetProtein: targetNutrition.targetProtein,
          targetCarbs: targetNutrition.targetCarbs,
          targetFat: targetNutrition.targetFat
        }}
      />

      {isCopyMealOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-6 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Copy a Past Meal</h2>
              {pastMeals.length === 0 ? (
                <div className="text-center text-text-light">No past meals found.</div>
              ) : (
                <form>
                  <div className="space-y-4">
                    {pastMeals.map((meal, idx) => (
                      <label key={idx} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-background">
                        <input
                          type="radio"
                          name="copyMeal"
                          checked={selectedMealIndex === idx}
                          onChange={() => setSelectedMealIndex(idx)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{meal.meal_type}</div>
                          <div className="text-sm text-text-light">{meal.notes}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </form>
              )}
            </div>
            <div className="p-6 border-t border-gray-700 mt-auto flex gap-4">
              <button
                onClick={() => setIsCopyMealOpen(false)}
                className="flex-1 p-3 bg-background text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyMeal}
                disabled={selectedMealIndex === null || !user}
                className="flex-1 p-3 bg-accent text-white rounded-lg font-medium disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditMealOpen && editMealData && (
        <AddMealModal
          isOpen={isEditMealOpen}
          onClose={() => { setIsEditMealOpen(false); setEditMealData(null); }}
          onSave={handleSaveEditMeal}
          targetValues={{
            targetCalories: targetNutrition.targetCalories,
            targetProtein: targetNutrition.targetProtein,
            targetCarbs: targetNutrition.targetCarbs,
            targetFat: targetNutrition.targetFat
          }}
          initialData={{
            name: editMealData.meal_type,
            description: editMealData.notes || '',
            calories: editMealData.calories,
            protein: editMealData.protein ?? editMealData.protein_g ?? 0,
            carbs: editMealData.carbs ?? editMealData.carbs_g ?? 0,
            fat: editMealData.fats ?? editMealData.fat_g ?? 0,
          }}
        />
      )}
    </Layout>
  );
} 