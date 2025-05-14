// src/db/database.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../database/passwords.db');

// Crear instancia de la base de datos
const db = new Database(DB_PATH);

// Inicialización
db.pragma('journal_mode = WAL'); // Mejor rendimiento

// Crear tablas si no existen
db.exec(`
  CREATE TABLE IF NOT EXISTS passwords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_service ON passwords(service);
`);

export default db;