# 🚀 Guía de Despliegue - Exotic Pets Platform

Esta guía detalla el despliegue de la arquitectura híbrida Lambda/OpenShift con API Gateway para la plataforma de mascotas exóticas.

## 📋 Arquitectura General

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │     Backend     │
│   (React)       │───▶│   (AWS)         │───▶│   (Hybrid)      │
│   Port 3002     │    │   Unified API   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Lambda      │    │   OpenShift     │
                       │  (Lightweight)  │    │   (Robust)      │
                       │  Image Process  │    │  Business Logic │
                       └─────────────────┘    └─────────────────┘
```

## 🛠️ Componentes Implementados

### ✅ Lambda Function (Ligera) - PERFECTO para tareas simples
- **Propósito**: Procesamiento de imágenes (operación simple y rápida)
- **Funciones**: Redimensionado, optimización WebP, múltiples formatos
- **Por qué es ligero**: Sin BD, sin estado, transformación directa
- **Triggers**: S3 uploads, API Gateway calls
- **Tamaños generados**: thumbnail, small, medium, large, gallery, hero
- **Tiempo ejecución**: < 30 segundos

### ✅ OpenShift Microservice (Robusto) - PERFECTO para lógica compleja
- **Propósito**: Lógica de negocio compleja y generación de documentos
- **Funciones principales**:
  - **Generación de PDF**: Facturas, recibos, etiquetas de envío
  - **Gestión de órdenes**: Cálculos complejos, validaciones
  - **CRUD completo**: Productos, usuarios, analytics
  - **Integración BD**: MongoDB consultas complejas + Redis cache
- **Por qué es robusto**: Persistencia, estado, cálculos complejos, templates
- **Características**: Auto-scaling, health checks, monitoring

### ✅ API Gateway (Enrutador)
- **Propósito**: Punto único de entrada
- **Rutas**:
  - `/lambda/*` → Lambda functions
  - `/api/*` → OpenShift services
- **Características**: Rate limiting, CORS, SSL/TLS

### ✅ Frontend Updates
- **Nuevo componente**: `ImageGallery` para múltiples imágenes
- **Soporte**: Navegación de imágenes, thumbnails, responsive
- **Optimización**: Lazy loading, diferentes tamaños

## 📦 Despliegue Paso a Paso

### 1. Preparación del Entorno

```bash
# Instalar herramientas necesarias
npm install -g serverless
aws configure
oc login https://your-openshift-cluster.com

# Clonar y preparar código
cd lambda/image-processor
npm install

cd ../../openshift/exotic-pets-api
npm install
```

### 2. Desplegar Lambda Function

```bash
# Desde lambda/image-processor/
serverless deploy

# O manualmente:
zip -r deployment.zip . -x "*.git*" "serverless.yml" "README.md"
aws lambda create-function \
  --function-name exotic-pets-image-processor \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://deployment.zip \
  --memory-size 1024 \
  --timeout 30
```

### 3. Configurar S3 y CloudFront

```bash
# Crear bucket S3
aws s3 mb s3://exotic-pets-images-prod

# Configurar trigger S3 → Lambda
aws s3api put-bucket-notification-configuration \
  --bucket exotic-pets-images-prod \
  --notification-configuration file://s3-notification.json

# Crear distribución CloudFront
aws cloudformation deploy \
  --template-file cloudfront-template.yaml \
  --stack-name exotic-pets-cdn
```

### 4. Desplegar en OpenShift

```bash
# Desde openshift/exotic-pets-api/

# Crear secrets
oc create secret generic exotic-pets-secrets \
  --from-literal=mongodb-uri="mongodb+srv://user:pass@cluster.mongodb.net/exotic-pets" \
  --from-literal=redis-url="redis://redis-service:6379" \
  --from-literal=jwt-secret="your-super-secret-key"

# Crear ConfigMap
oc create configmap exotic-pets-config \
  --from-literal=allowed-origins="https://your-frontend.com" \
  --from-literal=api-base-url="https://exotic-pets-api.apps.cluster.com"

# Desplegar aplicación
oc apply -f openshift/deployment.yaml

# Verificar despliegue
oc get pods -l app=exotic-pets-api
oc get routes
```

### 5. Configurar API Gateway

```bash
# Desplegar stack de API Gateway
aws cloudformation deploy \
  --template-file api-gateway/aws-api-gateway.yaml \
  --stack-name exotic-pets-api-gateway \
  --parameter-overrides \
    LambdaFunctionArn="arn:aws:lambda:region:account:function:exotic-pets-image-processor" \
    OpenShiftEndpoint="https://exotic-pets-api.apps.your-cluster.com"
```

### 6. Actualizar Frontend

```bash
# Desde el directorio del frontend
npm install

# Actualizar variables de entorno
cat > .env.production << EOF
VITE_API_GATEWAY_URL=https://api-id.execute-api.region.amazonaws.com/prod
VITE_LAMBDA_ENDPOINT=/lambda/process-image
VITE_OPENSHIFT_ENDPOINT=/api
EOF

# Build y deploy
npm run build
```

## 🔧 Configuración de Variables

### Lambda Environment Variables
```bash
BUCKET_NAME=exotic-pets-images-prod
STAGE=prod
AWS_REGION=us-east-1
```

### OpenShift Environment Variables
```yaml
env:
- name: NODE_ENV
  value: "production"
- name: MONGODB_URI
  valueFrom:
    secretKeyRef:
      name: exotic-pets-secrets
      key: mongodb-uri
- name: REDIS_URL
  valueFrom:
    secretKeyRef:
      name: exotic-pets-secrets
      key: redis-url
```

### API Gateway Configuration
```json
{
  "stageName": "prod",
  "throttling": {
    "burstLimit": 100,
    "rateLimit": 50
  },
  "quota": {
    "limit": 10000,
    "period": "DAY"
  }
}
```

## 🧪 Testing y Verificación

### 1. Test Lambda Function
```bash
# Test procesamiento de imagen
curl -X POST \
  https://api-id.execute-api.us-east-1.amazonaws.com/prod/lambda/process-image \
  -H 'Content-Type: application/json' \
  -d '{
    "imageUrl": "https://example.com/pet-image.jpg",
    "sizes": [
      {"name": "thumbnail", "width": 150, "height": 150}
    ]
  }'
```

### 2. Test OpenShift Service
```bash
# Test health check
curl https://exotic-pets-api.apps.cluster.com/health

# Test productos
curl https://api-id.execute-api.us-east-1.amazonaws.com/prod/api/products
```

### 3. Test Frontend Integration
```javascript
// Verificar que las imágenes múltiples funcionan
const testImageGallery = async () => {
  const product = await hybridProductService.getProduct('test-id');
  console.log('Product images:', product.images);
  // Debe mostrar array de imágenes con diferentes tamaños
};
```

## 📊 Monitoreo y Métricas

### CloudWatch Metrics (Lambda)
- Duración de ejecución
- Errores y timeouts
- Invocaciones por minuto
- Throttling

### OpenShift Monitoring
```bash
# Ver métricas de pods
oc top pods -l app=exotic-pets-api

# Ver logs
oc logs -f deployment/exotic-pets-api

# Health checks
curl https://exotic-pets-api.apps.cluster.com/health/metrics
```

### API Gateway Analytics
- Requests per second
- Latencia
- Error rates
- Cache hit ratio

## 🚨 Troubleshooting

### Problemas Comunes

#### Lambda Function
```bash
# Error: Function timeout
# Solución: Aumentar timeout y memoria
aws lambda update-function-configuration \
  --function-name exotic-pets-image-processor \
  --timeout 60 \
  --memory-size 1536

# Error: Permission denied S3
# Solución: Verificar IAM role
aws iam get-role-policy \
  --role-name lambda-execution-role \
  --policy-name s3-access-policy
```

#### OpenShift
```bash
# Pod no inicia
oc describe pod POD_NAME
oc logs POD_NAME

# Error de conexión DB
oc get secrets exotic-pets-secrets -o yaml
oc exec POD_NAME -- env | grep MONGODB
```

#### API Gateway
```bash
# Error CORS
# Verificar que OPTIONS esté configurado
aws apigateway get-method \
  --rest-api-id API_ID \
  --resource-id RESOURCE_ID \
  --http-method OPTIONS

# Error 502 Bad Gateway
# Verificar que los backends respondan
curl -I https://exotic-pets-api.apps.cluster.com/health
```

## 💰 Costos Estimados (Mensual)

### Para 10,000 usuarios activos:

**AWS Lambda**:
- Invocaciones: ~50,000/mes
- Duración: 20ms promedio
- Costo: ~$1.00

**API Gateway**:
- Requests: ~500,000/mes
- Costo: ~$1.75

**S3 + CloudFront**:
- Storage: 100GB
- Transfers: 1TB
- Costo: ~$15.00

**OpenShift**:
- 3 pods (1 vCPU, 512MB cada uno)
- Costo: ~$180.00/mes

**Total estimado**: ~$197.75/mes

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **Lambda**: IAM roles mínimos, VPC opcional
2. **OpenShift**: Security contexts, non-root users
3. **API Gateway**: Rate limiting, API keys
4. **Comunicación**: HTTPS/TLS en todas las conexiones
5. **Secrets**: Almacenados en OpenShift secrets/AWS SSM

### Próximos Pasos de Seguridad

1. Implementar WAF en API Gateway
2. Configurar OAuth2/JWT authentication
3. Encriptación end-to-end
4. Audit logging
5. Vulnerability scanning

## 📞 Soporte y Mantenimiento

### Actualizaciones
```bash
# Lambda
serverless deploy

# OpenShift
oc apply -f openshift/deployment.yaml
oc rollout restart deployment/exotic-pets-api

# API Gateway
aws cloudformation update-stack \
  --stack-name exotic-pets-api-gateway \
  --template-body file://aws-api-gateway.yaml
```

### Backup y Recovery
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)

# OpenShift config backup
oc get all,secrets,configmaps -o yaml > openshift-backup.yaml
```

¡La arquitectura híbrida está lista para producción! 🎉