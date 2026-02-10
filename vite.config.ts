import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  preview: {
    host: true,
    port: 4173,
    allowedHosts: [
      '76.13.255.95',
      'admin.tradelinknetwork.co.uk',
      'localhost',
    ],
  },
})

