// src/data/products.js
import Gecko1 from '../assets/petsImg/gecko1.jpg'
import Gecko2 from '../assets/petsImg/gecko2.webp'
import Gecko3 from '../assets/petsImg/gecko3.jpeg'
import Piton1 from '../assets/petsImg/piton1.webp'
import Piton2 from '../assets/petsImg/piton2.webp'
import Piton3 from '../assets/petsImg/piton3.jpg'
import Iguana1 from '../assets/petsImg/iguana1.jpg'
import Iguana2 from '../assets/petsImg/iguana2.jpg'
import Iguana3 from '../assets/petsImg/iguana3.jpg'
import Camaleon1 from '../assets/petsImg/camaleon1.jpg'
import Camaleon2 from '../assets/petsImg/camaleon2.jpg'
import Camaleon3 from '../assets/petsImg/camaleon3.jpg'
import Camaleon4 from '../assets/petsImg/camaleon4.jpg'
import RanaAzul1 from '../assets/petsImg/ranaAzul.jpg'
import RanaAzul2 from '../assets/petsImg/ranaAzul2.jpg'
import RanaAzul3 from '../assets/petsImg/ranaAzul3.jpg'
import Axolotl1 from '../assets/petsImg/Axolotl.jpg'
import Axolotl2 from '../assets/petsImg/axolotl2.webp'
import Axolotl3 from '../assets/petsImg/axolotl3.webp'
import CacatuaBlanca1 from '../assets/petsImg/cacatuaBlanca1.jpg'
import CacatuaBlanca2 from '../assets/petsImg/cacatuaBlanca2.jpg'
import CacatuaBlanca3 from '../assets/petsImg/cacatuaBlanca3.jpg'
import CanarioCantor1 from '../assets/petsImg/canarioCantor1.jpeg'
import CanarioCantor2 from '../assets/petsImg/canarioCantor2.jpeg'
import CanarioCantor3 from '../assets/petsImg/canarioCantor3.jpg'
import Cecilia1 from '../assets/petsImg/cecilia1.webp'
import Cecilia2 from '../assets/petsImg/cecilia2.jpg'
import Cecilia3 from '../assets/petsImg/cecilia3.webp'
import Comedero from '../assets/petsImg/comederoAutom.jpg'
import EscorpionAm1 from '../assets/petsImg/escorpionAmarillo1.jpg'
import EscorpionAm2 from '../assets/petsImg/escorpionAmarillo2.jpg'
import EscorpionAm3 from '../assets/petsImg/escorpionAmarillo3.jpg'
import EscorpionEmp1 from '../assets/petsImg/escorpionEmp1.jpg'
import EscorpionEmp2 from '../assets/petsImg/escorpionEmp32.jpg'
import EscorpionEmp3 from '../assets/petsImg/escorpionEmp3.jpg'
import GuacamayoAzul1 from '../assets/petsImg/guacamayoAzul1.jpg'
import GuacamayoAzul2 from '../assets/petsImg/guacamayoAzul2.jpg'
import GuacamayoAzul3 from '../assets/petsImg/guacamayoAzul3.jpg'
import KitIluminacion from '../assets/petsImg/kitIlum.webp'
import LoroAmazonico1 from '../assets/petsImg/loroAmazonico1.jpg'
import LoroAmazonico2 from '../assets/petsImg/loroAmazonico2.jpg'
import LoroAmazonico3 from '../assets/petsImg/loroAmazonico3.jpg'
import PeriquitoAus1 from '../assets/petsImg/periquitoAus1.webp'
import PeriquitoAus2 from '../assets/petsImg/periquitoAus2.webp'
import PeriquitoAus3 from '../assets/petsImg/periquitoAus3.webp'
import RanaVerde1 from '../assets/petsImg/ranaVerde.jpeg'
import RanaVerde2 from '../assets/petsImg/ranaVerde2.jpg'
import RanaVerde3 from '../assets/petsImg/ranaVerde3.jpg'
import RefugioNatural from '../assets/petsImg/refugioNatural.jpg'
import salamandraFuego1 from '../assets/petsImg/salamandraFuego.jpg'
import salamandraFuego2 from '../assets/petsImg/salamandraFuego2.jpeg'
import salamandraFuego3 from '../assets/petsImg/salamandraFuego3.jpeg'
import SistNebulizacion from '../assets/petsImg/sistNebulizacion.jpg'
import TarantulaGoliat1 from '../assets/petsImg/tarantulaGoliat1.jpg'
import TarantulaGoliat2 from '../assets/petsImg/tarantulaGoliat2.jpg'
import TarantulaGoliat3 from '../assets/petsImg/tarantulaGoliat3.jpg'
import TarantulaRosa1 from '../assets/petsImg/tarantulaRosa1.webp'
import TarantulaRosa2 from '../assets/petsImg/tarantulaRosa2.jpg'
import TarantulaRosa3 from '../assets/petsImg/tarantulaRosa3.jpg'
import Termometro from '../assets/petsImg/termometroDigital.webp'
import Terrario60 from '../assets/petsImg/terrario60.png'
import Terrario100 from '../assets/petsImg/terrario100.jpg'
import Terrario150 from '../assets/petsImg/terrario150.jpg'
import Terrario80 from '../assets/petsImg/terrariovert80.png'
import Terrario30 from '../assets/petsImg/terratio30.png'
import TortugaRoja1 from '../assets/petsImg/tortugaRoja1.jpg'
import TortugaRoja2 from '../assets/petsImg/tortugaRoja2.jpg'
import TortugaRoja3 from '../assets/petsImg/tortugaRoja3.jpg'
import ViudaNegra1 from '../assets/petsImg/viudaNegra1.jpg'
import ViudaNegra2 from '../assets/petsImg/viudaNegra2.webp'
import ViudaNegra3 from '../assets/petsImg/viudaNegra3.webp'

export const products = [
  // 🦎 Reptiles
  {
    id: 1,
    name: 'Gecko Leopardo Premium',
    price: 250,
    originalPrice: 300,
    image: '🦎',
    badge: 'Popular',
    badgeColor: 'bg-nature-500',
    rating: 4.9,
    reviews: 128,
    description: 'Gecko saludable con certificado sanitario',
    features: ['Certificado veterinario', 'Terrario incluido', 'Guía de cuidados'],
    gradient: 'from-nature-600 to-emerald-700',
    category: 'Reptiles',
    color: 'Amarillo',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: Gecko1,
    image2: Gecko2,
    image3: Gecko3

  },
  {
    id: 2,
    name: 'Pitón Real',
    price: 400,
    originalPrice: 450,
    image: '🐍',
    badge: 'Oferta',
    badgeColor: 'bg-red-500',
    rating: 4.7,
    reviews: 67,
    description: 'Espécimen único con patrón excepcional',
    features: ['Morfo exclusivo', 'Documentación completa', 'Soporte veterinario'],
    gradient: 'from-purple-600 to-indigo-700',
    category: 'Reptiles',
    color: 'Marrón',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: Piton1,
    image2: Piton2,
    image3: Piton3
  },
  {
    id: 3,
    name: 'Iguana Verde Juvenil',
    price: 180,
    originalPrice: null,
    image: '🦖',
    badge: 'Recomendado',
    badgeColor: 'bg-green-500',
    rating: 4.6,
    reviews: 92,
    description: 'Iguana joven adaptada al cautiverio',
    features: ['Alimentación variada', 'Documento sanitario', 'Soporte en línea'],
    gradient: 'from-green-600 to-lime-700',
    category: 'Reptiles',
    color: 'Verde',
    difficulty: 'Principiante',
    size: 'Mediano',
    image1: Iguana1,
    image2: Iguana2,
    image3: Iguana3
  },
  {
    id: 4,
    name: 'Camaleón Pantera',
    price: 500,
    originalPrice: 550,
    image: '🦎',
    badge: 'Exclusivo',
    badgeColor: 'bg-purple-500',
    rating: 4.8,
    reviews: 74,
    description: 'Camaleón con colores vivos y patrón único',
    features: ['Colores intensos', 'Cuidados especializados', 'Incluye guía avanzada'],
    gradient: 'from-pink-600 to-purple-700',
    category: 'Reptiles',
    color: 'Multicolor',
    difficulty: 'Avanzado',
    size: 'Grande',
    image1: Camaleon1,
    image2: Camaleon2,
    image3: Camaleon3,
    image4: Camaleon4,
  },
  {
    id: 5,
    name: 'Tortuga de Orejas Rojas',
    price: 90,
    originalPrice: 120,
    image: '🐢',
    badge: 'Oferta',
    badgeColor: 'bg-red-500',
    rating: 4.5,
    reviews: 210,
    description: 'Tortuga acuática saludable lista para su hábitat',
    features: ['Terrario acuático compatible', 'Certificado sanitario', 'Dieta incluida'],
    gradient: 'from-teal-600 to-green-600',
    category: 'Reptiles',
    color: 'Rojo',
    difficulty: 'Principiante',
    size: 'Mediano',
    image1: TortugaRoja1,
    image2: TortugaRoja2,
    image3: TortugaRoja3
  },

  // 🐸 Anfibios
  {
    id: 6,
    name: 'Rana Dardo Azul',
    price: 220,
    originalPrice: 250,
    image: '🐸',
    badge: 'Exótica',
    badgeColor: 'bg-blue-500',
    rating: 4.9,
    reviews: 112,
    description: 'Rana dardo venenosa criada en cautiverio',
    features: ['Colores brillantes', 'Terrario recomendado', 'Asesoría incluida'],
    gradient: 'from-blue-600 to-cyan-700',
    category: 'Anfibios',
    color: 'Azul',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: RanaAzul1,
    image2: RanaAzul2,
    image3: RanaAzul3
  },
  {
    id: 7,
    name: 'Salamandra de Fuego',
    price: 190,
    originalPrice: null,
    image: '🔥',
    badge: 'Popular',
    badgeColor: 'bg-orange-500',
    rating: 4.7,
    reviews: 88,
    description: 'Salamandra llamativa con patrón brillante',
    features: ['Guía de cuidados', 'Ambiente húmedo incluido', 'Certificación'],
    gradient: 'from-orange-600 to-yellow-600',
    category: 'Anfibios',
    color: 'Naranja',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: salamandraFuego1,
    image2: salamandraFuego2,
    image3: salamandraFuego3
  },
  {
    id: 8,
    name: 'Rana Arborícola Verde',
    price: 130,
    originalPrice: null,
    image: '🐸',
    badge: null,
    badgeColor: '',
    rating: 4.5,
    reviews: 59,
    description: 'Rana ideal para principiantes, activa y colorida',
    features: ['Fácil de cuidar', 'Terrario pequeño', 'Alimentación clara'],
    gradient: 'from-green-500 to-emerald-600',
    category: 'Anfibios',
    color: 'Verde',
    difficulty: 'Principiante',
    size: 'Pequeño',
    image1: RanaVerde1,
    image2: RanaVerde2,
    image3: RanaVerde3
  },
  {
    id: 9,
    name: 'Axolote Mexicano',
    price: 210,
    originalPrice: 250,
    image: '🧬',
    badge: 'Raro',
    badgeColor: 'bg-pink-500',
    rating: 4.8,
    reviews: 135,
    description: 'Anfibio único con regeneración natural',
    features: ['Certificado', 'Tanque acuático compatible', 'Guía de dieta'],
    gradient: 'from-pink-600 to-rose-700',
    category: 'Anfibios',
    color: 'Blanco',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: Axolotl1,
    image2: Axolotl2,
    image3: Axolotl3
  },
  {
    id: 10,
    name: 'Cecilia Tropical',
    price: 160,
    originalPrice: null,
    image: '🪱',
    badge: 'Exótico',
    badgeColor: 'bg-indigo-500',
    rating: 4.4,
    reviews: 34,
    description: 'Anfibio sin patas, ideal para coleccionistas',
    features: ['Raro en cautiverio', 'Asesoría especializada', 'Certificado sanitario'],
    gradient: 'from-indigo-600 to-purple-700',
    category: 'Anfibios',
    color: 'Marrón',
    difficulty: 'Avanzado',
    size: 'Grande',
    image1: Cecilia1,
    image2: Cecilia2,
    image3: Cecilia3
  },

  // 🕷️ Arácnidos
  {
    id: 11,
    name: 'Tarántula Rosa Chilena',
    price: 950,
    originalPrice: 120000,
    image: '🕷️',
    badge: 'Popular',
    badgeColor: 'bg-pink-500',
    rating: 4.7,
    reviews: 140,
    description: 'Arácnido dócil ideal para principiantes',
    features: ['Fácil de mantener', 'Caja de transporte incluida', 'Certificado'],
    gradient: 'from-rose-500 to-red-600',
    category: 'Arácnidos',
    color: 'Rosa',
    difficulty: 'Principiante',
    size: 'Mediano',
    image1: TarantulaRosa1,
    image2: TarantulaRosa2,
    image3: TarantulaRosa3
  },
  {
    id: 12,
    name: 'Escorpión Emperador',
    price: 110,
    originalPrice: 140,
    image: '🦂',
    badge: 'Exótico',
    badgeColor: 'bg-purple-500',
    rating: 4.6,
    reviews: 78,
    description: 'Escorpión negro de gran tamaño y presencia',
    features: ['Terrario recomendado', 'Guía de seguridad', 'Certificación incluida'],
    gradient: 'from-purple-700 to-black',
    category: 'Arácnidos',
    color: 'Negro',
    difficulty: 'Intermedio',
    size: 'Grande',
    image1: EscorpionEmp1,
    image2: EscorpionEmp2,
    image3: EscorpionEmp3
  },
  {
    id: 13,
    name: 'Viuda Negra Controlada',
    price: 150,
    originalPrice: 180,
    image: '🕸️',
    badge: 'Raro',
    badgeColor: 'bg-red-600',
    rating: 4.2,
    reviews: 23,
    description: 'Especie venenosa solo para expertos',
    features: ['Solo venta certificada', 'Terrario especializado', 'Asesoría extrema'],
    gradient: 'from-red-700 to-black',
    category: 'Arácnidos',
    color: 'Negro',
    difficulty: 'Avanzado',
    size: 'Pequeño',
    image1: ViudaNegra1,
    image2: ViudaNegra2,
    image3: ViudaNegra3
  },
  {
    id: 14,
    name: 'Tarántula Goliat',
    price: 220,
    originalPrice: 250,
    image: '🕷️',
    badge: 'Gigante',
    badgeColor: 'bg-orange-600',
    rating: 4.8,
    reviews: 61,
    description: 'Una de las arañas más grandes del mundo',
    features: ['Requiere espacio amplio', 'Certificado sanitario', 'Envío especializado'],
    gradient: 'from-orange-700 to-brown-700',
    category: 'Arácnidos',
    color: 'Negro',
    difficulty: 'Avanzado',
    size: 'Mediano',
    image1: TarantulaGoliat1,
    image2: TarantulaGoliat2,
    image3: TarantulaGoliat3
  },
  {
    id: 15,
    name: 'Escorpión Amarillo',
    price: 130,
    originalPrice: 150,
    image: '🦂',
    badge: null,
    badgeColor: '',
    rating: 4.3,
    reviews: 44,
    description: 'Escorpión del desierto resistente',
    features: ['Alto impacto visual', 'Fácil alimentación', 'Manual incluido'],
    gradient: 'from-yellow-600 to-amber-700',
    category: 'Arácnidos',
    color: 'Amarillo',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: EscorpionAm1,
    image2: EscorpionAm2,
    image3: EscorpionAm3
  },

  // 🦜 Aves
  {
    id: 16,
    name: 'Loro Amazónico',
    price: 600,
    originalPrice: 650,
    image: '🦜',
    badge: 'Popular',
    badgeColor: 'bg-green-600',
    rating: 4.9,
    reviews: 245,
    description: 'Ave colorida con gran capacidad de imitación',
    features: ['Habla entrenada', 'Jaula incluida', 'Certificado sanitario'],
    gradient: 'from-green-600 to-lime-600',
    category: 'Aves',
    color: 'Verde',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: LoroAmazonico1,
    image2: LoroAmazonico2,
    image3: LoroAmazonico3
  },
  {
    id: 17,
    name: 'Cacatúa Blanca',
    price: 800,
    originalPrice: 900,
    image: '🕊️',
    badge: 'Exclusivo',
    badgeColor: 'bg-yellow-500',
    rating: 4.8,
    reviews: 132,
    description: 'Ave de gran tamaño, dócil y elegante',
    features: ['Jaula grande incluida', 'Guía de cuidados', 'Certificado sanitario'],
    gradient: 'from-yellow-500 to-amber-600',
    category: 'Aves',
    color: 'Blanco',
    difficulty: 'Intermedio',
    size: 'Mediano',
    image1: CacatuaBlanca1,
    image2: CacatuaBlanca2,
    image3: CacatuaBlanca3
  },
  {
    id: 18,
    name: 'Periquito Australiano',
    price: 80,
    originalPrice: 100,
    image: '🐦',
    badge: 'Económico',
    badgeColor: 'bg-blue-400',
    rating: 4.6,
    reviews: 321,
    description: 'Ave pequeña ideal para principiantes',
    features: ['Fácil de cuidar', 'Jaula pequeña', 'Dieta sencilla'],
    gradient: 'from-sky-500 to-blue-600',
    category: 'Aves',
    color: 'Verde',
    difficulty: 'Principiante',
    size: 'Pequeño',
    image1: PeriquitoAus1,
    image2: PeriquitoAus2,
    image3: PeriquitoAus3
  },
  {
    id: 19,
    name: 'Guacamayo Azul',
    price: 1200,
    originalPrice: 1400,
    image: '🦜',
    badge: 'Exótico',
    badgeColor: 'bg-indigo-600',
    rating: 4.9,
    reviews: 80,
    description: 'Ave majestuosa de gran tamaño y belleza',
    features: ['Entrenamiento vocal', 'Certificado sanitario', 'Entrega especializada'],
    gradient: 'from-indigo-600 to-purple-600',
    category: 'Aves',
    color: 'Azul',
    difficulty: 'Avanzado',
    size: 'Grande',
    image1: GuacamayoAzul1,
    image2: GuacamayoAzul2,
    image3: GuacamayoAzul3
  },
  {
    id: 20,
    name: 'Canario Cantor',
    price: 120,
    originalPrice: null,
    image: '🎶',
    badge: 'Melódico',
    badgeColor: 'bg-orange-500',
    rating: 4.7,
    reviews: 156,
    description: 'Ave pequeña con canto melodioso',
    features: ['Jaula incluida', 'Alimentación sencilla', 'Guía de entrenamiento'],
    gradient: 'from-orange-500 to-red-500',
    category: 'Aves',
    color: 'Amarillo',
    difficulty: 'Principiante',
    size: 'Pequeño',
    image1: CanarioCantor1,
    image2: CanarioCantor2,
    image3: CanarioCantor3
  },

  // 🔧 Accesorios
  {
    id: 21,
    name: 'Kit Iluminación Reptiles',
    price: 120,
    originalPrice: null,
    image: '💡',
    badge: null,
    badgeColor: '',
    rating: 4.6,
    reviews: 203,
    description: 'Sistema completo de iluminación UV/UVB',
    features: ['Temporizador incluido', 'Espectro completo', 'Instalación fácil'],
    gradient: 'from-orange-600 to-yellow-600',
    category: 'Accesorios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Mediano',
    image1: KitIluminacion  },
  {
    id: 22,
    name: 'Comedero Automático',
    price: 80,
    originalPrice: 100,
    image: '🥣',
    badge: 'Práctico',
    badgeColor: 'bg-blue-500',
    rating: 4.7,
    reviews: 178,
    description: 'Sistema automático de alimentación regulada',
    features: ['Programación digital', 'Resistente al agua', 'Garantía incluida'],
    gradient: 'from-blue-500 to-indigo-600',
    category: 'Accesorios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Mediano',
    image1: Comedero
  },
  {
    id: 23,
    name: 'Termómetro Digital',
    price: 45,
    originalPrice: null,
    image: '🌡️',
    badge: null,
    badgeColor: '',
    rating: 4.5,
    reviews: 311,
    description: 'Mide la temperatura exacta del hábitat',
    features: ['Pantalla LCD', 'Alta precisión', 'Fácil instalación'],
    gradient: 'from-gray-500 to-slate-600',
    category: 'Accesorios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Pequeño',
    imagen1: Termometro
  },
  {
    id: 24,
    name: 'Sistema de Nebulización',
    price: 150,
    originalPrice: 180,
    image: '💧',
    badge: 'Top Ventas',
    badgeColor: 'bg-cyan-500',
    rating: 4.8,
    reviews: 195,
    description: 'Control automático de humedad en terrarios',
    features: ['Automático', 'Compatible con varios tanques', 'Eficiencia energética'],
    gradient: 'from-cyan-500 to-teal-600',
    category: 'Accesorios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Mediano',
    image1: SistNebulizacion,
    
  },
  {
    id: 25,
    name: 'Refugio Natural',

    price: 60,
    originalPrice: null,
    image: '🏡',
    badge: 'Natural',
    badgeColor: 'bg-green-500',
    rating: 4.6,
    reviews: 89,
    description: 'Escondite decorativo para reptiles y anfibios',
    features: ['Aspecto natural', 'Fácil de limpiar', 'No tóxico'],
    gradient: 'from-green-500 to-emerald-600',
    category: 'Accesorios',
    color: 'Verde',
    difficulty: 'Principiante',
    size: 'Pequeño',
    imagen1 : RefugioNatural
  },

  // 🏠 Terrarios
  {
    id: 26,
    name: 'Terrario Ecosistema 60L',
    price: 180,
    originalPrice: null,
    image: '🏠',
    badge: 'Nuevo',
    badgeColor: 'bg-cyan-500',
    rating: 4.8,
    reviews: 89,
    description: 'Hábitat completo con iluminación LED',
    features: ['Sistema de ventilación', 'Iluminación UV', 'Decoración natural'],
    gradient: 'from-cyan-600 to-nature-600',
    category: 'Terrarios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Mediano',
    imagen1: Terrario60
  },
  {
    id: 27,
    name: 'Terrario Premium 100L',
    price: 300,
    originalPrice: 350,
    image: '🏡',
    badge: '  ',
    badgeColor: 'bg-yellow-500',
    rating: 4.9,
    reviews: 132,
    description: 'Espacio amplio para reptiles medianos y grandes',
    features: ['Cristal reforzado', 'Iluminación incluida', 'Decoración básica'],
    gradient: 'from-yellow-600 to-orange-600',
    category: 'Terrarios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Grande',
    imagen1: Terrario100
  },
  {
    id: 28,
    name: 'Terrario Compacto 30L',
    price: 120,
    originalPrice: null,
    image: '📦',
    badge: 'Económico',
    badgeColor: 'bg-green-500',
    rating: 4.5,
    reviews: 221,
    description: 'Terrario pequeño para principiantes',
    features: ['Fácil de mover', 'Ventilación lateral', 'Vidrio templado'],
    gradient: 'from-green-500 to-teal-600',
    category: 'Terrarios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Pequeño',
    imagen1: Terrario30
  },
  {
    id: 29,
    name: 'Terrario Vertical 80L',
    price: 250,
    originalPrice: null,
    image: '🪴',
    badge: 'Recomendado',
    badgeColor: 'bg-indigo-500',
    rating: 4.7,
    reviews: 145,
    description: 'Ideal para especies arborícolas',
    features: ['Diseño alto', 'Malla superior', 'Compatible con nebulización'],
    gradient: 'from-indigo-500 to-purple-600',
    category: 'Terrarios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Grande',
    imagen1: Terrario80
  },
  {
    id: 30,
    name: 'Terrario Deluxe 150L',
    price: 500,
    originalPrice: 600,
    image: '🏰',
    badge: 'Exclusivo',
    badgeColor: 'bg-red-500',
    rating: 4.9,
    reviews: 65,
    description: 'Terrario de lujo para coleccionistas',
    features: ['Decoración premium', 'Iluminación LED RGB', 'Sistema de humedad avanzado'],
    gradient: 'from-red-600 to-pink-600',
    category: 'Terrarios',
    color: 'Translúcido',
    difficulty: 'Principiante',
    size: 'Grande',
    imagen1: Terrario150
  }
]

