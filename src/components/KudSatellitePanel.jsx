import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import { Layers3, MapPinned, ScanSearch, User, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Komponen helper untuk menggerakkan peta secara dinamis
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function KudSatellitePanel() {
  const [petaniList, setPetaniList] = useState([]);
  const [selectedLahan, setSelectedLahan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // Ambil URL API dari env, atau fallback ke localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // 1. MENGAMBIL DATA ASLI DARI MONGODB
  useEffect(() => {
    const fetchPetani = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/petani-list`, {
          withCredentials: true, // WAJIB untuk mengirim cookie token JWT
        });

        // Filter hanya petani yang SUDAH memiliki koordinat lokasi
        const validPetani = response.data.filter(
          (p) => p.koordinat_lokasi && p.koordinat_lokasi.lat && p.koordinat_lokasi.lng
        );

        // Format data MongoDB agar sesuai dengan kebutuhan UI Map
        const formattedData = validPetani.map((petani) => ({
          id: petani._id,
          nama: petani.nama_perusahaan || 'Lahan Pribadi',
          pemilik: petani.nama,
          luas: `${petani.profil_lahan?.luas_lahan_ha || 0} Ha`,
          kordinat: [petani.koordinat_lokasi.lat, petani.koordinat_lokasi.lng],
          ndvi: 'Belum Discan', // Akan diupdate oleh API Satelit
          skor: 92,       // Anda bisa buat logik dinamis nanti
          statusLahan: petani.profil_lahan?.status_lahan || 'belum diverifikasi',
        }));

        setPetaniList(formattedData);
        if (formattedData.length > 0) {
          setSelectedLahan(formattedData[0]); // Default pilih lahan pertama
        }
      } catch (error) {
        // TAMPILKAN DETAIL ERROR KE CONSOLE & LAYAR
        console.error('Detail Error API:', error.response || error);
        
        const pesanBackend = error.response?.data?.pesan;
        const statusError = error.response?.status;
        
        if (statusError === 401 || statusError === 403) {
           toast.error(`Akses Ditolak (${statusError}): ${pesanBackend || 'Anda bukan KUD/Admin'}`);
        } else if (statusError === 404) {
           toast.error('Gagal: Rute /petani-list tidak ditemukan di Backend');
        } else {
           toast.error(`Error: ${pesanBackend || error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetani();
  }, [API_URL]);

  // 2. FUNGSI UNTUK MENYETUJUI LAHAN (MEMANGGIL API SATELIT & BACKEND PUT)
  const handleVerifikasi = async () => {
    if (!selectedLahan) return;
    
    setIsVerifying(true);
    const toastId = toast.loading('Menghubungkan ke API ESA Sentinel...', { duration: 5000 });
    
    try {
      // 1. Tarik Data Riil dari Satelit Eropa
      const satRes = await axios.post(`${API_URL}/satellite/analisis/${selectedLahan.id}`, {}, {
        withCredentials: true
      });
      
      const ndviRiil = satRes.data.ndvi;
      const jenisSatelit = satRes.data.satelit;
      
      toast.success(`Scan berhasil via ${jenisSatelit}! NDVI: ${ndviRiil}`, { id: toastId, duration: 4000 });

      // 2. Setujui Lahan di Database Escrow (Lanjut ke Pabrik)
      await axios.put(`${API_URL}/user/verifikasi-lahan/${selectedLahan.id}`, {}, {
        withCredentials: true
      });

      // Update State UI
      const updatedList = petaniList.map(p => 
        p.id === selectedLahan.id ? { ...p, statusLahan: 'terverifikasi', ndvi: ndviRiil } : p
      );
      setPetaniList(updatedList);
      setSelectedLahan({ ...selectedLahan, statusLahan: 'terverifikasi', ndvi: ndviRiil });

    } catch (error) {
      toast.error(error.response?.data?.pesan || 'Satelit gagal memindai lahan.', { id: toastId });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-gray-100">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Menghubungkan ke satelit KUD...</p>
      </div>
    );
  }

  if (petaniList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-3xl border border-gray-100 p-8 text-center">
        <div className="p-4 bg-gray-50 rounded-full mb-4">
          <MapPinned size={48} className="text-gray-400" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-2">Belum Ada Pemetaan Lahan</h3>
        <p className="text-gray-500 text-sm max-w-md">Belum ada satupun petani yang melakukan Geotagging lahan mereka. Arahkan petani untuk mengisi koordinat di menu Profil Dashboard mereka.</p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers3 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Verifikasi Lahan Satelit</h3>
            <p className="text-xs text-gray-500 font-medium">Pemantauan NDVI & Validasi Kontrak Petani</p>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          Live Monitoring
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] flex-1">
        
        {/* PANEL KIRI: PETA */}
        <div className="relative min-h-[400px] lg:min-h-full bg-gray-100">
          <MapContainer center={selectedLahan.kordinat} zoom={14} scrollWheelZoom={false} className="h-full min-h-[400px] w-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={selectedLahan.kordinat} />
            
            {/* Marker Lahan Utama */}
            <CircleMarker
              center={selectedLahan.kordinat}
              radius={24}
              pathOptions={{ 
                color: selectedLahan.skor >= 80 ? '#10b981' : selectedLahan.skor >= 60 ? '#f59e0b' : '#ef4444', 
                fillColor: selectedLahan.skor >= 80 ? '#10b981' : selectedLahan.skor >= 60 ? '#f59e0b' : '#ef4444', 
                fillOpacity: 0.2, 
                weight: 2 
              }}
            />
            <CircleMarker
              center={selectedLahan.kordinat}
              radius={6}
              pathOptions={{ color: '#fff', fillColor: '#1f2937', fillOpacity: 1, weight: 2 }}
            />
          </MapContainer>

          {/* Overlay Info Kiri Atas */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3 z-[400]">
            <MapPinned size={18} className="text-emerald-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Fokus Koordinat</p>
              <p className="text-sm font-bold text-gray-800">{selectedLahan.kordinat[0].toFixed(5)}, {selectedLahan.kordinat[1].toFixed(5)}</p>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: DAFTAR VERIFIKASI & METRIK */}
        <div className="bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col h-[500px] lg:h-auto">
          
          {/* Metrik Terpilih */}
          <div className="p-5 lg:p-6 bg-white border-b border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <ScanSearch size={18} /> Detail Analisis
                </div>
                {selectedLahan.statusLahan === 'terverifikasi' ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <CheckCircle2 size={14}/> Lolos Verifikasi
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                    <AlertTriangle size={14}/> Belum Diaudit
                  </span>
                )}
             </div>

             <div className="grid grid-cols-2 gap-3 mb-4">
               {/* Update warna otomatis jika nilai NDVI dari satelit berupa angka riil */}
               <InfoCard 
                  title="Kesehatan (NDVI)" 
                  value={selectedLahan.ndvi} 
                  tone={
                    typeof selectedLahan.ndvi === 'number' && selectedLahan.ndvi >= 0.6 ? 'text-emerald-600' : 
                    typeof selectedLahan.ndvi === 'number' && selectedLahan.ndvi >= 0.4 ? 'text-amber-500' : 
                    selectedLahan.ndvi === 'Tinggi' ? 'text-emerald-600' : 
                    'text-gray-800'
                  } 
               />
               <InfoCard title="Skor Validasi" value={`${selectedLahan.skor}/100`} tone="text-gray-800" />
             </div>

             {selectedLahan.statusLahan === 'terverifikasi' ? (
                <button disabled className="w-full py-2.5 bg-gray-100 text-gray-400 font-bold rounded-xl text-sm cursor-not-allowed">
                  Lahan Telah Disetujui
                </button>
             ) : (
                <button 
                  onClick={handleVerifikasi}
                  disabled={isVerifying}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {isVerifying ? 'Memproses...' : 'Setujui Kontrak Lahan Ini'}
                </button>
             )}
          </div>

          {/* Daftar Antrean */}
          <div className="p-5 lg:p-6 flex-1 overflow-y-auto">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Data Petani KUD ({petaniList.length})
            </h4>
            <div className="flex flex-col gap-2">
              {petaniList.map((lahan) => (
                <button
                  key={lahan.id}
                  onClick={() => setSelectedLahan(lahan)}
                  className={`flex items-center justify-between w-full p-3 rounded-xl border text-left transition-all ${
                    selectedLahan?.id === lahan.id 
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full relative ${selectedLahan?.id === lahan.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      <User size={16} />
                      {lahan.statusLahan === 'terverifikasi' && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full">
                           <CheckCircle2 size={12} className="text-emerald-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{lahan.pemilik}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{lahan.nama} • {lahan.luas}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className={selectedLahan?.id === lahan.id ? 'text-emerald-500' : 'text-gray-300'} />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function InfoCard({ title, value, tone }) {
  return (
    <div className="rounded-xl bg-gray-50/80 border border-gray-100 p-3 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</p>
      <p className={`text-lg font-black mt-1 ${tone}`}>{value}</p>
    </div>
  );
}