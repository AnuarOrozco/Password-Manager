import { useState } from 'react';
import { encrypt } from '../utils/encryption';
import { getDbConnection, closeDbConnection } from '../db/database';

export default function AddPassword({ onPasswordAdded }) {
  const [service, setService] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let db;
    try {
      db = await getDbConnection();
      await db.run(
        'INSERT INTO passwords (service, username, password) VALUES (?, ?, ?)',
        [service, username, encrypt(password)]
      );
      
      // Limpiar el formulario
      setService('');
      setUsername('');
      setPassword('');
      
      // Notificar éxito
      if (onPasswordAdded) {
        onPasswordAdded();
      }
    } catch (err) {
      console.error('Error al guardar la contraseña:', err);
      setError('Error al guardar la contraseña. Por favor intenta nuevamente.');
    } finally {
      if (db) {
        await closeDbConnection(db);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">➕ Añadir Nueva Contraseña</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Servicio</label>
        <input
          type="text"
          placeholder="Ej: Google"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Usuario</label>
        <input
          type="text"
          placeholder="usuario@email.com"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Contraseña</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}