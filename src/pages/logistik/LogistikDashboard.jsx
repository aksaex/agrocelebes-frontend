import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Truck, MapPin, Package, CheckCircle2, Clock, Gavel, ShieldCheck, History, ArrowRight } from 'lucide-react';

// Simulasi data lelang yang dilempar dari KUD
const bursaLelang = [
  { id: 'TRX-9921', komoditas: 'Jagung Pipil Kuning', tonase: 15, asal: 'KUD Mekar, Sulsel', tujuan: 'Pabrik Pakan Tbk, Makassar', batasWaktu: 'Hari ini, 15:00 WITA' },
  { id: 'TRX-9922', komoditas: 'Gabah Kering Panen', tonase: 8, asal: 'KUD Subur, Sulsel', tujuan: 'Gudang Bulog, Parepare', batasWaktu: 'Besok, 10:00 WITA' }
];

export default function LogistikDashboard() {
  const [activeTab, setActiveTab] = useState('bursa');
  const [tersedia, setTersedia] = useState(bursaLelang);
  const [tawaranSaya, setTawaranSaya] = useState([]);

  // State untuk input form bidding (sementara)
  const [bidForm, setBidForm] = useState({ id: null, harga: '', armada: 'Truk Fuso (8 Ton)' });

  const handleBidding = (e, job) => {
    e.preventDefault();
    if (!bidForm.harga) {
      toast.error('Masukkan harga penawaran terlebih dahulu!');
      return;
    }

    // 1. Pindahkan dari Bursa ke Tawaran Saya
    const tawaranBaru = {
      ...job,
      hargaDiajukan: bidForm.harga,
      armada: bidForm.armada,
      status: 'Menunggu Evaluasi KUD'
    };

    setTawaranSaya([tawaranBaru, ...tawaranSaya]);
    setTersedia(tersedia.filter(item => item.id !== job.id));
    
    // 2. Reset Form & Tampilkan Notifikasi
    setBidForm({ id: null, harga: '', armada: 'Truk Fuso (8 Ton)' });
    toast.success('Tawaran berhasil dikirim ke KUD!');
    setActiveTab('tawaran');
  };

  return (
    <div className="flex flex-col font-sans animate-fade-in pb-10 min-h-screen w-full bg-slate-50/50">
      
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20 w-full shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/30">
                <Truck size={28} />
              </div>
              <div>
                 <h1 className="font-black text-xl md:text-2xl leading-tight text-white">
                   Vendor Logistik
                 </h1>
                 <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                   <ShieldCheck size={14} className="text-blue-400"/> PT Lintas Trans Mandiri (Terverifikasi)
                 </p>
              </div>
            </div>
            
            {/* Metrik Mini Header */}
            <div className="hidden md:flex gap-6 text-right">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Pengiriman</p>
                <p className="text-lg font-black text-white">124 <span className="text-xs text-slate-400 font-medium">Trip</span></p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rating Vendor</p>
                <p className="text-lg font-black text-amber-400">4.8 <span className="text-xs text-slate-400 font-medium">/ 5.0</span></p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide">
            <button 
              onClick={() => setActiveTab('bursa')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'bursa' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Gavel size={16} /> Bursa Lelang <span className="bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full text-xs">{tersedia.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('tawaran')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tawaran' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Clock size={16} /> Tawaran Saya <span className="bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full text-xs">{tawaranSaya.length}</span>
            </button>
            <button 
              onClick={() => toast('Riwayat pengiriman akan segera hadir')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap bg-slate-800 text-slate-300 hover:bg-slate-700`}
            >
              <History size={16} /> Riwayat
            </button>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1">
        
        {/* TAB 1: BURSA LELANG */}
        {activeTab === 'bursa' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-5">
            {tersedia.length === 0 ? (
               <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-300">
                 <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
                   <CheckCircle2 size={40} />
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg">Tidak ada lelang baru</h3>
                 <p className="text-sm mt-2 text-slate-500 max-w-sm">Anda telah mengikuti semua lelang yang tersedia saat ini atau belum ada KUD yang melempar jadwal baru.</p>
               </div>
            ) : (
              tersedia.map((job) => (
                <div key={job.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-colors">
                  
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">
                          {job.id}
                        </span>
                        <span className="text-[10px] font-black flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                          <Clock size={12}/> Tutup: {job.batasWaktu}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{job.komoditas}</h3>
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                        <Package size={16} className="text-emerald-600" /> {job.tonase} Ton Muatan
                      </p>
                    </div>
                  </div>

                  {/* Rute */}
                  <div className="p-5 bg-white">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><MapPin size={12}/> Titik Muat (KUD)</p>
                        <p className="text-sm font-bold text-slate-800">{job.asal}</p>
                      </div>
                      <ArrowRight size={18} className="text-slate-300 shrink-0" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><MapPin size={12}/> Tujuan (Pabrik)</p>
                        <p className="text-sm font-bold text-slate-800">{job.tujuan}</p>
                      </div>
                    </div>

                    {/* Form Bidding */}
                    {bidForm.id === job.id ? (
                      <form onSubmit={(e) => handleBidding(e, job)} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Total Harga Angkut (Rp)</label>
                            <input 
                              type="number" 
                              required
                              value={bidForm.harga}
                              onChange={(e) => setBidForm({...bidForm, harga: e.target.value})}
                              placeholder="Misal: 1500000" 
                              className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">Pilihan Armada</label>
                            <select 
                              value={bidForm.armada}
                              onChange={(e) => setBidForm({...bidForm, armada: e.target.value})}
                              className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-blue-500 focus:ring-2 focus:ring-blue-200"
                            >
                              <option value="Truk Colt Diesel (4 Ton)">Truk Colt Diesel (4 Ton)</option>
                              <option value="Truk Fuso (8 Ton)">Truk Fuso (8 Ton)</option>
                              <option value="Truk Tronton (15 Ton)">Truk Tronton (15 Ton)</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                           <button type="button" onClick={() => setBidForm({id: null, harga: '', armada: 'Truk Fuso (8 Ton)'})} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 flex-1">
                             Batal
                           </button>
                           <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 hover:shadow-lg transition flex-[2]">
                             Kirim Tawaran
                           </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setBidForm({ id: job.id, harga: '', armada: 'Truk Fuso (8 Ton)' })}
                        className="w-full py-3.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <Gavel size={18} /> Ajukan Harga (Bid)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: TAWARAN SAYA */}
        {activeTab === 'tawaran' && (
          <div className="animate-fade-in flex flex-col gap-4">
            {tawaranSaya.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-300">
                 <div className="bg-slate-100 p-4 rounded-full mb-4 text-slate-400">
                   <Clock size={40} />
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg">Belum ada tawaran aktif</h3>
                 <p className="text-sm mt-2 text-slate-500 max-w-sm">Ajukan harga pada bursa lelang untuk mulai mendapatkan pekerjaan logistik.</p>
               </div>
            ) : (
              tawaranSaya.map((job) => (
                 <div key={job.id} className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
                   <div>
                     <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
                         {job.id}
                       </span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                         <Clock size={12}/> {job.status}
                       </span>
                     </div>
                     <h3 className="text-lg font-black text-slate-900">{job.komoditas}</h3>
                     <p className="text-sm font-medium text-slate-500 mt-1">{job.asal} <ArrowRight size={12} className="inline mx-1"/> {job.tujuan}</p>
                   </div>
                   
                   <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-w-[200px] text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tawaran Anda</p>
                     <p className="text-xl font-black text-blue-700">Rp {Number(job.hargaDiajukan).toLocaleString('id-ID')}</p>
                     <p className="text-xs font-bold text-slate-600 mt-1">{job.armada}</p>
                   </div>
                 </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}