'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function SummaryPage() {
  const router = useRouter()
  const { savedDays } = useStore()

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 flex items-center gap-4"
      >
        <motion.button
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">All Entries</h1>
      </motion.header>

      {/* Content */}
      <main className="px-6 py-4">
        {savedDays.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-lg font-semibold mb-2">No saved entries yet</h2>
            <p className="text-sm text-text-secondary">
              Save your daily entries to see them here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {savedDays.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-surface rounded-2xl p-6 border border-gray-700/50"
              >
                {/* Date */}
                <div className="text-sm text-text-secondary mb-4">
                  {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-border rounded-xl p-3">
                    <div className="text-xs text-text-secondary mb-1">Calories</div>
                    <div className="text-lg font-bold">{day.totalCalories} kcal</div>
                  </div>
                  <div className="bg-border rounded-xl p-3">
                    <div className="text-xs text-text-secondary mb-1">Protein</div>
                    <div className="text-lg font-bold text-blue-400">{day.totalProtein}g</div>
                  </div>
                  <div className="bg-border rounded-xl p-3">
                    <div className="text-xs text-text-secondary mb-1">Deficit</div>
                    <div className={`text-lg font-bold ${day.deficit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {day.deficit > 0 ? '+' : ''}{day.deficit} kcal
                    </div>
                  </div>
                  <div className="bg-border rounded-xl p-3">
                    <div className="text-xs text-text-secondary mb-1">Weight</div>
                    <div className="text-lg font-bold">{day.weight} lb</div>
                  </div>
                </div>

                {/* Meals & Workouts Count */}
                <div className="flex gap-4 text-sm text-text-secondary">
                  <span>{day.mealsCount} meals logged</span>
                  <span>•</span>
                  <span>{day.workoutsCount} workouts</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
