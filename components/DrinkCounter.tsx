"use client";

import { useState, useEffect } from "react";

export default function DrinkCounter() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayCount();
  }, []);

  const fetchTodayCount = async () => {
    try {
      const res = await fetch("/api/drinks/today");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async () => {
    try {
      const res = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 1 }),
      });

      if (res.ok) {
        setCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error incrementing:", error);
    }
  };

  const handleDecrement = async () => {
    try {
      const res = await fetch("/api/drinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: -1 }),
      });

      if (res.ok) {
        setCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error decrementing:", error);
    }
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
      <div className="flex items-center gap-3 mb-6">
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
        <h2 className="text-2xl font-bold text-gray-900">Today's Count</h2>
      </div>

      <div className="text-center py-8">
        <div className="counter-display mb-8 pulse-slow">{count}</div>

        <p className="text-gray-600 mb-8">
          {count === 0
            ? "Start tracking your drinks!"
            : `Great job! ${count} drinks today`}
        </p>

        <div className="flex gap-6 justify-center">
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
      </div>
    </div>
  );
}
