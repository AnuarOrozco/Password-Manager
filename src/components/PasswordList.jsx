import { useEffect, useState } from 'react';
import { decrypt } from '../utils/encryption';
import { getDbConnection, closeDbConnection } from '../db/database';
import { EyeIcon, EyeSlashIcon, ClipboardDocumentIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import PasswordModal from './PasswordModal';

export default function PasswordList({ refresh }) {
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    // No alert - we'll use visual feedback instead
    setShowPasswordId(null);
  };

  const handleEdit = (password) => {
    setSelectedPassword(password);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta contraseña?')) return;
    
    try {
      const db = await getDbConnection();
      await db.run('DELETE FROM passwords WHERE id = ?', [id]);
      setPasswords(passwords.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting password:', err);
      setError('Error al eliminar la contraseña');
    }
  };

  const filteredPasswords = passwords.filter(pwd =>
    pwd.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pwd.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          🔐 Tus Contraseñas
        </h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Buscar contraseñas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredPasswords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No se encontraron resultados' : 'No hay contraseñas guardadas aún.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-600">
                <th className="py-3 px-4 border dark:border-gray-500 text-left text-gray-800 dark:text-gray-200">Servicio</th>
                <th className="py-3 px-4 border dark:border-gray-500 text-left text-gray-800 dark:text-gray-200">Usuario</th>
                <th className="py-3 px-4 border dark:border-gray-500 text-left text-gray-800 dark:text-gray-200">Fecha</th>
                <th className="py-3 px-4 border dark:border-gray-500 text-left text-gray-800 dark:text-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPasswords.map((pwd) => (
                <tr key={pwd.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="py-3 px-4 border dark:border-gray-500 text-gray-800 dark:text-gray-200">{pwd.service}</td>
                  <td className="py-3 px-4 border dark:border-gray-500 text-gray-800 dark:text-gray-200">{pwd.username}</td>
                  <td className="py-3 px-4 border dark:border-gray-500 text-gray-800 dark:text-gray-200">
                    {new Date(pwd.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border dark:border-gray-500">
                    <div className="flex space-x-2">
                      {showPasswordId === pwd.id ? (
                        <>
                          <span className="font-mono bg-gray-100 dark:bg-gray-500 p-1 rounded text-sm">
                            {decrypt(pwd.password)}
                          </span>
                          <button
                            onClick={() => handleCopyPassword(pwd.password)}
                            className="p-1 text-green-500 hover:text-green-600 dark:hover:text-green-400 transition"
                            title="Copiar"
                          >
                            <ClipboardDocumentIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setShowPasswordId(null)}
                            className="p-1 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition"
                            title="Ocultar"
                          >
                            <EyeSlashIcon className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowPasswordId(pwd.id)}
                          className="p-1 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Mostrar"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(pwd)}
                        className="p-1 text-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400 transition"
                        title="Editar"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pwd.id)}
                        className="p-1 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        password={selectedPassword}
        onSuccess={() => {
          setRefresh(prev => !prev);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}