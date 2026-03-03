import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // <--- YOU NEED THIS LINE
  server: {
    proxy: {
      '/api': 'http://localhost:5000', 
    },
    watch: {
      usePolling: true, // Recommended for WSL 2
    },
  },
})