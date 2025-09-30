import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  signUpUser,
  confirmSignUpCode,
  clearError,
  clearNeedsConfirmation,
  selectAuthLoading,
  selectAuthError,
  selectNeedsConfirmation,
  selectPendingEmail
} from '../../redux/authSlice';

const SignupForm = ({ onClose, onSwitchToLogin }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const needsConfirmation = useSelector(selectNeedsConfirmation);
  const pendingEmail = useSelector(selectPendingEmail);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearNeedsConfirmation());
    };
  }, [dispatch]);

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password);
    }
  }, [formData.password]);

  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Mínimo 8 caracteres');
    }

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluye mayúsculas y minúsculas');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluye al menos un número');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Incluye caracteres especiales');
    }

    setPasswordStrength({ score, feedback });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (passwordStrength.score < 3) {
      return;
    }

    try {
      const result = await dispatch(signUpUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      }));

      if (signUpUser.fulfilled.match(result) && !result.payload.needsConfirmation) {
        onClose();
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();

    if (!confirmationCode.trim()) {
      return;
    }

    try {
      const result = await dispatch(confirmSignUpCode({
        email: pendingEmail,
        code: confirmationCode
      }));

      if (confirmSignUpCode.fulfilled.match(result)) {
        dispatch(clearNeedsConfirmation());
        onSwitchToLogin();
      }
    } catch (error) {
      console.error('Confirmation error:', error);
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return '';

    switch (error.code) {
      case 'UsernameExistsException':
        return 'Ya existe una cuenta con este email';
      case 'InvalidPasswordException':
        return 'La contraseña no cumple los requisitos de seguridad';
      case 'CodeMismatchException':
        return 'Código de verificación incorrecto';
      case 'ExpiredCodeException':
        return 'El código ha expirado. Solicita uno nuevo.';
      case 'LimitExceededException':
        return 'Límite de intentos excedido. Espera antes de intentar de nuevo.';
      default:
        return error.message || 'Error en el registro';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-green-500';
      case 4:
        return 'bg-nature-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'Débil';
      case 2:
        return 'Regular';
      case 3:
        return 'Buena';
      case 4:
        return 'Excelente';
      default:
        return '';
    }
  };

  if (needsConfirmation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 mx-4 experimental-nav-item animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Confirmar Cuenta</h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 mb-4 border border-nature-500/30 bg-nature-500/10 rounded-xl">
            <p className="text-nature-300">
              Hemos enviado un código de verificación a <strong>{pendingEmail}</strong>
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-red-300 border border-red-500/30 bg-red-500/10 rounded-xl">
              {getErrorMessage(error)}
            </div>
          )}

          <form onSubmit={handleConfirmation} className="space-y-4">
            <div>
              <label htmlFor="confirmationCode" className="block mb-2 text-sm font-medium text-gray-300">
                Código de Verificación
              </label>
              <input
                type="text"
                id="confirmationCode"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
                maxLength={6}
                className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none text-center text-2xl tracking-widest"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !confirmationCode.trim()}
              className="w-full px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verificando...
                </div>
              ) : (
                'Confirmar Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-medium text-nature-400 hover:text-nature-300 transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-4 experimental-nav-item animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Crear Cuenta</h2>
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
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
              placeholder="Tu nombre completo"
            />
          </div>

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
                placeholder="Crea una contraseña segura"
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

            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Seguridad:</span>
                  <span className={`text-xs font-medium ${passwordStrength.score >= 3 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div className="mt-1">
                    {passwordStrength.feedback.map((tip, index) => (
                      <p key={index} className="text-xs text-gray-400">• {tip}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 rounded-xl focus:outline-none ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-nature-600/30 focus:border-nature-500'
              }`}
              placeholder="Repite tu contraseña"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">Las contraseñas no coinciden</p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !formData.name ||
              !formData.email ||
              !formData.password ||
              !formData.confirmPassword ||
              formData.password !== formData.confirmPassword ||
              passwordStrength.score < 3
            }
            className="w-full px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando cuenta...
              </div>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-nature-400 hover:text-nature-300 transition-colors"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;