import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api': "https://deepfake-detection-backend.fly.dev",
      // Change on Supabase deployment: https://deepfake-detection-kappa.vercel.app/dashboard
      '/api': "http://localhost:5000", // Use this for local development
    }
  },
})
