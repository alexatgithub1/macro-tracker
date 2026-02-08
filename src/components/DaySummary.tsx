'use client'

import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { format } from 'date-fns'
import { useState } from 'react'

interface DaySummaryProps {
  onClose: () => void
}

export default function DaySummary({ onClose }: DaySummaryProps) {
  const { user, dailyEntry, foodLogs, workoutLogs, saveCurrentDay } = useStore()
  const [recommendations, setRecommendations] = useState<string>('')
  const [isLoadingRecs, setIsLoadingRecs] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const proteinTarget = Math.round(user.weight_lb * user.protein_target_g_per_lb)
  const calorieTarget = 2400

  const generateRecommendations = async () => {
    setIsLoadingRecs(true)
    try {
      // TODO: Call AI API to generate recommendations based on daily data
      // For now, show a placeholder
      setRecommendations(
        `Based on today's intake:\n\n` +
        `✅ You're at ${dailyEntry?.total_protein_g || 0}g protein (${proteinTarget}g target)\n` +
        `✅ You consumed ${dailyEntry?.total_intake_kcal || 0} calories (${calorieTarget} target)\n` +
        `✅ You burned ~${dailyEntry?.total_burn_kcal || 0} calories from workouts\n\n` +
        `Recommendations:\n` +
        `• ${dailyEntry && dailyEntry.total_protein_g < proteinTarget ? 'Add more protein-rich foods' : 'Great protein intake!'}\n` +
        `• ${dailyEntry && dailyEntry.deficit_kcal > 0 ? 'You\'re in a good deficit for weight loss' : 'Consider reducing calories slightly'}\n` +
        `• Stay hydrated and get 7-9 hours of sleep`
      )
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setIsLoadingRecs(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Today's Summary</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 bg-border rounded-full flex items-center justify-center hover:bg-border/70"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Date */}
        <div className="text-sm text-text-secondary mb-6">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>

        {/* Stats Overview */}
        <div className="space-y-4 mb-6">
          <div className="bg-border rounded-xl p-4">
            <div className="text-xs text-text-secondary mb-1">Total Calories</div>
            <div className="text-2xl font-bold">{dailyEntry?.total_intake_kcal || 0} kcal</div>
            <div className="text-xs text-text-tertiary">Target: {calorieTarget} kcal</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-border rounded-xl p-3">
              <div className="text-xs text-text-secondary mb-1">Protein</div>
              <div className="text-lg font-bold text-blue-400">{dailyEntry?.total_protein_g || 0}g</div>
            </div>
            <div className="bg-border rounded-xl p-3">
              <div className="text-xs text-text-secondary mb-1">Carbs</div>
              <div className="text-lg font-bold text-orange-400">{dailyEntry?.total_carbs_g || 0}g</div>
            </div>
            <div className="bg-border rounded-xl p-3">
              <div className="text-xs text-text-secondary mb-1">Fat</div>
              <div className="text-lg font-bold text-yellow-400">{dailyEntry?.total_fat_g || 0}g</div>
            </div>
          </div>

          <div className="bg-border rounded-xl p-4">
            <div className="text-xs text-text-secondary mb-1">Deficit/Surplus</div>
            <div className={`text-2xl font-bold ${dailyEntry && dailyEntry.deficit_kcal > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dailyEntry && dailyEntry.deficit_kcal > 0 ? '+' : '-'}{Math.abs(dailyEntry?.deficit_kcal || 0)} kcal
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Meals ({foodLogs.length})</h3>
          {foodLogs.length === 0 ? (
            <div className="text-sm text-text-tertiary text-center py-4">No meals logged</div>
          ) : (
            <div className="space-y-2">
              {foodLogs.map((log) => (
                <div key={log.id} className="bg-border rounded-lg p-3">
                  <div className="text-sm font-medium mb-1">{log.parsed_description}</div>
                  <div className="flex gap-3 text-xs text-text-secondary">
                    <span>{log.calories_kcal} kcal</span>
                    <span>•</span>
                    <span>{log.protein_g}g P</span>
                    <span>•</span>
                    <span>{log.carbs_g}g C</span>
                    <span>•</span>
                    <span>{log.fat_g}g F</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workouts */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">Workouts ({workoutLogs.length})</h3>
          {workoutLogs.length === 0 ? (
            <div className="text-sm text-text-tertiary text-center py-4">No workouts logged</div>
          ) : (
            <div className="space-y-2">
              {workoutLogs.map((log) => (
                <div key={log.id} className="bg-border rounded-lg p-3">
                  <div className="text-sm font-medium capitalize mb-1">{log.type}</div>
                  <div className="text-xs text-text-secondary">
                    {log.duration_minutes} minutes • ~{log.estimated_burn_kcal} kcal burned
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3">AI Recommendations</h3>
          {!recommendations ? (
            <motion.button
              onClick={generateRecommendations}
              disabled={isLoadingRecs}
              whileHover={{ scale: isLoadingRecs ? 1 : 1.02 }}
              whileTap={{ scale: isLoadingRecs ? 1 : 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-colors disabled:opacity-50"
            >
              {isLoadingRecs ? 'Generating...' : 'Get Recommendations'}
            </motion.button>
          ) : (
            <div className="bg-border rounded-xl p-4">
              <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">
                {recommendations}
              </pre>
            </div>
          )}
        </div>

        {/* Save Entry Button */}
        <motion.button
          onClick={() => {
            saveCurrentDay()
            setIsSaved(true)
            setTimeout(() => {
              onClose()
            }, 1000)
          }}
          disabled={isSaved}
          whileHover={{ scale: isSaved ? 1 : 1.02 }}
          whileTap={{ scale: isSaved ? 1 : 0.98 }}
          className={`w-full py-3 rounded-xl font-medium transition-colors ${
            isSaved
              ? 'bg-green-600 text-white'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
          }`}
        >
          {isSaved ? '✓ Entry Saved!' : 'Save Entry'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
