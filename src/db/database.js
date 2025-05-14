// src/db/database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Configuración de la base de datos
const DB_CONFIG = {
  filename: './database/passwords.db',  // Cambiado a una carpeta específica
  driver: sqlite3.Database
};

// Manejador de conexión
export async function getDbConnection() {
  try {
    const db = await open(DB_CONFIG);
    await initializeDatabase(db);
    return db;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
}

// Inicialización de la base de datos
async function initializeDatabase(db) {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Índice para búsquedas más rápidas
    await db.exec('CREATE INDEX IF NOT EXISTS idx_service ON passwords(service)');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

// Función para cerrar la conexión (opcional pero recomendado)
export async function closeDbConnection(db) {
  try {
    await db.close();
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
  }
}