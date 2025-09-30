import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { addToCart } from '../redux/cartSlice';
import { hybridProductService } from '../services/hybridProductService';
import { 
  trackPageView, 
  trackAddToCart, 
  trackCategoryFilter, 
  trackSearch, 
  trackPriceFilter,
  trackDifficultyFilter,
  trackSortProducts,
  trackViewModeChange,
  trackClearFilters,
  trackProductImageError,
  trackSpeciesInterest
} from '../utils/analytics';



// ===== UTILITY FUNCTIONS =====
const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getCategoryIcon = (category) => {
  const icons = {
    'Reptiles': '🦎',
    'Anfibios': '🐸',
    'Aracnidos': '🕷️',
    'Aves': '🦜'
  };
  return icons[category] || '🎯';
};

const getDifficultyColor = (difficulty) => {
  const colors = {
    'Principiante': 'text-green-400',
    'Intermedio': 'text-yellow-400',
    'Avanzado': 'text-red-400'
  };
  return colors[difficulty] || 'text-gray-400';
};



const Products = () => {
  // ===== REDUX & ROUTING =====
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // ===== PRODUCT DATA STATE =====
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Todas"]);
  const [colors, setColors] = useState(["Todos"]);
  const [sizes, setSizes] = useState(["Todos"]);
  const [difficulties, setDifficulties] = useState(["Todas"]);

  // ===== FILTER & UI STATE =====
  const [filters, setFilters] = useState({
    category: 'Todas',
    color: 'Todos',
    difficulty: 'Todas',
    size: 'Todos',
    search: '',
    priceRange: [0, 1000000] // Updated to Colombian pesos
  });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  // ===== EFFECTS =====
  // Track page view on component mount
  useEffect(() => {
    trackPageView('Products Page', 'Catálogo de Especies Exóticas');
  }, []);

  // Handle URL category parameter
  useEffect(() => {
    const categoryFromUrl = searchParams.get('categoria');
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }));
      // Track category selection from URL
      trackCategoryFilter(categoryFromUrl);
      trackSpeciesInterest(categoryFromUrl, 'url_navigation');
    } else {
      setFilters(prev => ({ ...prev, category: 'Todas' }));
    }
  }, [searchParams, categories]);

  // Fetch products using hybrid service
  useEffect(() => {
    const fetchHybridProducts = async () => {
      try {
        console.log("Fetching hybrid products...");
        const hybridProducts = await hybridProductService.getProducts();
        console.log("Hybrid products response:", hybridProducts);

        const items = hybridProducts.map((product) => ({
          id: product._id || product.contentfulId,
          contentfulId: product.contentfulId,
          name: product.name,
          category: product.category,
          // Usa imagen de Contentful si está disponible, sino usa emoji por categoría
          image: product.images?.url || null,
          badge: product.badge,
          badgeColor: product.badgeColor || 'bg-green-500',
          price: product.price,
          originalPrice: product.originalPrice,
          color: product.color,
          size: product.size,
          difficulty: product.difficulty,
          // Datos adicionales del híbrido
          stock: product.stock,
          inStock: product.inStock,
          rating: product.rating,
          reviewCount: product.reviewCount,
          sku: product.sku,
          totalSales: product.totalSales
        }));

        setProducts(items);

        // Build dynamic filter options
        const uniqueCategories = ["Todas", ...new Set(items.map(p => p.category).filter(Boolean))];
        const uniqueColors = ["Todos", ...new Set(items.map(p => p.color).filter(Boolean))];
        const uniqueSizes = ["Todos", ...new Set(items.map(p => p.size).filter(Boolean))];
        const uniqueDifficulties = ["Todas", ...new Set(items.map(p => p.difficulty).filter(Boolean))];

        setCategories(uniqueCategories);
        setColors(uniqueColors);
        setSizes(uniqueSizes);
        setDifficulties(uniqueDifficulties);

        // Update price range based on actual product prices
        const prices = items.map(p => p.price).filter(Boolean);
        if (prices.length > 0) {
          const maxPrice = Math.max(...prices);
          setFilters(prev => ({
            ...prev,
            priceRange: [0, Math.ceil(maxPrice / 50000) * 50000] // Round to nearest 50k
          }));
        }

      } catch (error) {
        console.error("Error fetching hybrid products:", error);
        // Fallback: set empty state
        setProducts([]);
      }
    };

    fetchHybridProducts();
  }, []);

  // ===== COMPUTED VALUES =====
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = filters.category === 'Todas' || 
        normalize(product.category) === normalize(filters.category);
      
      const matchesColor = filters.color === 'Todos' || product.color === filters.color || !product.color;
      const matchesDifficulty = filters.difficulty === 'Todas' || product.difficulty === filters.difficulty || !product.difficulty;
      const matchesSize = filters.size === 'Todos' || product.size === filters.size || !product.size;
      
      const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      return matchesCategory && matchesColor && matchesDifficulty && 
             matchesSize && matchesSearch && matchesPrice;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return filtered;

  }, [filters, sortBy, products]);

  // ===== EVENT HANDLERS =====
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Track filter events
    switch (key) {
      case 'category':
        if (value !== 'Todas') {
          trackCategoryFilter(value, filteredProducts.length);
          trackSpeciesInterest(value, 'filter_selection');
        }
        break;
      case 'difficulty':
        if (value !== 'Todas') {
          trackDifficultyFilter(value, filteredProducts.length);
        }
        break;
      case 'search':
        if (value.trim().length > 2) {
          trackSearch(value, filteredProducts.length);
        }
        break;
      case 'priceRange':
        trackPriceFilter(value[0], value[1], filteredProducts.length);
        break;
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'Todas',
      color: 'Todos',
      difficulty: 'Todas',
      size: 'Todos',
      search: '',
      priceRange: [0, 1000000]
    });
    trackClearFilters();
  };






  // ===== RENDER =====
  return (
    <>
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
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

      {/* Main content */}
      <div className="min-h-screen py-20 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="relative mb-12 text-center">

            <div className="top-0 text-4xl leaf-decoration left-10 animate-leaf-sway opacity-30">🍃</div>

            <div className="text-3xl leaf-decoration top-5 right-10 animate-float opacity-20" style={{ animationDelay: '1s' }}>✨</div>



            <h1 className="mb-4 text-5xl font-bold text-white font-display">

              Catálogo de

              <span className="block text-transparent bg-gradient-to-r from-nature-500 to-accent-green bg-clip-text text-glow">

                Especies Exóticas

              </span>

            </h1>

            <p className="text-lg text-gray-300">

              Descubre {filteredProducts.length} especies únicas esperando un nuevo hogar

            </p>

          </div>



          <div className="grid gap-8 lg:grid-cols-4">



            {/* Panel de filtros */}

            <div className="lg:col-span-1">

              <div className="sticky p-6 experimental-nav-item top-8">



                {/* Header de filtros */}

                <div className="flex items-center justify-between mb-6">

                  <h2 className="text-xl font-bold text-white">Filtros</h2>

                  <button

                    onClick={clearFilters}

                    className="text-sm transition-colors duration-200 text-nature-500 hover:text-accent-green"

                  >

                    Limpiar todo

                  </button>

                </div>



                {/* Barra de búsqueda */}

                <div className="mb-6">

                  <label className="block mb-2 text-sm font-medium text-gray-300">Buscar</label>

                  <div className="relative">

                    <input

                      type="text"

                      placeholder="Nombre o categoría..."

                      value={filters.search}

                      onChange={(e) => updateFilter('search', e.target.value)}

                      className="w-full p-3 text-white placeholder-gray-400 transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"

                    />

                    <svg className="absolute w-5 h-5 text-gray-400 right-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />

                    </svg>

                  </div>

                </div>



                {/* Filtro por categoría */}

                <div className="mb-6">

                  <label className="block mb-3 text-sm font-medium text-gray-300">Categoría</label>

                  <div className="space-y-2">

                    {categories.map(category => (

                      <label key={category} className="flex items-center cursor-pointer group">

                        <input

                          type="radio"

                          name="category"

                          value={category}

                          checked={filters.category === category}

                          onChange={(e) => updateFilter('category', e.target.value)}

                          className="sr-only"

                        />

                        <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${filters.category === category

                          ? 'border-nature-500 bg-nature-500'

                          : 'border-gray-400 group-hover:border-nature-400'

                          }`}>

                          {filters.category === category && (

                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>

                          )}

                        </div>

                        <span className={`transition-colors duration-200 ${filters.category === category ? 'text-nature-400' : 'text-gray-300 group-hover:text-white'

                          }`}>

                          {category}

                        </span>

                      </label>

                    ))}

                  </div>

                </div>



                {/* Filtro por color */}

                <div className="mb-6">

                  <label className="block mb-3 text-sm font-medium text-gray-300">Color</label>

                  <select

                    value={filters.color}

                    onChange={(e) => updateFilter('color', e.target.value)}

                    className="w-full p-3 text-white transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"

                  >

                    {colors.map(color => (

                      <option key={color} value={color}>{color}</option>

                    ))}

                  </select>

                </div>



                {/* Filtro por dificultad */}

                <div className="mb-6">

                  <label className="block mb-3 text-sm font-medium text-gray-300">Nivel de Cuidado</label>

                  <select

                    value={filters.difficulty}

                    onChange={(e) => updateFilter('difficulty', e.target.value)}

                    className="w-full p-3 text-white transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"

                  >

                    {difficulties.map(difficulty => (

                      <option key={difficulty} value={difficulty}>{difficulty}</option>

                    ))}

                  </select>

                </div>



                {/* Filtro por tamaño */}

                <div className="mb-6">

                  <label className="block mb-3 text-sm font-medium text-gray-300">Tamaño</label>

                  <div className="grid grid-cols-3 gap-2">

                    {sizes.filter(size => size !== 'Todos').map(size => (

                      <button

                        key={size}

                        onClick={() => updateFilter('size', filters.size === size ? 'Todos' : size)}

                        className={`p-2 text-xs font-medium rounded-lg transition-all duration-200 ${filters.size === size

                          ? 'bg-nature-500 text-white'

                          : 'bg-dark-700 text-gray-300 hover:bg-nature-600/20 hover:text-nature-400'

                          }`}

                      >

                        {size}

                      </button>

                    ))}

                  </div>

                </div>



                {/* Rango de precios */}

                <div className="mb-6">

                  <label className="block mb-3 text-sm font-medium text-gray-300">

                    Precio: ${filters.priceRange[0].toLocaleString('es-CO')} - ${filters.priceRange[1].toLocaleString('es-CO')}

                  </label>

                  <input

                    type="range"

                    min="0"

                    max="1000000"

                    step="50000"

                    value={filters.priceRange[1]}

                    onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}

                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-dark-700 slider"

                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>$0</span>
                    <span>$1,000,000</span>
                  </div>

                </div>

              </div>

            </div>



            {/* Contenido principal */}

            <div className="lg:col-span-3">



              {/* Controles de vista y ordenamiento */}

              <div className="flex flex-col items-center justify-between gap-4 mb-8 sm:flex-row">

                <div className="flex items-center gap-4">

                  {/* Vista */}

                  <div className="flex p-1 bg-dark-700 rounded-xl">

                    <button

                      onClick={() => {
                        setViewMode('grid');
                        trackViewModeChange('grid');
                      }}

                      className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-nature-500 text-white' : 'text-gray-400 hover:text-white'

                        }`}

                    >

                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />

                      </svg>

                    </button>

                    <button

                      onClick={() => {
                        setViewMode('list');
                        trackViewModeChange('list');
                      }}

                      className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-nature-500 text-white' : 'text-gray-400 hover:text-white'

                        }`}

                    >

                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />

                      </svg>

                    </button>

                  </div>

                </div>



                {/* Ordenamiento */}

                <select

                  value={sortBy}

                  onChange={(e) => {
                    setSortBy(e.target.value);
                    trackSortProducts(e.target.value, filteredProducts.length);
                  }}

                  className="p-3 text-white transition-colors duration-200 border bg-dark-700 border-nature-600/30 rounded-xl focus:border-nature-500 focus:outline-none"

                >

                  <option value="name">Ordenar por Nombre</option>

                  <option value="price-low">Precio: Menor a Mayor</option>

                  <option value="price-high">Precio: Mayor a Menor</option>

                </select>

              </div>



              {/* Grid/Lista de productos */}

              {filteredProducts.length === 0 ? (

                <div className="py-20 text-center">

                  <div className="max-w-md p-12 mx-auto experimental-nav-item">

                    <div className="mb-6 opacity-50 text-8xl animate-bounce-soft">🍃</div>

                    <h2 className="mb-4 text-2xl font-bold text-white">No encontramos especies</h2>

                    <p className="mb-8 text-gray-400">Intenta ajustar tus filtros para descubrir más criaturas</p>

                    <button

                      onClick={clearFilters}

                      className="px-6 py-3 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-nature-600 to-nature-500 rounded-xl hover:from-nature-500 hover:to-accent-green"

                    >

                      Limpiar Filtros

                    </button>

                  </div>

                </div>

              ) : (

                <div className={viewMode === 'grid'

                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"

                  : "space-y-6"

                }>

                  {filteredProducts.map((product, index) => (

                    <Link

                      key={product.id}

                      to={`/productos/${product.contentfulId || product.id}`}

                      className={`experimental-nav-item group cursor-pointer animate-fade-in ${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'

                        }`}

                      style={{ animationDelay: `${index * 0.1}s` }}



                    >

                      {viewMode === 'grid' ? (

                        // Vista Grid

                        <>

                          {/* Partículas temáticas */}

                          <div className="absolute w-1 h-1 rounded-full opacity-0 top-2 right-2 bg-nature-500 group-hover:opacity-100 sparkle"></div>

                          <div className="absolute w-1 h-1 rounded-full opacity-0 bottom-2 left-2 bg-accent-green group-hover:opacity-100 sparkle" style={{ animationDelay: '0.5s' }}></div>



                          {/* Imagen principal - ACTUALIZADA */}

                          <div className="mb-6">

                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-nature-600/20 to-nature-500/20">

                              {product.image ? (

                                // Si tiene imagen real, mostrarla

                                <img

                                  src={product.image}

                                  alt={product.name}

                                  className="object-cover w-full h-48 transition-all duration-500 group-hover:scale-110"

                                  onError={(e) => {

                                    // Fallback al emoji si la imagen no carga
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                    trackProductImageError(product.id, product.name);

                                  }}

                                />

                              ) : null}



                              {/* Fallback emoji - siempre presente si no hay imagen */}

                              <div

                                className={`absolute inset-0 flex items-center justify-center text-6xl transition-all duration-500 group-hover:animate-bounce-soft group-hover:scale-110 filter drop-shadow-lg ${product.image ? 'hidden' : 'flex'

                                  }`}

                              >

                                {getCategoryIcon(product.category)}

                              </div>



                              {/* Overlay gradient en hover */}

                              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent group-hover:opacity-100"></div>



                              {/* Badge sobre la imagen */}

                              {product.badge && (

                                <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold text-white rounded-lg ${product.badgeColor || "bg-gray-500"}`}>

                                  {product.badge}

                                </div>

                              )}



                              {/* Precio con descuento */}

                              {product.originalPrice && product.originalPrice > 0 && (

                                <div className="absolute px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-lg top-3 right-3">

                                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%

                                </div>

                              )}



                            </div>



                            {/* Badge de categoría */}

                            <div className="inline-block px-3 py-1 mt-3 border rounded-full bg-gradient-to-r from-nature-600/20 to-nature-500/20 backdrop-blur-sm border-nature-500/30">

                              <span className="text-xs font-medium text-nature-400">{product.category}</span>

                            </div>

                          </div>



                          {/* Información del producto */}

                          <div className="text-center">

                            <h3 className="mb-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-nature-400">

                              {product.name}

                            </h3>





                            {/* Características */}

                            <div className="flex justify-center gap-2 mb-4">

                              <span className="px-2 py-1 text-xs text-gray-300 rounded-lg bg-dark-700/50 backdrop-blur-sm">

                                {product.color}

                              </span>

                              <span className="px-2 py-1 text-xs text-gray-300 rounded-lg bg-dark-700/50 backdrop-blur-sm">

                                {product.size}

                              </span>

                            </div>



                            {/* Nivel de dificultad */}

                            <div className="mb-4">

                              <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getDifficultyColor(product.difficulty)}`}>

                                {product.difficulty}

                              </span>

                            </div>



                            {/* Precio */}

                            <div className="mb-4">

                              <span className="text-3xl font-bold text-nature-500">${product.price?.toLocaleString('es-CO') || '0'}</span>

                              {product.originalPrice && (

                                <span className="ml-2 text-lg text-gray-500 line-through">${product.originalPrice.toLocaleString('es-CO')}</span>

                              )}

                            </div>

                            {/* Stock info */}
                            {product.inStock !== undefined && (
                              <div className="mb-4">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  product.inStock
                                    ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-400/30'
                                }`}>
                                  {product.inStock ? `Stock: ${product.stock}` : 'Agotado'}
                                </span>
                              </div>
                            )}



                            {/* Botón de compra */}

                            <button

                              onClick={(e) => {

                                e.preventDefault();

                                if (product.inStock !== false) {
                                  dispatch(addToCart(product));
                                  trackAddToCart(product);
                                  trackSpeciesInterest(product.category, 'add_to_cart');
                                }

                              }}

                              disabled={product.inStock === false}

                              className={`relative w-full px-6 py-3 font-semibold transition-all duration-300 border group rounded-xl ${
                                product.inStock === false
                                  ? 'bg-gray-600/20 border-gray-500/30 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-nature-600/20 to-nature-500/20 border-nature-500/30 text-nature-400 hover:text-white hover:from-nature-600 hover:to-nature-500 hover:shadow-lg hover:shadow-nature-500/25'
                              }`}

                            >

                              <span className="relative z-10 flex items-center justify-center">

                                {product.inStock === false ? 'Sin Stock' : 'Añadir al Carrito'}

                                {product.inStock !== false && (
                                  <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.55M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />

                                  </svg>
                                )}

                              </span>

                            </button>

                          </div>



                          {/* Efecto de brillo */}

                          <div className="absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none bg-gradient-to-br from-nature-500/5 to-transparent rounded-2xl group-hover:opacity-100"></div>

                        </>

                      ) : (

                        // Vista Lista - ACTUALIZADA

                        <>

                          {/* Imagen en vista lista */}

                          <div className="flex-shrink-0 mr-6">

                            <div className="relative w-20 h-20 overflow-hidden rounded-2xl bg-gradient-to-br from-nature-600 to-nature-500">

                              {product.image ? (

                                <img

                                  src={product.image}

                                  alt={product.name}

                                  className="object-cover w-full h-full transition-all duration-300 group-hover:scale-110"

                                  onError={(e) => {

                                    e.target.style.display = 'none';

                                    e.target.nextSibling.style.display = 'flex';

                                  }}

                                />

                              ) : null}

                              <div

                                className={`absolute inset-0 flex items-center justify-center text-2xl transition-all duration-300 group-hover:animate-bounce-soft ${product.image ? 'hidden' : 'flex'

                                  }`}

                              >

                                {getCategoryIcon(product.category)}

                              </div>

                            </div>

                          </div>



                          {/* Resto del contenido de vista lista igual... */}

                          <div className="flex-grow">

                            <div className="flex items-start justify-between">

                              <div>

                                <h3 className="mb-1 text-xl font-bold text-white transition-colors duration-300 group-hover:text-nature-400">

                                  {product.name}

                                </h3>

                                <p className="mb-2 text-sm font-medium text-nature-500">{product.category}</p>



                                {/* Características en lista */}

                                <div className="flex gap-4 mb-2 text-sm text-gray-400">

                                  <span>Color: <span className="text-white">{product.color}</span></span>

                                  <span>Tamaño: <span className="text-white">{product.size}</span></span>

                                  <span className={getDifficultyColor(product.difficulty)}>

                                    {product.difficulty}

                                  </span>

                                </div>

                              </div>



                              {/* Precio y botón */}

                              <div className="text-right">

                                <div className="mb-2 text-2xl font-bold text-nature-500">${product.price?.toLocaleString('es-CO') || '0'}</div>

                                {/* Stock in list view */}
                                {product.inStock !== undefined && (
                                  <div className="mb-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      product.inStock
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                      {product.inStock ? `Stock: ${product.stock}` : 'Agotado'}
                                    </span>
                                  </div>
                                )}

                                <button

                                  onClick={(e) => {

                                    e.preventDefault();

                                    if (product.inStock !== false) {
                                      dispatch(addToCart(product));
                                      trackAddToCart(product);
                                      trackSpeciesInterest(product.category, 'add_to_cart');
                                    }

                                  }}

                                  disabled={product.inStock === false}

                                  className={`relative px-6 py-2 font-semibold transition-all duration-300 border group rounded-xl ${
                                    product.inStock === false
                                      ? 'bg-gray-600/20 border-gray-500/30 text-gray-500 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-nature-600/20 to-nature-500/20 border-nature-500/30 text-nature-400 hover:text-white hover:from-nature-600 hover:to-nature-500'
                                  }`}

                                >

                                  <span className="relative z-10 flex items-center">

                                    {product.inStock === false ? 'Sin Stock' : 'Añadir'}

                                    {product.inStock !== false && (
                                      <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.55M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />

                                      </svg>
                                    )}

                                  </span>

                                </button>

                              </div>

                            </div>

                          </div>

                        </>

                      )}

                    </Link>

                  ))}

                </div>

              )}



              {/* Paginación (opcional para futuro) */}

              {filteredProducts.length > 0 && (

                <div className="flex justify-center mt-12">

                  <div className="px-6 py-3 experimental-nav-item">

                    <span className="text-gray-300">

                      Mostrando {filteredProducts.length} de {products.length} especies

                    </span>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </>

  );

};



export default Products;