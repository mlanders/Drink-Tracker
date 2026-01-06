"use client";

import { useState, useEffect } from "react";

interface Summary {
  year: number;
  month: number;
  totalDrinks: number;
  averagePerDay: number;
  daysTracked: number;
}

interface MonthlySummaryProps {
  timezone: string;
}

export default function MonthlySummary({ timezone }: MonthlySummaryProps) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const res = await fetch("/api/summary");
      if (res.ok) {
        const data = await res.json();
        setSummaries(data.summaries);
      }
    } catch (error) {
      console.error("Error fetching summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const date = new Date(2000, month - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  if (loading) {
    return (
      <div className="card p-8 fade-in">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b pb-4">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <svg
            className="w-5 h-5 text-purple-600"
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
        <h2 className="text-2xl font-bold text-gray-900">Monthly Summaries</h2>
      </div>

      {summaries.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No summaries yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Keep tracking to see your monthly stats!
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {summaries.map((summary, idx) => (
            <div
              key={idx}
              className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900">
                  {getMonthName(summary.month)} {summary.year}
                </h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  {summary.daysTracked} days
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Total Drinks</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.totalDrinks}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Daily Average</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Number(summary.averagePerDay).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
