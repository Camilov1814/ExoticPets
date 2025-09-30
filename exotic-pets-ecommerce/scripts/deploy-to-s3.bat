@echo off
echo 🚀 Desplegando a S3 con headers optimizados...

REM Configurar estas variables
set BUCKET_NAME=tu-bucket-name
set DISTRIBUTION_ID=tu-cloudfront-distribution-id

echo.
echo ⚙️  Configuración:
echo Bucket: %BUCKET_NAME%
echo Distribution: %DISTRIBUTION_ID%
echo.

REM 1. Subir archivos CSS y JS con cache largo
echo 📁 Subiendo archivos CSS/JS con cache largo...
aws s3 sync dist/assets/ s3://%BUCKET_NAME%/assets/ ^
  --cache-control "public, max-age=31536000, immutable" ^
  --content-encoding gzip ^
  --delete ^
  --exclude "*" ^
  --include "*.css" ^
  --include "*.js"

if %errorlevel% neq 0 (
    echo ❌ Error subiendo archivos CSS/JS
    exit /b 1
)

REM 2. Subir index.html sin cache
echo 📄 Subiendo index.html sin cache...
aws s3 cp dist/index.html s3://%BUCKET_NAME%/index.html ^
  --cache-control "no-cache, no-store, must-revalidate" ^
  --content-type "text/html; charset=utf-8"

if %errorlevel% neq 0 (
    echo ❌ Error subiendo index.html
    exit /b 1
)

REM 3. Subir otros archivos
echo 📦 Subiendo archivos restantes...
aws s3 sync dist/ s3://%BUCKET_NAME%/ ^
  --exclude "index.html" ^
  --exclude "assets/*" ^
  --cache-control "public, max-age=86400"

if %errorlevel% neq 0 (
    echo ❌ Error subiendo archivos restantes
    exit /b 1
)

REM 4. Invalidar cache de CloudFront
echo 🔄 Invalidando cache de CloudFront...
aws cloudfront create-invalidation ^
  --distribution-id %DISTRIBUTION_ID% ^
  --paths "/*"

if %errorlevel% neq 0 (
    echo ❌ Error invalidando cache
    exit /b 1
)

echo.
echo ✅ Deploy completado exitosamente!
echo.
echo 📋 Próximos pasos:
echo 1. Espera 2-3 minutos para la invalidación
echo 2. Abre tu sitio web de CloudFront
echo 3. Verifica en Console que aparezca: "🚀 GA4 initializing"
echo 4. Comprueba Google Analytics Realtime
echo.
pause