import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    caloriesTarget: settings.caloriesTarget,
    proteinTarget: settings.proteinTarget,
    stepsTarget: settings.stepsTarget,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daily Targets</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Calories Target
            </label>
            <input
              type="number"
              value={formData.caloriesTarget}
              onChange={(e) => setFormData(prev => ({ ...prev, caloriesTarget: Number(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Protein Target (g)
            </label>
            <input
              type="number"
              value={formData.proteinTarget}
              onChange={(e) => setFormData(prev => ({ ...prev, proteinTarget: Number(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Steps Target
            </label>
            <input
              type="number"
              value={formData.stepsTarget}
              onChange={(e) => setFormData(prev => ({ ...prev, stepsTarget: Number(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
              min="0"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}