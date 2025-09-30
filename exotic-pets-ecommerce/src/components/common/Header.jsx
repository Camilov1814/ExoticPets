import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { client } from '../../contentfulClient';
import {
  signOutUser,
  getCurrentAuthUser,
  selectIsAuthenticated,
  selectUser
} from '../../redux/authSlice';
import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState(["Inicio"]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart || []);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  const handleCategoryClick = (category) => {
    if (category === 'Inicio') {
      navigate('/');
    } else if (category === 'Animales') {
      navigate('/productos');
    } else {
      navigate(`/productos?categoria=${encodeURIComponent(category)}`);
    }
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const handleAuthClose = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(signOutUser());
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for current user on mount
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(getCurrentAuthUser());
    }
  }, [dispatch, isAuthenticated]);

  // 🔹 Cargar categorías desde Contentful
  useEffect(() => {
    client.getEntries({ content_type: 'productCard' })
      .then((res) => {
        const uniqueCategories = [
          "Inicio", // 👈 aseguramos Inicio siempre
          ...new Set(res.items.map((item) => item.fields.category))
        ];
        setCategories(uniqueCategories);
      })
      .catch(console.error);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-dark-900/95 backdrop-blur-md border-b border-nature-600/20' 
        : 'bg-transparent'
    }`}>
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center group">
            <div className="relative cursor-pointer" onClick={() => navigate('/')}>
              <h1 className="text-3xl font-bold text-white font-display">
                <span className="text-nature-500 animate-pulse-green">🌿</span>
                Exotic
                <span className="text-nature-500">Pets</span>
              </h1>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:block">
            <div className="flex items-center space-x-8">
              {categories.map((item, index) => (
                <button
                  key={item}
                  onClick={() => handleCategoryClick(item)}
                  className="relative px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:text-nature-500 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-nature-600 to-nature-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </button>
              ))}
            </div>
          </nav>

          {/* Authentication & Cart */}
          <div className="items-center hidden space-x-4 md:flex">
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:text-nature-500"
                  >
                    <div className="w-8 h-8 mr-2 rounded-full bg-gradient-to-r from-nature-600 to-nature-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:block">{user?.name || user?.email}</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-xl shadow-lg border border-nature-600/30 z-50 animate-fade-in">
                      <div className="py-1">
                        <div className="px-4 py-2 border-b border-nature-600/30">
                          <p className="text-sm text-gray-300">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-nature-400"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mi Perfil
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-nature-400"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mis Pedidos
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-dark-700"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link to="/cart" className="relative p-3 text-gray-300 hover:text-nature-500">
                  🛒
                  {cartCount > 0 && (
                    <span className="absolute flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold text-white rounded-full -top-2 -right-2 bg-gradient-to-r from-nature-600 to-nature-500">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                {/* Login/Signup buttons */}
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:text-nature-400"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={handleSignupClick}
                  className="px-4 py-2 text-sm font-medium text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green"
                >
                  Registrarse
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-300 rounded-lg hover:text-nature-500"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t bg-dark-900/95 backdrop-blur-md border-nature-600/20">
            {/* Navigation items */}
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => handleCategoryClick(item)}
                className="block w-full px-3 py-2 text-base font-medium text-left text-gray-300 hover:text-nature-500 hover:bg-dark-800"
              >
                {item}
              </button>
            ))}

            {/* Mobile auth section */}
            <div className="pt-3 border-t border-nature-600/20">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center px-3 py-2 text-gray-300">
                    <div className="w-8 h-8 mr-3 rounded-full bg-gradient-to-r from-nature-600 to-nature-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || 'Usuario'}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-nature-500 hover:bg-dark-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-nature-500 hover:bg-dark-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mis Pedidos
                  </Link>
                  <Link
                    to="/cart"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-nature-500 hover:bg-dark-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Carrito ({cartCount})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 text-base font-medium text-left text-red-400 hover:bg-dark-800"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLoginClick();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-base font-medium text-left text-gray-300 hover:text-nature-500 hover:bg-dark-800"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      handleSignupClick();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-base font-medium text-left text-nature-400 hover:text-nature-300 hover:bg-dark-800"
                  >
                    Registrarse
                  </button>
                  <Link
                    to="/cart"
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-nature-500 hover:bg-dark-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Carrito ({cartCount})
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modals */}
      {showLogin && (
        <LoginForm
          onClose={handleAuthClose}
          onSwitchToSignup={handleSignupClick}
        />
      )}

      {showSignup && (
        <SignupForm
          onClose={handleAuthClose}
          onSwitchToLogin={handleLoginClick}
        />
      )}
    </header>
  );
};

export default Header;