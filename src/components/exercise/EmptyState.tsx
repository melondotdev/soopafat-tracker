import React from 'react';
import { Activity, Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Select or create a workout plan to get started.</p>
      <button
        onClick={onCreateClick}
        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 inline-flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create Plan
      </button>
    </div>
  );
}