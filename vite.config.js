import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// SSL configuration - only for production or when certificates exist
let httpsConfig = false;

// Check if we're in production and certificates exist
const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.VITE_USE_SSL === 'true';

if (isProduction && useSSL) {
  const certPath = process.env.VITE_SSL_CERT_PATH || '/etc/letsencrypt/live/dev.bestowalsystems.in/fullchain.pem';
  const keyPath = process.env.VITE_SSL_KEY_PATH || '/etc/letsencrypt/live/dev.bestowalsystems.in/privkey.pem';

  // Check if SSL certificates exist before trying to read them
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    httpsConfig = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      secureProtocol: 'TLS_method',
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA384'
      ].join(':'),
      honorCipherOrder: true
    };
    console.log('✅ SSL certificates loaded for Vite dev server');
  } else {
    console.warn('⚠️  SSL certificates not found, using HTTP for Vite dev server');
    console.warn(`Cert path: ${certPath}`);
    console.warn(`Key path: ${keyPath}`);
  }
} else {
  console.log('🔧 Running Vite dev server in HTTP mode');
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3004,
    host: true,
    // Only use HTTPS if certificates are available
    https: httpsConfig,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'localhost',
      'dev.bestowalsystems.in'
    ]
  },
  define: {
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})