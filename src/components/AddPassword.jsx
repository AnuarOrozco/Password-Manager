import { useState } from 'react';
import { encrypt } from '../utils/encryption';
import { openDb } from '../db/database';

export default function AddPassword() {
  const [service, setService] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = await openDb();
    await db.run(
      'INSERT INTO passwords (service, username, password) VALUES (?, ?, ?)',
      [service, username, encrypt(password)]
    );
    db.close();
    alert('Contraseña guardada!');
    setService('');
    setUsername('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">➕ Añadir Nueva Contraseña</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Servicio</label>
        <input
          type="text"
          placeholder="Ej: Google"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
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
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Guardar
      </button>
    </form>
  );
}