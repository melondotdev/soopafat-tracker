import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import type { WorkoutPlan, WorkoutSession, Exercise } from '../types';

interface EditPlanModalProps {
  plan: WorkoutPlan;
  onSave: (plan: WorkoutPlan) => void;
  onClose: () => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_EXERCISE: Exercise = {
  name: '',
  weight: 0,
  sets: 3,
  maxReps: 8,
  notes: ''
};

export function EditPlanModal({ plan, onSave, onClose }: EditPlanModalProps) {
  const [name, setName] = useState(plan.name);
  const [sessions, setSessions] = useState<WorkoutSession[]>(plan.sessions);

  const addSession = () => {
    setSessions([...sessions, {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Session ${sessions.length + 1}`,
      exercises: [{ ...DEFAULT_EXERCISE }],
      assignedDays: []
    }]);
  };

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const addExercise = (sessionIndex: number) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].exercises.push({ ...DEFAULT_EXERCISE });
    setSessions(updatedSessions);
  };

  const removeExercise = (sessionIndex: number, exerciseIndex: number) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].exercises.splice(exerciseIndex, 1);
    setSessions(updatedSessions);
  };

  const updateExercise = (
    sessionIndex: number,
    exerciseIndex: number,
    field: keyof Exercise,
    value: string | number
  ) => {
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].exercises[exerciseIndex] = {
      ...updatedSessions[sessionIndex].exercises[exerciseIndex],
      [field]: value
    };
    setSessions(updatedSessions);
  };

  const updateSessionName = (index: number, name: string) => {
    const updatedSessions = [...sessions];
    updatedSessions[index].name = name;
    setSessions(updatedSessions);
  };

  const toggleDay = (sessionIndex: number, day: number) => {
    const updatedSessions = [...sessions];
    const currentDays = updatedSessions[sessionIndex].assignedDays;
    
    if (currentDays.includes(day)) {
      updatedSessions[sessionIndex].assignedDays = currentDays.filter(d => d !== day);
    } else {
      updatedSessions[sessionIndex].assignedDays = [...currentDays, day].sort();
    }
    
    setSessions(updatedSessions);
  };

  const handleSubmit = () => {
    const validSessions = sessions.map(session => ({
      ...session,
      exercises: session.exercises.filter(e => e.name.trim() !== '')
    })).filter(session => session.exercises.length > 0);

    if (validSessions.length === 0) {
      alert('Please add at least one exercise to your plan');
      return;
    }

    const updatedPlan: WorkoutPlan = {
      ...plan,
      name: name.trim() || 'Custom Plan',
      sessions: validSessions
    };

    onSave(updatedPlan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Workout Plan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {sessions.map((session, sessionIndex) => (
            <div key={session.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={session.name}
                  onChange={(e) => updateSessionName(sessionIndex, e.target.value)}
                  className="text-lg font-semibold bg-transparent border-b border-transparent focus:border-gray-300 focus:outline-none"
                />
                {sessions.length > 1 && (
                  <button
                    onClick={() => removeSession(sessionIndex)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(sessionIndex, i)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      session.assignedDays.includes(i)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

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
                  {session.exercises.map((exercise, exerciseIndex) => (
                    <tr key={exerciseIndex} className="border-b">
                      <td className="py-2">
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'name', e.target.value)}
                          placeholder="Exercise name"
                          className="w-full p-1 border rounded"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'weight', parseFloat(e.target.value))}
                          className="w-20 p-1 border rounded text-right"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                          className="w-16 p-1 border rounded text-right"
                        />
                      </td>
                      <td className="text-right">
                        <input
                          type="number"
                          value={exercise.maxReps}
                          onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'maxReps', parseInt(e.target.value))}
                          className="w-16 p-1 border rounded text-right"
                        />
                      </td>
                      <td className="text-right">
                        {session.exercises.length > 1 && (
                          <button
                            onClick={() => removeExercise(sessionIndex, exerciseIndex)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() => addExercise(sessionIndex)}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Exercise
              </button>
            </div>
          ))}

          <button
            onClick={addSession}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Session
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Save Changes
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
    </div>
  );
}