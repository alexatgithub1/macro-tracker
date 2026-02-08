export interface User {
  id: string
  age: number
  sex: 'M' | 'F'
  height_cm: number
  weight_lb: number
  activity_multiplier: number
  protein_target_g_per_lb: number
}

export interface DailyEntry {
  id: string
  date: string // YYYY-MM-DD
  weight_kg: number | null
  bmr_kcal: number
  activity_kcal: number
  total_burn_kcal: number
  total_intake_kcal: number
  total_protein_g: number
  total_carbs_g?: number
  total_fat_g?: number
  deficit_kcal: number
  journal_text: string | null
  recommendation_text: string | null
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type InputMethod = 'voice' | 'photo' | 'manual'

export interface FoodLog {
  id: string
  daily_entry_id: string
  logged_at: Date
  input_method: InputMethod
  raw_input: string
  parsed_description: string
  calories_kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  confidence: number // 0.0-1.0
  meal_type: MealType | null
}

export type WorkoutType = 'strength' | 'cardio' | 'walk' | 'other'

export interface WorkoutLog {
  id: string
  daily_entry_id: string
  logged_at: Date
  type: WorkoutType
  duration_minutes: number
  estimated_burn_kcal: number
  notes: string | null
}

export interface MacroSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence?: number
}
