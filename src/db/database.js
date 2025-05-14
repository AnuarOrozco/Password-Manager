// src/db/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Database configuration
const dbConfig = {
  filename: './passwords.db',
  driver: sqlite3.Database
};

// Connection handler
export async function openDb() {
  try {
    const db = await open(dbConfig);
    await initDb(db);
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Database initialization
async function initDb(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}