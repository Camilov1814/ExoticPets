import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {client} from "../../contentfulClient";

const Hero = () => {
  const [heroData, setHeroData] = useState(null);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar partículas
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 3,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      top: Math.random() * 100,
    }));
    setParticles(newParticles);

    // Cargar datos desde Contentful
    client
      .getEntries({ content_type: "heroSection", limit: 1 })
      .then((res) => {
        if (res.items.length > 0) {
          const f = res.items[0].fields;
          setHeroData({
            title: f.title,
            subtitle: f.subtitle,
            buttonPrimaryText: f.buttonPrimaryText,
            buttonSecondaryText: f.buttonSecondaryText,
            categories: Array.isArray(f.categories) ? f.categories : [],
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleNavigate = (categoria = "") => {
    navigate(
      `/productos${categoria ? `?categoria=${encodeURIComponent(categoria)}` : ""}`
    );
  };

  if (!heroData) {
    return <div className="text-center text-white">Cargando...</div>;
  }

  return (
    <section className="relative flex items-center min-h-screen overflow-hidden bg-gradient-nature">
      {/* Partículas animadas */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute nature-particle animate-float"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.animationDelay}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            top: `${particle.top}%`,
          }}
        />
      ))}

      {/* Contenido */}
      <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Texto */}
          <div className="text-center lg:text-left">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl font-display">
              {heroData.title.split(" ").slice(0, 2).join(" ")}
              <span className="block text-transparent bg-gradient-to-r from-nature-500 to-accent-green bg-clip-text text-glow">
                {heroData.title.split(" ").slice(2).join(" ")}
              </span>
            </h1>

            <p className="max-w-2xl mb-8 text-xl text-gray-300">
              {heroData.subtitle}
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              {/* Botón primario */}
              <button
                onClick={() => handleNavigate()}
                className="relative px-8 py-4 font-semibold text-white transition-all duration-300 transform group bg-gradient-to-r from-nature-600 to-nature-500 rounded-2xl hover:from-nature-500 hover:to-accent-green hover:scale-105 hover:shadow-2xl glow-green"
              >
                {heroData.buttonPrimaryText}
              </button>

              {/* Botón secundario */}
              <button className="px-8 py-4 font-semibold transition-all duration-300 transform border-2 group border-nature-500 text-nature-500 rounded-2xl hover:bg-nature-500 hover:text-dark-900 hover:scale-105">
                {heroData.buttonSecondaryText} 📚
              </button>
            </div>
          </div>

          {/* Categorías dinámicas */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {heroData.categories.map((cat, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(cat.name)}
                  className="relative p-6 transition-all duration-500 transform border cursor-pointer group bg-dark-800/50 backdrop-blur-sm border-nature-600/30 rounded-2xl hover:border-nature-500/50 animate-fade-in hover:scale-110"
                  style={{ animationDelay: `${index * 0.3}s` }}
                >
                  <div className="text-center">
                    <div className="mb-4 text-6xl transition-all duration-300 group-hover:animate-bounce-soft">
                      {cat.emoji}
                    </div>
                    <h3 className="text-lg font-semibold transition-colors duration-300 text-nature-500 group-hover:text-accent-green">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;