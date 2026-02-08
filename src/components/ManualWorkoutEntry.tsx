'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'

interface ManualWorkoutEntryProps {
  onClose: () => void
}

export default function ManualWorkoutEntry({ onClose }: ManualWorkoutEntryProps) {
  const { addWorkoutLog } = useStore()
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) {
      alert('Please enter your workout')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/parse-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })

      if (!response.ok) {
        throw new Error('Failed to parse workout')
      }

      const data = await response.json()

      addWorkoutLog({
        logged_at: new Date(),
        type: data.type,
        duration_minutes: data.duration,
        estimated_burn_kcal: data.calories_burned,
        notes: data.notes,
      })

      onClose()
    } catch (error) {
      console.error('Error parsing workout:', error)
      alert('Failed to parse workout. Please try again.')
    } finally {
      setIsProcessing(false)
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
        className="bg-surface backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Workout</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 bg-border rounded-full flex items-center justify-center hover:bg-border/70"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              What did you do?
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="e.g., 30 min run, lifted weights for an hour, walked 5 miles"
              rows={4}
              autoFocus
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-border rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-xs text-text-tertiary mt-2">
              AI will estimate duration and calories burned automatically
            </p>
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={isProcessing}
            whileHover={{ scale: isProcessing ? 1 : 1.02 }}
            whileTap={{ scale: isProcessing ? 1 : 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Add Workout'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
