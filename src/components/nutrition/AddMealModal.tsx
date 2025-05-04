import { useState, useEffect } from 'react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MealData) => void;
  targetValues?: {
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFat: number;
  };
  initialData?: MealData;
}

interface MealData {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function AddMealModal({ isOpen, onClose, onSave, targetValues, initialData }: AddMealModalProps) {
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [macros, setMacros] = useState<MealData>({
    name: '',
    description: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log for target values
  useEffect(() => {
    if (isOpen) {
      console.log('AddMealModal opened with target values:', targetValues);
    }
  }, [isOpen, targetValues]);

  // Reset or prefill form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMealName(initialData.name || '');
        setMealDescription(initialData.description || '');
        setMacros({
          name: initialData.name || '',
          description: initialData.description || '',
          calories: initialData.calories || 0,
          protein: initialData.protein || 0,
          carbs: initialData.carbs || 0,
          fat: initialData.fat || 0
        });
      } else {
        setMealName('');
        setMealDescription('');
        setMacros({
          name: '',
          description: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        });
      }
    }
  }, [isOpen, initialData]);

  const analyzeMeal = async () => {
    if (!mealDescription) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: mealDescription }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setMacros({
        name: mealName,
        description: mealDescription,
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0
      });
    } catch (error) {
      setError('Could not analyze meal. Please try again.');
      console.error('Error analyzing meal:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-bold mb-4">Add Meal</h2>
          {targetValues && (
            <div className="mb-4 p-3 bg-background rounded-lg">
              <h3 className="text-sm text-text-light mb-2">Daily Targets</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-text-light">Calories:</span>
                  <span className="font-medium">{targetValues.targetCalories} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-light">Protein:</span>
                  <span className="font-medium">{targetValues.targetProtein}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-light">Carbs:</span>
                  <span className="font-medium">{targetValues.targetCarbs}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-light">Fat:</span>
                  <span className="font-medium">{targetValues.targetFat}g</span>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-light mb-1">Meal Name</label>
              <input
                type="text"
                value={mealName}
                onChange={(e) => {
                  setMealName(e.target.value);
                  setMacros(prev => ({ ...prev, name: e.target.value }));
                }}
                placeholder="e.g., Breakfast, Lunch, Snack"
                className="w-full p-3 bg-background rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-text-light mb-1">Meal Description</label>
              <textarea
                value={mealDescription}
                onChange={(e) => {
                  setMealDescription(e.target.value);
                  setMacros(prev => ({ ...prev, description: e.target.value }));
                }}
                placeholder="Describe your meal in detail..."
                className="w-full p-3 bg-background rounded-lg h-32"
              />
            </div>
            <button
              onClick={analyzeMeal}
              disabled={isAnalyzing || !mealDescription}
              className="w-full p-4 bg-accent text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : 'Analyze Meal'}
            </button>
            {error && (
              <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
            )}
            <div className="bg-background rounded-lg p-4 space-y-2">
              <h3 className="font-medium">Estimated Macros</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-light">Calories:</span>
                  <input
                    type="number"
                    value={macros.calories}
                    onChange={(e) => setMacros(prev => ({ ...prev, calories: Number(e.target.value) }))}
                    className="w-full p-2 bg-card rounded mt-1"
                  />
                </div>
                <div>
                  <span className="text-text-light">Protein (g):</span>
                  <input
                    type="number"
                    value={macros.protein}
                    onChange={(e) => setMacros(prev => ({ ...prev, protein: Number(e.target.value) }))}
                    className="w-full p-2 bg-card rounded mt-1"
                  />
                </div>
                <div>
                  <span className="text-text-light">Carbs (g):</span>
                  <input
                    type="number"
                    value={macros.carbs}
                    onChange={(e) => setMacros(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                    className="w-full p-2 bg-card rounded mt-1"
                  />
                </div>
                <div>
                  <span className="text-text-light">Fat (g):</span>
                  <input
                    type="number"
                    value={macros.fat}
                    onChange={(e) => setMacros(prev => ({ ...prev, fat: Number(e.target.value) }))}
                    className="w-full p-2 bg-card rounded mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Fixed footer for buttons */}
        <div className="p-6 border-t border-gray-700 mt-auto flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-background text-white rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('AddMealModal: Save clicked with data:', {
                ...macros,
                name: mealName,
                description: mealDescription
              });
              onSave({
                ...macros,
                name: mealName,
                description: mealDescription
              });
            }}
            disabled={
              mealName.trim() === '' ||
              macros.calories === null || macros.calories === undefined ||
              macros.protein === null || macros.protein === undefined ||
              macros.carbs === null || macros.carbs === undefined ||
              macros.fat === null || macros.fat === undefined
            }
            className="flex-1 p-3 bg-accent text-white rounded-lg font-medium disabled:opacity-50"
          >
            Save Meal
          </button>
        </div>
      </div>
    </div>
  );
} 