import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = "mongodb+srv://camilov:serulo123@techglobal.jmv2huy.mongodb.net/?retryWrites=true&w=majority&appName=TechGlobal";
let db;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('ecommerce');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes

// Get all products with optional filters
app.get('/api/products', async (req, res) => {
  try {
    const {
      category,
      featured,
      inStock,
      active = 'true',
      search,
      minPrice,
      maxPrice,
      difficulty,
      size,
      color,
      limit = 50,
      skip = 0
    } = req.query;

    // Build filter object
    const filter = { active: active === 'true' };

    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (difficulty) filter.difficulty = difficulty;
    if (size) filter.size = size;
    if (color) filter.color = color;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { searchKeywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const products = await db.collection('products')
      .find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 })
      .toArray();

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by contentfulId
app.get('/api/products/:contentfulId', async (req, res) => {
  try {
    const { contentfulId } = req.params;

    const product = await db.collection('products').findOne({
      contentfulId,
      active: true
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    await db.collection('products').updateOne(
      { contentfulId },
      {
        $inc: { viewCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update stock
app.put('/api/products/:contentfulId/stock', async (req, res) => {
  try {
    const { contentfulId } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    const result = await db.collection('products').updateOne(
      { contentfulId },
      {
        $set: {
          stock,
          inStock: stock > 0,
          lastStockUpdate: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      contentfulId,
      newStock: stock,
      inStock: stock > 0
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// Get product categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.collection('products')
      .distinct('category', { active: true });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get product statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.collection('products').aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' },
          totalSales: { $sum: '$totalSales' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    const totals = await db.collection('products').aggregate([
      { $match: { active: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } },
          totalSales: { $sum: '$totalSales' }
        }
      }
    ]).toArray();

    res.json({
      byCategory: stats,
      totals: totals[0] || {}
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🛍️  Products endpoint: http://localhost:${PORT}/api/products`);
  });
}

startServer().catch(console.error);