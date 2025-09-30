const PDFDocument = require('pdfkit');

class PDFGenerator {

  /**
   * Genera factura PDF para una orden existente
   * Usa el formato de datos que ya tienes
   */
  static async generateInvoice(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header empresa
        doc.fontSize(20).text('EXOTIC PETS COLOMBIA', 50, 50);
        doc.fontSize(10).text('Especialistas en Mascotas Exóticas', 50, 75);
        doc.text('Bogotá, Colombia', 50, 90);
        doc.moveTo(50, 110).lineTo(550, 110).stroke();

        // Info factura
        doc.fontSize(16).text('FACTURA', 400, 50);
        doc.fontSize(10);
        doc.text(`No: ${order.orderId || order._id}`, 400, 70);
        doc.text(`Fecha: ${this.formatDate(order.createdAt)}`, 400, 85);

        // Info cliente (simplificado)
        let yPos = 140;
        doc.fontSize(12).text('CLIENTE:', 50, yPos);
        doc.fontSize(10);
        doc.text(order.customerName || 'Cliente', 50, yPos + 20);

        if (order.customerEmail) {
          doc.text(order.customerEmail, 50, yPos + 35);
        }

        // Dirección de envío (si existe)
        if (order.shippingAddress) {
          doc.fontSize(12).text('ENVÍO A:', 300, yPos);
          doc.fontSize(10);
          doc.text(order.shippingAddress.street || '', 300, yPos + 20);
          doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}`, 300, yPos + 35);
        }

        // Tabla de productos
        yPos = 220;
        this.addItemsTable(doc, order, yPos);

        // Totales
        this.addTotals(doc, order);

        // Footer
        doc.fontSize(8).text('Gracias por tu compra en Exotic Pets Colombia', 50, 700, {
          align: 'center'
        });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera recibo simplificado
   */
  static async generateReceipt(order) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header simple
        doc.fontSize(18).text('EXOTIC PETS COLOMBIA', 50, 50, { align: 'center' });
        doc.fontSize(14).text('RECIBO DE COMPRA', 50, 80, { align: 'center' });

        // Info básica
        let yPos = 120;
        doc.fontSize(12);
        doc.text(`Orden: ${order.orderId || order._id}`, 50, yPos);
        doc.text(`Fecha: ${this.formatDate(order.createdAt)}`, 50, yPos + 20);
        doc.text(`Cliente: ${order.customerName || 'Cliente'}`, 50, yPos + 40);

        // Productos
        yPos += 80;
        doc.text('PRODUCTOS:', 50, yPos);
        yPos += 20;

        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            const productName = item.productName || item.name || 'Producto';
            const quantity = item.quantity || 1;
            const price = item.price || 0;

            doc.fontSize(10);
            doc.text(`${quantity}x ${productName} - $${this.formatPrice(price)}`, 70, yPos);
            yPos += 15;
          });
        }

        // Total
        yPos += 20;
        doc.fontSize(14);
        doc.text(`TOTAL: $${this.formatPrice(order.total || 0)}`, 50, yPos);

        // Footer
        doc.fontSize(8).text('Conserva este recibo para futuras referencias', 50, yPos + 60, {
          align: 'center'
        });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper methods
  static addItemsTable(doc, order, startY) {
    const tableTop = startY;

    // Headers
    doc.fontSize(10);
    doc.text('Producto', 50, tableTop);
    doc.text('Cant.', 350, tableTop);
    doc.text('Precio', 400, tableTop);
    doc.text('Total', 480, tableTop);

    // Línea
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let yPosition = tableTop + 25;

    // Items
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        const productName = item.productName || item.name || 'Producto';
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const total = quantity * price;

        doc.text(productName, 50, yPosition, { width: 280 });
        doc.text(quantity.toString(), 350, yPosition);
        doc.text(`$${this.formatPrice(price)}`, 400, yPosition);
        doc.text(`$${this.formatPrice(total)}`, 480, yPosition);

        yPosition += 20;
      });
    } else {
      doc.text('No hay productos en esta orden', 50, yPosition);
      yPosition += 20;
    }

    // Línea final
    doc.moveTo(50, yPosition + 5).lineTo(550, yPosition + 5).stroke();
  }

  static addTotals(doc, order) {
    const totalsX = 400;
    let yPosition = 450;

    doc.fontSize(10);

    // Subtotal (si existe)
    if (order.subtotal) {
      doc.text('Subtotal:', totalsX, yPosition);
      doc.text(`$${this.formatPrice(order.subtotal)}`, totalsX + 80, yPosition);
      yPosition += 15;
    }

    // Impuestos (si existen)
    if (order.taxes || order.tax) {
      doc.text('Impuestos:', totalsX, yPosition);
      doc.text(`$${this.formatPrice(order.taxes || order.tax)}`, totalsX + 80, yPosition);
      yPosition += 15;
    }

    // Envío (si existe)
    if (order.shipping) {
      doc.text('Envío:', totalsX, yPosition);
      doc.text(`$${this.formatPrice(order.shipping)}`, totalsX + 80, yPosition);
      yPosition += 15;
    }

    // Línea
    doc.moveTo(totalsX, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Total final
    doc.fontSize(12);
    doc.text('TOTAL:', totalsX, yPosition);
    doc.text(`$${this.formatPrice(order.total || 0)}`, totalsX + 80, yPosition);
  }

  // Utility methods
  static formatDate(date) {
    if (!date) return 'N/A';

    try {
      return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  static formatPrice(price) {
    if (!price || isNaN(price)) return '0';

    return parseInt(price).toLocaleString('es-CO');
  }
}

module.exports = PDFGenerator;