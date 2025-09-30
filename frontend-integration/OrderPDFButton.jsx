import React, { useState } from 'react';
import { pdfService } from './pdfService';

/**
 * Componente para generar PDFs de órdenes existentes
 * Se puede usar en cualquier parte donde tengas el ID de una orden
 */
const OrderPDFButton = ({
  orderId,
  orderNumber,
  type = 'invoice',
  variant = 'button' // 'button' | 'link' | 'icon'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownloadPDF = async () => {
    if (!orderId) {
      setError('No hay ID de orden');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await pdfService.downloadOrderPDF(orderId, type);

      if (!result.success) {
        setError(result.error || 'Error descargando PDF');
      }
    } catch (err) {
      setError('Error inesperado al generar PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async () => {
    if (!orderId) {
      setError('No hay ID de orden');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await pdfService.viewOrderPDF(orderId, type);

      if (!result.success) {
        setError(result.error || 'Error abriendo PDF');
      }
    } catch (err) {
      setError('Error inesperado al abrir PDF');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Renderizado según variante
  if (variant === 'icon') {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          className="p-2 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
          title={`Descargar ${type === 'invoice' ? 'factura' : 'recibo'}`}
        >
          {loading ? '⏳' : '📄'}
        </button>
        <button
          onClick={handleViewPDF}
          disabled={loading}
          className="p-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
          title={`Ver ${type === 'invoice' ? 'factura' : 'recibo'}`}
        >
          {loading ? '⏳' : '👁️'}
        </button>
        {error && (
          <span className="text-xs text-red-500" title={error}>❌</span>
        )}
      </div>
    );
  }

  if (variant === 'link') {
    return (
      <div className="space-y-1">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800 underline text-sm disabled:opacity-50"
        >
          {loading ? 'Generando...' : `Descargar ${type === 'invoice' ? 'Factura' : 'Recibo'}`}
        </button>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  // Variante por defecto: botón completo
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Generando...
            </>
          ) : (
            <>
              📄 Descargar {type === 'invoice' ? 'Factura' : 'Recibo'}
            </>
          )}
        </button>

        <button
          onClick={handleViewPDF}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          👁️ Ver PDF
        </button>
      </div>

      {error && (
        <div className="p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {orderNumber && (
        <p className="text-xs text-gray-500">
          Orden: {orderNumber} | ID: {orderId}
        </p>
      )}
    </div>
  );
};

export default OrderPDFButton;