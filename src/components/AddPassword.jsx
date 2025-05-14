import { useState } from 'react';
import { encrypt } from '../utils/encryption';
import { getDbConnection, closeDbConnection } from '../db/database';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AddPassword({ onPasswordAdded }) {
  const [formData, setFormData] = useState({
    service: '',
    username: '',
    password: '',
    showPassword: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    let db;
    try {
      if (!formData.service || !formData.username || !formData.password) {
        throw new Error('Todos los campos son requeridos');
      }

      db = await getDbConnection();
      await db.run(
        'INSERT INTO passwords (service, username, password) VALUES (?, ?, ?)',
        [formData.service.trim(), formData.username.trim(), encrypt(formData.password)]
      );
      
      // Reset form and show success
      setFormData({
        service: '',
        username: '',
        password: '',
        showPassword: false
      });
      setSuccess(true);
      
      // Notify parent component
      if (onPasswordAdded) {
        onPasswordAdded();
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving password:', err);
      setError(err.message || 'Error al guardar la contraseña. Por favor intenta nuevamente.');
    } finally {
      if (db) {
        await closeDbConnection(db);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        ➕ Añadir Nueva Contraseña
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Contraseña guardada exitosamente!
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Servicio*</label>
        <input
          type="text"
          name="service"
          placeholder="Ej: Google, GitHub"
          value={formData.service}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Usuario/Email*</label>
        <input
          type="text"
          name="username"
          placeholder="usuario@email.com"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">Contraseña*</label>
        <div className="relative">
          <input
            type={formData.showPassword ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
            required
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
            aria-label={formData.showPassword ? 'Hide password' : 'Show password'}
          >
            {formData.showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className={`w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </>
        ) : (
          'Guardar Contraseña'
        )}
      </button>
    </form>
  );
}