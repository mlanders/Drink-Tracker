CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drink_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  count INTEGER NOT NULL,
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_drink_entries_user_date ON drink_entries(user_id, date);

CREATE TABLE IF NOT EXISTS monthly_summaries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_drinks INTEGER NOT NULL,
  average_per_day REAL NOT NULL,
  days_tracked INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, year, month)
);
