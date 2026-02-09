'use client'

import { useStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useRef, useState } from 'react'

export default function SummaryPage() {
  const router = useRouter()
  const { savedDays } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const text = await file.text()
      // TODO: Parse the file and import entries
      console.log('File content:', text)
      alert('File upload feature coming soon! File contents logged to console.')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-xl font-semibold">All Entries</h1>
        </div>

        <motion.button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          whileHover={{ scale: isUploading ? 1 : 1.05 }}
          whileTap={{ scale: isUploading ? 1 : 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Import'}
        </motion.button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </motion.header>

      {/* Content */}
      <main className="px-6 py-4 space-y-6">
        {/* Weight Graph */}
        {savedDays.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-2xl p-6 border border-gray-700/50"
          >
            <h2 className="text-base font-semibold mb-4">Weight Progress</h2>
            <div className="relative h-48">
              <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="400" y2="0" stroke="#374151" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#374151" strokeWidth="0.5" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#374151" strokeWidth="0.5" />
                <line x1="0" y1="150" x2="400" y2="150" stroke="#374151" strokeWidth="0.5" />

                {/* Weight line */}
                <polyline
                  points={savedDays
                    .slice()
                    .reverse()
                    .map((day, i) => {
                      const x = (i / Math.max(savedDays.length - 1, 1)) * 400
                      const weights = savedDays.map(d => d.weight)
                      const minWeight = Math.min(...weights)
                      const maxWeight = Math.max(...weights)
                      const range = maxWeight - minWeight || 1
                      const y = 150 - ((day.weight - minWeight) / range) * 140 - 5
                      return `${x},${y}`
                    })
                    .join(' ')}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>

                {/* Data points */}
                {savedDays
                  .slice()
                  .reverse()
                  .map((day, i) => {
                    const x = (i / Math.max(savedDays.length - 1, 1)) * 400
                    const weights = savedDays.map(d => d.weight)
                    const minWeight = Math.min(...weights)
                    const maxWeight = Math.max(...weights)
                    const range = maxWeight - minWeight || 1
                    const y = 150 - ((day.weight - minWeight) / range) * 140 - 5
                    return (
                      <circle
                        key={day.date}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#8b5cf6"
                        stroke="#1f2937"
                        strokeWidth="2"
                      />
                    )
                  })}
              </svg>

              {/* Weight labels */}
              <div className="flex justify-between mt-2 text-xs text-text-secondary">
                <span>{savedDays[savedDays.length - 1]?.weight} lb</span>
                <span className="text-text-primary font-semibold">
                  {(savedDays[0]?.weight - savedDays[savedDays.length - 1]?.weight).toFixed(1)} lb change
                </span>
                <span>{savedDays[0]?.weight} lb</span>
              </div>
            </div>
          </motion.div>
        )}

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
