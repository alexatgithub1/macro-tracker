'use client'

import { create } from 'zustand'
import { DailyEntry, FoodLog, WorkoutLog, User } from './types'
import { format } from 'date-fns'

interface SavedDay {
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
  updateWeight: (weight_lb: number) => void
  calculateTotals: () => void
  saveCurrentDay: () => void
}

// Mock user data
const mockUser: User = {
  id: '1',
  age: 38,
  sex: 'M',
  height_cm: 183,
  weight_lb: 185,
  activity_multiplier: 1.5,
  protein_target_g_per_lb: 1.0,
}

export const useStore = create<AppState>((set, get) => ({
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

  updateWeight: (weight_lb) => {
    set((state) => ({
      user: { ...state.user, weight_lb },
    }))
    get().calculateTotals()
  },

  calculateTotals: () => {
    const { user, foodLogs, workoutLogs, currentDate } = get()

    // Calculate BMR (Mifflin-St Jeor)
    const weight_kg = user.weight_lb * 0.453592
    const bmr = 10 * weight_kg + 6.25 * user.height_cm - 5 * user.age + 5

    // Calculate activity calories
    const activity_kcal = bmr * (user.activity_multiplier - 1)

    // Calculate exercise burn
    const exercise_burn = workoutLogs.reduce((sum, w) => sum + w.estimated_burn_kcal, 0)

    // Calculate intake
    const total_intake = foodLogs.reduce((sum, f) => sum + f.calories_kcal, 0)
    const total_protein = foodLogs.reduce((sum, f) => sum + f.protein_g, 0)
    const total_carbs = foodLogs.reduce((sum, f) => sum + f.carbs_g, 0)
    const total_fat = foodLogs.reduce((sum, f) => sum + f.fat_g, 0)

    // Total burn
    const total_burn = Math.round(bmr + activity_kcal + exercise_burn)

    // Deficit
    const deficit = total_burn - total_intake

    set({
      dailyEntry: {
        id: currentDate,
        date: currentDate,
        weight_kg: weight_kg,
        bmr_kcal: Math.round(bmr),
        activity_kcal: Math.round(activity_kcal),
        total_burn_kcal: total_burn,
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
}))
