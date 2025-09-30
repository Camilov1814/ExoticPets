const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const PDFGenerator = require('../services/pdfGenerator');
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - userId
 *         - items
 *         - totalAmount
 *       properties:
 *         id:
 *           type: string
 *           description: Order ID
 *         userId:
 *           type: string
 *           description: User ID who placed the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *               name:
 *                 type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *         totalAmount:
 *           type: number
 *         shippingAddress:
 *           type: object
 *         paymentMethod:
 *           type: string
 *         trackingNumber:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 */
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    // Validate and enrich order items
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          error: `Product ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      enrichedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal,
        sku: product.sku,
        category: product.category
      });
    }

    // Calculate taxes and shipping
    const taxes = totalAmount * 0.19; // 19% IVA Colombia
    const shipping = calculateShipping(totalAmount, shippingAddress);
    const finalTotal = totalAmount + taxes + shipping;

    // Create order
    const order = new Order({
      userId,
      items: enrichedItems,
      subtotal: totalAmount,
      taxes,
      shipping,
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod,
      notes,
      status: 'pending',
      orderNumber: generateOrderNumber(),
      estimatedDelivery: calculateDeliveryDate(shippingAddress)
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity, totalSales: item.quantity } }
      );
    }

    // Generate PDF invoice asynchronously
    setTimeout(async () => {
      try {
        await generateOrderPDF(order._id);
      } catch (error) {
        logger.error('Error generating PDF:', error);
      }
    }, 1000);

    logger.info(`Order created: ${order.orderNumber} for user ${userId}`);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        estimatedDelivery: order.estimatedDelivery
      }
    });

  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}/pdf:
 *   get:
 *     summary: Generate and download order PDF invoice
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [invoice, receipt, shipping-label]
 *           default: invoice
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Order not found
 */
router.get('/:orderId/pdf', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { type = 'invoice' } = req.query;
    const userId = req.user.id;

    // Get order with populated data
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name description images');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user owns this order or is admin
    if (order.userId._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate PDF based on type
    let pdfBuffer;
    let filename;

    switch (type) {
      case 'invoice':
        pdfBuffer = await PDFGenerator.generateInvoice(order);
        filename = `invoice-${order.orderNumber}.pdf`;
        break;
      case 'receipt':
        pdfBuffer = await PDFGenerator.generateReceipt(order);
        filename = `receipt-${order.orderNumber}.pdf`;
        break;
      case 'shipping-label':
        pdfBuffer = await PDFGenerator.generateShippingLabel(order);
        filename = `shipping-${order.orderNumber}.pdf`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid PDF type' });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info(`PDF generated: ${type} for order ${order.orderNumber}`);

  } catch (error) {
    logger.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const filter = { userId };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.productId', 'name price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get specific order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name description price images category');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify ownership
    if (order.userId._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);

  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *               trackingNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    // Admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const updateData = { status, updatedAt: new Date() };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Send notification email
    if (status === 'shipped' && trackingNumber) {
      await EmailService.sendShippingNotification(order);
    }

    logger.info(`Order ${order.orderNumber} status updated to ${status}`);
    res.json({ message: 'Order status updated', order });

  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Helper functions
function generateOrderNumber() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `EP-${timestamp}-${random}`.toUpperCase();
}

function calculateShipping(amount, address) {
  // Free shipping over $200,000 COP
  if (amount >= 200000) return 0;

  // Different rates by city
  const cityRates = {
    'bogota': 15000,
    'medellin': 18000,
    'cali': 20000,
    'barranquilla': 25000
  };

  const city = address.city?.toLowerCase();
  return cityRates[city] || 30000; // Default rate
}

function calculateDeliveryDate(address) {
  const days = address.city?.toLowerCase() === 'bogota' ? 2 : 5;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return deliveryDate;
}

async function generateOrderPDF(orderId) {
  try {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name description images');

    if (!order) return;

    // Generate invoice PDF
    const pdfBuffer = await PDFGenerator.generateInvoice(order);

    // Save to file system or cloud storage
    const filename = `invoices/${order.orderNumber}-invoice.pdf`;
    // await saveToCloudStorage(filename, pdfBuffer);

    // Update order with PDF path
    order.invoicePDF = filename;
    await order.save();

    // Send email with PDF attachment
    await EmailService.sendOrderConfirmation(order, pdfBuffer);

    logger.info(`PDF generated and saved for order ${order.orderNumber}`);
  } catch (error) {
    logger.error('Error in generateOrderPDF:', error);
  }
}

module.exports = router;