import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Exercise } from '../types';

interface NotesModalProps {
  exercise: Exercise;
  onSave: (notes: string) => void;
  onClose: () => void;
}

export function NotesModal({ exercise, onSave, onClose }: NotesModalProps) {
  const [notes, setNotes] = useState(exercise.notes || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{exercise.name} Notes</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes for this exercise..."
          className="w-full p-2 border rounded-lg h-32 resize-none mb-4"
        />
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              onSave(notes);
              onClose();
            }}
            className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Save Notes
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}