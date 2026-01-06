"use client";

import { useState, useEffect } from "react";
import { formatDateInTimezone, getTodayInTimezone } from "@/lib/dateUtils";

interface DayData {
  date: string;
  count: number;
}

interface CalendarViewProps {
  timezone: string;
}

export default function CalendarView({ timezone }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthData, setMonthData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthData();
  }, [currentMonth]);

  const fetchMonthData = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      // Fetch all drink entries for the current month
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      const res = await fetch(`/api/drinks/month?year=${year}&month=${month}`);
      if (res.ok) {
        const data = await res.json();
        const dataMap = new Map<string, number>();
        data.days.forEach((day: DayData) => {
          dataMap.set(day.date, day.count);
        });
        setMonthData(dataMap);
      }
    } catch (error) {
      console.error("Error fetching month data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    const next = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
    const today = new Date();
    if (next <= today) {
      setCurrentMonth(next);
    }
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return (
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const getCountForDate = (date: Date): number => {
    // Convert the local date to a UTC date for lookup
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dateString = formatDateInTimezone(utcDate, timezone);
    return monthData.get(dateString) || 0;
  };

  const getColorForCount = (count: number): string => {
    if (count === 0) return "bg-green-500"; // Sober day - green!
    if (count === 1) return "bg-green-300";
    if (count === 2) return "bg-yellow-300";
    if (count <= 4) return "bg-orange-400";
    if (count <= 6) return "bg-orange-600";
    return "bg-red-600"; // High count - red warning
  };

  const isToday = (date: Date): boolean => {
    const today = getTodayInTimezone(timezone);
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    return utcDate.getTime() === today.getTime();
  };

  const isFutureDate = (date: Date): boolean => {
    const today = getTodayInTimezone(timezone);
    const utcDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    return utcDate > today;
  };

  const days = getDaysInMonth();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading) {
    return (
      <div className="card p-6 fade-in">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Calendar View</h2>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
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

        <h3 className="text-lg font-semibold text-gray-900">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Next month"
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

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square"></div>;
          }

          const count = getCountForDate(date);
          const colorClass = getColorForCount(count);
          const future = isFutureDate(date);
          const today = isToday(date);

          return (
            <div
              key={date.toISOString()}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 relative
                ${future ? "bg-gray-50 cursor-not-allowed" : colorClass + " cursor-pointer hover:ring-2 hover:ring-purple-400"}
                ${today ? "ring-2 ring-purple-600" : ""}
              `}
              title={`${date.toLocaleDateString()}: ${count} ${count === 0 ? "drinks (Sober!)" : count === 1 ? "drink" : "drinks"}`}
            >
              <span
                className={`text-xs font-semibold ${count === 0 || count > 4 ? "text-white" : "text-gray-900"}`}
              >
                {date.getDate()}
              </span>
              {(count === 0 || count > 0) && (
                <span
                  className={`text-[10px] font-semibold ${count === 0 || count > 4 ? "text-white" : "text-gray-800"}`}
                >
                  {count === 0 ? "✓" : count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center text-white font-bold text-[10px]">
            ✓
          </div>
          <span className="font-medium">0 Sober</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-300"></div>
          <span>1</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-yellow-300"></div>
          <span>2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-orange-400"></div>
          <span>3-4</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-orange-600"></div>
          <span>5-6</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-600"></div>
          <span>7+</span>
        </div>
      </div>
    </div>
  );
}
