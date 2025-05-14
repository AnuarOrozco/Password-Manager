import { useState } from 'react';
import { encrypt } from '../utils/encryption';
import { useDatabase } from '../hooks/useDatabase';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AddPassword({ onPasswordAdded }) {
  const { executeQuery } = useDatabase();
  const [formData, setFormData] = useState({
    service: '',
    username: '',
    password: '',
    showPassword: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.service || !formData.username || !formData.password) {
        throw new Error('Todos los campos son requeridos');
      }

      await executeQuery(async (db) => {
        await db.run(
          'INSERT INTO passwords (service, username, password) VALUES (?, ?, ?)',
          [formData.service.trim(), formData.username.trim(), encrypt(formData.password)]
        );
      });

      // Reset form
      setFormData({
        service: '',
        username: '',
        password: '',
        showPassword: false
      });
      setPasswordStrength(0);
      
      // Show success
      toast.success('Contraseña guardada exitosamente');
      
      // Notify parent
      if (onPasswordAdded) onPasswordAdded();

    } catch (err) {
      console.error('Error saving password:', err);
      toast.error(err.message || 'Error al guardar la contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        ➕ Añadir Nueva Contraseña
      </h2>

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

      <div className="mb-4">
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
            aria-label={formData.showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {formData.showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {/* Visualizador de fortaleza de contraseña */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex gap-1 h-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level}
                  className={`flex-1 rounded-sm ${
                    passwordStrength >= level 
                      ? level > 2 ? 'bg-green-500' : level > 1 ? 'bg-yellow-500' : 'bg-red-500'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
              {passwordStrength === 0 ? 'Muy débil' :
               passwordStrength === 1 ? 'Débil' :
               passwordStrength === 2 ? 'Moderada' :
               passwordStrength === 3 ? 'Fuerte' : 'Muy fuerte'}
            </p>
          </div>
        )}
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
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
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