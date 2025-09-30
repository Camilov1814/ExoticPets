const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    sku: String,
    category: String
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxes: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  shipping: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'pse', 'efecty', 'cash_on_delivery']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Colombia'
    },
    additionalInfo: String
  },
  trackingNumber: {
    type: String,
    sparse: true,
    index: true
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  notes: String,

  // PDF and document references
  invoicePDF: String,
  shippingLabelPDF: String,

  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'items.productId': 1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for status color (for UI)
orderSchema.virtual('statusColor').get(function() {
  const colors = {
    'pending': 'orange',
    'confirmed': 'blue',
    'processing': 'purple',
    'shipped': 'green',
    'delivered': 'darkgreen',
    'cancelled': 'red'
  };
  return colors[this.status] || 'gray';
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Calculate totals if items have changed
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.totalAmount = this.subtotal + this.taxes + this.shipping;
  }

  next();
});

// Static methods
orderSchema.statics.findByOrderNumber = function(orderNumber) {
  return this.findOne({ orderNumber }).populate('userId items.productId');
};

orderSchema.statics.getOrderStats = function(userId = null) {
  const match = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

orderSchema.statics.getRevenueByPeriod = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

// Instance methods
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

orderSchema.methods.canBeShipped = function() {
  return ['confirmed', 'processing'].includes(this.status);
};

orderSchema.methods.markAsShipped = function(trackingNumber) {
  this.status = 'shipped';
  this.trackingNumber = trackingNumber;
  this.updatedAt = new Date();
  return this.save();
};

orderSchema.methods.calculateDeliveryDate = function() {
  const city = this.shippingAddress.city?.toLowerCase();
  const baseDays = city === 'bogota' ? 2 : 5;

  const deliveryDate = new Date(this.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + baseDays);

  return deliveryDate;
};

// Middleware to update product sales stats
orderSchema.post('save', async function(doc) {
  if (doc.isNew && doc.status === 'confirmed') {
    // Update product sales statistics
    const Product = mongoose.model('Product');

    for (const item of doc.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        {
          $inc: {
            totalSales: item.quantity,
            revenue: item.subtotal
          }
        }
      );
    }
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;