import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  addDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import type { Settings, FoodEntry, CustomFood, DailyProgress, WorkoutPlan, CompletedSession } from '../types';

// Settings
export async function getUserSettings(userId: string): Promise<Settings | null> {
  const docRef = doc(db, 'users', userId, 'settings', 'targets');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as Settings : null;
}

export async function saveUserSettings(userId: string, settings: Settings): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'settings', 'targets'), settings);
}

// Food Entries
export async function getFoodEntries(userId: string, date: string): Promise<FoodEntry[]> {
  const entriesRef = collection(db, 'users', userId, 'foodEntries', date, 'entries');
  const querySnapshot = await getDocs(entriesRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodEntry));
}

export async function saveFoodEntry(userId: string, date: string, entry: FoodEntry): Promise<void> {
  await setDoc(
    doc(db, 'users', userId, 'foodEntries', date, 'entries', entry.id),
    entry
  );
}

export async function deleteFoodEntry(userId: string, date: string, entryId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'foodEntries', date, 'entries', entryId));
}

// Custom Foods
export async function searchCustomFoods(searchTerm: string): Promise<CustomFood[]> {
  const foodsRef = collection(db, 'foods');
  const q = query(
    foodsRef,
    where('name', '>=', searchTerm.toLowerCase()),
    where('name', '<=', searchTerm.toLowerCase() + '\uf8ff')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomFood));
}

export async function addCustomFood(food: Omit<CustomFood, 'id'>): Promise<void> {
  await addDoc(collection(db, 'foods'), {
    ...food,
    name: food.name.toLowerCase()
  });
}

// Daily Progress
export async function getDailyProgress(userId: string, date: string): Promise<DailyProgress | null> {
  const docRef = doc(db, 'users', userId, 'progress', date);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as DailyProgress : null;
}

export async function saveDailyProgress(userId: string, date: string, progress: DailyProgress): Promise<void> {
  await setDoc(doc(db, 'users', userId, 'progress', date), progress);
}

// Workout Plans
export async function getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  const plansRef = collection(db, 'users', userId, 'workoutPlans');
  const querySnapshot = await getDocs(plansRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutPlan));
}

export async function saveWorkoutPlan(userId: string, plan: Omit<WorkoutPlan, 'id'>): Promise<string> {
  const planRef = doc(collection(db, 'users', userId, 'workoutPlans'));
  const planWithId = { ...plan, id: planRef.id };
  await setDoc(planRef, planWithId);
  return planRef.id;
}

export async function updateWorkoutPlan(userId: string, plan: WorkoutPlan): Promise<void> {
  const planRef = doc(db, 'users', userId, 'workoutPlans', plan.id);
  await updateDoc(planRef, plan);
}

// Completed Sessions
export async function saveCompletedSession(userId: string, session: CompletedSession): Promise<void> {
  const sessionRef = doc(collection(db, 'users', userId, 'completedSessions'));
  const sessionWithId = { ...session, id: sessionRef.id };
  await setDoc(sessionRef, sessionWithId);
}

export async function getCompletedSessions(userId: string, startDate: string, endDate: string): Promise<CompletedSession[]> {
  const sessionsRef = collection(db, 'users', userId, 'completedSessions');
  const q = query(
    sessionsRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompletedSession));
}

export function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}