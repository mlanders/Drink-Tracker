"use client"

import { useState, useEffect } from "react"

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastTrackedDate: string | null
}

export default function StreakTracker() {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStreak()
  }, [])

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/drinks/streak")
      if (res.ok) {
        const data = await res.json()
        setStreak(data)
      }
    } catch (error) {
      console.error("Error fetching streak:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6 fade-in">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!streak) {
    return null
  }

  return (
    <div className="card p-6 fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Tracking Streak</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Current</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">{streak.currentStreak}</p>
          <p className="text-xs text-gray-600 mt-1">
            {streak.currentStreak === 1 ? "day" : "days"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">Longest</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{streak.longestStreak}</p>
          <p className="text-xs text-gray-600 mt-1">
            {streak.longestStreak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {streak.currentStreak === 0 && streak.lastTrackedDate && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            Your streak ended. Start tracking again to rebuild it!
          </p>
        </div>
      )}

      {streak.currentStreak > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            🔥 Keep it up! You're on a {streak.currentStreak}-day streak!
          </p>
        </div>
      )}
    </div>
  )
}
