import React from 'react';
import { CheckCircle, Trophy } from 'lucide-react';

interface SessionCompletionModalProps {
  onClose: () => void;
  sessionName: string;
}

export function SessionCompletionModal({ onClose, sessionName }: SessionCompletionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Trophy className="w-16 h-16 text-yellow-500" />
        </div>
        
        <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
        <p className="text-gray-600 mb-6">
          Great job completing {sessionName}! Keep up the momentum!
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}