// vite.config.mjs
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

export default defineConfig({
  plugins: [createVuePlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    cors: false,
    strictPort: true,
  },
})
