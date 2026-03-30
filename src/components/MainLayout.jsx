import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, MessageSquare, ShieldAlert, LogOut, Menu, User } from 'lucide-react';

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Overlay Hitam untuk Mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      
      {/* SIDEBAR MENETAP */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="h-8" />
          <span className="text-xl font-extrabold text-primary tracking-tight">AgroCelebes</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => { navigate('/dashboard'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${isActive('/dashboard') ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => { navigate('/pasar-b2b'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${isActive('/pasar-b2b') ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Store size={20} /> Pasar B2B
          </button>
          <button onClick={() => { navigate('/ai-penyuluh'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition font-semibold ${isActive('/ai-penyuluh') ? 'bg-green-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}>
            <MessageSquare size={20} /> AI Penyuluh
          </button>
        </nav>

        {/* Tombol Control Panel di Bawah */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
           {user.role === 'admin' && (
            <button onClick={() => { navigate('/admin'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 p-3 mb-2 rounded-xl transition font-bold ${isActive('/admin') ? 'bg-red-100 text-red-700' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
              <ShieldAlert size={20} /> Control Panel
            </button>
          )}
        </div>
      </aside>

      {/* AREA KANAN (TOPBAR & KONTEN) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* TOPBAR MENETAP */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-primary transition">
              <Menu size={24} />
            </button>
            <h1 className="font-bold text-gray-800 text-lg hidden sm:block">
              {isActive('/dashboard') ? 'Dashboard Utama' : isActive('/pasar-b2b') ? 'Katalog B2B' : isActive('/ai-penyuluh') ? 'AI Penyuluh Pintar' : 'AgroCelebes'}
            </h1>
          </div>

          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:shadow-sm transition">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                {user.nama.charAt(0)}
              </div>
              <span className="text-sm font-semibold hidden md:block text-gray-700">{user.nama}</span>
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-50 text-xs text-gray-400 font-bold tracking-widest uppercase mb-1">Akun {user.role}</div>
                <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition">
                  <User size={16} /> Profil Saya
                </button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition">
                  <LogOut size={16} /> Keluar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* HALAMAN DINAMIS (Dashboard/Pasar/AI) AKAN MUNCUL DI TENGAH SINI */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          {children}
        </main>
      </div>
    </div>
  );
}