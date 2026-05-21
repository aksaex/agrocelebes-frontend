import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'; 
import axios from 'axios'; // <-- 1. TAMBAHKAN IMPORT AXIOS

// =====================================================================
// KONFIGURASI GLOBAL AXIOS (WAJIB UNTUK KEAMANAN COOKIE)
// =====================================================================
// Baris ini memastikan setiap request axios (ke mana pun di dalam aplikasi)
// akan secara otomatis membawa HttpOnly Cookie yang berisi token JWT.
axios.defaults.withCredentials = true; 
// =====================================================================

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)