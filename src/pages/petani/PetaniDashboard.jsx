import AgendaWidget from '../../components/AgendaWidget';
import WeatherWidget from '../../components/WeatherWidget';
import StoreStatsWidget from '../../components/StoreStatsWidget';
import PriceWidget from '../../components/PriceWidget';
import { TrendingUp, CalendarDays } from 'lucide-react';

export default function PetaniDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in w-full max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* 1. NOTIFIKASI AGENDA TERDEKAT */}
      <AgendaWidget />

      {/* 2. HEADER TANGGAL */}
      <div className="flex justify-between items-center bg-white px-5 py-3.5 rounded-3xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-2 font-black text-gray-800 text-base sm:text-lg tracking-tight">
            <TrendingUp size={22} className="text-primary" />
         </div>
         <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <CalendarDays size={16} className="text-primary" />
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
         </div>
      </div>

      {/* 3. PRAKIRAAN CUACA */}
      <WeatherWidget />

      {/* 4. INDEKS HARGA PASAR B2B */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">Indeks Harga Pasar B2B</h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded-md">Live Data</span>
        </div>
        <div className="p-4">
          <PriceWidget />
        </div>
      </div>

      {/* 5. ETALASE SAYA (Statistik Toko Petani) */}
      <StoreStatsWidget />

    </div>
  );
}