import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production build configuration
    target: 'es2020',
    minify: 'terser', // Better compression for production
    sourcemap: false, // Remove sourcemaps for production
    rollupOptions: {
      output: {
        // Standard file naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Simpler chunking strategy
        manualChunks: {
          vendor: ['react', 'react-dom'],
          analytics: ['./src/utils/analytics.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Production limit
  },
  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true // Auto-open browser on startup
  },
  // Standard base path for localhost
  base: '/',
})
