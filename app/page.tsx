import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-animate">
      <div className="text-center text-white max-w-4xl mx-auto fade-in">
        <div className="inline-block mb-6 p-4 bg-white/20 backdrop-blur-lg rounded-3xl">
          <svg
            className="w-20 h-20 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>

        <h1 className="text-7xl font-bold mb-6 drop-shadow-2xl">
          Drink Tracker
        </h1>

        <p className="text-2xl mb-4 font-light drop-shadow-lg">
          Track your alcohol consumption with ease
        </p>

        <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
          Monitor your drinking habits and celebrate sober days. Simple,
          beautiful, and effective tracking.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 shadow-2xl transform hover:scale-105 transition-all duration-200 inline-block min-w-[200px]"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 shadow-2xl transform hover:scale-105 transition-all duration-200 inline-block min-w-[200px]"
          >
            Get Started
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-bold text-xl mb-2">Track Daily</h3>
            <p className="text-white/80">
              Monitor your intake every single day
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-2">📈</div>
            <h3 className="font-bold text-xl mb-2">View Progress</h3>
            <p className="text-white/80">See monthly summaries and trends</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-bold text-xl mb-2">Stay Healthy</h3>
            <p className="text-white/80">Build better habits over time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
