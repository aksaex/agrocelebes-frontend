import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// === BARIS AJAIB: MENGHIDUPKAN MESIN PWA ===
import { registerSW } from 'virtual:pwa-register'

// Nyalakan Service Worker dan otomatis update jika ada kode baru
const updateSW = registerSW({
  onNeedRefresh() {
    // Opsional: Bisa tampilkan toast "Ada update baru, refresh halaman!"
    console.log("PWA Update Ready!");
  },
  onOfflineReady() {
    console.log("PWA Ready to work offline!");
  },
})
// ===========================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)