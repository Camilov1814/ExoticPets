const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://camilov:serulo123@techglobal.jmv2huy.mongodb.net/?retryWrites=true&w=majority&appName=TechGlobal";

async function createProducts() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('ecommerce');
    
    // Eliminar colección si existe (para testing)
    try {
      await db.collection('products').drop();
      console.log('🗑️  Colección products eliminada');
    } catch (e) {
      console.log('ℹ️  Colección products no existía');
    }
    
    // Crear colección
    await db.createCollection('products');
    
    // Crear índices
    await db.collection('products').createIndex({ contentfulId: 1 }, { unique: true });
    await db.collection('products').createIndex({ sku: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ inStock: 1 });
    await db.collection('products').createIndex({ featured: 1 });
    await db.collection('products').createIndex({ active: 1 });
    await db.collection('products').createIndex({ tags: 1 });
    console.log('✅ Índices creados');
    
    // Productos de prueba basados en tus animales exóticos
    const products = [
      {
        contentfulId: "gecko-leopardo-premium",
        name: "Gecko Leopardo Premium",
        sku: "GLP-001",
        
        // Pricing
        price: 450000,
        originalPrice: 500000,
        stock: 5,
        inStock: true,
        
        // Classification
        category: "Reptiles",
        color: "Amarillo",
        size: "Pequeño",
        difficulty: "Principiante",
        
        // E-commerce
        featured: true,
        active: true,
        
        // Metrics
        rating: 4.8,
        reviewCount: 12,
        totalSales: 15,
        viewCount: 450,
        
        // Inventory
        supplier: "Exotic Reptiles Colombia",
        costPrice: 300000,
        reorderLevel: 2,
        
        // SEO
        tags: ["gecko", "reptil", "principiante", "leopardo"],
        searchKeywords: ["gecko leopardo", "eublepharis macularius", "reptil principiante"],
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStockUpdate: new Date()
      },
      {
        contentfulId: "pogona-vitticeps-juvenil",
        name: "Dragón Barbudo Juvenil",
        sku: "DBJ-002",
        
        price: 650000,
        originalPrice: null,
        stock: 3,
        inStock: true,
        
        category: "Reptiles",
        color: "Naranja",
        size: "Mediano",
        difficulty: "Intermedio",
        
        featured: true,
        active: true,
        
        rating: 5.0,
        reviewCount: 8,
        totalSales: 10,
        viewCount: 520,
        
        supplier: "Desert Reptiles Imports",
        costPrice: 450000,
        reorderLevel: 1,
        
        tags: ["dragón barbudo", "pogona", "reptil", "intermedio"],
        searchKeywords: ["pogona vitticeps", "dragon barbudo", "pogona"],
        
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStockUpdate: new Date()
      },
      {
        contentfulId: "tarantula-rosada-chile",
        name: "Tarántula Rosada de Chile",
        sku: "TRC-003",
        
        price: 180000,
        originalPrice: 200000,
        stock: 10,
        inStock: true,
        
        category: "Aracnidos",
        color: "Rosa",
        size: "Mediano",
        difficulty: "Intermedio",
        
        featured: false,
        active: true,
        
        rating: 4.6,
        reviewCount: 25,
        totalSales: 30,
        viewCount: 890,
        
        supplier: "Arachnid Imports",
        costPrice: 120000,
        reorderLevel: 3,
        
        tags: ["tarantula", "aracnido", "chile", "grammostola"],
        searchKeywords: ["tarantula rosada", "grammostola rosea", "araña"],
        
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStockUpdate: new Date()
      },
      {
        contentfulId: "serpiente-maiz-amelanistic",
        name: "Serpiente del Maíz Amelanística",
        sku: "SMA-004",
        
        price: 380000,
        originalPrice: null,
        stock: 4,
        inStock: true,
        
        category: "Reptiles",
        color: "Naranja",
        size: "Mediano",
        difficulty: "Principiante",
        
        featured: true,
        active: true,
        
        rating: 4.9,
        reviewCount: 18,
        totalSales: 22,
        viewCount: 670,
        
        supplier: "Snake Breeders Colombia",
        costPrice: 250000,
        reorderLevel: 2,
        
        tags: ["serpiente", "corn snake", "principiante", "maiz"],
        searchKeywords: ["serpiente maiz", "pantherophis guttatus", "corn snake"],
        
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStockUpdate: new Date()
      },
      {
        contentfulId: "terrario-vidrio-60cm",
        name: "Terrario de Vidrio 60x45x45cm",
        sku: "TVG-101",
        
        price: 280000,
        originalPrice: null,
        stock: 8,
        inStock: true,
        
        category: "Terrarios",
        color: "Translucido",
        size: "Mediano",
        difficulty: "Principiante",
        
        featured: false,
        active: true,
        
        rating: 4.7,
        reviewCount: 35,
        totalSales: 50,
        viewCount: 1200,
        
        supplier: "Reptile Habitat Supplies",
        costPrice: 180000,
        reorderLevel: 5,
        
        tags: ["terrario", "vidrio", "reptiles", "accesorios"],
        searchKeywords: ["terrario vidrio", "terrario reptiles", "habitat"],
        
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStockUpdate: new Date()
      },
      {
        contentfulId: "lampara-uvb-10",
        name: "Lámpara UVB 10.0 para Reptiles",
        sku: "LUV-102",
        
        price: 95000,
        originalPrice: 110000,
        stock: 15,
        inStock: true,
        
        category: "Accesorios",
        color: "Blanco",
        size: "Pequeño",
        difficulty: "Principiante",
        
        featured: false,
        active: true,
        
        rating: 4.5,
        reviewCount: 42,
        totalSales: 85,
        viewCount: 1500,
        
        supplier: "Reptile Lighting Co",
        costPrice: 60000,
        reorderLevel: 10,
        
        tags: ["lampara", "uvb", "iluminacion", "reptiles"],
        searchKeywords: ["lampara uvb", "luz reptiles", "uvb 10.0"],
        
        createdAt: new Date(),
        updatedAt: new Date(),
        lastStockUpdate: new Date()
      }
    ];
    
    await db.collection('products').insertMany(products);
    console.log(`✅ ${products.length} productos insertados`);
    
    // Estadísticas
    console.log('\n📊 Estadísticas de productos:');
    
    const stats = await db.collection('products').aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          avgPrice: { $avg: "$price" }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} productos | Stock: ${stat.totalStock} | Precio promedio: $${Math.round(stat.avgPrice).toLocaleString('es-CO')}`);
    });
    
    // Productos destacados
    const featured = await db.collection('products').find({ featured: true }).toArray();
    console.log(`\n⭐ Productos destacados: ${featured.length}`);
    featured.forEach(p => {
      console.log(`   - ${p.name} ($${p.price.toLocaleString('es-CO')})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createProducts();