# 🎯 Guía de Integración SIMPLE - PDF Service

## ✅ **Lo que REALMENTE hemos implementado**

### 🪶 **Lambda**:
- ✅ Procesamiento de imágenes (ya estaba correcto)

### 🔧 **OpenShift SIMPLE**:
- ✅ **Solo 1 función**: Generar PDFs de órdenes existentes
- ✅ Usa tu **MongoDB actual** (no crea nuevas tablas)
- ✅ Usa tus **órdenes existentes**
- ✅ **No toca Cognito** (no maneja usuarios)
- ✅ **70 líneas de código** vs 500+ antes

---

## 🚀 **Cómo usar (SÚPER SIMPLE)**

### 1. **Desplegar el microservicio**
```bash
cd openshift/simple-pdf-service
docker build -t pdf-service .
docker run -p 8080:8080 -e MONGODB_URI="tu-mongo-uri" pdf-service
```

### 2. **Probar que funciona**
```bash
# Ver qué órdenes tienes
curl http://localhost:8080/api/orders

# Generar PDF de una orden
curl http://localhost:8080/api/orders/TU_ORDER_ID/pdf > factura.pdf
```

### 3. **Integrar en tu frontend React**
```javascript
import OrderPDFButton from './OrderPDFButton';

// En cualquier componente donde muestres órdenes:
<OrderPDFButton
  orderId={order.id}
  orderNumber={order.orderNumber}
  type="invoice"
/>
```

---

## 📋 **Endpoints SIMPLES**

| Endpoint | Qué hace |
|----------|----------|
| `GET /health` | Verificar que funciona |
| `GET /api/orders` | Ver órdenes disponibles |
| `GET /api/orders/:id/pdf` | **Generar PDF de orden** |
| `GET /api/orders/:id/pdf?type=receipt` | Generar recibo simple |

---

## 🔄 **Flujo REAL de uso**

```javascript
// Tu usuario ve una orden en el frontend
const orders = [
  { id: "orden123", total: 45000, items: ["Iguana verde"] }
];

// Usuario clickea "Descargar Factura"
<OrderPDFButton orderId="orden123" type="invoice" />

// 1. Frontend llama: /api/orders/orden123/pdf
// 2. OpenShift busca orden123 en TU MongoDB
// 3. OpenShift genera PDF profesional
// 4. Usuario descarga: factura-orden123.pdf
```

---

## 🛠️ **Variables de entorno**

### **OpenShift Service**:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/exotic-pets
PORT=8080
```

### **Frontend React**:
```bash
# Opción 1: Directo al servicio
REACT_APP_PDF_SERVICE_URL=https://pdf-service.apps.cluster.com

# Opción 2: A través de API Gateway
REACT_APP_API_GATEWAY_URL=https://api-gateway.amazonaws.com/prod
```

---

## 📊 **Ejemplo con tus datos reales**

Si en tu MongoDB tienes órdenes como:
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "orderId": "EP-2024-001",
  "customerName": "Juan Pérez",
  "customerEmail": "juan@email.com",
  "total": 127000,
  "items": [
    {
      "productId": "iguana-verde-id",
      "name": "Iguana Verde",
      "quantity": 1,
      "price": 95000
    },
    {
      "productId": "terrario-id",
      "name": "Terrario 120L",
      "quantity": 1,
      "price": 32000
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**El PDF generado incluirá:**
- ✅ Header con logo Exotic Pets Colombia
- ✅ Número de factura: EP-2024-001
- ✅ Cliente: Juan Pérez
- ✅ Productos: 1x Iguana Verde ($95,000), 1x Terrario 120L ($32,000)
- ✅ Total: $127,000
- ✅ Fecha: 15/01/2024

---

## 🎯 **Arquitectura FINAL (Simple)**

```
Frontend React    →    API Gateway    →    OpenShift PDF
(OrderPDFButton)       (Opcional)          (70 líneas)
                                                ↓
                                          Tu MongoDB
                                         (órdenes existentes)
```

---

## ⚡ **Testing rápido**

### 1. **Ver si tienes órdenes**:
```bash
curl http://localhost:8080/api/orders
```

### 2. **Generar PDF de prueba**:
```bash
curl "http://localhost:8080/api/orders/ORDEN_ID/pdf" > test.pdf
```

### 3. **Integrar en React**:
```jsx
import { pdfService } from './pdfService';

const MyOrdersPage = () => {
  const handleDownloadInvoice = async (orderId) => {
    await pdfService.downloadOrderPDF(orderId, 'invoice');
  };

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h3>Orden: {order.orderId}</h3>
          <OrderPDFButton orderId={order.id} />
        </div>
      ))}
    </div>
  );
};
```

---

## 💰 **Costos Reales**

- **Lambda**: $1/mes (imágenes)
- **OpenShift**: $50-80/mes (servicio PDF simple)
- **API Gateway**: $2/mes
- **Total**: ~$60/mes vs $200+ de la versión compleja

---

## ✅ **¿Por qué esta versión es PERFECTA?**

1. ✅ **Usa tu infraestructura**: MongoDB + Cognito existentes
2. ✅ **Microservicio real**: PDF generation es lógica robusta
3. ✅ **Simple**: Solo 1 responsabilidad
4. ✅ **Fácil de probar**: 2 comandos curl
5. ✅ **Fácil de integrar**: 1 componente React
6. ✅ **Económico**: No recursos innecesarios

**¡Lista para implementar!** 🎉