import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavigatorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const isToday = new Date().toDateString() === date.toDateString();

  const navigate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
      <button
        onClick={() => navigate(-1)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-500">
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </span>
        <span className="text-lg font-semibold">
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {isToday && (
          <span className="text-xs text-emerald-500 font-medium">Today</span>
        )}
      </div>

      <button
        onClick={() => navigate(1)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}