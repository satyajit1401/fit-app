import { useState, useEffect } from 'react';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TargetNutrition) => void;
  initialData?: TargetNutrition;
}

interface TargetNutrition {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWater: number;
  weeklyWeightTargets: number[];
}

type Goal = 'fat_loss' | 'muscle_gain' | 'maintenance';

interface FormData {
  height: string;
  weight: string;
  goalWeight: string;
  timeToAchieve: string;
  age: string;
  gender: string;
  activityLevel: string;
  targetCalories: string;
  targetProtein: string;
  targetCarbs: string;
  targetFat: string;
  targetWater: string;
  weeklyWeightTargets: number[];
  goal: Goal;
}

export default function PersonalizationModal({ isOpen, onClose, onSave, initialData }: PersonalizationModalProps) {
  const [step, setStep] = useState<'initial' | 'manual' | 'system'>('initial');
  const [formData, setFormData] = useState<FormData>({
    height: '',
    weight: '',
    goalWeight: '',
    timeToAchieve: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    targetCalories: '',
    targetProtein: '',
    targetCarbs: '',
    targetFat: '',
    targetWater: '',
    weeklyWeightTargets: [],
    goal: 'maintenance'
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('initial');
      // Reset form data when opening modal
      setFormData({
        height: '',
        weight: '',
        goalWeight: '',
        timeToAchieve: '',
        age: '',
        gender: 'male',
        activityLevel: 'moderate',
        targetCalories: '',
        targetProtein: '',
        targetCarbs: '',
        targetFat: '',
        targetWater: '',
        weeklyWeightTargets: [],
        goal: 'maintenance'
      });
    }
  }, [isOpen]);

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        targetCalories: initialData.targetCalories.toString(),
        targetProtein: initialData.targetProtein.toString(),
        targetCarbs: initialData.targetCarbs.toString(),
        targetFat: initialData.targetFat.toString(),
        targetWater: initialData.targetWater?.toString() || '3000',
      }));
    }
  }, [initialData]);

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Lightly active (light exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderately active (moderate exercise 3-5 days/week)' },
    { value: 'very', label: 'Very active (hard exercise 6-7 days/week)' },
    { value: 'extra', label: 'Extra active (very hard exercise & physical job)' },
  ];

  const calculateMacrosFromCalories = (calories: number, goal: Goal) => {
    let proteinPercentage: number;
    let carbsPercentage: number;
    let fatPercentage: number;

    switch (goal) {
      case 'fat_loss':
        proteinPercentage = 0.40; // 40% protein
        carbsPercentage = 0.30;   // 30% carbs
        fatPercentage = 0.30;     // 30% fat
        break;
      case 'muscle_gain':
        proteinPercentage = 0.30; // 30% protein
        carbsPercentage = 0.50;   // 50% carbs
        fatPercentage = 0.20;     // 20% fat
        break;
      case 'maintenance':
      default:
        proteinPercentage = 0.35; // 35% protein
        carbsPercentage = 0.40;   // 40% carbs
        fatPercentage = 0.25;     // 25% fat
        break;
    }

    const protein = Math.round((calories * proteinPercentage) / 4); // 4 calories per gram of protein
    const carbs = Math.round((calories * carbsPercentage) / 4);     // 4 calories per gram of carbs
    const fat = Math.round((calories * fatPercentage) / 9);         // 9 calories per gram of fat

    return { protein, carbs, fat };
  };

  const handleCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const calories = e.target.value;
    setFormData(prev => ({ ...prev, targetCalories: calories }));

    if (calories) {
      const macros = calculateMacrosFromCalories(Number(calories), formData.goal);
      setFormData(prev => ({
        ...prev,
        targetCalories: calories,
        targetProtein: macros.protein.toString(),
        targetCarbs: macros.carbs.toString(),
        targetFat: macros.fat.toString(),
      }));
    }
  };

  const determineGoal = (currentWeight: number, goalWeight: number): Goal => {
    if (currentWeight > goalWeight) return 'fat_loss';
    if (currentWeight < goalWeight) return 'muscle_gain';
    return 'maintenance';
  };

  const calculateMacros = async () => {
    if (!formData.height || !formData.weight || !formData.goalWeight || 
        !formData.timeToAchieve || !formData.age) {
      setError('Please fill in all required fields');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const currentWeight = Number(formData.weight);
      const goalWeight = Number(formData.goalWeight);
      const goal = determineGoal(currentWeight, goalWeight);

      const response = await fetch('/api/calculate-macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          height: Number(formData.height),
          weight: currentWeight,
          goalWeight: goalWeight,
          timeToAchieve: Number(formData.timeToAchieve),
          age: Number(formData.age),
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          goal: goal
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate macros');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setFormData(prev => ({
        ...prev,
        targetCalories: data.targetCalories.toString(),
        targetProtein: data.targetProtein.toString(),
        targetCarbs: data.targetCarbs.toString(),
        targetFat: data.targetFat.toString(),
        weeklyWeightTargets: data.weeklyWeightTargets,
        goal: goal
      }));

    } catch (error) {
      console.error('Error calculating macros:', error);
      setError('Failed to calculate macros. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('PersonalizationModal: Save clicked');
      setError(null);
      setIsSaving(true);
      // Validate the data
      const targetCalories = Number(formData.targetCalories);
      const targetProtein = Number(formData.targetProtein);
      const targetCarbs = Number(formData.targetCarbs);
      const targetFat = Number(formData.targetFat);
      const targetWater = Number(formData.targetWater);
      if (!targetCalories || !targetProtein || !targetCarbs || !targetFat || !targetWater) {
        setError('Please ensure all values are filled');
        setIsSaving(false);
        return;
      }
      const data: TargetNutrition = {
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        targetWater,
        weeklyWeightTargets: formData.weeklyWeightTargets,
      };
      console.log('PersonalizationModal: Calling onSave with data:', data);
      await onSave(data);
      onClose();
    } catch (err) {
      console.error('Error saving targets:', err);
      setError('Failed to save targets. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          {step === 'initial' && (
            <>
              <h2 className="text-xl font-bold mb-4">Set Your Daily Targets</h2>
              <div className="space-y-4">
                <button
                  onClick={() => setStep('manual')}
                  className="w-full p-4 bg-accent text-white rounded-lg font-medium"
                >
                  Set Manually
                </button>
                <button
                  onClick={() => setStep('system')}
                  className="w-full p-4 bg-background text-white rounded-lg font-medium"
                >
                  Use System Calculator
                </button>
              </div>
            </>
          )}

          {step === 'system' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Enter Your Details</h2>
              
              <div>
                <label className="block text-sm text-text-light mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Goal Weight (kg)</label>
                <input
                  type="number"
                  value={formData.goalWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, goalWeight: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Time to Achieve (weeks)</label>
                <input
                  type="number"
                  value={formData.timeToAchieve}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeToAchieve: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityLevel: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                >
                  {activityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={calculateMacros}
                disabled={isCalculating}
                className="w-full p-4 bg-accent text-white rounded-lg font-medium disabled:opacity-50"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Daily Calories & Macros'}
              </button>

              {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )}

              {formData.targetCalories && (
                <div className="mt-6 space-y-4 bg-background p-4 rounded-lg">
                  <h3 className="font-medium">Calculated Targets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-text-light">Daily Calories:</span>
                      <div className="font-medium">{formData.targetCalories} kcal</div>
                    </div>
                    <div>
                      <span className="text-text-light">Protein:</span>
                      <div className="font-medium">{formData.targetProtein}g</div>
                    </div>
                    <div>
                      <span className="text-text-light">Carbs:</span>
                      <div className="font-medium">{formData.targetCarbs}g</div>
                    </div>
                    <div>
                      <span className="text-text-light">Fat:</span>
                      <div className="font-medium">{formData.targetFat}g</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Set Your Targets</h2>
              
              <div>
                <label className="block text-sm text-text-light mb-1">Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => {
                    const newGoal = e.target.value as Goal;
                    setFormData(prev => {
                      const newMacros = prev.targetCalories 
                        ? calculateMacrosFromCalories(Number(prev.targetCalories), newGoal)
                        : { protein: 0, carbs: 0, fat: 0 };
                      return {
                        ...prev,
                        goal: newGoal,
                        targetProtein: newMacros.protein.toString(),
                        targetCarbs: newMacros.carbs.toString(),
                        targetFat: newMacros.fat.toString(),
                      };
                    });
                  }}
                  className="w-full p-3 bg-background rounded-lg"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Daily Calories</label>
                <input
                  type="number"
                  value={formData.targetCalories}
                  onChange={handleCaloriesChange}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={formData.targetProtein}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetProtein: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={formData.targetCarbs}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetCarbs: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={formData.targetFat}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetFat: e.target.value }))}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">Water (ml)</label>
                <input
                  type="number"
                  value={formData.targetWater}
                  onChange={e => setFormData(prev => ({ ...prev, targetWater: e.target.value }))}
                  min={0}
                  step={100}
                  className="w-full p-3 bg-background rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 mt-auto">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 p-3 bg-background text-white rounded-lg font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isCalculating || isSaving || !formData.targetCalories}
              className="flex-1 p-3 bg-accent text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2 text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 