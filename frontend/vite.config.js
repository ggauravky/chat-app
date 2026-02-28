import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — largest, change least often
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-zustand': ['zustand'],
          // Socket.IO client
          'vendor-socket': ['socket.io-client'],
          // Emoji picker (heaviest single package)
          'vendor-emoji': ['emoji-picker-react'],
          // Icon library
          'vendor-icons': ['lucide-react'],
          // Date utilities
          'vendor-date': ['date-fns'],
        },
      },
    },
    // Silence warning; our chunks are now split
    chunkSizeWarningLimit: 600,
  },
})
