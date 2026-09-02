import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Factory, Banknote, Truck, Activity, PackageCheck, 
  ShieldCheck, ArrowDownToLine, Clock, CheckCircle2 
} from 'lucide-react';

// Mock Data Logistik Masuk (Inbound)
const inboundLogistics = [
  { id: 'TRX-9921', vendor: 'PT Lintas Trans Mandiri', armada: 'Truk Fuso (8 Ton)', muatan: 'Jagung Pipil Kuning', eta: 'Hari ini, 16:30 WITA', status: 'Dalam Perjalanan', progress: 65 },
  { id: 'TRX-9880', vendor: 'Agro Express', armada: 'Truk Tronton (15 Ton)', muatan: 'Gabah Kering Panen', eta: 'Tiba di Gerbang', status: 'Menunggu Bongkar', progress: 100 },
];

export default function PabrikDashboard() {
  const [activeTab, setActiveTab] = useState('kontrak');
  
  // State untuk Data API Escrow
  const [kontrakList, setKontrakList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi Mengambil Data Kontrak
  const fetchKontrak = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/escrow`, {
        withCredentials: true
      });
      setKontrakList(res.data);
    } catch (error) {
      toast.error('Gagal mengambil data kontrak escrow.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKontrak();
  }, []);

  // Fungsi Eksekusi Setor DP
  const handlePayDp = async (id) => {
    const tid = toast.loading('Memproses pembayaran Virtual Account...');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/escrow/${id}/pay-dp`, {}, { 
        withCredentials: true 
      });
      toast.success('DP berhasil dikunci di Escrow!', { id: tid });
      fetchKontrak(); // Refresh data setelah sukses
    } catch (err) { 
      toast.error(err.response?.data?.pesan || 'Gagal memproses DP', { id: tid }); 
    }
  };

  return (
    <div className="flex flex-col font-sans animate-fade-in pb-10 min-h-screen w-full bg-slate-50/50">
      
      {/* HEADER STICKY */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-4 text-indigo-900 mb-5">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Factory size={28} />
            </div>
            <div>
               <h1 className="font-black text-xl md:text-2xl leading-tight">
                 Dashboard Offtaker (Pabrik)
               </h1>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                 <ShieldCheck size={14} className="text-emerald-500"/> PT Agro Pangan Nusantara
               </p>
            </div>
          </div>

          {/* TAB NAVIGASI */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl w-full sm:max-w-2xl overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('kontrak')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'kontrak' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Banknote size={16} /> Pembayaran & Kontrak
            </button>
            <button 
              onClick={() => setActiveTab('inbound')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'inbound' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Truck size={16} /> Inbound Logistik
            </button>
            <button 
              onClick={() => setActiveTab('inventori')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'inventori' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Activity size={16} /> Kapasitas Silo
            </button>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1">
        
        {/* TAB 1: KONTROK & DP (Terintegrasi API) */}
        {activeTab === 'kontrak' && (
          <div className="animate-fade-in">
            <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
               <div className="bg-indigo-600 text-white p-1.5 rounded-full mt-0.5 shrink-0">
                 <ArrowDownToLine size={14} />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-indigo-900">Tugas Anda: Amankan Pasokan</h4>
                 <p className="text-xs text-indigo-700 mt-1">
                   Segera bayar Down Payment (DP) pada kontrak yang telah diverifikasi oleh KUD untuk memastikan alokasi hasil panen masuk ke pabrik Anda.
                 </p>
               </div>
            </div>

            {/* List Kontrak dari API */}
            <div className="grid gap-4">
              {isLoading ? (
                <div className="py-12 text-center text-indigo-500 font-bold animate-pulse">
                  Memuat data kontrak dari server...
                </div>
              ) : kontrakList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold bg-white rounded-3xl border border-dashed border-gray-300">
                  Belum ada penawaran agregasi dari KUD saat ini.
                </div>
              ) : (
                kontrakList.map((item) => (
                  <div key={item._id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-indigo-300 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                          item.status === 'verifikasi_lahan' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          item.status === 'pending' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                          'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900">{item.komoditas} - {item.tonase} Ton</h3>
                      <p className="text-sm font-bold text-gray-500 mt-2">
                        Petani: <span className="text-indigo-600">{item.petani_id?.nama || 'Anonim'}</span>
                      </p>
                      <p className="text-sm font-bold text-gray-500 mt-1">
                        Nilai Kontrak: <span className="text-emerald-600">Rp {item.nilai_kontrak?.toLocaleString('id-ID')}</span>
                      </p>
                    </div>

                    <div className="w-full md:w-auto shrink-0 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
                      {item.status === 'verifikasi_lahan' ? (
                        <button 
                          onClick={() => handlePayDp(item._id)}
                          className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2"
                        >
                          <Banknote size={18} /> Setor DP Escrow (VA)
                        </button>
                      ) : item.status === 'pending' ? (
                        <div className="w-full md:w-auto flex items-center justify-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 px-6 py-3.5 rounded-xl border border-slate-200">
                          <Clock size={18}/> Menunggu KUD
                        </div>
                      ) : (
                        <div className="w-full md:w-auto flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-6 py-3.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 size={18} /> DP Terkunci
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INBOUND LOGISTIK */}
        {activeTab === 'inbound' && (
          <div className="animate-fade-in flex flex-col gap-5">
            <h2 className="text-lg font-black text-gray-800 mb-2">Pantauan Kedatangan Truk</h2>
            
            {inboundLogistics.map((truk) => (
              <div key={truk.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-300 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      {truk.id}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border flex items-center gap-1 
                      ${truk.status === 'Menunggu Bongkar' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {truk.status === 'Menunggu Bongkar' ? <PackageCheck size={12}/> : <Clock size={12}/>} {truk.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{truk.muatan}</h3>
                  <p className="text-sm font-bold text-gray-500 mt-1 flex items-center gap-1.5">
                    <Truck size={16} className="text-indigo-400"/> {truk.vendor} • {truk.armada}
                  </p>
                </div>

                <div className="flex-1 w-full md:max-w-xs">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-500">Progres Perjalanan</span>
                    <span className="text-indigo-600">{truk.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${truk.progress}%` }}></div>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">
                    ETA: {truk.eta}
                  </p>
                </div>

                {truk.status === 'Menunggu Bongkar' && (
                  <button className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap">
                    Konfirmasi Bongkar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: INVENTORI */}
        {activeTab === 'inventori' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 border-8 border-indigo-600 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 80%)' }}></div>
                  <div className="text-2xl font-black text-gray-800">80%</div>
                </div>
                <h3 className="font-bold text-lg text-gray-900">Silo A - Jagung</h3>
                <p className="text-sm text-gray-500 mt-1">4.000 / 5.000 Ton Terisi</p>
             </div>
             
             <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 rounded-full border-8 border-emerald-100 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 border-8 border-emerald-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }}></div>
                  <div className="text-2xl font-black text-gray-800">45%</div>
                </div>
                <h3 className="font-bold text-lg text-gray-900">Silo B - Gabah</h3>
                <p className="text-sm text-gray-500 mt-1">2.250 / 5.000 Ton Terisi</p>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}