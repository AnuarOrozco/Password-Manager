import { useEffect, useState } from 'react';
import { decrypt } from '../utils/encryption';
import { openDb } from '../db/database';

export default function PasswordList() {
  const [passwords, setPasswords] = useState([]);

  useEffect(() => {
    async function loadPasswords() {
      const db = await openDb();
      const savedPasswords = await db.all('SELECT * FROM passwords');
      setPasswords(savedPasswords);
      db.close();
    }
    loadPasswords();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🔐 Tus Contraseñas</h2>
      {passwords.length === 0 ? (
        <p className="text-gray-500">No hay contraseñas guardadas aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border">Servicio</th>
                <th className="py-2 px-4 border">Usuario</th>
                <th className="py-2 px-4 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {passwords.map((pwd) => (
                <tr key={pwd.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{pwd.service}</td>
                  <td className="py-2 px-4 border">{pwd.username}</td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => alert(`Contraseña: ${decrypt(pwd.password)}`)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
                    >
                      Mostrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}