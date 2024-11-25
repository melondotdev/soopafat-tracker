import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  color?: 'blue' | 'magenta' | 'yellow';
  editable?: boolean;
  onUpdate?: (value: number) => void;
}

const colorClasses = {
  blue: 'bg-blue-500',
  magenta: 'bg-fuchsia-500',
  yellow: 'bg-amber-500'
};

export function ProgressBar({ 
  current, 
  target, 
  label, 
  color = 'blue',
  editable = false,
  onUpdate
}: ProgressBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(current.toString());

  useEffect(() => {
    setValue(current.toString());
  }, [current]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newValue = parseInt(value);
    if (!isNaN(newValue) && newValue >= 0 && onUpdate) {
      onUpdate(newValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex justify-between mb-1 text-sm">
          <span>{label}</span>
          <span>/ {target}</span>
        </div>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 border rounded-lg"
          autoFocus
          onBlur={handleSubmit}
        />
      </form>
    );
  }

  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-sm">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <span>{current} / {target}</span>
          {editable && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}