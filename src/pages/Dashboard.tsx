import React, { useState, useEffect } from 'react';
import { Activity, Utensils, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { DateNavigator } from '../components/DateNavigator';
import { ProgressBar } from '../components/ProgressBar';
import { DietTracker } from '../components/DietTracker';
import { ExerciseTracker } from '../components/ExerciseTracker';
import { SettingsModal } from '../components/SettingsModal';
import { FoodSearch } from '../components/FoodSearch';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { 
  getFoodEntries, 
  saveFoodEntry, 
  deleteFoodEntry,
  saveDailyProgress,
  getDailyProgress
} from '../lib/db';
import type { DailyProgress, FoodEntry } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'diet' | 'exercise'>('diet');
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const { settings, loading: settingsLoading } = useSettings();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: currentDate.toISOString().split('T')[0],
    calories: 0,
    protein: 0,
    steps: 0,
    completedSessions: 0
  });
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const dateStr = currentDate.toISOString().split('T')[0];
      loadDailyData(dateStr);
    }
  }, [currentDate, currentUser]);

  const loadDailyData = async (dateStr: string) => {
    if (!currentUser) return;
    try {
      const [progress, entries] = await Promise.all([
        getDailyProgress(currentUser.uid, dateStr),
        getFoodEntries(currentUser.uid, dateStr)
      ]);
      
      if (progress) {
        setDailyProgress(progress);
      } else {
        setDailyProgress({
          date: dateStr,
          calories: 0,
          protein: 0,
          steps: 0,
          completedSessions: 0
        });
      }
      
      setFoodEntries(entries);
      updateProgressFromEntries(entries);
    } catch (error) {
      console.error('Error loading daily data:', error);
    }
  };

  const updateProgressFromEntries = (entries: FoodEntry[]) => {
    const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
    const totalProtein = entries.reduce((sum, entry) => sum + entry.protein, 0);
    
    setDailyProgress(prev => ({
      ...prev,
      calories: totalCalories,
      protein: totalProtein
    }));
  };

  const handleStepsUpdate = async (steps: number) => {
    if (!currentUser) return;
    const dateStr = currentDate.toISOString().split('T')[0];
    const updatedProgress = { ...dailyProgress, steps };
    setDailyProgress(updatedProgress);
    await saveDailyProgress(currentUser.uid, dateStr, updatedProgress);
  };

  const addFoodEntry = async (entry: FoodEntry) => {
    if (!currentUser) return;
    const dateStr = currentDate.toISOString().split('T')[0];
    try {
      await saveFoodEntry(currentUser.uid, dateStr, entry);
      setFoodEntries(prev => [...prev, entry]);
      updateProgressFromEntries([...foodEntries, entry]);
    } catch (error) {
      console.error('Error saving food entry:', error);
    }
  };

  const removeFoodEntry = async (id: string) => {
    if (!currentUser) return;
    const dateStr = currentDate.toISOString().split('T')[0];
    try {
      await deleteFoodEntry(currentUser.uid, dateStr, id);
      const updatedEntries = foodEntries.filter(entry => entry.id !== id);
      setFoodEntries(updatedEntries);
      updateProgressFromEntries(updatedEntries);
    } catch (error) {
      console.error('Error deleting food entry:', error);
    }
  };

  const handleFoodSelect = (food: any, quantity: number) => {
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      timestamp: new Date().toISOString(),
      isFavorite: false
    };
    addFoodEntry(newEntry);
    setShowFoodSearch(false);
  };

  const updateWorkoutProgress = async (completedSessions: number) => {
    if (!currentUser) return;
    const dateStr = currentDate.toISOString().split('T')[0];
    const updatedProgress = { ...dailyProgress, completedSessions };
    setDailyProgress(updatedProgress);
    await saveDailyProgress(currentUser.uid, dateStr, updatedProgress);
  };

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  if (settingsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">SOOPAFAT</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">{currentUser?.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <DateNavigator date={currentDate} onDateChange={setCurrentDate} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <ProgressBar
              current={dailyProgress.calories}
              target={settings.caloriesTarget}
              label="Calories"
              color="blue"
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <ProgressBar
              current={dailyProgress.protein}
              target={settings.proteinTarget}
              label="Protein (g)"
              color="magenta"
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm col-span-2 sm:col-span-1">
            <ProgressBar
              current={dailyProgress.steps}
              target={settings.stepsTarget}
              label="Steps"
              color="yellow"
              editable
              onUpdate={handleStepsUpdate}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex">
              <button
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'diet'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('diet')}
              >
                <Utensils className="w-5 h-5" />
                Diet
              </button>
              <button
                className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  activeTab === 'exercise'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('exercise')}
              >
                <Activity className="w-5 h-5" />
                Exercise
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {activeTab === 'diet' ? (
              <>
                <button
                  onClick={() => setShowFoodSearch(true)}
                  className="mb-4 w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Search Foods
                </button>
                <DietTracker 
                  entries={foodEntries}
                  onAddEntry={addFoodEntry}
                  onRemoveEntry={removeFoodEntry}
                />
              </>
            ) : (
              <ExerciseTracker 
                onSessionComplete={updateWorkoutProgress}
                selectedDate={currentDate}
              />
            )}
          </div>
        </div>
      </main>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {showFoodSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <FoodSearch onFoodSelect={handleFoodSelect} />
            <button
              onClick={() => setShowFoodSearch(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}