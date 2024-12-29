import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://webte1.fei.stuba.sk/~xbednarikm3/final/",
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    includeAssets: ['favicon_io/*'],
    manifest: {
      name: 'FEI Jump',
      short_name: 'FEI Jump',
      description: 'Záverečné zadanie na predmet Webové Technológie 1 - Matúš Bednařík, Cyril Beňačka',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      orientation: 'portrait',
      icons: [
        {
          src: 'favicon_io/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png'
        },
        {
          src: 'favicon_io/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png'
        },
        {
          src: 'favicon_io/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'favicon_io/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'favicon_io/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png'
        },
        {
          src: 'favicon_io/apple-touch-icon-167x167.png',
          sizes: '167x167',
          type: 'image/png'
        },
        {
          src: 'favicon_io/apple-touch-icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        }
      ]
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})