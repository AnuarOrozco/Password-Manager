import { useEffect, useState } from 'react';
import { decrypt } from '../utils/encryption';
import { getDbConnection, closeDbConnection } from '../db/database';

export default function PasswordList({ refresh }) {
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordId, setShowPasswordId] = useState(null);

  useEffect(() => {
    const fetchPasswords = async () => {
      setIsLoading(true);
      setError(null);
      let db;
      
      try {
        db = await getDbConnection();
        const savedPasswords = await db.all(`
          SELECT id, service, username, password, created_at 
          FROM passwords 
          ORDER BY created_at DESC
        `);
        setPasswords(savedPasswords);
      } catch (err) {
        console.error('Error loading passwords:', err);
        setError('Error al cargar las contraseñas');
      } finally {
        if (db) await closeDbConnection(db);
        setIsLoading(false);
      }
    };

    fetchPasswords();
  }, [refresh]);

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(decrypt(password));
    alert('Contraseña copiada al portapapeles');
    setShowPasswordId(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">🔐 Tus Contraseñas</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : passwords.length === 0 ? (
        <p className="text-gray-500">No hay contraseñas guardadas aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border text-left">Servicio</th>
                <th className="py-3 px-4 border text-left">Usuario</th>
                <th className="py-3 px-4 border text-left">Fecha</th>
                <th className="py-3 px-4 border text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {passwords.map((pwd) => (
                <tr key={pwd.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border">{pwd.service}</td>
                  <td className="py-3 px-4 border">{pwd.username}</td>
                  <td className="py-3 px-4 border">
                    {new Date(pwd.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border space-x-2">
                    {showPasswordId === pwd.id ? (
                      <>
                        <span className="font-mono bg-gray-100 p-1 rounded">
                          {decrypt(pwd.password)}
                        </span>
                        <button
                          onClick={() => handleCopyPassword(pwd.password)}
                          className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition text-sm"
                        >
                          Copiar
                        </button>
                        <button
                          onClick={() => setShowPasswordId(null)}
                          className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition text-sm"
                        >
                          Ocultar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowPasswordId(pwd.id)}
                        className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition text-sm"
                      >
                        Mostrar
                      </button>
                    )}
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