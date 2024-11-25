import cnfData from './cnfData.json';

export interface ProcessedFood {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  searchName?: string;
}

// Normalize text for better search matching
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

// Process and normalize food data
export const cnfFoods: ProcessedFood[] = cnfData
  .map((food, index) => ({
    id: `cnf-${index}`,
    name: food.foodName,
    servingSize: 100,
    servingUnit: 'g',
    calories: Math.round(food.nutritionFacts.calories || 0),
    protein: Math.round((food.nutritionFacts.protein || 0) * 10) / 10,
    carbs: Math.round((food.nutritionFacts.carbs || 0) * 10) / 10,
    fat: Math.round((food.nutritionFacts.fat || 0) * 10) / 10,
    searchName: normalizeText(food.foodName)
  }))
  .filter(food => 
    // Only include foods that have at least calories and one other nutrient
    food.calories > 0 && (food.protein > 0 || food.carbs > 0 || food.fat > 0)
  );