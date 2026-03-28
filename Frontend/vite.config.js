import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party deps so the initial app chunk stays smaller and cacheable.
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react-core'
          if (id.includes('react-query') || id.includes('@tanstack')) return 'vendor-react-query'
          if (id.includes('redux') || id.includes('react-redux')) return 'vendor-redux'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('micromark') || id.includes('unified')) return 'vendor-markdown'
          if (id.includes('axios')) return 'vendor-network'
          if (id.includes('date-fns')) return 'vendor-date'
          if (id.includes('lucide-react')) return 'vendor-icons'

          return 'vendor-misc'
        },
      },
    },
  },
})