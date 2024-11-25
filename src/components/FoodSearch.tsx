import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { searchCustomFoods, addCustomFood } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { cnfFoods } from '../data/cnfDatabase';
import type { CustomFood } from '../types';
import type { ProcessedFood } from '../data/cnfDatabase';

interface FoodSearchProps {
  onFoodSelect: (food: any, quantity: number) => void;
}

// Normalize search text for consistent matching
function normalizeText(text: string): string {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

export function FoodSearch({ onFoodSelect }: FoodSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<(CustomFood | ProcessedFood) | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchResults, setSearchResults] = useState<(CustomFood | ProcessedFood)[]>([]);
  const { currentUser } = useAuth();

  const [newFood, setNewFood] = useState({
    name: '',
    servingSize: 100,
    servingUnit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  });

  useEffect(() => {
    const searchFoods = async () => {
      if (searchTerm.length >= 2) {
        const normalizedSearch = normalizeText(searchTerm);
        
        // Search CNF foods
        const cnfResults = cnfFoods.filter(food => 
          food.searchName?.includes(normalizedSearch)
        );

        // Search custom foods from Firebase
        const customResults = await searchCustomFoods(searchTerm);

        // Combine and sort results by relevance
        const allResults = [...cnfResults, ...customResults].sort((a, b) => {
          const aName = normalizeText(a.name);
          const bName = normalizeText(b.name);
          const aStartsWith = aName.startsWith(normalizedSearch) ? 0 : 1;
          const bStartsWith = bName.startsWith(normalizedSearch) ? 0 : 1;
          if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
          return aName.localeCompare(bName);
        });

        // Limit to top 20 matches for performance
        setSearchResults(allResults.slice(0, 20));
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimeout = setTimeout(searchFoods, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleFoodSelect = (food: CustomFood | ProcessedFood) => {
    setSelectedFood(food);
    setQuantity(food.servingSize);
  };

  const handleAdd = () => {
    if (selectedFood) {
      const multiplier = quantity / selectedFood.servingSize;
      const adjustedFood = {
        ...selectedFood,
        calories: Math.round(selectedFood.calories * multiplier),
        protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
        carbs: Math.round((selectedFood.carbs || 0) * multiplier * 10) / 10,
        fat: Math.round((selectedFood.fat || 0) * multiplier * 10) / 10
      };
      onFoodSelect(adjustedFood, quantity);
      setSelectedFood(null);
      setQuantity(100);
      setSearchTerm('');
    }
  };

  const handleAddCustomFood = async () => {
    if (!currentUser) return;

    const customFood: Omit<CustomFood, 'id'> = {
      ...newFood,
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString()
    };

    try {
      await addCustomFood(customFood);
      setShowAddForm(false);
      setNewFood({
        name: '',
        servingSize: 100,
        servingUnit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
      });
      setSearchTerm(customFood.name);
    } catch (error) {
      console.error('Error adding custom food:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Add New
        </button>
      </div>

      {searchTerm && !selectedFood && !showAddForm && (
        <div className="bg-white border rounded-lg divide-y max-h-60 overflow-y-auto">
          {searchResults.map((food) => (
            <button
              key={food.id}
              onClick={() => handleFoodSelect(food)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <span>{food.name}</span>
                <span className="text-sm text-gray-500">
                  {food.calories} cal • {food.protein}g protein
                </span>
              </div>
              <div className="text-xs text-gray-500">
                per {food.servingSize}{food.servingUnit}
                {food.id.startsWith('cnf-') && ' • CNF Database'}
              </div>
            </button>
          ))}
          {searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No results found. Try adding a custom food.
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Add Custom Food</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={newFood.name}
                onChange={(e) => setNewFood(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Serving Size</label>
              <input
                type="number"
                value={newFood.servingSize}
                onChange={(e) => setNewFood(prev => ({ ...prev, servingSize: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Unit</label>
              <select
                value={newFood.servingUnit}
                onChange={(e) => setNewFood(prev => ({ ...prev, servingUnit: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="g">grams</option>
                <option value="ml">milliliters</option>
                <option value="oz">ounces</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Calories</label>
              <input
                type="number"
                value={newFood.calories}
                onChange={(e) => setNewFood(prev => ({ ...prev, calories: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Protein (g)</label>
              <input
                type="number"
                value={newFood.protein}
                onChange={(e) => setNewFood(prev => ({ ...prev, protein: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={newFood.carbs}
                onChange={(e) => setNewFood(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Fat (g)</label>
              <input
                type="number"
                value={newFood.fat}
                onChange={(e) => setNewFood(prev => ({ ...prev, fat: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Fiber (g)</label>
              <input
                type="number"
                value={newFood.fiber}
                onChange={(e) => setNewFood(prev => ({ ...prev, fiber: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Sugar (g)</label>
              <input
                type="number"
                value={newFood.sugar}
                onChange={(e) => setNewFood(prev => ({ ...prev, sugar: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Sodium (mg)</label>
              <input
                type="number"
                value={newFood.sodium}
                onChange={(e) => setNewFood(prev => ({ ...prev, sodium: Number(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleAddCustomFood}
            className="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Add to Database
          </button>
        </div>
      )}

      {selectedFood && !showAddForm && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{selectedFood.name}</h3>
            <span className="text-sm text-gray-500">
              per {selectedFood.servingSize}{selectedFood.servingUnit}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">
                Quantity ({selectedFood.servingUnit})
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border rounded-lg"
                min="0"
              />
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Calories:</span>{' '}
              {Math.round((selectedFood.calories * quantity) / selectedFood.servingSize)}
            </div>
            <div>
              <span className="text-gray-600">Protein:</span>{' '}
              {Math.round((selectedFood.protein * quantity) / selectedFood.servingSize)}g
            </div>
            <div>
              <span className="text-gray-600">Carbs:</span>{' '}
              {Math.round(((selectedFood.carbs || 0) * quantity) / selectedFood.servingSize)}g
            </div>
            <div>
              <span className="text-gray-600">Fat:</span>{' '}
              {Math.round(((selectedFood.fat || 0) * quantity) / selectedFood.servingSize)}g
            </div>
          </div>
        </div>
      )}
    </div>
  );
}