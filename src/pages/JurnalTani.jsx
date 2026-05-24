import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Wallet, CalendarDays, Plus, Trash2, CheckCircle2, Circle, Sprout, CloudSnow, WifiOff, RefreshCcw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JurnalTani() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'kas');
  const [isLoading, setIsLoading] = useState(true);
  
  // 👇 TAMBAHAN: Mencegah user klik tombol simpan berkali-kali (Double Click)
  const [isSaving, setIsSaving] = useState(false); 
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // 👇 REF UNTUK CEGAH DOUBLE SYNC (Dari DeepSeek - Sangat Aman)
  const isSyncingRef = useRef(false);
  const hasFetchedAfterSyncRef = useRef(false);

  const [kasList, setKasList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [unsyncedData, setUnsyncedData] = useState([]);

  const [formKas, setFormKas] = useState({ tanggal: '', deskripsi: '', nominal: '', jenis_kas: 'pengeluaran' });
  const [formJadwal, setFormJadwal] = useState({ tanggal: '', kegiatan: '' });

  const getToken = () => localStorage.getItem('token');

  // ==========================================
  // 1. LISTENER JARINGAN & LOAD AWAL
  // ==========================================
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Sinyal internet kembali. Menyinkronkan data...');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Koneksi terputus. Beralih ke Mode Offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!getToken()) {
      navigate('/login');
    } else {
      loadDataLokal();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  // 👇 EFEK SINKRONISASI ANTI DOUBLE FETCH
  useEffect(() => {
    if (isOnline && unsyncedData.length > 0 && !isSyncingRef.current) {
      syncDataLokalKeCloud();
    } else if (isOnline && unsyncedData.length === 0 && !isLoading && !hasFetchedAfterSyncRef.current) {
      hasFetchedAfterSyncRef.current = true;
      fetchJurnalCloud();
    } else if (!isOnline) {
      hasFetchedAfterSyncRef.current = false;
    }
  }, [isOnline, unsyncedData.length]);

  const loadDataLokal = () => {
    const localKas = localStorage.getItem('agro_kas');
    const localJadwal = localStorage.getItem('agro_jadwal');
    const localUnsynced = localStorage.getItem('agro_unsynced');
    
    if (localKas) setKasList(JSON.parse(localKas));
    if (localJadwal) setJadwalList(JSON.parse(localJadwal));
    if (localUnsynced) setUnsyncedData(JSON.parse(localUnsynced));

    if (navigator.onLine) {
      if (!localUnsynced || JSON.parse(localUnsynced).length === 0) {
        hasFetchedAfterSyncRef.current = true;
        fetchJurnalCloud();
      } else {
        syncDataLokalKeCloud();
      }
    } else {
      setIsLoading(false);
    }
  };

  const fetchJurnalCloud = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/jurnal`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      const dataKas = res.data.filter(item => item.tipe === 'kas');
      const dataJadwal = res.data.filter(item => item.tipe === 'jadwal').sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      
      setKasList(dataKas);
      setJadwalList(dataJadwal);
      localStorage.setItem('agro_kas', JSON.stringify(dataKas));
      localStorage.setItem('agro_jadwal', JSON.stringify(dataJadwal));
      
    } catch (error) {
      console.error("Gagal sinkron cloud:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. FUNGSI SINKRONISASI (CEGAH DUPLIKASI)
  // ==========================================
  const syncDataLokalKeCloud = async () => {
    if (!isOnline || isSyncingRef.current) return;
    
    const currentUnsynced = JSON.parse(localStorage.getItem('agro_unsynced')) || [];
    if (currentUnsynced.length === 0) {
      if (!hasFetchedAfterSyncRef.current) {
        hasFetchedAfterSyncRef.current = true;
        fetchJurnalCloud();
      }
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    
    const successItems = [];
    const failedItems = [];

    for (const item of currentUnsynced) {
      try {
        const payload = { ...item };
        delete payload._id; 
        delete payload.synced; 

        await axios.post(`${import.meta.env.VITE_API_URL}/jurnal`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        successItems.push(item);
      } catch (error) {
        console.error("Gagal kirim data antrean:", error);
        failedItems.push(item);
      }
    }

    // 👇 HANYA HAPUS DATA YANG SUKSES DARI ANTREAN
    if (successItems.length > 0) {
      const remainingUnsynced = failedItems;
      setUnsyncedData(remainingUnsynced);
      
      if (remainingUnsynced.length === 0) {
        localStorage.removeItem('agro_unsynced');
        toast.success(`${successItems.length} catatan offline berhasil masuk Cloud!`);
        
        hasFetchedAfterSyncRef.current = false;
        await fetchJurnalCloud();
      } else {
        localStorage.setItem('agro_unsynced', JSON.stringify(remainingUnsynced));
        toast.error(`${successItems.length} tersinkron, ${failedItems.length} gagal. Akan dicoba lagi nanti.`);
      }
      
      // 👇 HAPUS DATA LOKAL YANG SUDAH TERSINKRON (Mencegah tampilan dobel di UI)
      const updatedKasList = kasList.filter(kas => 
        !successItems.some(success => success._id === kas._id)
      );
      const updatedJadwalList = jadwalList.filter(jadwal => 
        !successItems.some(success => success._id === jadwal._id)
      );
      
      setKasList(updatedKasList);
      setJadwalList(updatedJadwalList);
      localStorage.setItem('agro_kas', JSON.stringify(updatedKasList));
      localStorage.setItem('agro_jadwal', JSON.stringify(updatedJadwalList));
      
    } else if (failedItems.length > 0) {
      toast.error('Gagal menyinkronkan data. Coba lagi nanti.');
    }
    
    isSyncingRef.current = false;
    setIsSyncing(false);
  };

  // 👇 SIMPAN KE LOKAL + ANTREAN DENGAN ID SUPER UNIK
  const simpanKelokalDanAntrean = (newItem, tipe) => {
    const uniqueId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const itemWithUniqueId = { ...newItem, _id: uniqueId };
    
    const updatedUnsynced = [...unsyncedData, itemWithUniqueId];
    setUnsyncedData(updatedUnsynced);
    localStorage.setItem('agro_unsynced', JSON.stringify(updatedUnsynced));

    if (tipe === 'kas') {
      const updatedKas = [itemWithUniqueId, ...kasList];
      setKasList(updatedKas);
      localStorage.setItem('agro_kas', JSON.stringify(updatedKas));
    } else {
      const updatedJadwal = [...jadwalList, itemWithUniqueId].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
      setJadwalList(updatedJadwal);
      localStorage.setItem('agro_jadwal', JSON.stringify(updatedJadwal));
    }
  };

  // --- FUNGSI BUKU KAS ---
  const handleTambahKas = async (e) => {
    e.preventDefault();
    if (!formKas.tanggal || !formKas.deskripsi || !formKas.nominal || isSaving) return;
    
    setIsSaving(true); // Kunci tombol agar tidak dobel klik
    const payload = {
      tipe: 'kas',
      jenis_kas: formKas.jenis_kas,
      tanggal: formKas.tanggal,
      deskripsi: formKas.deskripsi,
      nominal: parseInt(formKas.nominal)
    };

    if (isOnline) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/jurnal`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success(formKas.jenis_kas === 'pemasukan' ? 'Pemasukan tersimpan!' : 'Pengeluaran tersimpan!');
        fetchJurnalCloud();
      } catch (error) {
        toast.error('Gagal mem-backup ke cloud. Menyimpan di Lokal.');
        simpanKelokalDanAntrean(payload, 'kas');
      }
    } else {
      simpanKelokalDanAntrean(payload, 'kas');
      toast.success('Tersimpan di HP (Mode Offline)');
    }
    setFormKas({ tanggal: '', deskripsi: '', nominal: '', jenis_kas: 'pengeluaran' });
    setIsSaving(false); // Buka kunci tombol
  };

  // --- FUNGSI JADWAL TANI ---
  const handleTambahJadwal = async (e) => {
    e.preventDefault();
    if (!formJadwal.tanggal || !formJadwal.kegiatan || isSaving) return;

    setIsSaving(true); // Kunci tombol agar tidak dobel klik
    const payload = {
      tipe: 'jadwal',
      tanggal: formJadwal.tanggal,
      deskripsi: formJadwal.kegiatan,
      status_selesai: false
    };

    if (isOnline) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/jurnal`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success('Jadwal tersimpan di Cloud!');
        fetchJurnalCloud();
      } catch (error) {
        simpanKelokalDanAntrean(payload, 'jadwal');
      }
    } else {
      simpanKelokalDanAntrean(payload, 'jadwal');
      toast.success('Jadwal tersimpan di HP (Offline)');
    }
    setFormJadwal({ tanggal: '', kegiatan: '' });
    setIsSaving(false); // Buka kunci tombol
  };

  const hapusJurnal = async (id, tipe) => {
    if(!window.confirm("Hapus catatan ini?")) return;
    
    if (id.startsWith('temp_')) {
      const filteredUnsynced = unsyncedData.filter(item => item._id !== id);
      setUnsyncedData(filteredUnsynced);
      localStorage.setItem('agro_unsynced', JSON.stringify(filteredUnsynced));
      
      if(tipe === 'kas') {
        const filtered = kasList.filter(item => item._id !== id);
        setKasList(filtered);
        localStorage.setItem('agro_kas', JSON.stringify(filtered));
      } else {
        const filtered = jadwalList.filter(item => item._id !== id);
        setJadwalList(filtered);
        localStorage.setItem('agro_jadwal', JSON.stringify(filtered));
      }
      toast.success('Data offline dihapus');
    } 
    else if (isOnline) { 
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/jurnal/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        
        if(tipe === 'kas') {
          const filtered = kasList.filter(item => item._id !== id);
          setKasList(filtered);
          localStorage.setItem('agro_kas', JSON.stringify(filtered));
        } else {
          const filtered = jadwalList.filter(item => item._id !== id);
          setJadwalList(filtered);
          localStorage.setItem('agro_jadwal', JSON.stringify(filtered));
        }
        toast.success('Data dihapus dari cloud');
      } catch (error) {
        toast.error('Gagal menghapus dari cloud');
        return; 
      }
    } else {
      toast.error('Tidak bisa menghapus data Cloud saat Offline!');
      return;
    }
  };

  const toggleStatusJadwal = async (id, statusSaatIni) => {
    if (id.startsWith('temp_') || !isOnline) {
       toast.error("Tidak bisa update status saat Offline / Belum tersinkron");
       return;
    }

    const updatedList = jadwalList.map(item => item._id === id ? { ...item, status_selesai: !statusSaatIni } : item);
    setJadwalList(updatedList);
    localStorage.setItem('agro_jadwal', JSON.stringify(updatedList));
    
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/jurnal/${id}`, { status_selesai: !statusSaatIni }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
    } catch (error) {
      console.error("Gagal update status di cloud");
    }
  };

  // KALKULASI KEUANGAN
  const totalPemasukan = kasList.filter(k => k.jenis_kas === 'pemasukan').reduce((acc, curr) => acc + curr.nominal, 0);
  const totalPengeluaran = kasList.filter(k => k.jenis_kas !== 'pemasukan').reduce((acc, curr) => acc + curr.nominal, 0);
  const saldoBersih = totalPemasukan - totalPengeluaran;

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center font-bold text-primary animate-pulse">Memuat Jurnal...</div>;
  }

  // ✅ UI (JSX) SAMA PERSIS DENGAN KODE ANDA, HANYA TAMBAH KUNCI DI TOMBOL SIMPAN
  return (
    <div className="flex flex-col font-sans animate-fade-in pb-10 min-h-screen bg-gray-50/50 w-full">
      
      {/* HEADER STICKY */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-green-50 rounded-xl"><BookOpen size={24} /></div>
              <div>
                 <h1 className="font-black text-xl md:text-2xl leading-tight">Jurnal Tani</h1>
                 {isOnline && unsyncedData.length === 0 ? (
                    <p className="text-[10px] sm:text-xs text-blue-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <CloudSnow size={12}/> Tersinkronisasi ke Cloud
                    </p>
                 ) : isOnline && unsyncedData.length > 0 ? (
                    <p className="text-[10px] sm:text-xs text-yellow-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <RefreshCcw size={12} className="animate-spin"/> Menunggu Sinkronisasi...
                    </p>
                 ) : (
                    <p className="text-[10px] sm:text-xs text-orange-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <WifiOff size={12}/> Mode Offline (Tersimpan di HP)
                    </p>
                 )}
              </div>
            </div>
            
            {isOnline && (
               <button onClick={syncDataLokalKeCloud} disabled={isSyncing || unsyncedData.length === 0} className={`p-2.5 rounded-full transition ${unsyncedData.length > 0 ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-gray-50 text-gray-400'}`} title="Sinkronkan Data">
                 <RefreshCcw size={20} className={isSyncing ? "animate-spin" : ""} />
               </button>
            )}
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-xl w-full sm:max-w-sm overflow-hidden">
            <button 
              onClick={() => setActiveTab('kas')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all truncate px-2 ${activeTab === 'kas' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Wallet size={16} /> <span className="truncate">Buku Kas</span>
            </button>
            <button 
              onClick={() => setActiveTab('jadwal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all truncate px-2 ${activeTab === 'jadwal' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <CalendarDays size={16} /> <span className="truncate">Jadwal Tani</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto flex-1">
        
        {activeTab === 'kas' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              <div className={`p-5 sm:p-6 rounded-3xl shadow-lg text-white relative overflow-hidden transition-colors duration-500 ${saldoBersih >= 0 ? 'bg-gradient-to-br from-green-600 to-primary' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
                <DollarSign className="absolute right-[-20px] bottom-[-20px] opacity-10" size={120} />
                <div className="relative z-10">
                  <p className="text-xs text-white/80 uppercase tracking-widest font-bold mb-1">Laba Bersih (Saldo)</p>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black break-words mb-4 leading-none truncate" title={`Rp ${saldoBersih.toLocaleString('id-ID')}`}>
                    Rp {saldoBersih.toLocaleString('id-ID')}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-3 border-t border-white/20 pt-4 mt-2">
                     <div className="min-w-0">
                        <p className="text-[10px] text-white/70 uppercase truncate">Pemasukan</p>
                        <p className="font-bold text-sm sm:text-base truncate" title={`Rp ${totalPemasukan.toLocaleString('id-ID')}`}>Rp {totalPemasukan.toLocaleString('id-ID')}</p>
                     </div>
                     <div className="min-w-0">
                        <p className="text-[10px] text-white/70 uppercase truncate">Pengeluaran</p>
                        <p className="font-bold text-sm sm:text-base truncate" title={`Rp ${totalPengeluaran.toLocaleString('id-ID')}`}>Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
                     </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Catat Transaksi Baru</h3>
                <form onSubmit={handleTambahKas} className="flex flex-col gap-3">
                  
                  <div className="flex bg-gray-100 p-1.5 rounded-xl w-full mb-2">
                    <button type="button" onClick={() => setFormKas({...formKas, jenis_kas: 'pemasukan'})} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate px-1 ${formKas.jenis_kas === 'pemasukan' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <TrendingUp size={14} /> <span className="truncate">Pemasukan</span>
                    </button>
                    <button type="button" onClick={() => setFormKas({...formKas, jenis_kas: 'pengeluaran'})} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all truncate px-1 ${formKas.jenis_kas === 'pengeluaran' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <TrendingDown size={14} /> <span className="truncate">Pengeluaran</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tanggal</label>
                    <input type="date" value={formKas.tanggal} onChange={(e) => setFormKas({...formKas, tanggal: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-semibold text-gray-700" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Keterangan Transaksi</label>
                    <input type="text" value={formKas.deskripsi} onChange={(e) => setFormKas({...formKas, deskripsi: e.target.value})} placeholder={formKas.jenis_kas === 'pemasukan' ? "Contoh: Jual Jagung 500kg" : "Contoh: Beli Pupuk NPK"} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-semibold text-gray-700" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nominal (Rp)</label>
                    <input type="number" min="1" value={formKas.nominal} onChange={(e) => setFormKas({...formKas, nominal: e.target.value})} placeholder="Contoh: 150000" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-semibold text-gray-700" required />
                  </div>
                  
                  {/* 👇 TOMBOL DISABLED SAAT PROSES SAVE */}
                  <button type="submit" disabled={isSaving} className={`w-full mt-3 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md ${isSaving ? 'bg-gray-400 cursor-not-allowed' : isOnline ? (formKas.jenis_kas === 'pemasukan' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20') : 'bg-gray-800 hover:bg-black shadow-gray-800/20'}`}>
                    <Plus size={18} /> {isSaving ? 'Menyimpan...' : isOnline ? 'Simpan ke Cloud' : 'Simpan Sementara (Offline)'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm h-full min-h-[400px]">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Riwayat Keuangan</h3>
                  <span className="text-[10px] sm:text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">{kasList.length} Transaksi</span>
                </div>
                
                {kasList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 py-16 px-4 text-center">
                    <Wallet size={48} className="mb-4 opacity-30" />
                    <p className="text-sm font-bold text-gray-600">Buku Kas Masih Kosong</p>
                    <p className="text-xs mt-1">Catat semua pemasukan dan pengeluaran lahan Anda di sini.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {kasList.map((item) => (
                      <div key={item._id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-2xl transition group ${item._id.startsWith('temp_') ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                        
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0 mb-3 sm:mb-0">
                          <div className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 sm:mt-0 ${item.jenis_kas === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}`}>
                             {item.jenis_kas === 'pemasukan' ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-gray-800 font-bold text-sm leading-tight truncate pr-2" title={item.deskripsi}>{item.deskripsi}</span>
                            <span className="text-gray-400 text-[11px] sm:text-xs mt-1 font-medium truncate">
                               {item.tanggal} {item._id.startsWith('temp_') && <span className="text-yellow-600 ml-1 font-bold">(Offline)</span>}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0 border-t sm:border-0 border-gray-100/50 pt-2 sm:pt-0 pl-14 sm:pl-0 w-full sm:w-auto mt-1 sm:mt-0">
                          <span className={`font-black text-sm md:text-base truncate ${item.jenis_kas === 'pemasukan' ? 'text-green-600' : 'text-orange-600'}`} title={`Rp ${item.nominal.toLocaleString('id-ID')}`}>
                            {item.jenis_kas === 'pemasukan' ? '+' : '-'} Rp {item.nominal.toLocaleString('id-ID')}
                          </span>
                          
                          <button onClick={() => hapusJurnal(item._id, 'kas')} className="text-gray-400 hover:text-red-500 transition opacity-100 lg:opacity-0 lg:group-hover:opacity-100 bg-white sm:bg-transparent p-1.5 sm:p-0 rounded-lg border sm:border-0 border-gray-200">
                            <Trash2 size={16} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jadwal' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                  <Sprout className="text-primary" size={20} />
                  <h3 className="font-bold text-gray-800">Tambah Agenda</h3>
                </div>
                <form onSubmit={handleTambahJadwal} className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Tanggal Pelaksanaan</label>
                    <input type="date" value={formJadwal.tanggal} onChange={(e) => setFormJadwal({...formJadwal, tanggal: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-semibold text-gray-700" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Kegiatan Tani</label>
                    <input type="text" value={formJadwal.kegiatan} onChange={(e) => setFormJadwal({...formJadwal, kegiatan: e.target.value})} placeholder="Contoh: Pemupukan NPK Pertama" className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary text-sm font-semibold text-gray-700" required />
                  </div>
                  
                  {/* 👇 TOMBOL DISABLED SAAT PROSES SAVE */}
                  <button type="submit" disabled={isSaving} className={`w-full mt-3 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md ${isSaving ? 'bg-gray-400 cursor-not-allowed' : isOnline ? 'bg-primary hover:bg-green-700 shadow-primary/20' : 'bg-gray-800 hover:bg-black shadow-gray-800/20'}`}>
                    <Plus size={18} /> {isSaving ? 'Menyimpan...' : isOnline ? 'Simpan Agenda' : 'Simpan (Offline)'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
               <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm h-full min-h-[400px]">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Agenda & To-Do List</h3>
                  {isSyncing && <RefreshCcw size={16} className="text-gray-400 animate-spin" />}
                </div>
                
                {jadwalList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-gray-400 py-16 px-4 text-center">
                    <CalendarDays size={48} className="mb-4 opacity-30" />
                    <p className="text-sm font-bold text-gray-600">Jadwal Tanam Masih Kosong</p>
                    <p className="text-xs mt-1">Buat pengingat jadwal pemupukan atau panen Anda di sini.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {jadwalList.map((item) => (
                      <div key={item._id} className={`flex items-start sm:items-center gap-3 p-4 border rounded-2xl transition group ${
                        item.status_selesai ? 'bg-gray-50 border-gray-100 opacity-60' : 
                        item._id.startsWith('temp_') ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'
                      }`}>
                        
                        <button onClick={() => toggleStatusJadwal(item._id, item.status_selesai)} className="flex-shrink-0 focus:outline-none mt-0.5 sm:mt-0">
                          {item.status_selesai ? (
                            <CheckCircle2 size={24} className="text-primary" />
                          ) : (
                            <Circle size={24} className="text-gray-300 hover:text-primary transition" />
                          )}
                        </button>
                        
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 min-w-0">
                           <span className={`font-bold text-sm leading-tight truncate ${item.status_selesai ? 'line-through text-gray-500' : 'text-gray-800'}`} title={item.deskripsi}>
                             {item.deskripsi}
                           </span>
                           <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg w-fit flex-shrink-0 border border-gray-200">
                             {item.tanggal} {item._id.startsWith('temp_') && <span className="text-yellow-600 ml-1">(Belum sinkron)</span>}
                           </span>
                        </div>

                        <button onClick={() => hapusJurnal(item._id, 'jadwal')} className="text-gray-400 hover:text-red-500 transition opacity-100 lg:opacity-0 lg:group-hover:opacity-100 ml-1 p-1 sm:p-0">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}