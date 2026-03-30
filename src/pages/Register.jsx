import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Building, User, Mail, Lock, Phone, Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama: '', email: '', password: '', role: 'petani', no_hp: '', alamat: '', nama_perusahaan: ''
  });
  
  const [koordinat, setKoordinat] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole, nama_perusahaan: selectedRole === 'petani' ? '' : formData.nama_perusahaan });
  };

  const dapatkanLokasi = () => {
    setIsLocating(true);
    toast.loading("Melacak satelit...", { id: 'gps' });
    
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
              toast.success('Lokasi dikunci! ✅', { id: 'gps' });
            }
          } catch (error) {
            toast.error('Gagal memuat teks alamat.', { id: 'gps' });
          }
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          toast.error('Gagal melacak. Pastikan GPS aktif.', { id: 'gps' });
        }
      );
    } else {
      toast.error("Browser tidak mendukung GPS.", { id: 'gps' });
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSubmit = { ...formData, koordinat_lokasi: koordinat };
      const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/register', dataToSubmit);
      
      toast.success(response.data.pesan);
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.pesan || 'Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Menggunakan h-screen agar pas 1 layar desktop tanpa scrollbar (tergantung resolusi)
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Container Lebar (max-w-4xl) untuk menampung Grid 2 Kolom di Desktop */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-4xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        
        {/* SISI KIRI (Khusus Desktop): Logo & Judul Simple */}
        <div className="w-full md:w-1/3 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
            <Sprout className="text-primary" size={36} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">Buat Akun<br/>AgroCelebes</h2>
          <p className="text-gray-500 text-sm mb-6">Bergabunglah dengan ekosistem pertanian digital terintegrasi di Sulawesi.</p>
          <div className="hidden md:block w-16 h-1 bg-primary rounded-full mb-6"></div>
          <p className="hidden md:block text-sm text-gray-600 font-medium">
            Sudah punya akun? <br/>
            <Link to="/login" className="text-primary font-extrabold hover:underline mt-1 inline-block">Masuk ke sistem ➔</Link>
          </p>
        </div>

        {/* SISI KANAN: Form Grid Responsif */}
        <div className="w-full md:w-2/3 bg-gray-50/50 p-1 rounded-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* 1. ROLE SELECTOR (Kompak) */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" onClick={() => handleRoleChange('petani')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.role === 'petani' ? 'border-primary bg-green-50 text-primary shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <Sprout size={20} /> <span className="font-bold text-sm">Petani</span>
              </button>
              <button 
                type="button" onClick={() => handleRoleChange('pembeli')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.role === 'pembeli' ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                <Building size={20} /> <span className="font-bold text-sm">Pembeli / PT</span>
              </button>
            </div>

            {/* Input Nama Perusahaan (Muncul jika Pembeli) */}
            {formData.role === 'pembeli' && (
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
                <Building className="text-gray-400 mr-3" size={18} />
                <input type="text" name="nama_perusahaan" placeholder="Nama Perusahaan (PT/CV)" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm" />
              </div>
            )}

            {/* 2. GRID 2 KOLOM UNTUK DESKTOP (Agar tidak memakan tinggi layar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                <User className="text-gray-400 mr-3" size={18} />
                <input type="text" name="nama" placeholder="Nama Lengkap" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm" />
              </div>

              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Mail className="text-gray-400 mr-3" size={18} />
                <input type="email" name="email" placeholder="Email Aktif" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm" />
              </div>

              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Lock className="text-gray-400 mr-3" size={18} />
                <input type="password" name="password" placeholder="Buat Password" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm" />
              </div>

              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                <Phone className="text-gray-400 mr-3" size={18} />
                <input type="text" name="no_hp" placeholder="No. WhatsApp (+62)" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm" />
              </div>
            </div>
            
            {/* 3. ALAMAT & LOKASI (Full Width) */}
            <div className="flex gap-2">
              <div className={`flex-1 flex items-center bg-white border rounded-xl p-3 transition ${koordinat ? 'border-green-500 bg-green-50' : 'border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'}`}>
                <MapPin className={`${koordinat ? 'text-green-500' : 'text-gray-400'} mr-3`} size={18} />
                <input type="text" name="alamat" value={formData.alamat} placeholder="Alamat Lengkap / Lahan" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm" />
              </div>
              <button 
                type="button" onClick={dapatkanLokasi} disabled={koordinat !== null || isLocating} 
                className={`p-3 rounded-xl flex items-center justify-center transition-all shadow-sm flex-shrink-0 border ${koordinat ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
                title="Lacak GPS Otomatis"
              >
                {koordinat ? <CheckCircle2 size={20} /> : <MapPin size={20} className={isLocating ? 'animate-bounce text-blue-500' : ''} />}
              </button>
            </div>

            {/* 4. TOMBOL SUBMIT */}
            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md group mt-1">
              {loading ? 'Memproses...' : <>Daftar Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          {/* Muncul di HP saja karena di desktop dipindah ke kiri */}
          <p className="md:hidden mt-6 text-center text-sm text-gray-600">
            Sudah punya akun? <Link to="/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
          </p>
        </div>

      </div>
    </div>
  );
}