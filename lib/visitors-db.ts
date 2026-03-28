// visitors-db.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, 'visitors.sqlite');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

export function addVisitor(id: string) {
  try {
    db.prepare('INSERT OR IGNORE INTO visitors (id) VALUES (?)').run(id);
  } catch {}
}

export function getTotalVisitors(): number {
  const row = db.prepare('SELECT COUNT(*) as total FROM visitors').get();
  return row?.total || 0;
}
