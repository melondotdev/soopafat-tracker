import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings, saveUserSettings } from '../lib/db';

export interface Settings {
  caloriesTarget: number;
  proteinTarget: number;
  stepsTarget: number;
}

const DEFAULT_SETTINGS: Settings = {
  caloriesTarget: 2000,
  proteinTarget: 120,
  stepsTarget: 10000,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function loadSettings() {
      if (currentUser) {
        try {
          const userSettings = await getUserSettings(currentUser.uid);
          if (userSettings) {
            setSettings(userSettings);
          } else {
            await saveUserSettings(currentUser.uid, DEFAULT_SETTINGS);
            setSettings(DEFAULT_SETTINGS);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadSettings();
  }, [currentUser]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!currentUser) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveUserSettings(currentUser.uid, updatedSettings);
  };

  return {
    settings,
    updateSettings,
    loading
  };
}