import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '../redux/cartSlice';
import { Link } from 'react-router-dom';
import { client } from '../contentfulClient';

const Cart = () => {
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [cartSettings, setCartSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    fetchCartSettings();
  }, []);

  const fetchCartSettings = async () => {
    try {
      const response = await client.getEntries({
        content_type: 'cartSettings',
        limit: 1
      });
      
      if (response.items.length > 0) {
        setCartSettings(response.items[0].fields);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart settings:', error);
      // Usar valores por defecto si falla
      setCartSettings({
        emptyCartTitle: '¡Explora nuestro mundo!',
        emptyCartDescription: 'Descubre especies fascinantes esperando un nuevo hogar',
        emptyCartIcon: '🦎',
        guaranteeText: 'Garantía de bienestar animal',
        freeShippingText: 'Gratis',
        freeShippingThreshold: 0
      });
      setLoading(false);
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Reptiles': '🦎',
      'Anfibios': '🐸',
      'Aracnidos': '🕷️',
      'Aves': '🦜',
      'Accesorios': '🔧',
      'Alimentos': '🥘',
      'Terrarios': '🏠'
    };
    return icons[category] || '🎯';
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-4 text-4xl animate-spin">🔄</div>
            <p className="text-nature-400">Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Partículas de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }, (_, i) => (
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

      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="relative z-10 max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
          
          {/* Header con decoraciones */}
          <div className="relative mb-12 text-center">
            <div className="top-0 text-4xl leaf-decoration left-10 animate-leaf-sway opacity-30">🛒</div>
            <div className="text-3xl leaf-decoration top-5 right-10 animate-float opacity-20" style={{ animationDelay: '1s' }}>💎</div>
            
            <h1 className="mb-4 text-5xl font-bold text-white font-display">
              Tu Carrito de
              <span className="block text-transparent bg-gradient-to-r from-nature-500 to-accent-green bg-clip-text text-glow">
                Criaturas Únicas
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              {cart.length === 0 ? 'Tu carrito está esperando por nuevas aventuras' : `${cart.length} especies seleccionadas`}
            </p>
          </div>

          {cart.length === 0 ? (
            // Estado vacío con contenido de Contentful
            <div className="py-20 text-center">
              <div className="max-w-md p-12 mx-auto experimental-nav-item">
                <div className="mb-6 opacity-50 text-8xl animate-bounce-soft">
                  {cartSettings?.emptyCartIcon || '🦎'}
                </div>
                <h2 className="mb-4 text-2xl font-bold text-white">
                  {cartSettings?.emptyCartTitle || '¡Explora nuestro mundo!'}
                </h2>
                <p className="mb-8 text-gray-400">
                  {cartSettings?.emptyCartDescription || 'Descubre especies fascinantes esperando un nuevo hogar'}
                </p>
                <Link to="/productos">
                  <button className="relative px-8 py-4 font-semibold text-white transition-all duration-300 transform group bg-gradient-to-r from-nature-600 to-nature-500 rounded-2xl hover:from-nature-500 hover:to-accent-green hover:scale-105 glow-green">
                    <span className="relative z-10 flex items-center">
                      Explorar Catálogo
                      <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              
              {/* Lista de productos */}
              <div className="space-y-6 lg:col-span-2">
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-6 experimental-nav-item group animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-6">
                      
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0">
                        {item.image ? (
                          <img
                            src={`https:${item.image}`}
                            alt={item.imageAlt || item.name}
                            className="object-cover w-20 h-20 transition-all duration-300 border-2 rounded-2xl border-nature-500/30 group-hover:border-nature-400/50 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-20 h-20 text-3xl transition-all duration-300 bg-gradient-to-br from-nature-600 to-nature-500 rounded-2xl group-hover:animate-bounce-soft">
                            {getCategoryIcon(item.category)}
                          </div>
                        )}
                      </div>

                      {/* Información del producto */}
                      <div className="flex-grow">
                        <h3 className="mb-1 text-xl font-bold text-white transition-colors duration-300 group-hover:text-nature-400">
                          {item.name}
                        </h3>
                        <p className="mb-2 text-sm font-medium text-nature-500">{item.category}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-2xl font-bold text-accent-green">${item.price}</p>
                          {item.originalPrice && (
                            <p className="text-lg text-gray-500 line-through">${item.originalPrice}</p>
                          )}
                        </div>
                        
                        {/* Características adicionales */}
                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && <span>Tamaño: {item.size}</span>}
                        </div>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border bg-dark-700 rounded-xl border-nature-600/30">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 transition-all duration-200 text-nature-500 hover:text-accent-green hover:bg-nature-600/20 rounded-l-xl"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-4 py-2 text-white font-semibold min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)} 
                            className="p-2 transition-all duration-200 text-nature-500 hover:text-accent-green hover:bg-nature-600/20 rounded-r-xl"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[6rem]">
                          <p className="text-2xl font-bold text-nature-500">${item.price * item.quantity}</p>
                          {item.originalPrice && (
                            <p className="text-sm text-gray-400">
                              Ahorras: ${(item.originalPrice - item.price) * item.quantity}
                            </p>
                          )}
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="p-2 text-red-400 transition-all duration-200 hover:text-red-300 hover:bg-red-500/10 rounded-xl group/delete"
                        >
                          <svg className="w-5 h-5 group-hover/delete:animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen de compra */}
              <div className="lg:col-span-1">
                <div className="sticky p-8 experimental-nav-item top-8">
                  
                  {/* Header del resumen */}
                  <div className="mb-8 text-center">
                    <h2 className="mb-2 text-2xl font-bold text-white">Resumen de Compra</h2>
                    <div className="w-16 h-1 mx-auto rounded-full bg-gradient-to-r from-nature-500 to-accent-green"></div>
                  </div>

                  {/* Detalles */}
                  <div className="mb-8 space-y-4">
                    <div className="flex justify-between text-gray-300">
                      <span>Productos ({cart.length})</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    
                    {/* Calcular ahorro total si hay descuentos */}
                    {cart.some(item => item.originalPrice) && (
                      <div className="flex justify-between text-green-400">
                        <span>Ahorros totales</span>
                        <span>
                          -${cart.reduce((sum, item) => {
                            return sum + ((item.originalPrice || item.price) - item.price) * item.quantity;
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-300">
                      <span>Envío</span>
                      <span className="text-accent-green">
                        {cartSettings?.freeShippingText || 'Gratis'}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-nature-600/30">
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-nature-500">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-4">
                    <Link
                      to="/checkout"
                      className="relative w-full px-6 py-4 font-semibold text-white transition-all duration-300 transform group bg-gradient-to-r from-nature-600 to-nature-500 rounded-2xl hover:from-nature-500 hover:to-accent-green hover:scale-105 glow-green block text-center"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Proceder al Pago
                        <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </Link>

                    <button
                      onClick={() => dispatch(clearCart())}
                      className="w-full px-6 py-3 font-semibold text-red-400 transition-all duration-300 border-2 border-red-500/50 rounded-2xl hover:bg-red-500/10 hover:border-red-400"
                    >
                      Vaciar Carrito
                    </button>
                  </div>

                  {/* Garantía con contenido de Contentful */}
                  <div className="pt-6 mt-8 border-t border-nature-600/30">
                    <div className="flex items-center text-sm text-gray-400">
                      <svg className="w-5 h-5 mr-2 text-nature-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {cartSettings?.guaranteeText || 'Garantía de bienestar animal'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;