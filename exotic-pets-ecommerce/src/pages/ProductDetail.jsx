import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import { hybridProductService } from '../services/hybridProductService';
import ImageGallery from '../components/common/ImageGallery';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('ProductDetail: ID from URL:', id);
    fetchProducts();
  }, [id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Fetch products using hybrid service
      const hybridProducts = await hybridProductService.getProducts();

      const formattedProducts = hybridProducts.map(product => ({
        id: product._id || product.contentfulId,
        contentfulId: product.contentfulId,
        name: product.name,
        category: product.category,
        description: product.description || 'Producto exótico de alta calidad',
        price: product.price,
        originalPrice: product.originalPrice,
        color: product.color,
        size: product.size,
        difficulty: product.difficulty,
        badge: product.badge,
        badgeColor: product.badgeColor || 'bg-green-500',
        featured: product.featured || false,
        // Hybrid data
        stock: product.stock,
        inStock: product.inStock,
        rating: product.rating || 4.5,
        reviews: product.reviewCount || 0,
        features: product.features || [],
        totalSales: product.totalSales,
        sku: product.sku,
        // Image from Contentful or fallback
        image: product.images?.url ? (product.images.url.startsWith('http') ? product.images.url : `https:${product.images.url}`) : null,
        imageAlt: product.name,
        // Use processed images array from hybrid service
        images: product.images || []
      }));
      
      setProducts(formattedProducts);
      
      // Buscar el producto específico por contentfulId o ID
      console.log('ProductDetail: Looking for product with ID:', id);
      console.log('ProductDetail: Available products:', formattedProducts.map(p => ({ id: p.id, contentfulId: p.contentfulId, name: p.name })));

      const currentProduct = formattedProducts.find(p => {
        // Try exact matches first
        if (p.contentfulId === id || p.id === id) return true;

        // Try case-insensitive matches
        if (p.contentfulId?.toLowerCase() === id?.toLowerCase()) return true;
        if (p.id?.toLowerCase() === id?.toLowerCase()) return true;

        // Try matching MongoDB ObjectId
        if (p.id === id || p._id === id) return true;

        return false;
      });

      console.log('ProductDetail: Found product:', currentProduct);
      if (currentProduct) {
        console.log('ProductDetail: Product image data:', {
          image: currentProduct.image,
          imageGallery: currentProduct.imageGallery,
          rawImages: currentProduct.images
        });
      }
      setProduct(currentProduct);

      if (!currentProduct) {
        console.error('ProductDetail: Product not found with ID:', id);
        setError('Producto no encontrado');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Productos similares
  const similarProducts = useMemo(() => {
    if (!product || !products.length) return [];
    return products.filter(
      p => p.category === product.category && p.id !== product.id
    ).slice(0, 4);
  }, [product, products]);

  const getCategoryIcon = (category) => {
    const icons = {
      'Reptiles': '🦎',
      'Anfibios': '🐸',
      'Aracnidos': '🕷️',
      'Aves': '🦜',
      'Terrarios': '🏠',
      'Accesorios': '🔧',
      'Alimentos': '🥗'
    };
    return icons[category] || '🎯';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Principiante': 'text-green-400 bg-green-400/10 border-green-400/30',
      'Intermedio': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
      'Avanzado': 'text-red-400 bg-red-400/10 border-red-400/30'
    };
    return colors[difficulty] || 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  };

  const handleAddToCart = () => {
    if (product.inStock === false) {
      return; // No agregar si no hay stock
    }
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}>
        ★
      </span>
    ));
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-4 text-4xl animate-spin">🔄</div>
            <p className="text-nature-400">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md p-12 mx-auto text-center experimental-nav-item">
            <div className="mb-6 opacity-50 text-8xl animate-bounce-soft">⚠️</div>
            <h2 className="mb-4 text-2xl font-bold text-white">Error al cargar</h2>
            <p className="mb-8 text-gray-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no encuentra el producto
  if (!product && !loading) {
    return (
      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md p-12 mx-auto text-center experimental-nav-item">
            <div className="mb-6 opacity-50 text-8xl animate-bounce-soft">❌</div>
            <h2 className="mb-4 text-2xl font-bold text-white">Producto no encontrado</h2>
            <p className="mb-4 text-gray-400">Lo sentimos, no pudimos encontrar la criatura que buscas</p>
            <p className="mb-8 text-xs text-gray-500">ID buscado: {id}</p>
            <Link
              to="/productos"
              className="px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green"
            >
              Volver al Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Partículas de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
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
        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-sm text-gray-400">
            <Link to="/" className="transition-colors hover:text-nature-400">Inicio</Link>
            <span>→</span>
            <Link to="/productos" className="transition-colors hover:text-nature-400">Productos</Link>
            <span>→</span>
            <span className="text-nature-400">{product.name}</span>
          </nav>

          {/* Contenido principal */}
          <div className="grid gap-12 lg:grid-cols-2">
            
            {/* Sección de imagen */}
            <div className="space-y-6">
              {/* Gallery de imágenes con nuevo componente */}
              <div className="relative experimental-nav-item">
                <ImageGallery
                  images={product.images}
                  productName={product.name}
                />

                {/* Badge */}
                {product.badge && (
                  <div className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded-full ${product.badgeColor} z-10`}>
                    {product.badge}
                  </div>
                )}

                {/* Descuento */}
                {product.originalPrice && (
                  <div className="absolute px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-4 right-4 z-10">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Información del producto */}
            <div className="space-y-8">
              
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{getCategoryIcon(product.category)}</span>
                  <span className="px-3 py-1 text-sm font-medium border rounded-full text-nature-400 bg-nature-400/10 border-nature-400/30">
                    {product.category}
                  </span>
                  {product.featured && (
                    <span className="px-3 py-1 text-sm font-medium text-yellow-400 border rounded-full border-yellow-400/30 bg-yellow-400/10">
                      ⭐ Destacado
                    </span>
                  )}
                </div>
                
                <h1 className="mb-4 text-4xl font-bold text-white font-display">
                  {product.name}
                </h1>
                
                <p className="text-lg leading-relaxed text-gray-300">
                  {product.description}
                </p>
              </div>

              {/* Rating y reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                  <span className="ml-2 text-sm text-gray-400">
                    {product.rating}/5 ({product.reviews} reseñas)
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-nature-500">${product.price?.toLocaleString('es-CO') || '0'}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice.toLocaleString('es-CO')}</span>
                )}
              </div>

              {/* Stock Information */}
              {product.inStock !== undefined && (
                <div className="mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                    product.inStock
                      ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                      : 'bg-red-500/20 text-red-400 border border-red-400/30'
                  }`}>
                    <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
                    {product.inStock ? `${product.stock} unidades disponibles` : 'Producto agotado'}
                  </div>
                  {product.sku && (
                    <p className="text-sm text-gray-500 mt-2">SKU: {product.sku}</p>
                  )}
                </div>
              )}

              {/* Características principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border experimental-nav-item border-nature-600/20">
                  <div className="text-sm text-gray-400">Color</div>
                  <div className="text-lg font-semibold text-white">{product.color}</div>
                </div>
                <div className="p-4 border experimental-nav-item border-nature-600/20">
                  <div className="text-sm text-gray-400">Tamaño</div>
                  <div className="text-lg font-semibold text-white">{product.size}</div>
                </div>
                <div className="col-span-2 p-4 border experimental-nav-item border-nature-600/20">
                  <div className="mb-2 text-sm text-gray-400">Nivel de Cuidado</div>
                  <span className={`px-3 py-1 text-sm font-medium border rounded-full ${getDifficultyColor(product.difficulty)}`}>
                    {product.difficulty}
                  </span>
                </div>
              </div>

              {/* Features (si tienes datos) */}
              {product.features && product.features.length > 0 && (
                <div className="p-6 experimental-nav-item">
                  <h3 className="mb-4 text-lg font-semibold text-white">Incluye:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-300">
                        <span className="text-nature-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Controles de compra */}
              <div className="p-6 space-y-6 experimental-nav-item">
                {/* Cantidad */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-white">Cantidad:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex items-center justify-center w-10 h-10 transition-colors border rounded-lg bg-dark-700 border-nature-600/30 hover:border-nature-500/50"
                    >
                      −
                    </button>
                    <span className="w-12 text-lg font-semibold text-center text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="flex items-center justify-center w-10 h-10 transition-colors border rounded-lg bg-dark-700 border-nature-600/30 hover:border-nature-500/50"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.inStock === false}
                    className={`w-full px-6 py-4 font-semibold transition-all duration-300 rounded-xl ${
                      product.inStock === false
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'text-white bg-gradient-to-r from-nature-600 to-nature-500 hover:from-nature-500 hover:to-accent-green hover:shadow-lg hover:shadow-nature-500/25'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {product.inStock === false ? 'Producto Agotado' : 'Añadir al Carrito'}
                      {product.inStock !== false && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.55M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                      )}
                    </span>
                  </button>
                  
                  <button className="w-full px-6 py-4 font-semibold transition-all duration-300 border text-nature-400 border-nature-500/30 rounded-xl hover:text-white hover:bg-nature-600/20 hover:border-nature-500/60">
                    Comprar Ahora
                  </button>
                </div>
              </div>

              {/* Botón volver */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 transition-all duration-300 border text-nature-400 border-nature-600/30 rounded-xl hover:text-white hover:border-nature-500/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
            </div>
          </div>

          {/* Productos similares */}
          {similarProducts.length > 0 && (
            <div className="mt-20">
              <div className="mb-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-white font-display">
                  Otras criaturas de 
                  <span className="text-transparent bg-gradient-to-r from-nature-500 to-accent-green bg-clip-text">
                    {" " + product.category}
                  </span>
                </h2>
                <p className="text-gray-300">Descubre más especies fascinantes</p>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {similarProducts.map((similar, index) => (
                  <Link
                    key={similar.id}
                    to={`/productos/${similar.id}`}
                    className="p-6 experimental-nav-item group animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Partículas */}
                    <div className="absolute w-1 h-1 rounded-full opacity-0 top-2 right-2 bg-nature-500 group-hover:opacity-100 sparkle"></div>
                    
                    {/* Imagen */}
                    <div className="mb-6 text-center">
                      {similar.image ? (
                        <img
                          src={`https:${similar.image}`}
                          alt={similar.imageAlt}
                          className="object-cover w-full h-32 mb-4 transition-all duration-500 rounded-lg group-hover:scale-110"
                        />
                      ) : (
                        <div className="mb-4 text-5xl transition-all duration-500 group-hover:animate-bounce-soft group-hover:scale-110 filter drop-shadow-lg">
                          {getCategoryIcon(similar.category)}
                        </div>
                      )}
                      <div className="inline-block px-3 py-1 mb-2 border rounded-full bg-gradient-to-r from-nature-600/20 to-nature-500/20 backdrop-blur-sm border-nature-500/30">
                        <span className="text-xs font-medium text-nature-400">{similar.category}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center">
                      <h3 className="mb-2 text-lg font-bold text-white transition-colors duration-300 group-hover:text-nature-400">
                        {similar.name}
                      </h3>
                      
                      <div className="flex justify-center gap-1 mb-3">
                        {renderStars(similar.rating)}
                        <span className="ml-1 text-xs text-gray-400">({similar.reviews})</span>
                      </div>

                      <div className="mb-4">
                        <span className="text-2xl font-bold text-nature-500">${similar.price?.toLocaleString('es-CO') || '0'}</span>
                        {similar.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">${similar.originalPrice.toLocaleString('es-CO')}</span>
                        )}
                        {similar.inStock !== undefined && (
                          <div className="mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              similar.inStock
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {similar.inStock ? `Stock: ${similar.stock}` : 'Agotado'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Efecto hover */}
                    <div className="absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none bg-gradient-to-br from-nature-500/5 to-transparent rounded-2xl group-hover:opacity-100"></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}