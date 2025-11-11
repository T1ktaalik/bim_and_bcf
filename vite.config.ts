import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    base: '/apps.nova-engineering.pro/promo_warehouse/',
  plugins: [vue(),  tailwindcss(),],
  define: {
    // Make environment variables available
    __VITE_BASE_URL__: JSON.stringify(process.env.VITE_BASE_URL || '/'),
    __VITE_BCF_URL__: JSON.stringify(process.env.VITE_BCF_URL || '/bcf')
  }
})

