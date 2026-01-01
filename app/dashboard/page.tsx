import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DrinkCounter from "@/components/DrinkCounter";
import MonthlySummary from "@/components/MonthlySummary";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Drink Tracker
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block text-sm text-gray-600 truncate max-w-[150px] lg:max-w-none">
                {session.user?.email}
              </div>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Track your daily hydration and view your progress
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <DrinkCounter />
          <MonthlySummary />
        </div>
      </main>
    </div>
  );
}
