import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { useNavigate } from 'react-router-dom';
import { hybridProductService } from '../../services/hybridProductService';

const FeaturedProducts = () => {
  const [activeProduct, setActiveProduct] = useState(0);
  const [particles, setParticles] = useState([]);
  const [products, setProducts] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Partículas random de fondo
    setParticles(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 2,
      }))
    );

    // Fetch de productos destacados usando el servicio híbrido
    const fetchFeaturedProducts = async () => {
      try {
        const hybridProducts = await hybridProductService.getFeaturedProducts();

        const mapped = hybridProducts.map((product) => ({
          id: product._id || product.contentfulId,
          name: product.name,
          price: `$${product.price?.toLocaleString('es-CO')}` || '$0',
          originalPrice: product.originalPrice ? `$${product.originalPrice.toLocaleString('es-CO')}` : null,
          badge: product.badge,
          badgeColor: product.badgeColor || 'bg-green-500',
          rating: product.rating || 0,
          reviews: product.reviewCount || 0,
          description: product.description || 'Producto exótico de alta calidad',
          features: product.features || [],
          gradient: 'from-nature-600 to-emerald-700',
          category: product.category,
          // Usa imagen de Contentful si está disponible, sino usa emoji
          image: product.images?.url || '🐍',
          // Datos adicionales del híbrido
          stock: product.stock,
          inStock: product.inStock,
          contentfulId: product.contentfulId
        }));

        setProducts(mapped);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback en caso de error
        setProducts([]);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const goToCategory = (category) => {
    navigate(`/productos?categoria=${encodeURIComponent(category)}`);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-dark-900 to-dark-800">
      {/* Fondo de partículas */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-1 h-1 rounded-full bg-nature-500 animate-float opacity-20"
          style={{ left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${p.delay}s` }}
        />
      ))}

      <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Título */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-5xl font-bold text-white font-display">
            Productos <span className="block text-transparent bg-gradient-to-r from-nature-500 to-accent-green bg-clip-text">Destacados</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-300">
            Los favoritos de nuestros clientes, seleccionados por calidad y popularidad
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((prod, idx) => (
            <div
              key={prod.id}
              onMouseEnter={() => setActiveProduct(idx)}
              className="relative overflow-hidden transition transform border cursor-pointer group bg-gradient-to-br from-dark-800 to-dark-700 rounded-3xl border-nature-600/20 hover:border-nature-500/40 hover:scale-105"
            >
              {/* Badge */}
              {prod.badge && (
                <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full text-white ${prod.badgeColor} animate-pulse-green`}>
                  {prod.badge}
                </div>
              )}

              {/* Emoji / Imagen */}
              <div
                onClick={() => goToCategory(prod.category)}
                className={`relative aspect-square bg-gradient-to-br ${prod.gradient} flex items-center justify-center overflow-hidden group-hover:opacity-90`}
              >
                {prod.image.startsWith('http') ? (
                  <img src={prod.image} alt={prod.name} className="object-cover w-full h-full" />
                ) : (
                  <span className="transition text-8xl group-hover:animate-bounce-soft">
                    {prod.image}
                  </span>
                )}
              </div>

              {/* Contenido */}
              <div className="relative p-6">
                {/* Rating y Stock */}
                <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
                  <span>⭐ {prod.rating} ({prod.reviews})</span>
                  {prod.inStock !== undefined && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      prod.inStock
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {prod.inStock ? `Stock: ${prod.stock}` : 'Agotado'}
                    </span>
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">{prod.name}</h3>
                <p className="mb-4 text-sm text-gray-400">{prod.description}</p>
                {/* Features */}
                {prod.features.slice(0, 2).map((f, i) => (
                  <div key={i} className="flex items-center mb-1 text-xs text-nature-400">
                    <span className="w-1 h-1 mr-2 rounded-full bg-nature-500" />{f}
                  </div>
                ))}

                {/* Precio y botón */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-white">{prod.price}</span>
                  {prod.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">{prod.originalPrice}</span>
                  )}
                </div>
                <button
                  onClick={() => dispatch(addToCart({ id: prod.id, name: prod.name, price: prod.price }))}
                  disabled={!prod.inStock}
                  className={`w-full py-3 font-semibold transition transform border rounded-xl ${
                    prod.inStock
                      ? 'bg-gradient-to-r from-nature-600/20 to-nature-500/20 border-nature-500/30 text-nature-400 hover:text-white hover:from-nature-600 hover:to-nature-500 hover:scale-105'
                      : 'bg-gray-600/20 border-gray-500/30 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {prod.inStock ? 'Agregar al carrito' : 'Sin stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ver todos */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/productos')}
            className="inline-flex items-center px-8 py-4 font-semibold transition transform border-2 border-nature-500 text-nature-500 bg-dark-800/50 hover:bg-nature-500 hover:text-dark-900 rounded-2xl hover:scale-105"
          >
            Ver Todos los Productos
            <svg className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;