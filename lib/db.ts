import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDB(): D1Database {
  return getCloudflareContext().env.DB;
}

export type DBUser = {
  id: string;
  email: string;
  password: string;
  name: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type DBDrinkEntry = {
  id: string;
  user_id: string;
  count: number;
  date: string;
  created_at: string;
};

export type DBMonthlySummary = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  total_drinks: number;
  average_per_day: number;
  days_tracked: number;
  created_at: string;
};
