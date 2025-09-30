const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const PDFGenerator = require('./services/pdfGenerator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Simple middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// MongoDB connection (usar tu conexión existente)
let db;
MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exotic-pets')
  .then(client => {
    console.log('📦 Connected to MongoDB');
    db = client.db();
  })
  .catch(error => console.error('MongoDB connection error:', error));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PDF Generator',
    timestamp: new Date().toISOString()
  });
});

/**
 * ENDPOINT PRINCIPAL: Generar PDF de orden existente
 * Usa las órdenes que ya tienes en tu MongoDB
 */
app.get('/api/orders/:orderId/pdf', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { type = 'invoice' } = req.query;

    console.log(`🔍 Buscando orden: ${orderId}`);

    // Buscar orden en TU base de datos existente
    const order = await db.collection('orders').findOne({
      $or: [
        { _id: orderId },
        { orderId: orderId },
        { orderNumber: orderId }
      ]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Orden no encontrada',
        searched: orderId
      });
    }

    console.log(`✅ Orden encontrada: ${order.orderId || order._id}`);

    // Buscar productos de la orden
    const productIds = order.items?.map(item => item.productId) || [];
    const products = await db.collection('products').find({
      _id: { $in: productIds }
    }).toArray();

    // Enriquecer orden con datos de productos
    const enrichedOrder = {
      ...order,
      items: order.items?.map(item => {
        const product = products.find(p => p._id.toString() === item.productId);
        return {
          ...item,
          productName: product?.name || 'Producto no encontrado',
          productDescription: product?.description,
          productCategory: product?.category
        };
      }) || []
    };

    // Generar PDF
    console.log(`📄 Generando PDF tipo: ${type}`);
    let pdfBuffer;
    let filename;

    switch (type) {
      case 'invoice':
        pdfBuffer = await PDFGenerator.generateInvoice(enrichedOrder);
        filename = `factura-${order.orderId || order._id}.pdf`;
        break;
      case 'receipt':
        pdfBuffer = await PDFGenerator.generateReceipt(enrichedOrder);
        filename = `recibo-${order.orderId || order._id}.pdf`;
        break;
      default:
        return res.status(400).json({ error: 'Tipo de PDF no válido' });
    }

    // Enviar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

    console.log(`✅ PDF enviado: ${filename}`);

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * ENDPOINT AUXILIAR: Listar órdenes disponibles
 * Para debug y verificar qué órdenes existen
 */
app.get('/api/orders', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const orders = await db.collection('orders')
      .find({})
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      message: `${orders.length} órdenes encontradas`,
      orders: orders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        total: order.total,
        createdAt: order.createdAt,
        itemsCount: order.items?.length || 0
      }))
    });

  } catch (error) {
    console.error('Error listando órdenes:', error);
    res.status(500).json({ error: 'Error al listar órdenes' });
  }
});

/**
 * ENDPOINT: Info del servicio
 */
app.get('/', (req, res) => {
  res.json({
    service: 'Exotic Pets PDF Generator',
    version: '1.0.0',
    description: 'Microservicio simple para generar PDFs de órdenes',
    endpoints: {
      health: '/health',
      generatePDF: '/api/orders/:orderId/pdf?type=invoice|receipt',
      listOrders: '/api/orders'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PDF Service running on port ${PORT}`);
  console.log(`📚 Endpoints available:`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - Generate PDF: http://localhost:${PORT}/api/orders/ORDER_ID/pdf`);
  console.log(`   - List Orders: http://localhost:${PORT}/api/orders`);
});

module.exports = app;