import { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudRain, Sun, Cloud, Droplets, Wind, MapPin, AlertCircle } from 'lucide-react';

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lokasiTerdeteksi, setLokasiTerdeteksi] = useState('Mendeteksi lokasi...');

  const kodeWilayahBMKG = {
    "Makassar": "73.71.11.1001",
    "Barru": "73.11.04.1001", 
    "Bone": "73.08.08.1001",
    "Gowa": "73.08.08.1001",
    "Maros": "73.09.01.1001",
    "Pangkep": "73.09.01.1001",
    "Wajo": "73.08.08.1001",
    "Palopo": "73.73.01.1001",
  };

  const cariKodeWilayah = (namaAlamatLengkap) => {
    for (const [kota, kode] of Object.entries(kodeWilayahBMKG)) {
        if (namaAlamatLengkap.toLowerCase().includes(kota.toLowerCase())) {
            return { kode, namaKota: kota };
        }
    }
    // UBAH DISINI: Default dikembalikan ke Barru
    return { kode: "73.11.04.1001", namaKota: "Barru (Default)" };
  };

  const inisialisasiCuaca = () => {
    setLoading(true);
    setError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const geoData = await geoRes.json();
            const alamat = geoData.display_name || "Alamat tidak diketahui";
            
            const { kode, namaKota } = cariKodeWilayah(alamat);
            setLokasiTerdeteksi(namaKota);

            // mencoba mengambil data wilayah terdeteksi
            try {
              const response = await axios.get(`${import.meta.env.VITE_API_URL}/weather?adm4=${kode}`);
              setWeatherData(response.data);
            } catch (apiErr) {
              // UBAH DISINI: Fallback dialihkan ke Barru jika wilayah lain error
              console.warn(`Kode wilayah ${kode} (${namaKota}) direspons error oleh BMKG. Mengalihkan ke data resmi terdekat.`);
              
              const fallbackResponse = await axios.get(`${import.meta.env.VITE_API_URL}/weather?adm4=73.11.04.1001`);
              setWeatherData(fallbackResponse.data);
              setLokasiTerdeteksi(`${namaKota} (Menggunakan Stasiun BMKG Barru)`);
            }

          } catch (err) {
             setError(err.response?.data?.message || 'Gagal sinkronisasi data BMKG. Periksa koneksi internet server Anda.');
          } finally {
            setLoading(false);
          }
        },
        (geoError) => {
            setLokasiTerdeteksi("Akses Lokasi Ditolak");
            muatCuacaDefault();
        },
        { timeout: 10000 }
      );
    } else {
       setError('Perangkat tidak mendukung pelacakan cuaca.');
       setLoading(false);
    }
  };

  const muatCuacaDefault = async () => {
    try {
      // UBAH DISINI: Mengambil default cuaca Barru jika akses GPS ditolak
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/weather?adm4=73.11.04.1001`);
      setWeatherData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat cuaca dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    inisialisasiCuaca();
  }, []);

  const getWeatherIcon = (desc) => {
    const d = desc?.toLowerCase() || '';
    if (d.includes('hujan')) return <CloudRain className="text-blue-500 animate-pulse" size={32} />;
    if (d.includes('cerah')) return <Sun className="text-yellow-500" size={32} />;
    return <Cloud className="text-gray-400" size={32} />;
  };

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex justify-center items-center h-[200px]">
         <div className="flex flex-col items-center text-gray-400">
           <MapPin className="animate-bounce mb-3 text-green-600" size={28} />
           <p className="text-xs font-bold uppercase tracking-wider">Melacak Titik Koordinat...</p>
         </div>
      </div>
    );
  }

  if (error || !weatherData || !weatherData.data) {
    return (
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-red-100 h-[200px] flex flex-col justify-center items-center text-center">
        <AlertCircle size={28} className="text-red-400 mb-2"/>
        <p className="text-red-500 text-xs font-bold mb-3">{error}</p>
        <button onClick={inisialisasiCuaca} className="px-4 py-2 bg-red-50 rounded-xl text-red-600 text-xs font-bold hover:bg-red-100 transition">Coba Lacak Ulang</button>
      </div>
    );
  }

  // AMBIL DATA ARRAY CUACA MULTI-HARI
  const prakiraanHarian = weatherData.data[0].cuaca; 
  const prakiraanSekarang = prakiraanHarian[0][0]; 
  const lokasiResmiBMKG = weatherData.lokasi; 

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-3xl shadow-sm border border-blue-100 relative overflow-hidden group h-full flex flex-col">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
      
      {/* HEADER WIDGET */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-800 text-lg truncate">Prakiraan Cuaca</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Data Realtime BMKG</p>
        </div>
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-blue-50 flex-shrink-0 ml-4">
          {getWeatherIcon(prakiraanSekarang.weather_desc)}
        </div>
      </div>

      {/* DETAIL LOKASI DAN SUHU SEKARANG */}
      <div className="mb-4 relative z-10">
        <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
           <MapPin size={12} className="text-green-600"/> 
           {/* UBAH DISINI: Pengecekan text default diubah ke Barru */}
           {lokasiTerdeteksi !== 'Barru (Default)' && lokasiTerdeteksi !== 'Akses Lokasi Ditolak' 
              ? `Area ${lokasiTerdeteksi}` 
              : `${lokasiResmiBMKG.kecamatan}, ${lokasiResmiBMKG.kotkab}`}
        </p>
        <div className="flex items-center gap-3 mt-1">
            <p className="text-4xl font-black text-blue-600 tracking-tighter">{prakiraanSekarang.t}°C</p>
            <p className="text-sm font-bold text-gray-600 capitalize bg-white/60 px-3 py-1 rounded-lg border border-white">
                {prakiraanSekarang.weather_desc}
            </p>
        </div>
      </div>

      {/* KELEMBAPAN & ANGIN */}
      <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 bg-white/50 p-2 rounded-xl">
          <Droplets size={16} className="text-blue-400" />
          <span>Lembap: {prakiraanSekarang.hu}%</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 bg-white/50 p-2 rounded-xl">
          <Wind size={16} className="text-gray-400" />
          <span>Angin: {prakiraanSekarang.ws} km/j</span>
        </div>
      </div>

      {/* PANEL RAMALAN MULTI-HARI (HARI INI, BESOK, LUSA) */}
      <div className="border-t border-blue-100/50 pt-3 mt-auto relative z-10">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Prakiraan 3 Hari Ke Depan</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {prakiraanHarian.slice(0, 3).map((hari, index) => {
            // Mengambil jam pertama dari masing-masing array hari
            const dataHari = hari[0] || hari; 
            const labelHari = index === 0 ? 'Hari Ini' : index === 1 ? 'Besok' : 'Lusa';
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center min-w-[75px] bg-white/60 border border-white p-2 rounded-xl">
                <span className="text-[10px] font-bold text-gray-500">{labelHari}</span>
                <div className="my-1 scale-75">
                  {getWeatherIcon(dataHari.weather_desc)}
                </div>
                <span className="text-sm font-black text-gray-800">{dataHari.t}°C</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}