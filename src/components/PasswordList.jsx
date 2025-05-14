import { useEffect, useState } from 'react';
import { decrypt } from '../utils/encryption';
import { useDatabase } from '../hooks/useDatabase';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ClipboardDocumentIcon, 
  TrashIcon, 
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import PasswordModal from './PasswordModal';
import toast from 'react-hot-toast';

export default function PasswordList({ refresh }) {
  const { executeQuery } = useDatabase();
  const [passwords, setPasswords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const passwordsPerPage = 10;

  useEffect(() => {
    const fetchPasswords = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await executeQuery(async (db) => {
          const savedPasswords = await db.all(`
            SELECT id, service, username, password, created_at 
            FROM passwords 
            ORDER BY created_at DESC
          `);
          setPasswords(savedPasswords);
        });
      } catch (err) {
        console.error('Error loading passwords:', err);
        setError('Error al cargar las contraseñas');
        toast.error('Error al cargar las contraseñas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPasswords();
  }, [refresh, executeQuery]);

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(decrypt(password));
    toast.success('Contraseña copiada al portapapeles', {
      icon: '📋',
      duration: 2000
    });
    setShowPasswordId(null);
  };

  const handleEdit = (password) => {
    setSelectedPassword(password);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta contraseña?')) return;
    
    try {
      await executeQuery(async (db) => {
        await db.run('DELETE FROM passwords WHERE id = ?', [id]);
      });
      setPasswords(passwords.filter(p => p.id !== id));
      toast.success('Contraseña eliminada correctamente');
    } catch (err) {
      console.error('Error deleting password:', err);
      setError('Error al eliminar la contraseña');
      toast.error('Error al eliminar la contraseña');
    }
  };

  // Filtrar y paginar resultados
  const filteredPasswords = passwords.filter(pwd =>
    pwd.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pwd.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular páginas
  const indexOfLastPassword = currentPage * passwordsPerPage;
  const indexOfFirstPassword = indexOfLastPassword - passwordsPerPage;
  const currentPasswords = filteredPasswords.slice(indexOfFirstPassword, indexOfLastPassword);
  const totalPages = Math.ceil(filteredPasswords.length / passwordsPerPage);

  // Resetear a página 1 cuando se busca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          🔐 Tus Contraseñas
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({filteredPasswords.length} registros)
          </span>
        </h2>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Buscar contraseñas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
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
      ) : currentPasswords.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No se encontraron resultados' : 'No hay contraseñas guardadas aún.'}
          </p>
        </div>
      ) : (
        <>
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
                {currentPasswords.map((pwd) => (
                  <tr key={pwd.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="py-3 px-4 border dark:border-gray-500 text-gray-800 dark:text-gray-200">
                      <span className="font-medium">{pwd.service}</span>
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-500 text-gray-800 dark:text-gray-200">
                      {pwd.username}
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-500 text-gray-800 dark:text-gray-200">
                      {new Date(pwd.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 border dark:border-gray-500">
                      <div className="flex flex-wrap gap-2">
                        {showPasswordId === pwd.id ? (
                          <>
                            <span className="font-mono bg-gray-100 dark:bg-gray-500 p-1 rounded text-sm">
                              {decrypt(pwd.password)}
                            </span>
                            <button
                              onClick={() => handleCopyPassword(pwd.password)}
                              className="p-1.5 rounded-md bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition"
                              title="Copiar"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowPasswordId(null)}
                              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition"
                              title="Ocultar"
                            >
                              <EyeSlashIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowPasswordId(pwd.id)}
                            className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                            title="Mostrar"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(pwd)}
                          className="p-1.5 rounded-md bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
                          title="Editar"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pwd.id)}
                          className="p-1.5 rounded-md bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Mostrando {indexOfFirstPassword + 1}-{Math.min(indexOfLastPassword, filteredPasswords.length)} de {filteredPasswords.length} registros
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center gap-1"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span>Anterior</span>
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center ${
                          currentPage === pageNum 
                            ? 'bg-blue-600 text-white' 
                            : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition flex items-center gap-1"
                >
                  <span>Siguiente</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
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