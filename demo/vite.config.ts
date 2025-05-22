import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import piniaHMR from 'vite-pinia-hmr-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), piniaHMR()],
})
