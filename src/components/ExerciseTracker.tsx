import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getWorkoutPlans, saveWorkoutPlan, updateWorkoutPlan, saveCompletedSession } from '../lib/db';
import { NotesModal } from './NotesModal';
import { CreatePlanModal } from './CreatePlanModal';
import { EditPlanModal } from './EditPlanModal';
import { SessionCompletionModal } from './SessionCompletionModal';
import { PlanSelector } from './exercise/PlanSelector';
import { SessionSelector } from './exercise/SessionSelector';
import { ExerciseList } from './exercise/ExerciseList';
import { EmptyState } from './exercise/EmptyState';
import type { Exercise, WorkoutPlan, WorkoutSession } from '../types';

interface ExerciseTrackerProps {
  onSessionComplete: (sessions: number) => void;
  selectedDate: Date;
}

const DEFAULT_PLAN: WorkoutPlan = {
  id: 'default-plan',
  name: '4-Day Split',
  isDefault: true,
  sessions: [
    {
      id: 'session-1',
      name: 'Upper Body A',
      assignedDays: [1], // Monday
      exercises: [
        { name: 'DB chest press', weight: 50, sets: 3, maxReps: 11, notes: '' },
        { name: 'Incline DB chest press', weight: 50, sets: 3, maxReps: 8, notes: '' },
        { name: 'DB chest fly', weight: 25, sets: 2, maxReps: 7, notes: '' },
        { name: 'Close-grip assisted pull-ups', weight: -110, sets: 3, maxReps: 8, notes: '' },
        { name: 'Close-grip seated rows', weight: 115, sets: 3, maxReps: 8, notes: '' },
        { name: 'Wide-grip assisted pull-ups', weight: -125, sets: 2, maxReps: 5, notes: '' }
      ]
    },
    {
      id: 'session-2',
      name: 'Lower Body A',
      assignedDays: [2], // Tuesday
      exercises: [
        { name: 'Barbell squat', weight: 140, sets: 3, maxReps: 7, notes: '' },
        { name: 'Cable face pull', weight: 95, sets: 3, maxReps: 10, notes: '' },
        { name: 'Hack squat (quad)', weight: 115, sets: 3, maxReps: 6, notes: '' },
        { name: 'Standing calf', weight: 180, sets: 3, maxReps: 12, notes: '' },
        { name: 'Leg curl', weight: 115, sets: 3, maxReps: 15, notes: '' },
        { name: 'Leg extension', weight: 115, sets: 3, maxReps: 11, notes: '' }
      ]
    },
    {
      id: 'session-3',
      name: 'Upper Body B',
      assignedDays: [4], // Thursday
      exercises: [
        { name: 'Close-grip assisted pull-ups', weight: -110, sets: 3, maxReps: 8, notes: '' },
        { name: 'Close-grip seated rows', weight: 115, sets: 3, maxReps: 8, notes: '' },
        { name: 'Wide-grip assisted pull-ups', weight: -125, sets: 2, maxReps: 5, notes: '' },
        { name: 'DB chest press', weight: 50, sets: 3, maxReps: 11, notes: '' },
        { name: 'Incline DB chest press', weight: 50, sets: 3, maxReps: 8, notes: '' },
        { name: 'DB chest fly', weight: 25, sets: 2, maxReps: 7, notes: '' }
      ]
    },
    {
      id: 'session-4',
      name: 'Lower Body B',
      assignedDays: [6], // Saturday
      exercises: [
        { name: 'Barbell squat', weight: 140, sets: 3, maxReps: 7, notes: '' },
        { name: 'DB chest press', weight: 50, sets: 3, maxReps: 9, notes: '' },
        { name: 'Deadlift', weight: 55, sets: 3, maxReps: 8, notes: '' },
        { name: 'Hack squat (glut)', weight: 115, sets: 3, maxReps: 6, notes: '' },
        { name: 'Close-grip assisted pull-ups', weight: -110, sets: 3, maxReps: 7, notes: '' },
        { name: 'Standing calf', weight: 180, sets: 3, maxReps: 12, notes: '' }
      ]
    }
  ]
};

export function ExerciseTracker({ onSessionComplete, selectedDate }: ExerciseTrackerProps) {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [showNotes, setShowNotes] = useState<{ exercise: Exercise; index: number } | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadWorkoutPlans = async () => {
      if (!currentUser) return;

      try {
        const plans = await getWorkoutPlans(currentUser.uid);
        
        if (plans.length === 0) {
          // Create default plan if no plans exist
          const planId = await saveWorkoutPlan(currentUser.uid, DEFAULT_PLAN);
          setWorkoutPlans([{ ...DEFAULT_PLAN, id: planId }]);
          setSelectedPlanId(planId);
        } else {
          setWorkoutPlans(plans);
          setSelectedPlanId(plans[0].id);
        }
      } catch (error) {
        console.error('Error loading workout plans:', error);
      }
    };

    loadWorkoutPlans();
  }, [currentUser]);

  const selectedPlan = workoutPlans.find(p => p.id === selectedPlanId);
  const selectedSession = selectedPlan?.sessions.find(s => s.id === selectedSessionId);

  useEffect(() => {
    if (selectedPlan && !selectedSessionId) {
      const today = selectedDate.getDay();
      const availableSession = selectedPlan.sessions.find(s => s.assignedDays.includes(today));
      if (availableSession) {
        setSelectedSessionId(availableSession.id);
      } else {
        setSelectedSessionId(selectedPlan.sessions[0].id);
      }
    }
  }, [selectedPlan, selectedSessionId, selectedDate]);

  const handleExerciseUpdate = async (index: number, field: keyof Exercise, value: string | number) => {
    if (!selectedPlan || !selectedSession || !currentUser) return;

    const updatedSessions = selectedPlan.sessions.map(session => {
      if (session.id === selectedSession.id) {
        const updatedExercises = [...session.exercises];
        updatedExercises[index] = {
          ...updatedExercises[index],
          [field]: value
        };
        return { ...session, exercises: updatedExercises };
      }
      return session;
    });

    const updatedPlan = { ...selectedPlan, sessions: updatedSessions };
    await updateWorkoutPlan(currentUser.uid, updatedPlan);
    setWorkoutPlans(plans => plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const handleCreatePlan = async (plan: Omit<WorkoutPlan, 'id'>) => {
    if (!currentUser) return;
    const planId = await saveWorkoutPlan(currentUser.uid, plan);
    const newPlan = { ...plan, id: planId };
    setWorkoutPlans([...workoutPlans, newPlan]);
    setSelectedPlanId(planId);
    setShowCreatePlan(false);
  };

  const handleUpdatePlan = async (plan: WorkoutPlan) => {
    if (!currentUser) return;
    await updateWorkoutPlan(currentUser.uid, plan);
    setWorkoutPlans(plans => plans.map(p => p.id === plan.id ? plan : p));
    setShowEditPlan(false);
  };

  const handleSessionComplete = async () => {
    if (!currentUser || !selectedPlan || !selectedSession) return;

    const completedSession = {
      id: '',
      planId: selectedPlan.id,
      sessionId: selectedSession.id,
      date: selectedDate.toISOString().split('T')[0],
      exercises: selectedSession.exercises
    };

    await saveCompletedSession(currentUser.uid, completedSession);
    setShowCompletion(true);
    onSessionComplete(selectedPlan.sessions.findIndex(s => s.id === selectedSession.id) + 1);
  };

  if (workoutPlans.length === 0) {
    return <EmptyState onCreateClick={() => setShowCreatePlan(true)} />;
  }

  return (
    <div className="space-y-6">
      <PlanSelector
        plans={workoutPlans}
        selectedPlanId={selectedPlanId}
        onPlanSelect={setSelectedPlanId}
        onCreateClick={() => setShowCreatePlan(true)}
        onEditClick={() => setShowEditPlan(true)}
      />

      {selectedPlan && (
        <>
          <SessionSelector
            sessions={selectedPlan.sessions}
            selectedSessionId={selectedSessionId}
            onSessionSelect={setSelectedSessionId}
            selectedDate={selectedDate}
          />

          {selectedSession && (
            <>
              <ExerciseList
                exercises={selectedSession.exercises}
                onExerciseUpdate={handleExerciseUpdate}
                onNotesClick={(exercise, index) => setShowNotes({ exercise, index })}
              />

              <button
                onClick={handleSessionComplete}
                className="w-full py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Complete Session
              </button>
            </>
          )}
        </>
      )}

      {showCreatePlan && (
        <CreatePlanModal
          onSave={handleCreatePlan}
          onClose={() => setShowCreatePlan(false)}
        />
      )}

      {showEditPlan && selectedPlan && (
        <EditPlanModal
          plan={selectedPlan}
          onSave={handleUpdatePlan}
          onClose={() => setShowEditPlan(false)}
        />
      )}

      {showNotes && (
        <NotesModal
          exercise={showNotes.exercise}
          onSave={(notes) => handleExerciseUpdate(showNotes.index, 'notes', notes)}
          onClose={() => setShowNotes(null)}
        />
      )}

      {showCompletion && selectedSession && (
        <SessionCompletionModal
          sessionName={selectedSession.name}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
}