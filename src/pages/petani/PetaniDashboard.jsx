import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MapPin, WifiOff, CheckCircle, ShieldAlert, Coins, Layers, 
  RefreshCw, CloudSnow, RefreshCcw, CheckCircle2, Volume2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import WeatherWidget from '../../components/WeatherWidget';
import { speakNotification } from '../../utils/voiceAssistant';

export default function PetaniDashboard() {
  // --- STATE UTAMA ---
  const [profile, setProfile] = useState(null);
  const [escrowContract, setEscrowContract] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- STATE INPUT GEOTAGGING ---
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // --- STATE OFFLINE-FIRST (PWA) ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingGeotag, setPendingGeotag] = useState(null);
  const isSyncingRef = useRef(false);

  // 🌟 LOGIKA BISNIS: Cek apakah ada kontrak aktif (belum selesai)
  const isKontrakAktif = escrowContract && escrowContract.status !== 'selesai';
  const isMusimBaru = escrowContract && escrowContract.status === 'selesai';

  // 🌟 KUNCI KEAMANAN
  const getAuthConfig = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('token_agrocelebes'); 
    return {
      withCredentials: true,
      headers: { Authorization: token ? `Bearer ${token}` : '' }
    };
  };

  // 1. AMBIL DATA REALTIME DARI DATABASE
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const profileRes = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, getAuthConfig());
      setProfile(profileRes.data);

      if (profileRes.data?.koordinat_lokasi?.lat && profileRes.data?.koordinat_lokasi?.lng) {
        setLatitude(profileRes.data.koordinat_lokasi.lat);
        setLongitude(profileRes.data.koordinat_lokasi.lng);
      }

      const escrowRes = await axios.get(`${import.meta.env.VITE_API_URL}/escrow/petani-aktif`, getAuthConfig());
      setEscrowContract(escrowRes.data);
    } catch (err) {
      console.error("Detail Error Sinkronisasi:", err);
      const pesanError = err.response?.data?.pesan || err.response?.data?.message || "Gagal terhubung ke server.";
      toast.error(`Gagal Sinkronisasi: ${pesanError}`);
    } finally {
      setLoading(false);
    }
  };

  // INIT & LISTENER JARINGAN
  useEffect(() => {
    fetchDashboardData();

    // Cek apakah ada antrean koordinat saat offline sebelumnya
    const savedPending = localStorage.getItem('agro_pending_geotag');
    if (savedPending) {
      const parsed = JSON.parse(savedPending);
      setPendingGeotag(parsed);
      setLatitude(parsed.lat);
      setLongitude(parsed.lng);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. AUTO-SYNC SAAT SINYAL KEMBALI
  useEffect(() => {
    if (isOnline && pendingGeotag && !isSyncingRef.current) {
      syncGeotagKeCloud(pendingGeotag);
    }
  }, [isOnline, pendingGeotag]);

  // FUNGSI SINKRONISASI KE CLOUD
  const syncGeotagKeCloud = async (dataKoordinat) => {
    isSyncingRef.current = true;
    setIsSyncing(true);
    const tid = toast.loading('Menyinkronkan antrean data lahan ke satelit...');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/geotag`, dataKoordinat, getAuthConfig());

      // Bersihkan antrean offline
      localStorage.removeItem('agro_pending_geotag');
      setPendingGeotag(null);

      toast.success('Berhasil! Lahan Anda masuk antrean verifikasi satelit KUD.', { id: tid });
      speakNotification('Data lahan berhasil disinkronkan ke pusat. Lahan Anda masuk antrean verifikasi satelit.');
      fetchDashboardData(); 
    } catch (error) {
      toast.error('Gagal menyinkronkan data.', { id: tid });
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  };

  // 3. AMBIL GPS 1-KLIK (MENDUKUNG OFFLINE)
  const dapatkanLokasiGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Perangkat Anda tidak mendukung sensor GPS');
      speakNotification('Perangkat HP Anda tidak mendukung fitur sensor GPS.');
      return;
    }

    const tid = toast.loading('Mencari satelit GPS di area sawah...', { id: 'gps' });
    speakNotification('Mencari satelit GPS, mohon tunggu sebentar.');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(tid);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        const dataBaru = { lat: parseFloat(lat), lng: parseFloat(lng) };

        if (isOnline) {
          syncGeotagKeCloud(dataBaru);
        } else {
          // MODE OFFLINE: Simpan di HP dulu
          localStorage.setItem('agro_pending_geotag', JSON.stringify(dataBaru));
          setPendingGeotag(dataBaru);
          toast.success('Tersimpan di HP (Mode Offline). Menunggu sinyal...', { id: 'gps' });
          speakNotification('Tidak ada sinyal internet. Koordinat lahan disimpan sementara di HP. Sistem akan otomatis mengirim saat sinyal kembali.');
        }
      },
      () => {
        toast.error('Gagal mengunci satelit. Aktifkan Izin Lokasi HP Anda.', { id: 'gps' });
        speakNotification('Gagal mengunci posisi. Pastikan izin lokasi HP Anda sudah aktif.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 4. SIMPAN MANUAL (DARI INPUTAN TEXT)
  const simpanPemetaanLahan = () => {
    if (!latitude || !longitude) {
      toast.error('Tentukan koordinat lahan terlebih dahulu.');
      return;
    }

    const dataBaru = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    if (isOnline) {
      syncGeotagKeCloud(dataBaru);
    } else {
      localStorage.setItem('agro_pending_geotag', JSON.stringify(dataBaru));
      setPendingGeotag(dataBaru);
      toast.success('Offline! Pemetaan lahan disimpan lokal di memori HP.');
      speakNotification('Disimpan lokal. Menunggu jaringan internet kembali normal.');
    }
  };

  // 5. PENGAJUAN PINJAMAN AWAL
  const handleAjukanPinjaman = async () => {
    try {
      toast.loading('Memproses pengajuan ke KUD & Pabrik...', { id: 'loan' });
      await axios.post(`${import.meta.env.VITE_API_URL}/escrow/ajukan-pinjaman`, {}, getAuthConfig());
      toast.success('Pinjaman Awal Berhasil Diajukan! Menunggu Escrow didanai Pabrik.', { id: 'loan' });
      speakNotification('Pengajuan modal tanam Anda berhasil dikirim ke Koperasi. Menunggu verifikasi satelit dan pendanaan dari Pabrik.');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      const pesanError = err.response?.data?.pesan || "Gagal mengajukan pinjaman.";
      toast.error(pesanError);
      speakNotification('Maaf, pengajuan pinjaman Anda gagal diproses sistem.');
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
    <div className="p-4 max-w-4xl mx-auto flex flex-col gap-6 font-sans pb-12 animate-fade-in">

      {/* HEADER & INDIKATOR JARINGAN */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Dasbor Petani</h1>
          <p className="text-gray-500 text-sm">Validasi lahan Anda untuk akses KUR & Escrow B2B.</p>
        </div>
        <div className="text-right">
          {isOnline && !pendingGeotag ? (
            <span className="text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg shadow-sm">
              <CloudSnow size={14}/> Online
            </span>
          ) : isOnline && pendingGeotag ? (
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg shadow-sm">
              <RefreshCcw size={14} className="animate-spin"/> Syncing...
            </span>
          ) : (
            <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg shadow-sm animate-pulse">
              <WifiOff size={14}/> Offline Mode
            </span>
          )}
        </div>
      </div>

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
                {profile?.profil_lahan?.status_lahan === 'terverifikasi' ? <CheckCircle2 size={16}/> : <ShieldAlert size={16} />}
                {profile?.profil_lahan?.status_lahan || 'Belum Terpetakan'}
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

            <div className={`mt-4 p-2.5 rounded-xl border text-[10px] ${pendingGeotag ? 'bg-amber-900/40 border-amber-800 text-amber-400 animate-pulse' : 'bg-black/40 border-gray-800'}`}>
              {pendingGeotag 
                ? '⚠️ TERSIMPAN LOKAL (OFFLINE). MENUNGGU SINYAL...' 
                : (latitude && longitude ? `📍 TARGET LOCKED: ${latitude}, ${longitude}` : '⚠️ PETA BELUM DIKUNCI')}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={dapatkanLokasiGPS} 
            disabled={isSyncing || isKontrakAktif} 
            className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <MapPin size={16} className={isKontrakAktif ? "text-gray-400" : "text-green-600"} /> 
            {isKontrakAktif ? 'Terkunci (Kontrak Aktif)' : '1-Klik Kunci GPS (Offline)'}
          </button>

          <button 
            onClick={simpanPemetaanLahan} 
            disabled={isSyncing || isKontrakAktif} 
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle size={16} /> Simpan & Sinkronisasi
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

        {/* 🎙️ FITUR BARU: TOMBOL VOICE-FIRST */}
        <button 
          onClick={() => {
            let teksSuara = "";
            if (escrowContract?.status) {
              const formatStatus = escrowContract.status.replace('_', ' ');
              teksSuara = `Status kontrak Anda saat ini adalah ${formatStatus}. ${escrowContract.catatan || ''}`;
            } else if (profile?.profil_lahan?.status_lahan === 'terverifikasi') {
              teksSuara = "Selamat. Lahan Anda telah diverifikasi oleh satelit. Silakan tekan tombol hijau di bawah untuk mengajukan pinjaman awal modal tanam.";
            } else {
              teksSuara = "Lahan Anda belum diverifikasi. Silakan kunci posisi koordinat lahan terlebih dahulu pada panel di atas.";
            }
            speakNotification(teksSuara);
          }}
          className="mb-4 w-full bg-blue-50 text-blue-700 hover:bg-blue-100 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-blue-200 transition"
        >
          <Volume2 size={20} /> Dengarkan Status Saya
        </button>

        {/* TOMBOL PENGAJUAN YANG SUDAH DIBUKA GEMBOKNYA */}
        <button 
          onClick={handleAjukanPinjaman} 
          disabled={!latitude || !longitude} 
          className={`w-full py-4 rounded-xl text-sm font-black tracking-wide flex items-center justify-center gap-2 transition shadow-md ${
            (!latitude || !longitude)
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-95'
          }`}
        >
          <Coins size={18} />
          AJUKAN PINJAMAN AWAL MODAL TANAM
        </button>

        <p className="text-[10px] text-gray-500 mt-2 text-center">
          *Tombol terbuka setelah Anda mengunci GPS. KUD akan memverifikasi kelayakan via Satelit.
        </p>

      </div>

    </div>
  );
}