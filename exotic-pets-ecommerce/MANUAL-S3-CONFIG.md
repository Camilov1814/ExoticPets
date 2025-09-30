# 🎛️ Configuración Manual de S3 desde AWS Console

## 📋 Pasos Detallados

### **1. Subir Archivos a S3**

#### **Subir archivos CSS/JS:**
1. Ve a AWS Console → S3 → Tu bucket
2. Crea carpeta `assets/` si no existe
3. Sube todos los archivos de `dist/assets/` a `assets/`
4. Selecciona todos los archivos CSS y JS subidos
5. Clic en "Actions" → "Edit metadata"
6. Agregar metadata:
   ```
   Key: Cache-Control
   Value: public, max-age=31536000, immutable
   
   Key: Content-Type  
   Value: application/javascript; charset=utf-8  (para .js)
   Value: text/css; charset=utf-8  (para .css)
   ```

#### **Subir index.html:**
1. Sube `dist/index.html` al root del bucket
2. Selecciona el archivo index.html
3. Clic en "Actions" → "Edit metadata"
4. Agregar metadata:
   ```
   Key: Cache-Control
   Value: no-cache, no-store, must-revalidate
   
   Key: Content-Type
   Value: text/html; charset=utf-8
   ```

### **2. Configurar Permisos del Bucket**

#### **Bucket Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::TU-BUCKET-NAME/*"
        }
    ]
}
```

#### **CORS Configuration:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

### **3. Configurar CloudFront**

#### **Behaviors:**
- **Default (*)**: 
  - Origin: Tu bucket S3
  - Viewer Protocol: Redirect HTTP to HTTPS
  - Allowed HTTP Methods: GET, HEAD
  - Cache Policy: CachingOptimized

#### **Error Pages:**
- **404 Error**: Redirect to `/index.html` with status 200
- **403 Error**: Redirect to `/index.html` with status 200

### **4. Invalidar Cache**
1. Ve a CloudFront → Distributions
2. Selecciona tu distribución
3. Tab "Invalidations" → "Create invalidation"
4. Paths: `/*`
5. Clic "Create invalidation"

---

## 🚨 **Problemas Comunes y Soluciones:**

### **Archivos CSS/JS aparecen rojos:**
- ✅ Verificar que las rutas en index.html sean relativas (./assets/)
- ✅ Confirmar que Content-Type está configurado correctamente
- ✅ Invalidar cache de CloudFront

### **Google Analytics no funciona:**
- ✅ Verificar que index.html no tiene cache
- ✅ Comprobar en Network tab que se cargan scripts de GA
- ✅ Revisar Console para mensajes de error

### **Sitio muestra versión antigua:**
- ✅ Invalidar cache: `/*`
- ✅ Esperar 2-3 minutos
- ✅ Hard refresh: Ctrl+Shift+R

---

## 📊 **Verificación Final:**

### **En Browser Console debe aparecer:**
```
🚀 GA4 initializing at: 2024-XX-XXTXX:XX:XX.XXXZ Domain: xxxxx.cloudfront.net
✅ Google Analytics loaded successfully
```

### **En Network tab debe haber requests a:**
- `googletagmanager.com/gtag/js?id=G-4B5XF8H7H3`
- `google-analytics.com/collect` (al hacer acciones)

### **En Google Analytics Realtime:**
- Debería mostrar usuarios activos
- Eventos cuando interactúes con filtros/carrito