import React, { useState, useCallback } from 'react';
import { Plus, Search, Star, Trash2, X } from 'lucide-react';
import type { FoodEntry } from '../types';

interface DietTrackerProps {
  entries: FoodEntry[];
  onAddEntry: (entry: FoodEntry) => void;
  onRemoveEntry: (id: string) => void;
}

export function DietTracker({ entries, onAddEntry, onRemoveEntry }: DietTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddMode, setQuickAddMode] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    calories: '',
    protein: ''
  });

  const handleQuickAdd = useCallback(() => {
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: 'Quick Add',
      calories: Number(quickAddForm.calories) || 0,
      protein: Number(quickAddForm.protein) || 0,
      timestamp: new Date().toISOString(),
      isFavorite: false
    };
    
    onAddEntry(newEntry);
    setQuickAddMode(false);
    setQuickAddForm({ calories: '', protein: '' });
  }, [quickAddForm, onAddEntry]);

  const filteredEntries = entries.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search foods..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setQuickAddMode(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Quick Add
        </button>
      </div>

      {quickAddMode && (
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Quick Add</h3>
            <button
              onClick={() => setQuickAddMode(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Calories"
              value={quickAddForm.calories}
              onChange={(e) => setQuickAddForm(prev => ({ ...prev, calories: e.target.value }))}
              className="p-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={quickAddForm.protein}
              onChange={(e) => setQuickAddForm(prev => ({ ...prev, protein: e.target.value }))}
              className="p-2 border rounded-lg"
            />
          </div>
          <button 
            onClick={handleQuickAdd}
            className="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Add Entry
          </button>
        </div>
      )}

      <div className="space-y-2">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div>
              <h4 className="font-medium">{entry.name}</h4>
              <p className="text-sm text-gray-500">
                {entry.calories} cal • {entry.protein}g protein
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRemoveEntry(entry.id)}
                className="p-1 text-red-500 rounded-full hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}