import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite is enough for this project: the checker is entirely client-side and
// there are no environment variables or server routes to configure.
export default defineConfig({
  // Relative asset paths keep the same build usable at the domain root
  // (Vercel) and under a project subpath (GitHub Pages).
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
