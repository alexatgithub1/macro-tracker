'use client'

import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SummaryPage() {
  const router = useRouter()
  const { savedDays, importSavedDays, deleteSavedDay, loadDemoData } = useStore()
  const [isImporting, setIsImporting] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [pastedData, setPastedData] = useState('')
  const [hoveredPoint, setHoveredPoint] = useState<{date: string, weight: number, x: number, y: number} | null>(null)
  const [showDemoHint, setShowDemoHint] = useState(false)

  // Show demo hint on first load if no data
  useEffect(() => {
    if (savedDays.length === 0) {
      const timer = setTimeout(() => setShowDemoHint(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    // Helper function to parse a CSV line (handles quoted fields)
    const parseLine = (line: string): string[] => {
      // Remove outer quotes if the entire line is quoted
      if (line.startsWith('"') && line.endsWith('"')) {
        line = line.slice(1, -1)
      }

      const values: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())

      return values
    }

    const headers = parseLine(lines[0])
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i])
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      data.push(row)
    }

    return data
  }

  const normalizeImportedData = (data: any[]): any[] => {
    return data.map(row => ({
      date: row.date || row.Date,
      totalCalories: Number(row.totalCalories || row.Calories || row.calories || 0),
      totalProtein: Number(row.totalProtein || row.Protein || row.protein || 0),
      totalCarbs: Number(row.totalCarbs || row.Carbs || row.carbs || 0),
      totalFat: Number(row.totalFat || row.Fat || row.fat || 0),
      deficit: Number(row.deficit || row.Deficit || row.calorieDeficit || 0),
      weight: Number(row.weight || row.Weight || 0),
      mealsCount: Number(row.mealsCount || row.meals || row.Meals || 0),
      workoutsCount: Number(row.workoutsCount || row.workouts || row.Workouts || 0),
    }))
  }

  const handleImport = async () => {
    if (!pastedData.trim()) {
      alert('Please paste your data first')
      return
    }

    setIsImporting(true)
    try {
      let parsedData: any[] = []

      // Try JSON first
      try {
        parsedData = JSON.parse(pastedData)
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData]
        }
      } catch {
        // If JSON fails, parse as CSV
        parsedData = parseCSV(pastedData)
      }

      // Normalize the data to match SavedDay interface
      const normalizedData = normalizeImportedData(parsedData)

      // Validate that we have at least some valid data
      if (normalizedData.length === 0 || !normalizedData[0].date) {
        throw new Error('No valid data found')
      }

      // Import the data
      importSavedDays(normalizedData)

      alert(`Successfully imported ${normalizedData.length} entries!`)
      setShowImportModal(false)
      setPastedData('')
    } catch (error) {
      console.error('Error importing data:', error)
      alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsImporting(false)
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

        <div className="flex gap-2">
          <motion.button
            onClick={() => {
              if (confirm('Load demo data? This will add 7 days of sample entries.')) {
                loadDemoData()
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-sm font-medium hover:from-green-500 hover:to-emerald-500 transition-colors"
          >
            Demo
          </motion.button>
          <motion.button
            onClick={() => setShowImportModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import
          </motion.button>
        </div>
      </motion.header>

      {/* Demo Hint Arrow */}
      <AnimatePresence>
        {showDemoHint && savedDays.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
            className="absolute top-16 right-6 flex flex-col items-end gap-2 z-50"
            onClick={() => setShowDemoHint(false)}
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
              className="text-4xl"
            >
              ☝️
            </motion.div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
            >
              Try demo data!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="px-6 py-4 space-y-6">
        {/* Weight Graph */}
        {(() => {
          const daysWithWeight = savedDays.filter(d => d.weight > 0)

          if (daysWithWeight.length < 2) return null

          // Prepare chart data (sorted oldest to newest for proper line display)
          const chartData = daysWithWeight
            .slice()
            .reverse()
            .map(entry => ({
              date: format(new Date(entry.date), 'MMM d'),
              weight: entry.weight,
            }))

          // Calculate min and max for better Y-axis scaling
          const weights = daysWithWeight.map(e => e.weight)
          const minWeight = Math.min(...weights)
          const maxWeight = Math.max(...weights)
          const padding = (maxWeight - minWeight) * 0.2 || 5

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-surface to-gray-900/50 rounded-2xl p-6 border border-gray-700/50 shadow-lg"
            >
              <h2 className="text-base font-semibold mb-6 flex items-center gap-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Weight Progress</span>
              </h2>

              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6b5ce7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="#1a1a1a" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#444"
                      tick={{ fill: '#888', fontSize: 12 }}
                      axisLine={{ stroke: '#333' }}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#444"
                      tick={{ fill: '#888', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[minWeight - padding, maxWeight + padding]}
                      tickFormatter={(value) => `${value.toFixed(0)}`}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{
                        color: '#888',
                        fontSize: '13px',
                        marginBottom: '4px',
                      }}
                      itemStyle={{
                        color: '#00d4ff',
                        fontSize: '15px',
                        padding: 0,
                      }}
                      formatter={(value: number | string | undefined) => {
                        if (value === undefined) return ['N/A', ''];
                        return [`${typeof value === 'number' ? value.toFixed(1) : value} lbs`, ''];
                      }}
                      cursor={{ stroke: '#333', strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#00d4ff"
                      strokeWidth={2}
                      fill="url(#colorWeight)"
                      dot={{ fill: '#00d4ff', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#00d4ff', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Weight labels */}
              <div className="flex justify-between pt-4 border-t border-gray-700/30">
                <div className="flex flex-col items-start bg-gray-800/40 rounded-lg px-3 py-2">
                  <span className="text-text-tertiary text-xs mb-1">Start</span>
                  <span className="font-bold text-blue-400">{daysWithWeight[daysWithWeight.length - 1]?.weight.toFixed(1)} lb</span>
                </div>
                <div className="flex flex-col items-center bg-gray-800/40 rounded-lg px-3 py-2">
                  <span className="text-text-tertiary text-xs mb-1">Change</span>
                  <span className={`font-bold ${
                    (daysWithWeight[0]?.weight - daysWithWeight[daysWithWeight.length - 1]?.weight) < 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {(daysWithWeight[0]?.weight - daysWithWeight[daysWithWeight.length - 1]?.weight) < 0 ? '' : '+'}
                    {(daysWithWeight[0]?.weight - daysWithWeight[daysWithWeight.length - 1]?.weight).toFixed(1)} lb
                  </span>
                </div>
                <div className="flex flex-col items-end bg-gray-800/40 rounded-lg px-3 py-2">
                  <span className="text-text-tertiary text-xs mb-1">Current</span>
                  <span className="font-bold text-purple-400">{daysWithWeight[0]?.weight.toFixed(1)} lb</span>
                </div>
              </div>
            </motion.div>
          )
        })()}

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
                className="bg-surface rounded-2xl p-6 border border-gray-700/50 relative group"
              >
                {/* Delete Button */}
                <motion.button
                  onClick={() => {
                    if (confirm(`Delete entry for ${format(new Date(day.date), 'MMMM d, yyyy')}?`)) {
                      deleteSavedDay(day.date)
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>

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
                    <div className="text-lg font-bold">{day.weight > 0 ? day.weight.toFixed(1) : '-'} lb</div>
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

      {/* Import Modal */}
      {showImportModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowImportModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Import Data</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 bg-border rounded-full flex items-center justify-center hover:bg-border/70"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <p className="text-sm text-text-secondary mb-4">
              Paste your CSV data below (with headers: date, totalCalories, totalProtein, totalCarbs, totalFat, deficit, weight, mealsCount, workoutsCount)
            </p>

            <textarea
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              placeholder={`date,totalCalories,totalProtein,totalCarbs,totalFat,deficit,weight,mealsCount,workoutsCount\n2026-02-02,1600,130,90,85,500,169.8,3,2\n2026-02-03,2075,120,180,95,60,169.8,3,1`}
              rows={12}
              className="w-full px-4 py-3 bg-border rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
            />

            <div className="flex gap-3 mt-4">
              <motion.button
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
                whileHover={{ scale: isImporting ? 1 : 1.02 }}
                whileTap={{ scale: isImporting ? 1 : 0.98 }}
                className="px-6 py-3 bg-border rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </motion.button>

              <motion.button
                onClick={handleImport}
                disabled={isImporting}
                whileHover={{ scale: isImporting ? 1 : 1.02 }}
                whileTap={{ scale: isImporting ? 1 : 0.98 }}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Importing...' : 'Import Data'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
