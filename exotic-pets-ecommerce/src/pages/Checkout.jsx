import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../redux/cartSlice';
import { selectUser } from '../redux/authSlice';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const Checkout = () => {
  const cartItems = useSelector((state) => state.cart || []);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState({
    shippingAddress: {
      fullName: user?.name || '',
      address: '',
      city: '',
      state: '',
      country: 'Colombia',
      zipCode: '',
      phone: ''
    },
    paymentMethod: 'credit_card'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.19); // 19% IVA in Colombia
  const shipping = cartItems.length > 0 ? 35000 : 0;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const fieldName = name.split('.')[1];
      setOrderData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [fieldName]: value
        }
      }));
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const order = {
        orderNumber: generateOrderNumber(),
        userId: user.userId,
        userEmail: user.email,
        userName: user.name,
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          category: item.category,
          species: item.species || null
        })),
        pricing: {
          subtotal,
          tax,
          shipping,
          discount: 0,
          total
        },
        status: 'pending',
        shippingAddress: orderData.shippingAddress,
        payment: {
          method: orderData.paymentMethod,
          status: 'pending',
          transactionId: null
        },
        source: 'web',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Here you would send the order to your MongoDB backend
      console.log('Order to submit:', order);

      // For now, we'll just simulate the order submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear cart and redirect
      dispatch(clearCart());
      alert(`¡Pedido ${order.orderNumber} creado exitosamente!`);
      navigate('/');

    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error al procesar el pedido. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CheckoutContent = () => {
    if (cartItems.length === 0) {
      return (
        <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
          <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="experimental-nav-item max-w-md mx-auto p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-nature-600/20 to-nature-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-nature-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.55M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </div>
                </div>

                <h2 className="mb-4 text-3xl font-bold text-white">
                  Carrito Vacío
                </h2>

                <p className="mb-8 text-lg text-gray-300">
                  Agrega algunos productos a tu carrito antes de proceder al checkout
                </p>

                <button
                  onClick={() => navigate('/productos')}
                  className="px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green hover:shadow-lg hover:shadow-nature-500/25"
                >
                  Explorar Productos
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white font-display">
              Finalizar
              <span className="block text-transparent bg-gradient-to-r from-nature-500 to-accent-green bg-clip-text">
                Compra
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Confirma tu pedido y dirección de envío
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="experimental-nav-item p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Resumen del Pedido</h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-nature-600/20 to-nature-500/20 flex items-center justify-center">
                        <span className="text-lg">🦎</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white truncate">{item.name}</h3>
                        <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-nature-400">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-nature-600/30 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>IVA (19%):</span>
                    <span>${tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Envío:</span>
                    <span>${shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-nature-400 pt-2 border-t border-nature-600/30">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* Shipping Address */}
                <div className="experimental-nav-item p-6">
                  <h2 className="mb-4 text-xl font-bold text-white">Dirección de Envío</h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="address.fullName"
                        value={orderData.shippingAddress.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="address.phone"
                        value={orderData.shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
                        placeholder="+57 300 123 4567"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Dirección
                      </label>
                      <input
                        type="text"
                        name="address.address"
                        value={orderData.shippingAddress.address}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
                        placeholder="Carrera 43A #1-50"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={orderData.shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
                        placeholder="Medellín"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Departamento
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={orderData.shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
                        placeholder="Antioquia"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={orderData.shippingAddress.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
                        placeholder="050001"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        País
                      </label>
                      <select
                        name="address.country"
                        value={orderData.shippingAddress.country}
                        onChange={handleInputChange}
                        className="w-full p-3 text-white transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"
                      >
                        <option value="Colombia">Colombia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="experimental-nav-item p-6">
                  <h2 className="mb-4 text-xl font-bold text-white">Método de Pago</h2>

                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-xl border-nature-600/30 hover:border-nature-500 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={orderData.paymentMethod === 'credit_card'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${orderData.paymentMethod === 'credit_card' ? 'border-nature-500 bg-nature-500' : 'border-gray-400'}`}>
                        {orderData.paymentMethod === 'credit_card' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className="text-white">💳 Tarjeta de Crédito</span>
                    </label>

                    <label className="flex items-center p-3 border rounded-xl border-nature-600/30 hover:border-nature-500 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pse"
                        checked={orderData.paymentMethod === 'pse'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${orderData.paymentMethod === 'pse' ? 'border-nature-500 bg-nature-500' : 'border-gray-400'}`}>
                        {orderData.paymentMethod === 'pse' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <span className="text-white">🏛️ PSE</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-4 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green hover:shadow-lg hover:shadow-nature-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando Pedido...
                      </div>
                    ) : (
                      `Confirmar Pedido - $${total.toLocaleString()}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute fallbackMessage="Debes iniciar sesión para finalizar tu compra">
      <CheckoutContent />
    </ProtectedRoute>
  );
};

export default Checkout;