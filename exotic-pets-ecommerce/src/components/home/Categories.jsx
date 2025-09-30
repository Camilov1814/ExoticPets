import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '../../contentfulClient';

const Categories = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mapeo de gradientes por título
  const gradientMap = {
    'Reptiles': 'from-nature-600 to-nature-500',
    'Anfibios': 'from-cyan-600 to-nature-600',
    'Arácnidos': 'from-purple-600 to-dark-700',
    'Aves Exóticas': 'from-orange-600 to-nature-600',
    'Terrarios Premium': 'from-nature-600 to-dark-800',
    'Accesorios Especializados': 'from-accent-green to-nature-500'
  };

  // Mapeo de títulos a slugs para URLs
  const slugMap = {
    'Reptiles': 'reptiles',
    'Anfibios': 'anfibios',
    'Arácnidos': 'aracnidos',
    'Aves Exóticas': 'aves',
    'Terrarios Premium': 'terrarios',
    'Accesorios Especializados': 'accesorios'
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await client.getEntries({
        content_type: 'categoryCard',
        order: 'fields.order'
      });

      const formattedCategories = response.items.map(item => ({
        title: item.fields.title,
        description: item.fields.description,
        icon: item.fields.icon,
        count: `${item.fields.count}+ especies`, // Formatear el número
        gradient: gradientMap[item.fields.title] || 'from-gray-600 to-gray-500',
        particles: item.fields.particles || [],
        stats: `${item.fields.stat}% popularidad`, // Formatear el stat
        category: slugMap[item.fields.title] || item.fields.title.toLowerCase(),
        slug: slugMap[item.fields.title] || item.fields.title.toLowerCase()
      }));

      setCategories(formattedCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/productos?categoria=${encodeURIComponent(category)}`);
    setHoveredCategory(null);
  };

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
        <div className="flex items-center justify-center h-64">
          <div className="text-nature-500">Cargando categorías...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">

      {/* Partículas de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-nature-500 animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Decoraciones de hojas */}
      <div className="text-4xl leaf-decoration top-10 left-10 animate-leaf-sway opacity-20">🌿</div>
      <div className="text-3xl leaf-decoration top-20 right-20 animate-float opacity-10" style={{ animationDelay: '1s' }}>🍃</div>

      <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

        {/* Header de la sección */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-5xl font-bold text-white font-display">
            Nuestras
            <span className="block text-transparent bg-gradient-to-r from-nature-500 to-accent-green bg-clip-text">
              Especialidades
            </span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-300">
            Cada categoría cuidadosamente seleccionada para ofrecerte las especies más fascinantes del mundo
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <div
              key={index}
              className="relative p-8 transition-all duration-500 transform cursor-pointer experimental-nav-item group hover:scale-105"
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => handleCategoryClick(category.category)}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >

              {/* Partículas temáticas */}
              {category.particles.map((particle, i) => (
                <div
                  key={i}
                  className={`absolute text-lg opacity-0 group-hover:opacity-60 transition-all duration-500 pointer-events-none ${hoveredCategory === index ? 'animate-float' : ''
                    }`}
                  style={{
                    left: `${20 + i * 25}%`,
                    top: `${10 + i * 15}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  {particle}
                </div>
              ))}

              {/* Icono principal */}
              <div className="mb-6 text-center">
                <div className="mb-4 text-6xl transition-all duration-500 group-hover:animate-bounce-soft group-hover:scale-110 filter drop-shadow-lg">
                  {category.icon}
                </div>

                {/* Badge de contador */}
                <div className="inline-block px-4 py-2 border rounded-full bg-gradient-to-r from-nature-600/20 to-nature-500/20 backdrop-blur-sm border-nature-500/30">
                  <span className="text-sm font-semibold text-nature-400">{category.count}</span>
                </div>
              </div>

              {/* Información */}
              <div className="text-center">
                <h3 className="mb-3 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-nature-400">
                  {category.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-400">
                  {category.description}
                </p>

                {/* Stats */}
                <div className="px-3 py-2 mb-6 rounded-lg bg-dark-700/50 backdrop-blur-sm">
                  <span className="text-xs font-medium text-nature-500">{category.stats}</span>
                </div>

                {/* Botón de acción */}
                <button className="w-full px-6 py-3 font-semibold transition-all duration-300 border bg-gradient-to-r from-nature-600/20 to-nature-500/20 border-nature-500/30 text-nature-400 hover:text-white hover:from-nature-600 hover:to-nature-500 rounded-xl group-hover:shadow-lg group-hover:shadow-nature-500/25"
                  onClick={() => handleCategoryClick(category.category)}>
                  Explorar
                </button>
              </div>

              {/* Efecto de brillo */}
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none bg-gradient-to-br from-nature-500/5 to-transparent rounded-2xl group-hover:opacity-100"></div>

              {/* Indicator de actividad */}
              {hoveredCategory === index && (
                <div className="absolute transform -translate-x-1/2 bottom-4 left-1/2">
                  <div className="w-2 h-2 rounded-full bg-nature-500 animate-ping"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <button onClick={() => navigate('/productos')}
            className="relative px-8 py-4 font-semibold text-white transition-all duration-300 transform group bg-gradient-to-r from-nature-600 to-nature-500 rounded-2xl hover:from-nature-500 hover:to-accent-green hover:scale-105 hover:shadow-2xl glow-green">
            <span className="relative z-10 flex items-center">
              Ver Catálogo Completo
              <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Categories;