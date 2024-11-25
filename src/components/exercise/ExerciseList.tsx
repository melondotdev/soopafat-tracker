import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { Exercise } from '../../types';

interface ExerciseListProps {
  exercises: Exercise[];
  onExerciseUpdate: (index: number, field: keyof Exercise, value: string | number) => void;
  onNotesClick: (exercise: Exercise, index: number) => void;
}

export function ExerciseList({ exercises, onExerciseUpdate, onNotesClick }: ExerciseListProps) {
  const [editingCell, setEditingCell] = useState<{
    index: number;
    field: keyof Exercise;
  } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (index: number, field: keyof Exercise, value: number) => {
    setEditingCell({ index, field });
    setEditValue(value.toString());
  };

  const handleBlur = () => {
    if (editingCell) {
      const value = parseFloat(editValue);
      if (!isNaN(value)) {
        onExerciseUpdate(editingCell.index, editingCell.field, value);
      }
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Exercise</th>
            <th className="text-right py-2">Weight</th>
            <th className="text-right py-2">Sets</th>
            <th className="text-right py-2">Max Reps</th>
            <th className="w-16"></th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise, index) => (
            <tr key={index} className="border-b">
              <td className="py-3">{exercise.name}</td>
              <td className="text-right">
                {editingCell?.index === index && editingCell?.field === 'weight' ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-20 p-1 border rounded text-right"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => startEditing(index, 'weight', exercise.weight)}
                    className="hover:bg-gray-100 px-2 py-1 rounded min-w-[3rem] text-right"
                  >
                    {exercise.weight}
                  </button>
                )}
              </td>
              <td className="text-right">
                {editingCell?.index === index && editingCell?.field === 'sets' ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-16 p-1 border rounded text-right"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => startEditing(index, 'sets', exercise.sets)}
                    className="hover:bg-gray-100 px-2 py-1 rounded min-w-[2rem] text-right"
                  >
                    {exercise.sets}
                  </button>
                )}
              </td>
              <td className="text-right">
                {editingCell?.index === index && editingCell?.field === 'maxReps' ? (
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="w-16 p-1 border rounded text-right"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => startEditing(index, 'maxReps', exercise.maxReps)}
                    className="hover:bg-gray-100 px-2 py-1 rounded min-w-[2rem] text-right"
                  >
                    {exercise.maxReps}
                  </button>
                )}
              </td>
              <td className="text-right">
                <button
                  onClick={() => onNotesClick(exercise, index)}
                  className={`p-1 rounded-full ${
                    exercise.notes
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}