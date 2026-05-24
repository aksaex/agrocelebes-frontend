import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // <-- TAMBAHKAN IMPORT INI
import { 
  LayoutDashboard, 
  Store, 
  MessageSquare, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  User, 
  Calculator,
  BookOpen 
} from 'lucide-react';
import toast from 'react-hot-toast'; // <-- OPSIONAL: Untuk notifikasi logout

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  // ==========================================
  // PERBAIKAN: FUNGSI LOGOUT (MENGHAPUS COOKIE)
  // ==========================================
 const handleLogout = async () => {
    try {
        // Panggil endpoint logout di backend untuk menghancurkan HttpOnly Cookie
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
    } catch (error) {
        console.error("Gagal logout dari server", error);
    } finally {
        // Hapus data user di frontend
        localStorage.removeItem('user');
        // Arahkan ke halaman login
        window.location.href = '/login';
    }
};

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Overlay Hitam untuk Mobile saat Sidebar terbuka */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* =========================================
          SIDEBAR MENETAP (DESKTOP) / SLIDE (MOBILE)
          ========================================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <span className="text-xl font-extrabold text-primary tracking-tight">AgroCelebes</span>
        </div>
        
        {/* Navigasi Utama */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          {/* MENU UMUM */}
          <button 
            onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
              isActive('/dashboard') ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          
          <button 
            onClick={() => { navigate('/pasar-b2b'); setIsSidebarOpen(false); }} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
              isActive('/pasar-b2b') || isActive('/post-product') 
                ? 'bg-green-50 text-primary' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Store size={20} /> Pasar B2B
          </button>
          
          {/* MENU EKSKLUSIF (Petani & Admin) */}
          {(user.role === 'petani' || user.role === 'admin') && (
            <>
              <button 
                onClick={() => { navigate('/ai-penyuluh'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
                  isActive('/ai-penyuluh') ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={20} /> AI Penyuluh
              </button>

              <button 
                onClick={() => { navigate('/kalkulator'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
                  isActive('/kalkulator') ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calculator size={20} /> Kalkulator Cerdas
              </button>

              <button 
                onClick={() => { navigate('/jurnal'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
                  isActive('/jurnal') ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen size={20} /> Buku Tani Pintar
              </button>
            </>
          )}
        </nav>

        {/* Panel Bawah (Admin Control & User Info) */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
           {user.role === 'admin' && (
            <button 
              onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 p-3 mb-2 rounded-xl transition font-bold ${
                isActive('/admin') ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100'
              }`}
            >
              <ShieldAlert size={20} /> Control Panel
            </button>
          )}
        </div>
      </aside>

      {/* =========================================
          AREA KANAN (TOPBAR & KONTEN DINAMIS)
          ========================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOPBAR */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30 flex-shrink-0">
          
          <div className="flex items-center gap-4">
            {/* Tombol Hamburger (Mobile) */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden text-gray-500 hover:text-primary transition"
            >
              <Menu size={24} />
            </button>
            
            {/* Judul Halaman Dinamis */}
            <h1 className="font-bold text-gray-800 text-lg hidden sm:block">
              {isActive('/dashboard') ? (user.role === 'pembeli' ? 'Dashboard Pembeli' : 'Dashboard Utama')
                : isActive('/pasar-b2b') ? 'Katalog B2B' 
                : isActive('/post-product') ? 'Posting Komoditas'
                : isActive('/ai-penyuluh') ? 'AI Penyuluh Pintar' 
                : isActive('/kalkulator') ? 'Kalkulator Cerdas' 
                : isActive('/jurnal') ? 'Buku Tani Pintar' 
                : 'AgroCelebes'}
            </h1>
          </div>

          {/* Menu Profil Kanan Atas */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:shadow-sm transition"
            >
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                {user.nama.charAt(0)}
              </div>
              <span className="text-sm font-semibold hidden md:block text-gray-700 truncate max-w-[120px]">
                {user.nama}
              </span>
            </button>
            
            {/* Dropdown Profil */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-50 text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                  Akun {user.role}
                </div>
                
                <button 
                  onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} 
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition"
                >
                  <User size={16} /> Profil Saya
                </button>
                
                <button 
                  onClick={handleLogout} // <--- SEKARANG MEMANGGIL FUNGSI AXIOS
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* KONTEN HALAMAN DINAMIS */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {children}
        </main>

      </div>
    </div>
  );
}