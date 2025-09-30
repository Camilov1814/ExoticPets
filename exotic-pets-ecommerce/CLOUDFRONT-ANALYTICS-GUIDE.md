# 🌐 Guía CloudFront + Google Analytics

## 🎨 Significado de los Colores en el Build

### **🟢 Verde (index.html)**
- ✅ Archivo cargando correctamente
- ✅ Google Analytics debería funcionar

### **🔴 Rojo (archivos CSS/JS)**
- ❌ Archivo no encontrado (error 404)
- ❌ Problema de CORS o path incorrecto
- ⚠️ **Puede afectar Google Analytics si el JS principal está en rojo**

### **🔵 Azul (archivos JS)**
- ⚠️ Archivo carga con advertencias
- ⚠️ Posible problema de minificación
- ✅ Generalmente funcional pero con issues menores

## 🚀 Solución Optimizada Implementada

### **1. Configuración de Vite Optimizada** (`vite.config.js`)
```javascript
// Configuración específica para CloudFront
build: {
  target: 'esnext',
  minify: 'terser',
  sourcemap: false, // Evita archivos .map innecesarios
  base: './', // Paths relativos para mejor compatibilidad
}
```

### **2. Google Analytics Optimizado** (`index.html`)
```html
<!-- Preconnect para carga más rápida -->
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://www.google-analytics.com" />

<!-- Configuración optimizada para CloudFront -->
gtag('config', 'G-4B5XF8H7H3', {
  debug_mode: false, // Solo en desarrollo
  custom_map: {
    'custom_parameter_1': 'cloudfront_deployment'
  }
});
```

### **3. Script de Optimización**
Ejecuta: `npm run build:cloudfront`

## 📋 Checklist para Deploy en S3/CloudFront

### **Antes del Deploy:**
- [ ] Ejecutar `npm run build:cloudfront`
- [ ] Verificar que todos los archivos están en verde/azul
- [ ] Confirmar que `dist/index.html` existe
- [ ] Revisar logs de la consola para errores

### **Configuración de S3:**
```bash
# Headers para index.html
Cache-Control: no-cache, no-store, must-revalidate
Content-Type: text/html; charset=utf-8

# Headers para archivos CSS/JS
Cache-Control: public, max-age=31536000, immutable
Content-Type: application/javascript; charset=utf-8
```

### **Configuración de CloudFront:**
- **Origin**: Tu bucket S3
- **Default Root Object**: `index.html`
- **Error Pages**: 404 → `/index.html` (para React Router)
- **Compress Objects**: Sí
- **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE

### **Después del Deploy:**
- [ ] Invalidar cache de CloudFront: `/*`
- [ ] Verificar que GA se carga correctamente
- [ ] Comprobar Network tab para peticiones a `google-analytics.com`
- [ ] Confirmar eventos en Google Analytics Realtime

## 🔍 Diagnosticar Problemas

### **Archivos Rojos - CSS/JS no cargan:**
1. **Verificar paths en `index.html`:**
   ```html
   <!-- Debe ser path relativo -->
   <script type="module" src="./assets/index-abc123.js"></script>
   ```

2. **Configurar CORS en S3:**
   ```json
   {
     "CORSRules": [{
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET"],
       "AllowedOrigins": ["*"],
       "MaxAgeSeconds": 3000
     }]
   }
   ```

3. **Verificar permissions del bucket S3:**
   - Bucket debe ser público para lectura
   - CloudFront debe tener acceso al bucket

### **Google Analytics no funciona:**
1. **Verificar en Browser Console:**
   ```javascript
   // Debería retornar 'function'
   typeof window.gtag
   
   // Debería ser un array con elementos
   window.dataLayer
   ```

2. **Comprobar Network Requests:**
   - Buscar requests a `googletagmanager.com`
   - Buscar requests a `google-analytics.com/collect`

3. **Debug Component:**
   - El componente `AnalyticsDebug` se muestra en pantalla
   - Verificar los checkmarks (✅/❌)

### **CloudFront Issues:**
1. **Cache Issues:**
   ```bash
   # Invalidar cache completo
   aws cloudfront create-invalidation --distribution-id ABCD123 --paths "/*"
   ```

2. **Content-Type Issues:**
   - HTML: `text/html; charset=utf-8`
   - CSS: `text/css; charset=utf-8`
   - JS: `application/javascript; charset=utf-8`

## 🧪 Testing

### **Local Testing:**
```bash
npm run dev
# Abrir http://localhost:3000
# Verificar consola para mensajes de GA
```

### **Production Testing:**
```bash
npm run build:cloudfront
npm run preview
# Simula el comportamiento de producción
```

### **CloudFront Testing:**
1. Abrir tu URL de CloudFront
2. Abrir DevTools → Console
3. Buscar mensajes: `🚀 GA4 initializing` y `✅ Google Analytics loaded`
4. Ir a DevTools → Network
5. Realizar acciones (filtrar, añadir al carrito)
6. Verificar requests a Google Analytics

## 📊 Monitoreo

### **Google Analytics Realtime:**
- Events → Ver eventos en tiempo real
- Users → Verificar usuarios activos
- Conversions → Tracking de add_to_cart

### **Browser Console Logs:**
```
🚀 GA4 initializing at: 2024-01-20T10:30:00.000Z
✅ Google Analytics loaded successfully
🧪 Enviando evento de prueba...
📊 Event tracked: add_to_cart
```

## 🚨 Problemas Comunes

| Problema | Síntoma | Solución |
|----------|---------|----------|
| CSS rojo | Estilos no cargan | Verificar paths en index.html |
| JS azul | Advertencias de build | Revisar console.log en código |
| GA no funciona | No eventos en Realtime | Verificar script tags en HTML |
| 404 en archivos | Archivos no encontrados | Invalidar cache de CloudFront |
| CORS errors | Blocked by CORS policy | Configurar CORS en S3 |

## ✅ Comandos Rápidos

```bash
# Build optimizado para CloudFront
npm run build:cloudfront

# Verificar archivos generados
ls -la dist/

# Subir a S3 (ejemplo con AWS CLI)
aws s3 sync dist/ s3://tu-bucket-name --delete

# Invalidar cache de CloudFront
aws cloudfront create-invalidation --distribution-id TU-DISTRIBUTION-ID --paths "/*"
```

---

**💡 Pro Tip:** Los colores que ves en el navegador después del build son indicativos de la salud de tu aplicación. Verde = perfecto, Azul = funcional con advertencias, Rojo = problemático.