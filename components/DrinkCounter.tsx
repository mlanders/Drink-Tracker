"use client";

import { useState, useEffect } from "react";
import { formatDateInTimezone, getTodayInTimezone } from "@/lib/dateUtils";

interface DrinkCounterProps {
  timezone: string;
}

export default function DrinkCounter({ timezone }: DrinkCounterProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() =>
    getTodayInTimezone(timezone),
  );
  const [hasTrackedZero, setHasTrackedZero] = useState(false);

  useEffect(() => {
    fetchDateCount();
  }, [selectedDate]);

  const fetchDateCount = async () => {
    try {
      setLoading(true);
      // Format date as YYYY-MM-DD (stored as UTC in DB)
      const dateString = formatDateInTimezone(selectedDate, timezone);
      const res = await fetch(`/api/drinks/date?date=${dateString}`);
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setHasTrackedZero(data.hasTracked && data.count === 0);
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async () => {
    try {
      const dateString = formatDateInTimezone(selectedDate, timezone);
      const res = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1, date: dateString }),
      });

      if (res.ok) {
        setCount((prev) => prev + 1);
        setHasTrackedZero(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update count");
      }
    } catch (error) {
      console.error("Error incrementing:", error);
    }
  };

  const handleDecrement = async () => {
    try {
      const dateString = formatDateInTimezone(selectedDate, timezone);
      const res = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: -1, date: dateString }),
      });

      if (res.ok) {
        setCount((prev) => Math.max(0, prev - 1));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update count");
      }
    } catch (error) {
      console.error("Error decrementing:", error);
    }
  };

  const handleConfirmZero = async () => {
    try {
      const dateString = formatDateInTimezone(selectedDate, timezone);
      const res = await fetch("/api/drinks/confirm-zero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateString }),
      });

      if (res.ok) {
        setHasTrackedZero(true);
        await fetchDateCount();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to confirm zero");
      }
    } catch (error) {
      console.error("Error confirming zero:", error);
    }
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setUTCDate(next.getUTCDate() + 1);
    const today = getTodayInTimezone(timezone);
    if (next <= today) {
      setSelectedDate(next);
    }
  };

  const goToToday = () => {
    setSelectedDate(getTodayInTimezone(timezone));
  };

  const isToday = () => {
    const today = getTodayInTimezone(timezone);
    return selectedDate.getTime() === today.getTime();
  };

  const formatDate = () => {
    // Extract UTC date parts directly (since selectedDate represents a calendar day)
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const day = selectedDate.getUTCDate();

    // Create a formatter without timezone conversion
    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year:
        year !== getTodayInTimezone(timezone).getUTCFullYear()
          ? "numeric"
          : undefined,
    });

    // Format using a date constructed from the UTC parts in local time
    const displayDate = new Date(year, month, day);
    const dateStr = formatter.format(displayDate);

    if (isToday()) return `Today (${dateStr})`;

    const yesterday = new Date(getTodayInTimezone(timezone));
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    if (selectedDate.getTime() === yesterday.getTime())
      return `Yesterday (${dateStr})`;

    // For other dates, include weekday
    const formatterWithWeekday = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        year !== getTodayInTimezone(timezone).getUTCFullYear()
          ? "numeric"
          : undefined,
    });
    return formatterWithWeekday.format(displayDate);
  };

  if (loading) {
    return (
      <div className="card p-8 fade-in">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
          <div className="flex gap-4 justify-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Drink Count</h2>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-lg p-3">
        <button
          onClick={goToPreviousDay}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Previous day"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatDate()}
          </span>
          {!isToday() && (
            <button
              onClick={goToToday}
              className="ml-2 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Go to Today
            </button>
          )}
        </div>

        <button
          onClick={goToNextDay}
          disabled={isToday()}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Next day"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="text-center py-8">
        <div className="counter-display mb-8 pulse-slow">{count}</div>

        {hasTrackedZero && count === 0 ? (
          <div className="mb-8 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-green-800 font-semibold text-lg mb-1">
              🎉 Zero drinks logged!
            </p>
            <p className="text-green-700 text-sm">Great job staying sober!</p>
          </div>
        ) : (
          <p className="text-gray-600 mb-8">
            {count === 0
              ? "No drinks logged yet"
              : `${count} drink${count !== 1 ? "s" : ""} logged`}
          </p>
        )}

        <div className="flex gap-6 justify-center mb-6">
          <button
            onClick={handleDecrement}
            disabled={count === 0}
            className="w-24 h-24 text-4xl rounded-full font-bold btn-danger flex items-center justify-center"
            aria-label="Decrease count"
          >
            −
          </button>
          <button
            onClick={handleIncrement}
            className="w-24 h-24 text-4xl rounded-full font-bold btn-success flex items-center justify-center"
            aria-label="Increase count"
          >
            +
          </button>
        </div>

        {count === 0 && !hasTrackedZero && (
          <button
            onClick={handleConfirmZero}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            ✓ Confirm Zero Drinks (Sober Day!)
          </button>
        )}
      </div>
    </div>
  );
}
