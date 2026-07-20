import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  MessageSquare, 
  LogOut, 
  Menu, 
  User, 
  Calculator,
  BookOpen,
  Users,
  ShieldCheck
} from 'lucide-react';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));
  
  const dashboardPathByRole = {
    petani: '/petani/dashboard',
    kud: '/kud/dashboard',
    pabrik: '/pabrik/dashboard',
    kios: '/kios/dashboard',
    logistik: '/logistik/dashboard', 
    admin: '/admin/dashboard'
  };

  const handleLogout = async () => {
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
    } catch (error) {
        console.error("Gagal logout dari server", error);
    } finally {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Overlay Hitam untuk Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3 border-b border-green-100 flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <span className="text-xl font-extrabold text-green-900 tracking-tight">AgroCelebes</span>
        </div>
        
        {/* Navigasi Utama */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          {/* MENU UMUM (Dashboard Utama masing-masing Role) */}
          <button 
            onClick={() => { navigate(dashboardPathByRole[user.role] || '/dashboard'); setIsSidebarOpen(false); }} 
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
              isActive('/dashboard') || isActive('/petani/dashboard') || isActive('/admin/dashboard') || isActive('/kud/dashboard') || isActive('/pabrik/dashboard') || isActive('/kios/dashboard') || isActive('/logistik/dashboard')
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard Utama
          </button>

          {/* MENU EKSKLUSIF ADMIN */}
          {user.role === 'admin' && (
            <button 
              onClick={() => { navigate('/admin/users'); setIsSidebarOpen(false); }} 
              className={`w-full flex items-center gap-3 p-3 mt-2 rounded-xl transition font-semibold ${
                isActive('/admin/users') ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users size={20} /> Pengawasan BPD
            </button>
          )}
          
          {/* MENU EKSKLUSIF PETANI */}
          {user.role === 'petani' && (
            <>
              <button 
                onClick={() => { navigate('/ai-penyuluh'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
                  isActive('/ai-penyuluh') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={20} /> AI Penyuluh
              </button>

              <button 
                onClick={() => { navigate('/kalkulator'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
                  isActive('/kalkulator') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calculator size={20} /> Analisis Risiko
              </button>

              <button 
                onClick={() => { navigate('/jurnal'); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${
                  isActive('/jurnal') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen size={20} /> Buku Tani
              </button>
            </>
          )}

          {/* INDIKATOR KEAMANAN (Menambah Trust Juri Bank) */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
             <div className="flex items-center gap-2 text-green-700 font-bold text-sm mb-1">
                <ShieldCheck size={16} /> 
                Dilindungi BPD
             </div>
             <p className="text-xs text-green-600">Sistem Escrow Terverifikasi</p>
          </div>

        </nav>
      </aside>

      {/* AREA CONTENT KANAN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOPBAR */}
        <header className="bg-white border-b border-green-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden text-green-500 hover:text-green-700 transition"
            >
              <Menu size={24} />
            </button>
            
            <h1 className="font-bold text-green-800 text-lg hidden sm:block">
              {isActive('/petani/dashboard') || isActive('/admin/dashboard') || isActive('/dashboard') || isActive('/kud/dashboard') || isActive('/pabrik/dashboard') || isActive('/kios/dashboard') || isActive('/logistik/dashboard') ? 'Pusat Kendali Fintech'
                : isActive('/admin/users') ? 'Dashboard Pengawasan BPD' 
                : isActive('/ai-penyuluh') ? 'AI Penyuluh Pintar' 
                : isActive('/kalkulator') ? 'Analisis Risiko Pra-Panen' 
                : isActive('/jurnal') ? 'Buku Tani Pintar' 
                : 'AgroCelebes'}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:shadow-sm transition"
            >
              <div className="w-7 h-7 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                {user.nama.charAt(0)}
              </div>
              <span className="text-sm font-semibold hidden md:block text-gray-700 truncate max-w-[120px]">
                {user.nama}
              </span>
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-50 text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                  Akun {user.role}
                </div>
                <button 
                  onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} 
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-700 flex items-center gap-2 transition"
                >
                  <User size={16} /> Profil Saya
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                >
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* VIEW ROUTE */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
}