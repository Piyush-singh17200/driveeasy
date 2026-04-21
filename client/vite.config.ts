import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [
      'all',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      'undercook-octagon-linked.ngrok-free.dev',
      'localhost',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      },
    },
  },
})