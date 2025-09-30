# 🚀 Script de Deploy para S3 + CloudFront
param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName,
    
    [Parameter(Mandatory=$true)]
    [string]$DistributionId
)

Write-Host "🚀 Desplegando a S3 con headers optimizados..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚙️  Configuración:" -ForegroundColor Yellow
Write-Host "Bucket: $BucketName" -ForegroundColor White
Write-Host "Distribution: $DistributionId" -ForegroundColor White
Write-Host ""

try {
    # 1. Verificar que AWS CLI está configurado
    $awsCheck = aws sts get-caller-identity 2>$null
    if (-not $awsCheck) {
        throw "AWS CLI no está configurado. Ejecuta: aws configure"
    }
    
    # 2. Verificar que el directorio dist existe
    if (-not (Test-Path "dist")) {
        throw "Directorio dist/ no existe. Ejecuta: npm run build:cloudfront"
    }
    
    # 3. Subir archivos CSS y JS con cache largo
    Write-Host "📁 Subiendo archivos CSS/JS con cache largo..." -ForegroundColor Green
    
    $cssJsFiles = Get-ChildItem -Path "dist/assets" -Include "*.css", "*.js" -Recurse
    foreach ($file in $cssJsFiles) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\dist\", "").Replace("\", "/")
        $s3Key = $relativePath
        
        $contentType = if ($file.Extension -eq ".css") { "text/css; charset=utf-8" } else { "application/javascript; charset=utf-8" }
        
        aws s3 cp $file.FullName "s3://$BucketName/$s3Key" `
            --cache-control "public, max-age=31536000, immutable" `
            --content-type $contentType
            
        if ($LASTEXITCODE -ne 0) {
            throw "Error subiendo $($file.Name)"
        }
        Write-Host "   ✅ $($file.Name)" -ForegroundColor Gray
    }
    
    # 4. Subir index.html sin cache
    Write-Host "📄 Subiendo index.html sin cache..." -ForegroundColor Green
    aws s3 cp "dist/index.html" "s3://$BucketName/index.html" `
        --cache-control "no-cache, no-store, must-revalidate" `
        --content-type "text/html; charset=utf-8"
        
    if ($LASTEXITCODE -ne 0) {
        throw "Error subiendo index.html"
    }
    
    # 5. Subir otros archivos (imágenes, iconos, etc.)
    Write-Host "📦 Subiendo archivos restantes..." -ForegroundColor Green
    $otherFiles = Get-ChildItem -Path "dist" -Exclude "index.html", "assets" -Recurse -File
    foreach ($file in $otherFiles) {
        $relativePath = $file.FullName.Replace((Get-Location).Path + "\dist\", "").Replace("\", "/")
        aws s3 cp $file.FullName "s3://$BucketName/$relativePath" `
            --cache-control "public, max-age=86400"
    }
    
    # 6. Invalidar cache de CloudFront
    Write-Host "🔄 Invalidando cache de CloudFront..." -ForegroundColor Green
    $invalidation = aws cloudfront create-invalidation `
        --distribution-id $DistributionId `
        --paths "/*" `
        --output json | ConvertFrom-Json
        
    if ($LASTEXITCODE -ne 0) {
        throw "Error invalidando cache"
    }
    
    Write-Host ""
    Write-Host "✅ Deploy completado exitosamente!" -ForegroundColor Green
    Write-Host "🆔 Invalidation ID: $($invalidation.Invalidation.Id)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Espera 2-3 minutos para la invalidación" -ForegroundColor White
    Write-Host "2. Abre tu sitio web de CloudFront" -ForegroundColor White
    Write-Host "3. Verifica en Console: '🚀 GA4 initializing'" -ForegroundColor White
    Write-Host "4. Comprueba Google Analytics Realtime" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}