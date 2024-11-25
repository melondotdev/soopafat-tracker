import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserSettings, saveUserSettings } from '../lib/db';

interface Settings {
  caloriesTarget: number;
  proteinTarget: number;
  stepsTarget: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
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
            const defaultSettings = {
              caloriesTarget: 2000,
              proteinTarget: 120,
              stepsTarget: 10000,
            };
            await saveUserSettings(currentUser.uid, defaultSettings);
            setSettings(defaultSettings);
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
    if (!currentUser || !settings) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveUserSettings(currentUser.uid, updatedSettings);
  };

  if (!settings) {
    return null;
  }

  const value = {
    settings,
    updateSettings,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}