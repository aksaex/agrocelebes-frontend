import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// === BARIS AJAIB: MENGHIDUPKAN MESIN PWA ===
import { registerSW } from 'virtual:pwa-register'

// Langsung eksekusi fungsinya, JANGAN pakai const updateSW =
registerSW({
  onNeedRefresh() {
    console.log("PWA Update Ready!");
  },
  onOfflineReady() {
    console.log("PWA Ready to work offline!");
  },
});
// ===========================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)