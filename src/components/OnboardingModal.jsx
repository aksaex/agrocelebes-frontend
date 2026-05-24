import { useState } from 'react';
import axios from 'axios';
import { MapPin, Building, Phone, Sprout, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingModal({ isOpen, googleAccessToken, defaultRole = 'petani', onSuccess }) {
  const [onboardingData, setOnboardingData] = useState({
    role: defaultRole, no_hp: '', alamat: '', nama_perusahaan: ''
  });
  const [koordinat, setKoordinat] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const dapatkanLokasi = () => {
    setIsLocating(true);
    toast.loading("Melacak satelit...", { id: 'gpsModal' });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setKoordinat({ lat, lng });

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.display_name) {
              setOnboardingData(prev => ({ ...prev, alamat: data.display_name }));
              toast.success('Lokasi dikunci! ✅', { id: 'gpsModal' });
            }
          } catch (error) {
            toast.error('Gagal memuat teks alamat.', { id: 'gpsModal' });
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          toast.error('Gagal melacak. Pastikan GPS aktif/diizinkan.', { id: 'gpsModal' });
        }
      );
    } else {
      toast.error("Browser tidak mendukung GPS.", { id: 'gpsModal' });
      setIsLocating(false);
    }
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDASI REGEX NOMOR WA INDONESIA ---
    const waRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    if (!waRegex.test(onboardingData.no_hp)) {
      return toast.error('Nomor WhatsApp tidak valid');
    }
    // -----------------------------------------

    setLoading(true);
    const toastId = toast.loading('Memproses Akun...');
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/google', {
        access_token: googleAccessToken,
        koordinat_lokasi: koordinat,
        ...onboardingData
      });

      onSuccess(res.data);
      toast.success(`Akun berhasil dibuat! Selamat datang, ${res.data.user.nama}!`, { id: toastId });
    } catch (err) {
      toast.error('Gagal mengirim data tambahan(nomor sudah ada).', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-100 max-w-md w-full animate-scale-in">
        <div className="text-center mb-5">
          <h3 className="font-black text-xl text-gray-900">Satu Langkah Lagi</h3>
          <p className="text-xs text-gray-500 mt-1">Akun Google terhubung. Mohon lengkapi profil Anda.</p>
        </div>

        <form onSubmit={handleOnboardingSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setOnboardingData({...onboardingData, role: 'petani'})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition font-bold text-xs ${onboardingData.role === 'petani' ? 'border-primary bg-green-50 text-primary' : 'border-gray-200 bg-white text-gray-500'}`}>
              <Sprout size={16} /> Petani
            </button>
            <button type="button" onClick={() => setOnboardingData({...onboardingData, role: 'pembeli'})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition font-bold text-xs ${onboardingData.role === 'pembeli' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-500'}`}>
              <Building size={16} /> Pembeli
            </button>
          </div>

          {onboardingData.role === 'pembeli' && (
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:bg-white transition">
              <Building size={18} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Nama Perusahaan" required onChange={(e) => setOnboardingData({...onboardingData, nama_perusahaan: e.target.value})} className="bg-transparent outline-none w-full text-xs font-semibold text-gray-700" />
            </div>
          )}

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:bg-white transition">
            <Phone size={18} className="text-gray-400 mr-2" />
            <input 
              type="tel" 
              placeholder="Nomor WhatsApp" 
              required 
              minLength="10"
              maxLength="15"
              value={onboardingData.no_hp}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '');
                setOnboardingData({...onboardingData, no_hp: onlyNumbers});
              }} 
              className="bg-transparent outline-none w-full text-xs font-semibold text-gray-700" 
            />
          </div>

          <div className="flex gap-2">
            <div className={`flex-1 flex items-center bg-gray-50 border rounded-xl p-3 transition ${koordinat ? 'border-green-500 bg-green-50' : 'border-gray-200 focus-within:bg-white'}`}>
              <MapPin size={18} className={`${koordinat ? 'text-green-500' : 'text-gray-400'} mr-2 flex-shrink-0`} />
              <input 
                type="text" 
                placeholder="Klik tombol GPS" 
                required 
                readOnly 
                value={onboardingData.alamat} 
                className="bg-transparent outline-none w-full text-xs font-semibold text-gray-700 cursor-not-allowed truncate" 
              />
            </div>
            <button 
              type="button" onClick={dapatkanLokasi} disabled={koordinat !== null || isLocating} 
              className={`p-3 rounded-xl flex items-center justify-center transition-all shadow-sm flex-shrink-0 border ${koordinat ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
              title="Lacak GPS Otomatis"
            >
              {koordinat ? <CheckCircle2 size={18} /> : <MapPin size={18} className={isLocating ? 'animate-bounce text-blue-500' : ''} />}
            </button>
          </div>

          <button type="submit" disabled={loading || !koordinat} className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mt-2">
            {loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
          </button>
        </form>
      </div>
    </div>
  );
}