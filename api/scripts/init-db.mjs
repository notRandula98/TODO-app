import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const databasePath = resolve(projectRoot, process.env.DATABASE_PATH ?? 'todo.db');
const schema = readFileSync(new URL('../db/query.sql', import.meta.url), 'utf8');

mkdirSync(dirname(databasePath), { recursive: true });
const database = new Database(databasePath);
try {
  database.transaction(() => database.exec(schema))();
  console.log(`SQLite database initialized: ${databasePath}`);
} finally {
  database.close();
}
