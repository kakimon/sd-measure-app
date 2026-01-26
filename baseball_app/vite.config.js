import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // ★ GitHub Pages 用 base
  base: '/sd-measure-app/',

  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',

      // ★ GitHub Pages 対応
      base: '/sd-measure-app/',
      scope: '/sd-measure-app/',

      manifest: {
        name: 'Baseball App',
        short_name: 'Baseball',

        // ★ 重要：start_url を base に合わせる
        start_url: '/sd-measure-app/',

        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1a73e8',

        icons: [
          {
            // ★ パスは base なし（Vite が自動解決）
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})