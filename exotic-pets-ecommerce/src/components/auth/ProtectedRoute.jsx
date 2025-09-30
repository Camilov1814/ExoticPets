import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../redux/authSlice';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const ProtectedRoute = ({ children, fallbackMessage = "Debes iniciar sesión para continuar" }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const handleClose = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <>
      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="relative z-10 px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Background particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-nature-500 animate-float opacity-20"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="experimental-nav-item max-w-md mx-auto p-8">
              {/* Lock icon */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-nature-600/20 to-nature-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-nature-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <h2 className="mb-4 text-3xl font-bold text-white">
                Acceso Requerido
              </h2>

              <p className="mb-8 text-lg text-gray-300">
                {fallbackMessage}
              </p>

              <div className="space-y-4">
                <button
                  onClick={handleLoginClick}
                  className="w-full px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green hover:shadow-lg hover:shadow-nature-500/25"
                >
                  Iniciar Sesión
                </button>

                <button
                  onClick={handleSignupClick}
                  className="w-full px-6 py-3 font-semibold transition-all duration-300 border bg-gradient-to-r from-nature-600/20 to-nature-500/20 border-nature-500/30 text-nature-400 hover:text-white hover:from-nature-600 hover:to-nature-500 rounded-xl"
                >
                  Crear Cuenta Nueva
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  🌿 Únete a nuestra comunidad de amantes de especies exóticas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLogin && (
        <LoginForm
          onClose={handleClose}
          onSwitchToSignup={handleSignupClick}
        />
      )}

      {showSignup && (
        <SignupForm
          onClose={handleClose}
          onSwitchToLogin={handleLoginClick}
        />
      )}
    </>
  );
};

export default ProtectedRoute;