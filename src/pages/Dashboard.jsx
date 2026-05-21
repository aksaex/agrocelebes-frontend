import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import WeatherWidget from '../components/WeatherWidget';
import PriceWidget from '../components/PriceWidget';
import AgendaWidget from '../components/AgendaWidget';
import StoreStatsWidget from '../components/StoreStatsWidget'; // <--- IMPORT WIDGET BARU

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 bg-gray-50/50 flex flex-col items-center min-h-[calc(100vh-80px)]">
      
      {/* 1. KOTAK AGENDA TERDEKAT (REAL-TIME NOTIFICATION BANNER) */}
      {(user.role === 'petani' || user.role === 'admin') && (
        <div className="w-full max-w-5xl mb-6 animate-fade-in mt-2 sm:mt-4">
          <AgendaWidget />
        </div>
      )}

      {/* 2. GRID WIDGET UTAMA (MENGGUNAKAN 3 KOLOM SEKARANG) */}
      {/* Di HP: 1 baris ke bawah. Di Tablet: 2 baris. Di Laptop: 3 sejajar. */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        
        {/* Kolom 1: Cuaca BMKG */}
        <div className="w-full">
           <WeatherWidget />
        </div>
        
        {/* Kolom 2: Indeks Harga Pasar */}
        <div className="w-full">
           <PriceWidget />
        </div>

        {/* Kolom 3: Statistik Etalase Pribadi */}
        {/* Hanya muncul untuk petani/admin, pembeli tidak punya etalase */}
        {(user.role === 'petani' || user.role === 'admin') && (
          <div className="w-full md:col-span-2 lg:col-span-1">
             <StoreStatsWidget />
          </div>
        )}

      </div>

      {/* Footer Minimalis */}
      <div className="mt-auto pt-10 pb-4 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
         <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">AgroCelebes Control Panel</p>
         <div className="w-8 h-1 bg-primary/20 rounded-full mx-auto mt-2"></div>
      </div>

    </div>
  );
}