import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/sd-measure-app/',
  build: {
    outDir: '../docs',
    emptyOutDir: true   // ★追加（重要）
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Baseball App',
        short_name: 'Baseball',
        start_url: '.',   // ★変更（PWA安定）
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a73e8',
        icons: [
          {
            src: '/sd-measure-app/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/sd-measure-app/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})