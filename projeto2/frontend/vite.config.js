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
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
    allowedHosts: ['insta2.gestaoti.cloud']
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:5000/api')
  }
}) 