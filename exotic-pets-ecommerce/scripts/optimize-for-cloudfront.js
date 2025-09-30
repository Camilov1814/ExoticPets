#!/usr/bin/env node

/**
 * Script de optimización para CloudFront
 * Ejecutar después de npm run build
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

console.log('🚀 Optimizando archivos para CloudFront...');

// 1. Agregar headers de cache correctos al HTML
const addCacheHeaders = () => {
  const htmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Agregar meta tags para optimización
    const metaTags = `
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <meta name="robots" content="index, follow" />
    `;
    
    html = html.replace('<meta name="description"', metaTags + '    <meta name="description"');
    fs.writeFileSync(htmlPath, html);
    console.log('✅ Headers de cache agregados al HTML');
  }
};

// 2. Crear archivo de configuración para S3
const createS3Config = () => {
  const s3Config = {
    "cloudfront_optimization": {
      "html_files": {
        "cache_control": "no-cache, no-store, must-revalidate",
        "content_type": "text/html; charset=utf-8"
      },
      "js_files": {
        "cache_control": "public, max-age=31536000, immutable",
        "content_type": "application/javascript; charset=utf-8"
      },
      "css_files": {
        "cache_control": "public, max-age=31536000, immutable",
        "content_type": "text/css; charset=utf-8"
      }
    },
    "google_analytics": {
      "measurement_id": "G-4B5XF8H7H3",
      "deployment": "cloudfront",
      "debug_mode": false
    }
  };
  
  fs.writeFileSync(
    path.join(distDir, 'cloudfront-config.json'), 
    JSON.stringify(s3Config, null, 2)
  );
  console.log('✅ Configuración de S3/CloudFront creada');
};

// 3. Generar reporte de archivos
const generateFileReport = () => {
  const getAllFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        const stats = fs.statSync(filePath);
        const relativePath = path.relative(distDir, filePath);
        fileList.push({
          name: file.name,
          path: relativePath,
          size: stats.size,
          extension: path.extname(file.name),
          critical: ['index.html', 'favicon.ico'].includes(file.name)
        });
      }
    });
    return fileList;
  };

  const allFiles = getAllFiles(distDir);
  const report = {
    timestamp: new Date().toISOString(),
    files: allFiles,
    analytics_setup: true
  };
  
  // Verificar archivos CSS y JS (incluyendo subdirectorios)
  const hasCSS = allFiles.some(f => f.extension === '.css');
  const hasJS = allFiles.some(f => f.extension === '.js');
  const hasHTML = allFiles.some(f => f.name === 'index.html');
  
  console.log('\n📊 Reporte de Build:');
  console.log(`HTML: ${hasHTML ? '✅' : '❌'}`);
  console.log(`CSS: ${hasCSS ? '✅' : '❌'} (${allFiles.filter(f => f.extension === '.css').length} archivos)`);
  console.log(`JS: ${hasJS ? '✅' : '❌'} (${allFiles.filter(f => f.extension === '.js').length} archivos)`);
  console.log(`Total archivos: ${allFiles.length}`);
  
  // Mostrar detalles de archivos principales
  const cssFiles = allFiles.filter(f => f.extension === '.css');
  const jsFiles = allFiles.filter(f => f.extension === '.js');
  
  if (cssFiles.length > 0) {
    console.log('📁 Archivos CSS:', cssFiles.map(f => f.path).join(', '));
  }
  if (jsFiles.length > 0) {
    console.log('📁 Archivos JS:', jsFiles.map(f => f.path).join(', '));
  }
  
  fs.writeFileSync(
    path.join(distDir, 'build-report.json'), 
    JSON.stringify(report, null, 2)
  );
  
  return { hasHTML, hasCSS, hasJS };
};

// 4. Verificar Google Analytics setup
const verifyAnalyticsSetup = () => {
  const htmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    const hasGtagScript = html.includes('googletagmanager.com/gtag/js');
    const hasGtagConfig = html.includes('gtag(\'config\',');
    const hasMeasurementId = html.includes('G-4B5XF8H7H3');
    
    console.log('\n📈 Google Analytics Setup:');
    console.log(`Script Tag: ${hasGtagScript ? '✅' : '❌'}`);
    console.log(`Config: ${hasGtagConfig ? '✅' : '❌'}`);
    console.log(`Measurement ID: ${hasMeasurementId ? '✅' : '❌'}`);
    
    return hasGtagScript && hasGtagConfig && hasMeasurementId;
  }
  return false;
};

// Ejecutar optimizaciones
const main = () => {
  try {
    if (!fs.existsSync(distDir)) {
      console.error('❌ Directorio dist/ no existe. Ejecuta npm run build primero.');
      process.exit(1);
    }
    
    addCacheHeaders();
    createS3Config();
    const { hasHTML, hasCSS, hasJS } = generateFileReport();
    const analyticsOK = verifyAnalyticsSetup();
    
    console.log('\n🎉 Optimización completa!');
    console.log('\n📋 Instrucciones para S3:');
    console.log('1. Sube todos los archivos de dist/ a tu bucket S3');
    console.log('2. Configura index.html con Cache-Control: no-cache');
    console.log('3. Configura archivos CSS/JS con Cache-Control: max-age=31536000');
    console.log('4. Invalida el cache de CloudFront después del deploy');
    
    if (!analyticsOK) {
      console.warn('\n⚠️ ADVERTENCIA: Configuración de Google Analytics incompleta');
    }
    
    if (!hasCSS || !hasJS) {
      console.warn('\n⚠️ ADVERTENCIA: Archivos CSS o JS faltantes - revisa tu build');
    }
    
  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    process.exit(1);
  }
};

main();