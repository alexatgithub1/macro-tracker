'use client'

import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { Mic, Camera, Plus, Flame, Beef, TrendingDown, Dumbbell, X, BarChart3, Calendar, ChevronLeft, ChevronRight, StickyNote, Sparkles } from 'lucide-react'
import { format, addDays, subDays, parseISO, isToday } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ManualFoodEntry from '@/components/ManualFoodEntry'
import ManualWorkoutEntry from '@/components/ManualWorkoutEntry'
import DaySummary from '@/components/DaySummary'

export default function TodayView() {
  const router = useRouter()
  const { user, dailyEntry, foodLogs, workoutLogs, currentDate, setCurrentDate, calculateTotals, updateWeight, deleteFoodLog, deleteWorkoutLog, updateNotes } = useStore()
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [showWorkoutEntry, setShowWorkoutEntry] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [hoveredStat, setHoveredStat] = useState<number | null>(null)
  const [hoveredMeal, setHoveredMeal] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)

  useEffect(() => {
    calculateTotals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (dailyEntry?.journal_text) {
      setNotes(dailyEntry.journal_text)
    } else {
      setNotes('')
    }
  }, [dailyEntry?.journal_text])

  const handleNotesChange = (value: string) => {
    setNotes(value)
    updateNotes(value)
  }

  const generateAINotes = async () => {
    setIsGeneratingNotes(true)
    try {
      // TODO: Add API endpoint for AI-generated notes
      await new Promise(resolve => setTimeout(resolve, 1500))
      const aiNotes = `Based on today's data:\n- Consumed ${dailyEntry?.total_intake_kcal || 0} calories\n- Hit ${dailyEntry?.total_protein_g || 0}g protein\n- ${dailyEntry?.deficit_kcal && dailyEntry.deficit_kcal > 0 ? `Great deficit of ${dailyEntry.deficit_kcal} kcal!` : 'Consider increasing activity'}`
      handleNotesChange(aiNotes)
    } catch (error) {
      console.error('Error generating AI notes:', error)
      alert('Failed to generate AI notes. Please try again.')
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  const proteinTarget = Math.round(user.weight_lb * user.protein_target_g_per_lb)
  const calorieTarget = 2400
  const proteinProgress = dailyEntry ? (dailyEntry.total_protein_g / proteinTarget) * 100 : 0
  const calorieProgress = dailyEntry ? (dailyEntry.total_intake_kcal / calorieTarget) * 100 : 0

  const deficitValue = dailyEntry?.deficit_kcal || 0
  const isInDeficit = deficitValue > 0
  const isSurplus = deficitValue < 0

  const nutritionStats = [
    {
      icon: Flame,
      label: 'Calories',
      current: dailyEntry?.total_intake_kcal || 0,
      target: calorieTarget,
      unit: 'kcal',
      color: 'from-orange-500 to-red-500',
      percentage: Math.min(calorieProgress, 100)
    },
    {
      icon: Beef,
      label: 'Protein',
      current: dailyEntry?.total_protein_g || 0,
      target: proteinTarget,
      unit: 'g',
      color: 'from-blue-500 to-cyan-500',
      percentage: Math.min(proteinProgress, 100)
    },
    {
      icon: TrendingDown,
      label: isInDeficit ? 'Deficit' : isSurplus ? 'Surplus' : 'Balance',
      current: Math.abs(deficitValue),
      target: calorieTarget,
      unit: 'kcal',
      color: isInDeficit ? 'from-emerald-500 to-green-400' : 'from-red-500 to-orange-500',
      percentage: Math.min((Math.abs(deficitValue) / calorieTarget) * 100, 100),
      isDeficit: isInDeficit,
      isSurplus: isSurplus
    }
  ]

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
          >
            <Calendar className="w-4 h-4" />
          </motion.div>
          <div className="flex items-center gap-1">
            <motion.button
              onClick={() => {
                const newDate = format(subDays(parseISO(currentDate), 1), 'yyyy-MM-dd')
                setCurrentDate(newDate)
                calculateTotals()
              }}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 bg-border rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="text-sm text-text-secondary px-2 min-w-[100px] text-center">
              {isToday(parseISO(currentDate)) ? 'Today' : format(parseISO(currentDate), 'MMM d, yyyy')}
            </span>
            <motion.button
              onClick={() => {
                const newDate = format(addDays(parseISO(currentDate), 1), 'yyyy-MM-dd')
                setCurrentDate(newDate)
                calculateTotals()
              }}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 bg-border rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <motion.button
          onClick={() => router.push('/summary')}
          whileHover={{ scale: 1.05, rotate: [0, -10, 10, 0] }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center"
        >
          <BarChart3 className="w-5 h-5" />
        </motion.button>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 py-4 space-y-6">
        {/* Weight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-surface backdrop-blur-xl border border-gray-700/50 p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <motion.span
                  className="text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  {user.weight_lb.toFixed(1)}
                </motion.span>
                <span className="text-text-secondary text-xl">lb</span>
              </div>

              {/* Weight Controls */}
              <div className="flex flex-col gap-2">
                <motion.button
                  onClick={() => updateWeight(user.weight_lb + 0.5)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl p-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => updateWeight(Math.max(0, user.weight_lb - 0.5))}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl p-2 transition-all"
                >
                  <X className="w-5 h-5 rotate-0" style={{ strokeWidth: 3 }} />
                </motion.button>
              </div>
            </div>

            <motion.div
              className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Macros Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-surface backdrop-blur-xl border border-gray-700/50 p-6"
        >
          <div className="space-y-4">
            {nutritionStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onHoverStart={() => setHoveredStat(index)}
                  onHoverEnd={() => setHoveredStat(null)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: hoveredStat === index ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className={`w-4 h-4 ${hoveredStat === index ? 'text-orange-400' : 'text-gray-500'} transition-colors`} />
                      </motion.div>
                      <span className="text-gray-400 group-hover:text-white transition-colors text-sm">
                        {stat.label}
                      </span>
                    </div>
                    <motion.span
                      className={`text-sm ${
                        stat.isDeficit ? 'text-green-400' :
                        stat.isSurplus ? 'text-red-400' :
                        'text-gray-300'
                      }`}
                      animate={{ scale: hoveredStat === index ? 1.1 : 1 }}
                    >
                      {stat.label === 'Deficit' || stat.label === 'Surplus' || stat.label === 'Balance'
                        ? `${stat.isDeficit ? '+' : stat.isSurplus ? '-' : ''}${stat.current}${stat.unit}`
                        : `${stat.current} / ${stat.target}${stat.unit}`
                      }
                    </motion.span>
                  </div>

                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stat.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                        repeatDelay: 1
                      }}
                      style={{ width: '50%' }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Meals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-surface backdrop-blur-xl border border-gray-700/50 overflow-hidden"
        >
          <motion.div
            className="flex items-center justify-between p-6 cursor-pointer"
            onClick={() => setShowAddMenu(!showAddMenu)}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <h2 className="text-base font-semibold">Meals</h2>
            <motion.div
              animate={{ rotate: showAddMenu ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-3">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0 }}
                    onClick={() => alert('Photo logging coming soon!')}
                    onHoverStart={() => setHoveredMeal(0)}
                    onHoverEnd={() => setHoveredMeal(null)}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all group"
                  >
                    <motion.div
                      animate={{
                        scale: hoveredMeal === 0 ? 1.2 : 1,
                        rotate: hoveredMeal === 0 ? 360 : 0
                      }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl"
                    >
                      <Camera className="w-5 h-5" />
                    </motion.div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">Photo</span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => {
                      setShowManualEntry(true)
                      setShowAddMenu(false)
                    }}
                    onHoverStart={() => setHoveredMeal(1)}
                    onHoverEnd={() => setHoveredMeal(null)}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all group"
                  >
                    <motion.div
                      animate={{
                        scale: hoveredMeal === 1 ? 1.2 : 1,
                        rotate: hoveredMeal === 1 ? 360 : 0
                      }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-3 rounded-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">Manual</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Food Logs */}
          {!showAddMenu && foodLogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pb-6 px-6 text-sm text-text-tertiary"
            >
              No meals logged yet
            </motion.div>
          )}

          {!showAddMenu && foodLogs.length > 0 && (
            <div className="space-y-3 px-6 pb-6">
              {foodLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-border rounded-xl relative group"
                >
                  <div className="font-medium text-sm mb-1 pr-8">{log.parsed_description}</div>
                  <div className="flex gap-3 text-xs text-text-secondary">
                    <span>{log.calories_kcal} kcal</span>
                    <span>{log.protein_g}g protein</span>
                  </div>
                  <motion.button
                    onClick={() => deleteFoodLog(log.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 rounded-lg p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-red-400 hover:text-white" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-surface backdrop-blur-xl border border-gray-700/50 overflow-hidden"
        >
          <motion.div
            className="flex items-center justify-between p-6 cursor-pointer"
            onClick={() => setShowWorkoutEntry(true)}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Dumbbell className="w-5 h-5 text-purple-400" />
              </motion.div>
              <h2 className="text-base font-semibold">Workouts</h2>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl"
            >
              <Plus className="w-5 h-5" />
            </motion.div>
          </motion.div>

          {workoutLogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center pb-6 px-6 text-sm text-text-tertiary"
            >
              No workouts logged yet
            </motion.div>
          ) : (
            <div className="space-y-3 px-6 pb-6">
              {workoutLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-border rounded-xl relative group"
                >
                  <div className="font-medium text-sm capitalize mb-1 pr-8">{log.type}</div>
                  <div className="text-xs text-text-secondary">
                    {log.duration_minutes} min • ~{log.estimated_burn_kcal} kcal
                  </div>
                  <motion.button
                    onClick={() => deleteWorkoutLog(log.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 rounded-lg p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-red-400 hover:text-white" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-surface backdrop-blur-xl border border-gray-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: [0, -15, 15, 0] }}
                transition={{ duration: 0.5 }}
              >
                <StickyNote className="w-5 h-5 text-yellow-400" />
              </motion.div>
              <h2 className="text-base font-semibold">Notes</h2>
            </div>
            <motion.button
              onClick={generateAINotes}
              disabled={isGeneratingNotes}
              whileHover={{ scale: isGeneratingNotes ? 1 : 1.05 }}
              whileTap={{ scale: isGeneratingNotes ? 1 : 0.95 }}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xs font-medium hover:from-purple-500 hover:to-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingNotes ? 'Generating...' : 'AI Generate'}
            </motion.button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add your notes for the day..."
            rows={4}
            className="w-full px-4 py-3 bg-border rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
          />
        </motion.div>

        {/* Save Entry Button */}
        <motion.button
          onClick={() => setShowSaveModal(true)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-semibold text-lg hover:from-blue-500 hover:to-purple-500 transition-colors"
        >
          Save Entry
        </motion.button>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showManualEntry && (
          <ManualFoodEntry onClose={() => setShowManualEntry(false)} />
        )}
        {showWorkoutEntry && (
          <ManualWorkoutEntry onClose={() => setShowWorkoutEntry(false)} />
        )}
        {showSaveModal && (
          <DaySummary onClose={() => setShowSaveModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
