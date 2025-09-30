const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class PDFGenerator {

  /**
   * Generate invoice PDF for an order
   * @param {Object} order - Order object with populated fields
   * @returns {Buffer} PDF buffer
   */
  static async generateInvoice(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Factura ${order.orderNumber}`,
            Author: 'Exotic Pets Colombia',
            Subject: 'Factura de compra',
            Creator: 'Exotic Pets API'
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Header with company info
        this.addCompanyHeader(doc);

        // Invoice details
        this.addInvoiceHeader(doc, order);

        // Customer information
        this.addCustomerInfo(doc, order);

        // Items table
        this.addItemsTable(doc, order);

        // Totals section
        this.addTotalsSection(doc, order);

        // Footer
        this.addInvoiceFooter(doc, order);

        // Payment and shipping info
        this.addPaymentInfo(doc, order);

        doc.end();

      } catch (error) {
        logger.error('Error generating invoice PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate receipt PDF (simpler version)
   * @param {Object} order - Order object
   * @returns {Buffer} PDF buffer
   */
  static async generateReceipt(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Simple receipt layout
        this.addCompanyHeader(doc);

        doc.fontSize(20).text('RECIBO DE COMPRA', 50, 150, { align: 'center' });
        doc.fontSize(12);

        // Order summary
        let yPosition = 200;
        doc.text(`Número de orden: ${order.orderNumber}`, 50, yPosition);
        doc.text(`Fecha: ${order.createdAt.toLocaleDateString('es-CO')}`, 50, yPosition + 20);
        doc.text(`Cliente: ${order.userId.name}`, 50, yPosition + 40);

        // Items summary
        yPosition += 80;
        doc.text('Productos:', 50, yPosition);
        yPosition += 20;

        order.items.forEach((item, index) => {
          doc.text(`${item.quantity}x ${item.name} - $${item.price.toLocaleString('es-CO')}`, 70, yPosition);
          yPosition += 15;
        });

        // Total
        yPosition += 20;
        doc.fontSize(14).text(`TOTAL: $${order.totalAmount.toLocaleString('es-CO')}`, 50, yPosition);

        this.addReceiptFooter(doc);

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate shipping label PDF
   * @param {Object} order - Order object
   * @returns {Buffer} PDF buffer
   */
  static async generateShippingLabel(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: [400, 600], margin: 20 });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Shipping label layout
        doc.fontSize(16).text('EXOTIC PETS COLOMBIA', 20, 20, { align: 'center' });
        doc.fontSize(12).text('Envío Express', 20, 45, { align: 'center' });

        // Order info
        doc.fontSize(10);
        doc.text(`Orden: ${order.orderNumber}`, 20, 80);
        doc.text(`Fecha: ${order.createdAt.toLocaleDateString('es-CO')}`, 20, 95);

        if (order.trackingNumber) {
          doc.text(`Tracking: ${order.trackingNumber}`, 20, 110);
        }

        // Destination address
        doc.fontSize(12).text('ENVIAR A:', 20, 140);
        doc.fontSize(10);
        const address = order.shippingAddress;
        doc.text(order.userId.name, 20, 160);
        doc.text(address.street, 20, 175);
        doc.text(`${address.city}, ${address.state}`, 20, 190);
        doc.text(address.zipCode, 20, 205);
        doc.text(address.country || 'Colombia', 20, 220);

        // Phone
        if (order.userId.phone) {
          doc.text(`Tel: ${order.userId.phone}`, 20, 240);
        }

        // Package info
        doc.fontSize(12).text('CONTENIDO:', 20, 280);
        doc.fontSize(9);
        let yPos = 300;
        order.items.forEach(item => {
          doc.text(`${item.quantity}x ${item.name}`, 20, yPos);
          yPos += 12;
        });

        // Instructions
        doc.fontSize(8).text('Manejar con cuidado - Animales vivos', 20, yPos + 20, { align: 'center' });

        // Barcode placeholder (you could use a barcode library)
        doc.rect(20, yPos + 50, 360, 40).stroke();
        doc.fontSize(8).text(order.orderNumber, 20, yPos + 65, { align: 'center' });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper methods for PDF sections
  static addCompanyHeader(doc) {
    // Company logo and info
    doc.fontSize(20).text('EXOTIC PETS COLOMBIA', 50, 50);
    doc.fontSize(10).text('Especialistas en Mascotas Exóticas', 50, 75);
    doc.text('NIT: 900.123.456-7', 50, 90);
    doc.text('Bogotá, Colombia', 50, 105);
    doc.text('info@exoticpets.com | (601) 123-4567', 50, 120);

    // Draw line
    doc.moveTo(50, 140).lineTo(550, 140).stroke();
  }

  static addInvoiceHeader(doc, order) {
    // Invoice title and number
    doc.fontSize(16).text('FACTURA DE VENTA', 400, 50, { align: 'right' });
    doc.fontSize(12);
    doc.text(`Factura No: ${order.orderNumber}`, 400, 75, { align: 'right' });
    doc.text(`Fecha: ${order.createdAt.toLocaleDateString('es-CO')}`, 400, 90, { align: 'right' });
    doc.text(`Vencimiento: ${new Date(order.createdAt.getTime() + 30*24*60*60*1000).toLocaleDateString('es-CO')}`, 400, 105, { align: 'right' });
  }

  static addCustomerInfo(doc, order) {
    doc.fontSize(12).text('FACTURAR A:', 50, 160);
    doc.fontSize(10);
    doc.text(order.userId.name, 50, 180);
    doc.text(order.userId.email, 50, 195);

    if (order.userId.phone) {
      doc.text(`Tel: ${order.userId.phone}`, 50, 210);
    }

    // Shipping address
    doc.fontSize(12).text('ENVIAR A:', 300, 160);
    doc.fontSize(10);
    const addr = order.shippingAddress;
    doc.text(addr.street, 300, 180);
    doc.text(`${addr.city}, ${addr.state}`, 300, 195);
    doc.text(addr.zipCode, 300, 210);
    doc.text(addr.country || 'Colombia', 300, 225);
  }

  static addItemsTable(doc, order) {
    const tableTop = 270;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 400;
    const totalX = 480;

    // Table headers
    doc.fontSize(10);
    doc.text('SKU', itemCodeX, tableTop);
    doc.text('Descripción', descriptionX, tableTop);
    doc.text('Cant.', quantityX, tableTop);
    doc.text('Precio', priceX, tableTop);
    doc.text('Total', totalX, tableTop);

    // Header line
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let yPosition = tableTop + 25;

    // Items
    order.items.forEach((item) => {
      doc.text(item.sku || 'N/A', itemCodeX, yPosition);
      doc.text(item.name, descriptionX, yPosition, { width: 190 });
      doc.text(item.quantity.toString(), quantityX, yPosition);
      doc.text(`$${item.price.toLocaleString('es-CO')}`, priceX, yPosition);
      doc.text(`$${item.subtotal.toLocaleString('es-CO')}`, totalX, yPosition);

      yPosition += 20;

      // Add product description if available
      if (item.productId?.description) {
        doc.fontSize(8).fillColor('gray');
        doc.text(item.productId.description.substring(0, 100) + '...', descriptionX, yPosition - 5, { width: 190 });
        doc.fontSize(10).fillColor('black');
      }
    });

    // Bottom line
    doc.moveTo(50, yPosition + 5).lineTo(550, yPosition + 5).stroke();
  }

  static addTotalsSection(doc, order) {
    const totalsX = 400;
    let yPosition = 450;

    doc.fontSize(10);

    // Subtotal
    doc.text('Subtotal:', totalsX, yPosition);
    doc.text(`$${order.subtotal.toLocaleString('es-CO')}`, totalsX + 80, yPosition);
    yPosition += 15;

    // Taxes (IVA)
    doc.text('IVA (19%):', totalsX, yPosition);
    doc.text(`$${order.taxes.toLocaleString('es-CO')}`, totalsX + 80, yPosition);
    yPosition += 15;

    // Shipping
    if (order.shipping > 0) {
      doc.text('Envío:', totalsX, yPosition);
      doc.text(`$${order.shipping.toLocaleString('es-CO')}`, totalsX + 80, yPosition);
      yPosition += 15;
    } else {
      doc.text('Envío:', totalsX, yPosition);
      doc.text('GRATIS', totalsX + 80, yPosition);
      yPosition += 15;
    }

    // Total line
    doc.moveTo(totalsX, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Final total
    doc.fontSize(12).fillColor('green');
    doc.text('TOTAL:', totalsX, yPosition);
    doc.text(`$${order.totalAmount.toLocaleString('es-CO')}`, totalsX + 80, yPosition);
    doc.fillColor('black').fontSize(10);
  }

  static addPaymentInfo(doc, order) {
    let yPosition = 550;

    doc.fontSize(12).text('INFORMACIÓN DE PAGO', 50, yPosition);
    doc.fontSize(10);
    yPosition += 20;

    doc.text(`Método de pago: ${order.paymentMethod}`, 50, yPosition);
    yPosition += 15;

    doc.text(`Estado: ${this.getStatusInSpanish(order.status)}`, 50, yPosition);
    yPosition += 15;

    if (order.trackingNumber) {
      doc.text(`Número de seguimiento: ${order.trackingNumber}`, 50, yPosition);
      yPosition += 15;
    }

    if (order.estimatedDelivery) {
      doc.text(`Entrega estimada: ${order.estimatedDelivery.toLocaleDateString('es-CO')}`, 50, yPosition);
    }
  }

  static addInvoiceFooter(doc, order) {
    const footerY = 700;

    doc.fontSize(8).fillColor('gray');
    doc.text('Esta factura fue generada electrónicamente y es válida sin firma autógrafa.', 50, footerY);
    doc.text('Para consultas sobre su pedido, visite nuestra página web o contáctenos.', 50, footerY + 12);
    doc.text(`Factura generada el ${new Date().toLocaleString('es-CO')}`, 50, footerY + 24);

    // QR code placeholder
    doc.rect(450, footerY - 10, 40, 40).stroke();
    doc.text('QR', 465, footerY + 5);
  }

  static addReceiptFooter(doc) {
    const footerY = 500;
    doc.fontSize(8).fillColor('gray');
    doc.text('¡Gracias por tu compra en Exotic Pets Colombia!', 50, footerY, { align: 'center' });
    doc.text('Conserva este recibo para futuras referencias', 50, footerY + 15, { align: 'center' });
  }

  static getStatusInSpanish(status) {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }
}

module.exports = PDFGenerator;