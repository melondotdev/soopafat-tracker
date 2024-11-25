import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { getCompletedSessions } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';
import type { WorkoutSession, CompletedSession } from '../../types';

interface SessionSelectorProps {
  sessions: WorkoutSession[];
  selectedSessionId: string;
  onSessionSelect: (id: string) => void;
  selectedDate: Date;
}

export function SessionSelector({
  sessions,
  selectedSessionId,
  onSessionSelect,
  selectedDate
}: SessionSelectorProps) {
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadCompletedSessions = async () => {
      if (!currentUser) return;

      // Get start and end of the selected week
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Go to Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to Saturday
      endOfWeek.setHours(23, 59, 59, 999);

      try {
        const completed = await getCompletedSessions(
          currentUser.uid,
          startOfWeek.toISOString().split('T')[0],
          endOfWeek.toISOString().split('T')[0]
        );

        // Filter to only include sessions completed in the selected week
        const weekSessions = completed.filter(session => {
          const sessionDate = new Date(session.date);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
        });

        setCompletedSessions(weekSessions);
      } catch (error) {
        console.error('Error loading completed sessions:', error);
      }
    };

    loadCompletedSessions();
  }, [currentUser, selectedDate]); // Re-run when selected date changes

  const isSessionCompleted = (sessionId: string) => {
    return completedSessions.some(s => s.sessionId === sessionId);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {sessions.map(session => {
        const completed = isSessionCompleted(session.id);
        return (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
              selectedSessionId === session.id
                ? 'bg-emerald-500 text-white'
                : completed
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {session.name}
            {completed && (
              <CheckCircle className={`w-4 h-4 ${
                selectedSessionId === session.id ? 'text-white' : 'text-emerald-500'
              }`} />
            )}
          </button>
        );
      })}
    </div>
  );
}