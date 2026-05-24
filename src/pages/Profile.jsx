import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Phone, MapPin, Building, Save, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast'; // Tambahkan import toast

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '', email: '', role: '', no_hp: '', alamat: '', nama_perusahaan: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // State tambahan untuk GPS
  const [koordinat, setKoordinat] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
    } else {
      setFormData({
        nama: user.nama || '',
        email: user.email || '',
        role: user.role || '',
        no_hp: user.no_hp || '',
        alamat: user.alamat || '',
        nama_perusahaan: user.nama_perusahaan || ''
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
  if (e.target.name === 'no_hp') {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, no_hp: onlyNumbers });
  } else {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
};

  // FUNGSI PELACAK LOKASI (Diambil dari Register)
  const dapatkanLokasi = () => {
    setIsLocating(true);
    toast.loading("Melacak satelit...", { id: 'gpsProfile' });
    
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
              setFormData(prev => ({ ...prev, alamat: data.display_name }));
              toast.success('Lokasi berhasil diperbarui! ✅', { id: 'gpsProfile' });
            }
          } catch (error) {
            toast.error('Gagal memuat teks alamat.', { id: 'gpsProfile' });
          }
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          toast.error('Gagal melacak. Pastikan GPS aktif.', { id: 'gpsProfile' });
        }
      );
    } else {
      toast.error("Browser tidak mendukung GPS.", { id: 'gpsProfile' });
      setIsLocating(false);
    }
  };

const handleSave = async (e) => {
  e.preventDefault();
  
  // Validasi Ketat
  const waRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  if (!waRegex.test(formData.no_hp)) {
    return toast.error("Format Nomor WhatsApp tidak valid!");
  }

  setIsSaving(true);
  const loadingToast = toast.loading('Menyimpan perubahan...');
  
  try {
    const token = localStorage.getItem('user');
    const dataToSubmit = { ...formData, koordinat_lokasi: koordinat };
    
    const response = await axios.put(import.meta.env.VITE_API_URL + '/auth/profile', dataToSubmit, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    toast.success(response.data.pesan, { id: loadingToast });
    localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...response.data.user }));
  } catch (error) {
    toast.error('Gagal menyimpan profil.', { id: loadingToast });
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans p-4 md:p-6 lg:p-8 w-full">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition text-gray-600 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">Pengaturan Profil</h1>
        </div>

        {/* Grid Container yang Responsif */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* KOLOM KIRI: KARTU PROFIL (Menempati 1 bagian grid di Desktop) */}
          <div className="lg:col-span-1 h-fit">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              {/* Banner Background */}
              <div className="bg-gradient-to-r from-primary to-green-500 h-32 w-full relative">
                {/* Badge Role */}
                <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-white/30">
                  <ShieldCheck size={14} /> {formData.role}
                </span>
              </div>
              
              {/* Foto Profil Melayang */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white text-5xl font-bold text-primary transition-transform group-hover:scale-105">
                {formData.nama ? formData.nama.charAt(0).toUpperCase() : 'U'}
              </div>
              
              {/* Info Singkat */}
              <div className="pt-16 pb-8 px-6 text-center">
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">{formData.nama || 'Pengguna'}</h2>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mb-4">
                  <Mail size={14} /> {formData.email}
                </p>
                <div className="bg-green-50 text-green-700 text-xs px-4 py-2 rounded-xl font-medium border border-green-100">
                  Pastikan data Anda selalu up-to-date untuk kelancaran transaksi.
                </div>
              </div>
            </div>
          </div>
          
          {/* KOLOM KANAN: FORM EDIT (Menempati 2 bagian grid di Desktop) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-6">Informasi Pribadi</h3>

              <form onSubmit={handleSave} className="flex flex-col gap-5">
                
                {/* Grid dalam Form untuk tampilan 2 kolom berdampingan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nama Lengkap</label>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition mt-1.5">
                      <User size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                      <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="bg-transparent outline-none w-full text-gray-800" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email <span className="text-red-400 lowercase font-normal">(Terhubung)</span></label>
                    <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl p-3 mt-1.5 opacity-70">
                      <Mail size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                      <input type="email" value={formData.email} disabled className="bg-transparent outline-none w-full text-gray-600 cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                {formData.role === 'pembeli' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nama Perusahaan / PT</label>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition mt-1.5">
                      <Building size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                      <input type="text" name="nama_perusahaan" value={formData.nama_perusahaan} onChange={handleChange} className="bg-transparent outline-none w-full text-gray-800" placeholder="Misal: PT Maju Jaya" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nomor WhatsApp</label>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition mt-1.5">
                      <Phone size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                      <input type="text" name="no_hp" value={formData.no_hp} onChange={handleChange} className="bg-transparent outline-none w-full text-gray-800" required placeholder="+62..." />
                    </div>
                  </div>

                  {/* UPDATE BAGIAN INI: Penguncian Input GPS (Anti-Spoofing) */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      Alamat Lengkap <span className="text-red-500 lowercase font-normal">(Terkunci)</span>
                    </label>
                    <div className="flex gap-2 mt-1.5">
                      <div className={`flex-1 flex items-center bg-gray-50 border rounded-xl p-3 transition ${koordinat ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <MapPin size={18} className={`${koordinat ? 'text-green-500' : 'text-gray-400'} mr-2 flex-shrink-0`} />
                        <input 
                          type="text" 
                          name="alamat" 
                          value={formData.alamat} 
                          readOnly // KUNCI KEAMANAN: Tidak bisa diketik manual
                          className="bg-transparent outline-none w-full text-gray-600 cursor-not-allowed text-sm" 
                          required 
                          placeholder="Perbarui via GPS ➔" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={dapatkanLokasi} 
                        disabled={isLocating} 
                        className={`p-3 rounded-xl flex items-center justify-center transition-all shadow-sm flex-shrink-0 border ${koordinat ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                        title="Perbarui via GPS Satelit"
                      >
                        {koordinat ? <CheckCircle2 size={20} /> : <MapPin size={20} className={isLocating ? 'animate-bounce text-blue-500' : ''} />}
                      </button>
                    </div>
                  </div>
                  {/* AKHIR UPDATE GPS */}

                </div>

                <div className="border-t border-gray-100 pt-6 mt-2 flex justify-end">
                  <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-8 bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md shadow-primary/20">
                    <Save size={20} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}