# Exotic Pets Image Processor - AWS Lambda

Esta función Lambda procesa automáticamente las imágenes de productos de mascotas exóticas, generando múltiples tamaños optimizados para web.

## 🚀 Características

- **Procesamiento automático**: Se activa cuando se suben imágenes a S3
- **Múltiples tamaños**: Genera 6 tamaños diferentes (thumbnail, small, medium, large, gallery, hero)
- **Optimización WebP**: Convierte a formato WebP para mejor compresión
- **API REST**: Endpoint para procesamiento manual vía API Gateway
- **CloudFront CDN**: Distribución rápida de imágenes procesadas

## 📦 Arquitectura

```
Upload → S3 Bucket → Lambda Function → Processed Images → CloudFront CDN
                          ↓
                   API Gateway (manual processing)
```

## 🛠️ Despliegue

### Opción 1: Serverless Framework (Recomendado)

```bash
# Instalar Serverless Framework
npm install -g serverless

# Instalar dependencias
cd lambda/image-processor
npm install

# Configurar credenciales AWS
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY

# Desplegar
serverless deploy
```

### Opción 2: AWS CLI Manual

```bash
# Crear el paquete de deployment
cd lambda/image-processor
npm install
zip -r deployment.zip . -x "*.git*" "serverless.yml" "README.md"

# Crear función Lambda
aws lambda create-function \
  --function-name exotic-pets-image-processor \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://deployment.zip \
  --memory-size 1024 \
  --timeout 30

# Actualizar función existente
aws lambda update-function-code \
  --function-name exotic-pets-image-processor \
  --zip-file fileb://deployment.zip
```

## 🔧 Configuración de API Gateway

### 1. Crear API Gateway REST API

```bash
# Crear nueva API
aws apigateway create-rest-api --name exotic-pets-image-api

# Obtener el resource ID
aws apigateway get-resources --rest-api-id YOUR_API_ID

# Crear resource para /process-image
aws apigateway create-resource \
  --rest-api-id YOUR_API_ID \
  --parent-id ROOT_RESOURCE_ID \
  --path-part process-image

# Crear método POST
aws apigateway put-method \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE

# Integrar con Lambda
aws apigateway put-integration \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:YOUR_ACCOUNT:function:exotic-pets-image-processor/invocations

# Desplegar API
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod
```

### 2. Configurar CORS

```bash
# Habilitar CORS para OPTIONS
aws apigateway put-method \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method OPTIONS \
  --authorization-type NONE

aws apigateway put-integration \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method OPTIONS \
  --type MOCK \
  --request-templates '{"application/json": "{\"statusCode\": 200}"}'

# Configurar response headers
aws apigateway put-method-response \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false,method.response.header.Access-Control-Allow-Origin=false

aws apigateway put-integration-response \
  --rest-api-id YOUR_API_ID \
  --resource-id RESOURCE_ID \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers": "'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods": "'"'"'GET,POST,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin": "'"'"'*'"'"'}'
```

## 📝 Variables de entorno

```bash
BUCKET_NAME=exotic-pets-images-dev
STAGE=dev
AWS_REGION=us-east-1
```

## 🧪 Testing

### Test S3 Upload Event

```bash
# Subir imagen de prueba
aws s3 cp test-image.jpg s3://exotic-pets-images-dev/uploads/

# Ver logs
aws logs tail /aws/lambda/exotic-pets-image-processor --follow
```

### Test API Gateway

```bash
# Curl directo
curl -X POST \
  https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/process-image \
  -H 'Content-Type: application/json' \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "sizes": [
      {"name": "thumbnail", "width": 150, "height": 150},
      {"name": "medium", "width": 600, "height": 600}
    ]
  }'
```

### Test JavaScript

```javascript
// Test desde tu app React
const processImage = async (imageUrl) => {
  try {
    const response = await fetch('https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/process-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        sizes: [
          { name: 'thumbnail', width: 150, height: 150 },
          { name: 'small', width: 300, height: 300 },
          { name: 'medium', width: 600, height: 600 }
        ]
      })
    });

    const result = await response.json();
    console.log('Processed images:', result.images);
    return result;
  } catch (error) {
    console.error('Error processing image:', error);
  }
};
```

## 🔒 Permisos IAM

### Lambda Execution Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::exotic-pets-images-*/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::exotic-pets-images-*"
    }
  ]
}
```

## 📊 Monitoreo

### CloudWatch Metrics

- `Duration`: Tiempo de ejecución
- `Errors`: Número de errores
- `Invocations`: Número de invocaciones
- `Throttles`: Número de throttles

### CloudWatch Logs

```bash
# Ver logs en tiempo real
aws logs tail /aws/lambda/exotic-pets-image-processor --follow

# Buscar errores
aws logs filter-log-events \
  --log-group-name /aws/lambda/exotic-pets-image-processor \
  --filter-pattern "ERROR"
```

## 💰 Costos Estimados

Para 1000 imágenes/mes:
- **Lambda**: ~$0.20 (20ms promedio)
- **S3**: ~$0.50 (storage + requests)
- **CloudFront**: ~$1.00 (data transfer)
- **API Gateway**: ~$3.50 (1000 requests)

**Total estimado**: ~$5.20/mes

## 🚀 Escalabilidad

- **Concurrencia**: Hasta 1000 ejecuciones simultáneas
- **Timeout**: 30 segundos por imagen
- **Memoria**: 1024MB (ajustable según necesidad)
- **Límites**: 500MB máximo por imagen

## 📞 Soporte

Para reportar problemas o solicitar nuevas características, crea un issue en el repositorio del proyecto.