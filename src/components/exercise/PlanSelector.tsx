import React from 'react';
import { Plus, Edit2 } from 'lucide-react';
import type { WorkoutPlan } from '../../types';

interface PlanSelectorProps {
  plans: WorkoutPlan[];
  selectedPlanId: string;
  onPlanSelect: (id: string) => void;
  onCreateClick: () => void;
  onEditClick: () => void;
}

export function PlanSelector({
  plans,
  selectedPlanId,
  onPlanSelect,
  onCreateClick,
  onEditClick
}: PlanSelectorProps) {
  return (
    <div className="flex gap-4 items-center">
      <select
        value={selectedPlanId}
        onChange={(e) => onPlanSelect(e.target.value)}
        className="flex-1 p-2 border rounded-lg"
      >
        {plans.map(plan => (
          <option key={plan.id} value={plan.id}>
            {plan.name}
          </option>
        ))}
      </select>
      <button
        onClick={onCreateClick}
        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={onEditClick}
        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
      >
        <Edit2 className="w-5 h-5" />
      </button>
    </div>
  );
}