'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DailyEntry, FoodLog, WorkoutLog, User } from './types'
import { format } from 'date-fns'

export interface SavedDay {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  deficit: number
  weight: number
  mealsCount: number
  workoutsCount: number
}

interface AppState {
  user: User
  currentDate: string
  dailyEntry: DailyEntry | null
  foodLogs: FoodLog[]
  workoutLogs: WorkoutLog[]
  savedDays: SavedDay[]

  // Actions
  setCurrentDate: (date: string) => void
  addFoodLog: (foodLog: Omit<FoodLog, 'id' | 'daily_entry_id'>) => void
  addWorkoutLog: (workoutLog: Omit<WorkoutLog, 'id' | 'daily_entry_id'>) => void
  deleteFoodLog: (id: string) => void
  deleteWorkoutLog: (id: string) => void
  updateWeight: (weight_lb: number) => void
  updateNotes: (notes: string) => void
  calculateTotals: () => void
  saveCurrentDay: () => void
  importSavedDays: (days: SavedDay[]) => void
  deleteSavedDay: (date: string) => void
  loadDemoData: () => void
}

// Mock user data
const mockUser: User = {
  id: '1',
  age: 38,
  sex: 'M',
  height_cm: 183,
  weight_lb: 169,
  activity_multiplier: 1.5,
  protein_target_g_per_lb: 1.0,
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      currentDate: format(new Date(), 'yyyy-MM-dd'),
      dailyEntry: null,
      foodLogs: [],
      workoutLogs: [],
      savedDays: [],

  setCurrentDate: (date) => set({ currentDate: date }),

  addFoodLog: (foodLog) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newFoodLog: FoodLog = {
      ...foodLog,
      id,
      daily_entry_id: get().currentDate,
    }
    set((state) => ({
      foodLogs: [...state.foodLogs, newFoodLog],
    }))
    get().calculateTotals()
  },

  addWorkoutLog: (workoutLog) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newWorkoutLog: WorkoutLog = {
      ...workoutLog,
      id,
      daily_entry_id: get().currentDate,
    }
    set((state) => ({
      workoutLogs: [...state.workoutLogs, newWorkoutLog],
    }))
    get().calculateTotals()
  },

  deleteFoodLog: (id) => {
    set((state) => ({
      foodLogs: state.foodLogs.filter((log) => log.id !== id),
    }))
    get().calculateTotals()
  },

  deleteWorkoutLog: (id) => {
    set((state) => ({
      workoutLogs: state.workoutLogs.filter((log) => log.id !== id),
    }))
    get().calculateTotals()
  },

  updateWeight: (weight_lb) => {
    set((state) => ({
      user: { ...state.user, weight_lb },
    }))
    get().calculateTotals()
  },

  updateNotes: (notes) => {
    set((state) => ({
      dailyEntry: state.dailyEntry ? { ...state.dailyEntry, journal_text: notes } : null,
    }))
  },

  calculateTotals: () => {
    const { user, foodLogs, workoutLogs, currentDate } = get()

    // Fixed BMR
    const weight_kg = user.weight_lb * 0.453592
    const bmr = 1800

    // Calculate exercise burn
    const exercise_burn = workoutLogs.reduce((sum, w) => sum + w.estimated_burn_kcal, 0)

    // Calculate intake
    const total_intake = foodLogs.reduce((sum, f) => sum + f.calories_kcal, 0)
    const total_protein = foodLogs.reduce((sum, f) => sum + f.protein_g, 0)
    const total_carbs = foodLogs.reduce((sum, f) => sum + f.carbs_g, 0)
    const total_fat = foodLogs.reduce((sum, f) => sum + f.fat_g, 0)

    // Total burn (BMR + exercise)
    const total_burn = bmr + exercise_burn

    // Deficit
    const deficit = total_burn - total_intake

    set({
      dailyEntry: {
        id: currentDate,
        date: currentDate,
        weight_kg: weight_kg,
        bmr_kcal: bmr,
        activity_kcal: 0,
        total_burn_kcal: Math.round(total_burn),
        total_intake_kcal: Math.round(total_intake),
        total_protein_g: Math.round(total_protein),
        total_carbs_g: Math.round(total_carbs),
        total_fat_g: Math.round(total_fat),
        deficit_kcal: Math.round(deficit),
        journal_text: null,
        recommendation_text: null,
      },
    })
  },

  saveCurrentDay: () => {
    const { dailyEntry, user, foodLogs, workoutLogs, savedDays, currentDate } = get()

    if (!dailyEntry) return

    const newSavedDay: SavedDay = {
      date: currentDate,
      totalCalories: dailyEntry.total_intake_kcal,
      totalProtein: dailyEntry.total_protein_g,
      totalCarbs: dailyEntry.total_carbs_g || 0,
      totalFat: dailyEntry.total_fat_g || 0,
      deficit: dailyEntry.deficit_kcal,
      weight: user.weight_lb,
      mealsCount: foodLogs.length,
      workoutsCount: workoutLogs.length,
    }

    // Remove existing entry for this date if any
    const filtered = savedDays.filter(d => d.date !== currentDate)

    set({
      savedDays: [newSavedDay, ...filtered],
    })
  },

  importSavedDays: (newDays) => {
    const { savedDays } = get()

    // Create a map of existing days by date
    const existingMap = new Map(savedDays.map(day => [day.date, day]))

    // Merge new days, preferring imported data for duplicate dates
    newDays.forEach(day => {
      existingMap.set(day.date, day)
    })

    // Convert back to array and sort by date (newest first)
    const merged = Array.from(existingMap.values()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    set({ savedDays: merged })
  },

  deleteSavedDay: (date) => {
    set((state) => ({
      savedDays: state.savedDays.filter(d => d.date !== date),
    }))
  },

  loadDemoData: () => {
    const demoData: SavedDay[] = [
      { date: '2026-02-09', totalCalories: 2150, totalProtein: 165, totalCarbs: 185, totalFat: 62, deficit: 450, weight: 169.2, mealsCount: 4, workoutsCount: 1 },
      { date: '2026-02-08', totalCalories: 2050, totalProtein: 170, totalCarbs: 175, totalFat: 58, deficit: 550, weight: 169.5, mealsCount: 3, workoutsCount: 1 },
      { date: '2026-02-07', totalCalories: 2200, totalProtein: 160, totalCarbs: 195, totalFat: 65, deficit: 350, weight: 169.8, mealsCount: 4, workoutsCount: 0 },
      { date: '2026-02-06', totalCalories: 1950, totalProtein: 175, totalCarbs: 165, totalFat: 55, deficit: 650, weight: 170.1, mealsCount: 3, workoutsCount: 2 },
      { date: '2026-02-05', totalCalories: 2100, totalProtein: 168, totalCarbs: 180, totalFat: 60, deficit: 500, weight: 170.4, mealsCount: 4, workoutsCount: 1 },
      { date: '2026-02-04', totalCalories: 2250, totalProtein: 155, totalCarbs: 200, totalFat: 68, deficit: 300, weight: 170.7, mealsCount: 5, workoutsCount: 1 },
      { date: '2026-02-03', totalCalories: 2000, totalProtein: 172, totalCarbs: 170, totalFat: 57, deficit: 600, weight: 171.0, mealsCount: 3, workoutsCount: 1 },
    ]
    set({ savedDays: demoData })
  },
}),
    {
      name: 'macro-tracker-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
