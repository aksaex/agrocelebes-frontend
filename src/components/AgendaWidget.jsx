import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BellRing, CalendarCheck, AlertTriangle, CalendarClock } from 'lucide-react';

export default function AgendaWidget() {
  const navigate = useNavigate();
  const [agenda, setAgenda] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/jurnal`);
        const jadwalList = res.data.filter(item => item.tipe === 'jadwal' && !item.status_selesai);

        if (jadwalList.length === 0) {
          setAgenda(null);
          setIsLoading(false);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const kalkulasiJadwal = jadwalList.map(j => {
          const targetDate = new Date(j.tanggal);
          targetDate.setHours(0, 0, 0, 0);
          const diffTime = targetDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { ...j, diffDays };
        }).sort((a, b) => a.diffDays - b.diffDays);

        setAgenda(kalkulasiJadwal[0]);
      } catch (error) {
        console.error("Gagal memuat agenda", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgenda();
  }, []);

  // 1. STATE LOADING (Pipih)
  if (isLoading) {
    return <div className="h-16 sm:h-20 bg-gray-100 rounded-2xl animate-pulse border border-gray-200 w-full"></div>;
  }

  // 2. STATE KOSONG (Kompak & Elegan)
  if (!agenda) {
    return (
      <div onClick={() => navigate('/jurnal', { state: { activeTab: 'jadwal' } })} className="bg-green-50 border border-green-200 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-green-100 transition-all shadow-sm w-full group">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 sm:p-2.5 rounded-xl text-green-500 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
            <CalendarCheck size={20} className="sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-green-800 text-sm">Tidak ada agenda</p>
            <p className="text-[11px] sm:text-xs text-green-600 font-medium truncate">Lahan aman. Klik untuk menambah.</p>
          </div>
        </div>
      </div>
    );
  }

  // DINAMIKA WARNA & STATUS
  let statusText = '';
  let colorTheme = '';
  let IconBg = '';
  let IconComponent = CalendarClock;

  if (agenda.diffDays < 0) {
    statusText = `LEWAT H+${Math.abs(agenda.diffDays)}`;
    colorTheme = 'bg-red-50 border-red-200 hover:bg-red-100 text-red-800';
    IconBg = 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30';
    IconComponent = AlertTriangle;
  } else if (agenda.diffDays === 0) {
    statusText = 'HARI INI!';
    colorTheme = 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-800';
    IconBg = 'bg-orange-500 text-white animate-bounce shadow-md shadow-orange-500/30';
    IconComponent = BellRing;
  } else if (agenda.diffDays === 1) {
    statusText = 'BESOK';
    colorTheme = 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-800';
    IconBg = 'bg-yellow-400 text-white shadow-md shadow-yellow-400/30';
    IconComponent = BellRing;
  } else {
    statusText = `H-${agenda.diffDays}`;
    colorTheme = 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800';
    IconBg = 'bg-blue-500 text-white shadow-md shadow-blue-500/30';
  }

  return (
    <div onClick={() => navigate('/jurnal', { state: { activeTab: 'jadwal' } })} className={`${colorTheme} p-3 sm:p-4 rounded-2xl flex items-center gap-3 border cursor-pointer hover:-translate-y-0.5 transition-all shadow-sm w-full group`}>
      
      {/* ICON KIRI */}
      <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 group-hover:scale-105 transition-transform ${IconBg}`}>
        <IconComponent size={20} className="sm:w-5 sm:h-5" />
      </div>
      
      {/* KONTEN TENGAH (Teks & Judul) */}
      <div className="flex-1 min-w-0">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5 block">
          Agenda Terdekat
        </span>
        <span className="font-extrabold text-xs sm:text-sm md:text-base truncate block leading-tight">
          {agenda.deskripsi}
        </span>
      </div>

      {/* BADGE KANAN (Tidak makan tempat ke bawah) */}
      <div className="shrink-0 flex items-center">
         <span className="text-[10px] sm:text-xs font-black bg-white/90 px-2.5 py-1.5 rounded-lg border shadow-sm uppercase tracking-wide">
           {statusText}
         </span>
      </div>

    </div>
  );
}