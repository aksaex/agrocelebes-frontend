import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // AJAIB: Ini yang memastikan Service Worker terdaftar otomatis
      includeAssets: ['logo.png', 'sawah.png', 'aksa.png'], // File yang didownload diam-diam untuk offline
      manifest: {
        name: 'AgroCelebes',
        short_name: 'AgroCelebes',
        description: 'Platform Ekosistem Pertanian Digital Terintegrasi',
        theme_color: '#16a34a', // Warna Hijau Primary Anda
        background_color: '#ffffff',
        display: 'standalone', // AJAIB: Ini yang menghilangkan Chrome dan membuatnya full screen!
        icons: [
          {
            src: '/logo.png', // Pastikan gambar logo.png ada di folder public/
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // MESIN OFFLINE: Menyimpan semua kode web ke memori HP
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        
        runtimeCaching: [
          // Strategi Offline untuk Data API Backend (Pasar B2B)
          {
            urlPattern: /^https:\/\/agrocelebes-backend\.vercel\.app\/api\/.*/i,
            handler: 'NetworkFirst', // Coba ambil dari internet dulu. Kalau di sawah tidak ada sinyal, pakai data simpanan (cache) lama.
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // Simpan data pasar selama 7 hari
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});