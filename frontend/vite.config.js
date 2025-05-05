import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    allowedHosts: ['teste1.gestaoti.cloud', 'insta.gestaoti.cloud']
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
    'import.meta.env.VITE_API_REMOTE_URL': JSON.stringify('https://teste1.gestaoti.cloud/api')
  }
}) 