import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInUser, clearError, selectAuthLoading, selectAuthError } from '../../redux/authSlice';

const LoginForm = ({ onClose, onSwitchToSignup }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const result = await dispatch(signInUser(formData));
      if (signInUser.fulfilled.match(result)) {
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return '';

    switch (error.code) {
      case 'UserNotFoundException':
        return 'No existe una cuenta con este email';
      case 'NotAuthorizedException':
        return 'Email o contraseña incorrectos';
      case 'UserNotConfirmedException':
        return 'Tu cuenta no ha sido confirmada. Revisa tu email.';
      case 'TooManyFailedAttemptsException':
        return 'Demasiados intentos fallidos. Inténtalo más tarde.';
      case 'LimitExceededException':
        return 'Límite de intentos excedido. Espera antes de intentar de nuevo.';
      default:
        return error.message || 'Error al iniciar sesión';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 experimental-nav-item animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-red-300 border border-red-500/30 bg-red-500/10 rounded-xl">
            {getErrorMessage(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none pr-12"
                placeholder="Tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-nature-400 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className="w-full px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToSignup}
              className="font-medium text-nature-400 hover:text-nature-300 transition-colors"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;