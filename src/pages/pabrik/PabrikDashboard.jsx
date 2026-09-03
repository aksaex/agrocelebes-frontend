import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Factory, Banknote, Truck, Activity, PackageCheck, 
  ShieldCheck, ArrowDownToLine, Clock, CheckCircle2,
  Gavel, Package, TrendingUp, CheckCircle
} from 'lucide-react';

// Mock Data Logistik Masuk (Inbound) untuk Keperluan Demo
const inboundLogistics = [
  { id: 'TRX-9921', vendor: 'PT Lintas Trans Mandiri', armada: 'Truk Fuso (8 Ton)', muatan: 'Jagung Pipil Kuning', eta: 'Hari ini, 16:30 WITA', status: 'Dalam Perjalanan', progress: 65 },
  { id: 'TRX-9880', vendor: 'Agro Express', armada: 'Truk Tronton (15 Ton)', muatan: 'Gabah Kering Panen', eta: 'Tiba di Gerbang', status: 'Menunggu Bongkar', progress: 100 },
];

export default function PabrikDashboard() {
  const [activeTab, setActiveTab] = useState('bursa');
  
  // State untuk API Bursa Lelang (Menggantikan Escrow Lama)
  const [bursaLelang, setBursaLelang] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ id: null, harga: '' });

  const getAuthConfig = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('token_agrocelebes');
    return {
      withCredentials: true,
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    };
  };

  // Fungsi Mengambil Data Lelang Agregasi KUD
  const fetchLelang = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/lelang`, getAuthConfig());
      setBursaLelang(res.data);
    } catch (error) {
      toast.error('Gagal mengambil data bursa lelang.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLelang();
  }, []);

  // Fungsi Eksekusi Penawaran Harga (Bidding)
  const handleKirimTawaran = async (e, lelangId) => {
    e.preventDefault();
    if (!bidForm.harga || bidForm.harga < 5000000) {
      toast.error('Harga penawaran minimal Rp 5.000.000 / Ton');
      return;
    }

    const tid = toast.loading('Mengirim penawaran harga...');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/lelang/${lelangId}/bid`, { 
        harga_per_ton: Number(bidForm.harga) 
      }, getAuthConfig());
      
      toast.success('Penawaran berhasil masuk ke sistem KUD!', { id: tid });
      setBidForm({ id: null, harga: '' });
      fetchLelang(); // Refresh data setelah sukses bid
    } catch (error) {
      toast.error('Gagal mengirim penawaran.', { id: tid });
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
              onClick={() => setActiveTab('bursa')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'bursa' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Gavel size={16} /> Bursa Lelang KUD
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
        
        {/* TAB 1: BURSA LELANG B2B (REVISI DEEPSEEK) */}
        {activeTab === 'bursa' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KOLOM KIRI: DAFTAR LELANG */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                <TrendingUp size={16} /> Lelang Agregasi Terbuka
              </h2>
              
              {isLoading ? (
                <div className="py-12 text-center text-indigo-500 font-bold animate-pulse">
                  Memuat data bursa lelang...
                </div>
              ) : bursaLelang.length === 0 ? (
                <div className="py-12 text-center text-gray-400 font-bold bg-white rounded-3xl border border-dashed border-gray-300">
                  <Package size={48} className="mx-auto text-gray-300 mb-3" />
                  Belum ada agregasi panen dari KUD yang mencapai kuota industri.
                </div>
              ) : (
                bursaLelang.map((lelang) => (
                  <div key={lelang._id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-6 flex flex-col hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md">
                          Status: {lelang.status}
                        </span>
                        <h3 className="text-xl font-black text-gray-900 mt-3">{lelang.komoditas}</h3>
                        <p className="text-sm font-bold text-gray-500 mt-1">
                          Dari: <span className="text-indigo-600">KUD {lelang.kud_id?.nama_perusahaan || lelang.kud_id?.nama || 'Anonim'}</span>
                        </p>
                      </div>
                      <div className="text-right bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Terkumpul</p>
                        <p className="text-2xl font-black text-indigo-700">{lelang.tonase_terkumpul} <span className="text-sm">Ton</span></p>
                        <p className="text-[10px] text-indigo-500 mt-1 font-bold">Target Kuota: {lelang.tonase_target} Ton</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {bidForm.id === lelang._id ? (
                        <form onSubmit={(e) => handleKirimTawaran(e, lelang._id)} className="flex flex-col sm:flex-row items-end gap-3 bg-slate-50 p-4 rounded-2xl border border-gray-200">
                          <div className="flex-1 w-full">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block">Harga Penawaran / Ton (Rp)</label>
                            <input 
                              type="number" 
                              autoFocus
                              value={bidForm.harga}
                              onChange={(e) => setBidForm({ ...bidForm, harga: e.target.value })}
                              placeholder="Misal: 7200000" 
                              className="w-full p-3 bg-white border border-gray-300 rounded-xl font-bold text-gray-800 focus:outline-indigo-500"
                            />
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <button type="button" onClick={() => setBidForm({ id: null, harga: '' })} className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-100">
                              Batal
                            </button>
                            <button type="submit" className="flex-[2] px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2">
                              <CheckCircle size={18}/> Kirim Bid
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                          <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <Gavel size={14} className="text-indigo-500"/> {lelang.bids?.length || 0} Pabrik telah menawar
                          </p>
                          <button 
                            onClick={() => setBidForm({ id: lelang._id, harga: '' })}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
                          >
                            Ikut Penawaran (Bid)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* KOLOM KANAN: PANEL EDUKASI / SIMULASI */}
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-indigo-900 to-blue-900 p-6 rounded-3xl text-white shadow-md">
                 <h3 className="font-black text-lg mb-2">Simulasi Reverse Auction</h3>
                 <p className="text-xs text-indigo-200 mb-4 leading-relaxed">
                   Sistem menggunakan metode B2B Bidding. KUD akan memilih penawaran harga beli tertinggi demi kesejahteraan petani.
                 </p>
                 <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                    <p className="text-[10px] uppercase tracking-widest text-indigo-300 mb-1">Ketentuan Escrow (DP)</p>
                    <p className="text-sm font-bold leading-relaxed">Pabrik diwajibkan menyetor Down Payment (DP) 30% dari total nilai kontrak setelah KUD menyetujui tawaran Anda.</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INBOUND LOGISTIK (TIDAK BERUBAH) */}
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

        {/* TAB 3: INVENTORI (TIDAK BERUBAH) */}
        {activeTab === 'inventori' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition">
                <div className="w-32 h-32 rounded-full border-8 border-indigo-100 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 border-8 border-indigo-600 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 80%)' }}></div>
                  <div className="text-2xl font-black text-gray-800">80%</div>
                </div>
                <h3 className="font-bold text-lg text-gray-900">Silo A - Jagung</h3>
                <p className="text-sm text-gray-500 mt-1">4.000 / 5.000 Ton Terisi</p>
             </div>
             
             <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition">
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