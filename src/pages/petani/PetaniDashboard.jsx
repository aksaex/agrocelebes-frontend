import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, WifiOff, CheckCircle, ShieldAlert, Coins, Layers, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import WeatherWidget from '../../components/WeatherWidget';

export default function PetaniDashboard() {
  // --- STATE UTAMA (TERHUBUNG KE DATABASE) ---
  const [profile, setProfile] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- STATE INPUT GEOTAGGING ---
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // 🌟 KUNCI KEAMANAN: Fungsi pembaca token & pengaktif cookie lintas port (CORS)
  const getAuthConfig = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('token_agrocelebes'); 
    return {
      withCredentials: true, // WAJIB: Agar cookie session terbaca oleh server.js Anda
      headers: {
        Authorization: token ? `Bearer ${token}` : '' // Mengirim token token jika disimpan di localStorage
      }
    };
  };

  // 1. AMBIL DATA REALTIME DARI DATABASE
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mengambil profil petani dengan header keamanan
      const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, getAuthConfig());
      setProfile(profileRes.data);
      
      if (profileRes.data?.koordinat_lokasi?.lat && profileRes.data?.koordinat_lokasi?.lng) {
        setLatitude(profileRes.data.koordinat_lokasi.lat);
        setLongitude(profileRes.data.koordinat_lokasi.lng);
      }

      // Mengambil data kontrak escrow aktif dengan header keamanan
      const escrowRes = await axios.get(`${import.meta.env.VITE_API_URL}/escrow/petani-aktif`, getAuthConfig());
      setEscrowContract(escrowRes.data);
    } catch (err) {
      console.error("Detail Error Sinkronisasi:", err);
      // Mengubah pesan error agar jujur menampilkan alasan dari backend
      const pesanError = err.response?.data?.pesan || err.response?.data?.message || "Gagal terhubung ke server.";
      toast.error(`Gagal Sinkronisasi: ${pesanError}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. AMBIL GPS DARI SENSOR SMARTPHONE
  const dapatkanLokasiGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Perangkat Anda tidak mendukung sensor GPS');
      return;
    }

    toast.loading('Mencari satelit GPS di area sawah...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        toast.success('Koordinat presisi berhasil dikunci!', { id: 'gps' });
      },
      () => {
        toast.error('Gagal mengunci satelit. Aktifkan GPS presisi tinggi Anda.', { id: 'gps' });
      },
      { enableHighAccuracy: true }
    );
  };

  // 3. SIMPAN PEMETAAN LAHAN LANGSUNG KE MONGODB
  const simpanPemetaanLahan = async () => {
    if (!latitude || !longitude) {
      toast.error('Tentukan koordinat lahan terlebih dahulu.');
      return;
    }

    try {
      const payload = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
      
      if (isOffline) {
        localStorage.setItem('pending_geotag', JSON.stringify(payload));
        toast.success('Offline! Pemetaan lahan disimpan lokal di memori HP.');
      } else {
        // Mengirimkan data pemetaan lahan lengkap dengan otentikasi
        await axios.post(`${import.meta.env.VITE_API_URL}/user/geotag`, payload, getAuthConfig());
        toast.success('Database Diperbarui! Lahan Anda masuk antrean verifikasi satelit KUD.');
        fetchDashboardData(); 
      }
    } catch (err) {
      console.error(err);
      const pesanError = err.response?.data?.pesan || "Gagal memperbarui pemetaan di database.";
      toast.error(pesanError);
    }
  };

  // 4. LOGIKA PENGAJUAN PINJAMAN AWAL
  const handleAjukanPinjaman = async () => {
    try {
      toast.loading('Memproses pengajuan ke KUD & Pabrik...', { id: 'loan' });
      // Mengirimkan request pinjaman dengan otentikasi penuh
      await axios.post(`${import.meta.env.VITE_API_URL}/escrow/ajukan-pinjaman`, {}, getAuthConfig());
      toast.success('Pinjaman Awal Berhasil Diajukan! Menunggu Escrow didanai Pabrik.', { id: 'loan' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      const pesanError = err.response?.data?.pesan || "Gagal mengajukan pinjaman.";
      toast.error(pesanError);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <RefreshCw className="animate-spin text-green-600 mb-2" size={32} />
        <p className="text-sm font-bold text-gray-500">Sinkronisasi Enkripsi Database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto flex flex-col gap-6 font-sans pb-12">
      
      {/* BANNER OFFLINE DETECTOR */}
      {isOffline && (
        <div className="bg-red-500 text-white p-3 rounded-2xl flex items-center gap-2 font-bold shadow-md animate-pulse">
          <WifiOff size={20} />
          <span>Koneksi Terputus. Perubahan akan disimpan sementara di ruang penyimpanan lokal HP.</span>
        </div>
      )}

      {/* METRIK CUACA RIIL BMKG */}
      <WeatherWidget />

      {/* BLOCK 1: PEMETAAN LAHAN INTERAKTIF */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-green-800">
          <Layers size={22} />
          <h2 className="text-lg font-black tracking-tight">Space-Verified Geotagging</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status Sertifikasi Lahan</span>
              <p className={`text-sm font-bold capitalize mt-1 flex items-center gap-1 ${profile?.profil_lahan?.status_lahan === 'terverifikasi' ? 'text-emerald-600' : 'text-amber-600'}`}>
                <ShieldAlert size={16} /> {profile?.profil_lahan?.status_lahan || 'Belum Terpetakan'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Luas Lahan Terdaftar: <strong>{profile?.profil_lahan?.luas_lahan_ha || 0} Ha</strong></p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200/60">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Koordinat Saat Ini</span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input type="number" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="bg-white border text-xs p-2 rounded-lg font-mono focus:outline-none focus:border-green-500" />
                <input type="number" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="bg-white border text-xs p-2 rounded-lg font-mono focus:outline-none focus:border-green-500" />
              </div>
            </div>
          </div>

          {/* VIEWPORT PEMETAAN VISUAL TELEMETRI SATELIT */}
          <div className="bg-gray-900 text-gray-400 p-5 rounded-2xl font-mono text-xs flex flex-col justify-between relative overflow-hidden min-h-[160px]">
            <div className="absolute top-0 right-0 p-8 bg-green-500/10 rounded-full blur-2xl"></div>
            <div>
              <p className="text-emerald-400 font-bold">// SATELIT TELEMETRI KUD</p>
              <p className="mt-2 text-[11px] leading-relaxed">Luas Centroid Analisis: {profile?.profil_lahan?.luas_lahan_ha || 0} HA</p>
              <p className="text-[11px] leading-relaxed">Skor Risiko Cuaca BMKG: {profile?.profil_lahan?.cuaca_score ?? '1.0'}</p>
            </div>
            <div className="bg-black/40 p-2.5 rounded-xl border border-gray-800 text-[10px]">
              {latitude && longitude ? `📍 TARGET LOCKED: ${latitude}, ${longitude}` : '⚠️ PETA BELUM DIKUNCI'}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={dapatkanLokasiGPS} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
            <MapPin size={16} className="text-green-600" /> Ambil GPS dari Sensor Sawah
          </button>
          <button onClick={simpanPemetaanLahan} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle size={16} /> Simpan & Sinkronisasi Lahan ke DB
          </button>
        </div>
      </div>

      {/* BLOCK 2: ALUR UTAMA PROPOSAL - PENGAJUAN PINJAMAN AWAL */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-green-800">
            <Coins size={22} />
            <h2 className="text-lg font-black tracking-tight">Pinjaman Awal & Kontrak B2B</h2>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${escrowContract?.status ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
            Status Escrow: {escrowContract?.status || 'Tidak Ada Kontrak'}
          </span>
        </div>

        {escrowContract ? (
          <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/20 p-5 rounded-2xl border border-green-100/60 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Komoditas Kontrak</span>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{escrowContract.komoditas}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Tonase</span>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{escrowContract.tonase} Ton</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nilai Jaminan Kontrak</span>
                <p className="text-sm font-black text-green-700 mt-0.5">Rp {escrowContract.nilai_kontrak?.toLocaleString('id-ID')}</p>
              </div>
            </div>
            {escrowContract.virtual_account && (
              <div className="mt-3 text-xs bg-white/80 p-2 rounded-lg border border-gray-200 font-mono">
                <span className="text-gray-400">Virtual Account Jaminan:</span> <strong className="text-gray-700">{escrowContract.virtual_account}</strong>
              </div>
            )}
            <p className="text-[11px] text-gray-500 mt-4 pt-3 border-t border-dashed border-green-200">
              <strong>Catatan Sistem:</strong> {escrowContract.catatan || 'Menunggu pemenuhan siklus modal tanam oleh KUD.'}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 text-center rounded-2xl text-xs text-gray-500 mb-6">
            Lahan Anda belum diverifikasi satelit atau belum ada ikatan kontrak dari KUD.
          </div>
        )}

        <button 
          onClick={handleAjukanPinjaman}
          disabled={profile?.profil_lahan?.status_lahan !== 'terverifikasi'}
          className={`w-full py-4 rounded-xl text-sm font-black tracking-wide transition shadow-md flex items-center justify-center gap-2 ${
            profile?.profil_lahan?.status_lahan === 'terverifikasi'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          <Coins size={18} />
          AJUKAN PINJAMAN AWAL MODAL TANAM
        </button>
        
        {profile?.profil_lahan?.status_lahan !== 'terverifikasi' && (
          <p className="text-[10px] text-amber-600 font-bold text-center mt-2">
            *Tombol pinjaman terkunci hingga koordinat lahan disinkronisasi dan lolos audit status "terverifikasi" oleh satelit KUD.
          </p>
        )}
      </div>

    </div>
  );
}