export interface Exercise {
  name: string;
  weight: number;
  sets: number;
  maxReps: number;
  notes?: string;
  weeklyChanges?: {
    weight: number;
    sets: number;
    maxReps: number;
  };
}

export interface WorkoutSession {
  id: string;
  name: string;
  exercises: Exercise[];
  assignedDays: number[]; // 0-6 representing Sunday-Saturday
}

export interface WorkoutPlan {
  id: string;
  name: string;
  sessions: WorkoutSession[];
  isDefault: boolean;
  weekStartDate?: string;
}

export interface CompletedSession {
  id: string;
  planId: string;
  sessionId: string;
  date: string;
  exercises: Exercise[];
}

export interface Settings {
  caloriesTarget: number;
  proteinTarget: number;
  stepsTarget: number;
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  timestamp: string;
  isFavorite: boolean;
}

export interface CustomFood {
  id: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  createdBy: string;
  createdAt: string;
}

export interface DailyProgress {
  date: string;
  calories: number;
  protein: number;
  steps: number;
  completedSessions: number;
}