import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BellRing, CalendarCheck, AlertTriangle, CalendarClock, ChevronRight } from 'lucide-react';

export default function AgendaWidget() {
  const navigate = useNavigate();
  const [agenda, setAgenda] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/jurnal`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter hanya Tipe Jadwal yang BELUM selesai
        const jadwalList = res.data.filter(item => item.tipe === 'jadwal' && !item.status_selesai);

        if (jadwalList.length === 0) {
          setAgenda(null);
          setIsLoading(false);
          return;
        }

        // Algoritma Mencari Tanggal Terdekat
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const kalkulasiJadwal = jadwalList.map(j => {
          const targetDate = new Date(j.tanggal);
          targetDate.setHours(0, 0, 0, 0);
          const diffTime = targetDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { ...j, diffDays };
        }).sort((a, b) => a.diffDays - b.diffDays);

        // Ambil urutan pertama (yang harinya paling kecil / sudah minus)
        setAgenda(kalkulasiJadwal[0]);

      } catch (error) {
        console.error("Gagal memuat agenda", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgenda();
  }, []);

  if (isLoading) {
    return <div className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm w-full"></div>;
  }

  // Jika tidak ada agenda sama sekali
  if (!agenda) {
    return (
      <div onClick={() => navigate('/jurnal', { state: { activeTab: 'jadwal' } })} className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-green-100 transition shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full text-green-500 shadow-sm"><CalendarCheck size={20} /></div>
          <div>
            <p className="font-bold text-green-800 text-sm">Tidak ada agenda tertunda</p>
            <p className="text-xs text-green-600 font-medium">Lahan Anda aman. Klik untuk menambah jadwal baru.</p>
          </div>
        </div>
      </div>
    );
  }

  // DINAMIKA WARNA & STATUS BERDASARKAN HARI
  let statusText = '';
  let colorTheme = '';
  let IconBg = '';
  let IconComponent = CalendarClock;

  if (agenda.diffDays < 0) {
    statusText = `TERLEWAT H+${Math.abs(agenda.diffDays)}`;
    colorTheme = 'bg-red-50 border-red-200 hover:bg-red-100';
    IconBg = 'bg-red-500 text-white animate-pulse shadow-red-500/40';
    IconComponent = AlertTriangle;
  } else if (agenda.diffDays === 0) {
    statusText = 'HARI INI KEKEBUN!';
    colorTheme = 'bg-orange-50 border-orange-200 hover:bg-orange-100';
    IconBg = 'bg-orange-500 text-white animate-bounce shadow-orange-500/40';
    IconComponent = BellRing;
  } else if (agenda.diffDays === 1) {
    statusText = 'BESOK';
    colorTheme = 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
    IconBg = 'bg-yellow-400 text-white shadow-yellow-400/40';
    IconComponent = BellRing;
  } else {
    statusText = `H-${agenda.diffDays}`;
    colorTheme = 'bg-blue-50 border-blue-100 hover:bg-blue-100';
    IconBg = 'bg-blue-500 text-white shadow-blue-500/40';
  }

  return (
    <div onClick={() => navigate('/jurnal', { state: { activeTab: 'jadwal' } })} className={`${colorTheme} p-4 rounded-2xl flex ...`}>
      <div className="flex items-center gap-3 md:gap-4 w-full">
        
        <div className={`p-2.5 rounded-xl shadow-lg flex-shrink-0 ${IconBg}`}>
          <IconComponent size={22} />
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-80">
              Notifikasi Jadwal Tani
            </span>
            <span className="font-extrabold text-gray-800 text-sm md:text-base line-clamp-1">
              {agenda.deskripsi}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mt-1 md:mt-0">
             <span className="text-xs font-black bg-white/60 px-3 py-1 rounded-lg border border-white/40 shadow-sm text-gray-800">
               {statusText}
             </span>
             <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform hidden sm:block" />
          </div>
        </div>

      </div>
    </div>
  );
}