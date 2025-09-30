// Servicio para integrar con el PDF microservice
// Se conecta con tu sistema existente de órdenes

class PDFService {
  constructor() {
    // URL del microservicio PDF en OpenShift
    this.baseUrl = process.env.REACT_APP_PDF_SERVICE_URL || 'http://localhost:8080';

    // URL del API Gateway que enruta al microservicio
    this.gatewayUrl = process.env.REACT_APP_API_GATEWAY_URL || '';
  }

  /**
   * Generar y descargar PDF de una orden existente
   * @param {string} orderId - ID de la orden (del MongoDB existente)
   * @param {string} type - Tipo de PDF: 'invoice' o 'receipt'
   */
  async downloadOrderPDF(orderId, type = 'invoice') {
    try {
      console.log(`📄 Descargando PDF ${type} para orden: ${orderId}`);

      // URL completa del endpoint
      const url = this.gatewayUrl
        ? `${this.gatewayUrl}/api/orders/${orderId}/pdf?type=${type}`
        : `${this.baseUrl}/api/orders/${orderId}/pdf?type=${type}`;

      // Obtener el PDF
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Convertir a blob
      const blob = await response.blob();

      // Crear URL temporal y descargar
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${type}-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      console.log(`✅ PDF descargado exitosamente`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error descargando PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ver PDF en nueva ventana en lugar de descargar
   */
  async viewOrderPDF(orderId, type = 'invoice') {
    try {
      const url = this.gatewayUrl
        ? `${this.gatewayUrl}/api/orders/${orderId}/pdf?type=${type}`
        : `${this.baseUrl}/api/orders/${orderId}/pdf?type=${type}`;

      // Abrir en nueva ventana
      window.open(url, '_blank');

      return { success: true };

    } catch (error) {
      console.error('Error abriendo PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener lista de órdenes disponibles (para debug)
   */
  async getAvailableOrders() {
    try {
      const url = this.gatewayUrl
        ? `${this.gatewayUrl}/api/orders`
        : `${this.baseUrl}/api/orders`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error obteniendo órdenes');
      }

      return {
        success: true,
        orders: data.orders || []
      };

    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      return {
        success: false,
        error: error.message,
        orders: []
      };
    }
  }

  /**
   * Verificar si el servicio PDF está disponible
   */
  async checkService() {
    try {
      const url = this.gatewayUrl
        ? `${this.gatewayUrl}/health`
        : `${this.baseUrl}/health`;

      const response = await fetch(url);
      const data = await response.json();

      return {
        available: response.ok,
        status: data.status || 'unknown',
        service: data.service || 'PDF Service'
      };

    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

// Crear instancia singleton
export const pdfService = new PDFService();
export default pdfService;