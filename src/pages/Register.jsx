import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Building, User, Mail, Lock, Phone, Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import OnboardingModal from '../components/OnboardingModal'; 

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama: '', email: '', password: '', role: 'petani', no_hp: '', alamat: '', nama_perusahaan: ''
  });
  
  const [koordinat, setKoordinat] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole, nama_perusahaan: selectedRole === 'petani' ? '' : formData.nama_perusahaan });
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const toastId = toast.loading('Memverifikasi dengan Google..');
      try {
        setGoogleAccessToken(tokenResponse.access_token);
        
        // ✅ PERBAIKAN: Jangan kirim 'role' di sini.
        // Tujuannya agar backend merespon dengan 'isNewUser: true' jika user belum terdaftar.
        const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/google', {
          access_token: tokenResponse.access_token
        });

        if (res.data.isNewUser) {
          toast.dismiss(toastId);
          setShowOnboarding(true); 
        } else {
          // Jika ternyata user sudah punya akun, langsung login-kan
          if (res.data.token) localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          toast.success(`Selamat datang kembali, ${res.data.user.nama}!`, { id: toastId });
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Gagal memverifikasi akun Google.', { id: toastId });
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Koneksi ke Google dibatalkan.'),
    prompt: 'select_account'
  });

  const handleOnboardingSuccess = (data) => {
    // ✅ PERBAIKAN: Aktifkan penyimpanan token jika backend Anda mengirimkannya
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    setShowOnboarding(false);
    toast.success("Profil berhasil dilengkapi!");
    navigate('/dashboard');
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
          } catch (error) { toast.error('Gagal memuat teks alamat.', { id: 'gps' }); }
          setIsLocating(false);
        },
        () => { setIsLocating(false); toast.error('Gagal melacak. Pastikan GPS aktif.', { id: 'gps' }); }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi Sederhana
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
        return toast.error("Sandi harus 8+ karakter, mengandung huruf besar, angka, dan simbol.");
    }

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans py-8 relative">
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-5xl border border-gray-100 flex flex-col md:flex-row gap-8 lg:gap-12 items-center">
        
        {/* SISI KIRI (Branding) */}
        <div className="w-full md:w-5/12 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
            <Sprout className="text-primary" size={36} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">Buat Akun<br/>AgroCelebes</h2>
          <p className="text-gray-500 text-sm mb-6">Bergabunglah dengan ekosistem pertanian Sulawesi.</p>
          <div className="hidden md:block w-16 h-1 bg-primary rounded-full mb-6"></div>
          <p className="hidden md:block text-sm text-gray-600 font-medium">
            Sudah punya akun? <br/>
            <Link to="/login" className="text-primary font-extrabold hover:underline mt-1 inline-flex items-center gap-1 group">
              Masuk ke sistem <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>

        {/* SISI KANAN (Form) */}
        <div className="w-full md:w-7/12 bg-gray-50/50 p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-inner">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleRoleChange('petani')} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.role === 'petani' ? 'border-primary bg-green-50 text-primary shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                <Sprout size={20} /> <span className="font-bold text-sm">Petani</span>
              </button>
              <button type="button" onClick={() => handleRoleChange('pembeli')} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.role === 'pembeli' ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}>
                <Building size={20} /> <span className="font-bold text-sm">Pembeli</span>
              </button>
            </div>

            {formData.role === 'pembeli' && (
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-blue-500 transition">
                <Building className="text-gray-400 mr-3" size={18} />
                <input type="text" name="nama_perusahaan" placeholder="Nama Perusahaan" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-medium text-gray-700" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary transition">
                <User className="text-gray-400 mr-3" size={18} />
                <input type="text" name="nama" placeholder="Nama Lengkap" required minLength="3" onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-medium text-gray-700" />
              </div>
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary transition">
                <Mail className="text-gray-400 mr-3" size={18} />
                <input type="email" name="email" placeholder="Email Aktif" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-medium text-gray-700" />
              </div>
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary transition">
                <Lock className="text-gray-400 mr-3" size={18} />
                <input type="password" name="password" placeholder="Buat Password" required onChange={handleChange} className="w-full bg-transparent outline-none text-sm font-medium text-gray-700" />
              </div>
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary transition">
                <Phone className="text-gray-400 mr-3" size={18} />
                <input 
                  type="tel" name="no_hp" placeholder="Nomor WhatsApp" required maxLength="15"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value.replace(/\D/g, '') })} 
                  className="w-full bg-transparent outline-none text-sm font-medium text-gray-700" 
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className={`flex-1 flex items-center bg-white border rounded-xl p-3 transition ${koordinat ? 'border-green-500 bg-green-50' : 'border-gray-200 focus-within:border-primary'}`}>
                <MapPin className={`${koordinat ? 'text-green-500' : 'text-gray-400'} mr-3 flex-shrink-0`} size={18} />
                <input type="text" name="alamat" value={formData.alamat} placeholder="Klik Tombol GPS" required readOnly className="w-full bg-transparent outline-none text-sm font-medium text-gray-700 truncate cursor-not-allowed" />
              </div>
              <button type="button" onClick={dapatkanLokasi} disabled={koordinat !== null || isLocating} className={`p-3 rounded-xl flex items-center justify-center transition-all shadow-sm flex-shrink-0 border ${koordinat ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {koordinat ? <CheckCircle2 size={20} /> : <MapPin size={20} className={isLocating ? 'animate-bounce text-blue-500' : ''} />}
              </button>
            </div>

            <button type="submit" disabled={loading || !koordinat} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md mt-1">
              Daftar
            </button>
            
            <div className="flex items-center py-1 text-gray-400 text-xs font-bold uppercase text-center mt-1">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4">atau daftar cepat</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button type="button" onClick={() => handleGoogleLogin()} disabled={loading} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Masuk dengan Google
            </button>
          </form>
          {/*KODE INI UNTUK TAMPILAN HP*/}
          <p className="md:hidden mt-8 text-center text-sm text-gray-600 font-medium">
            Sudah punya akun? <Link to="/login" className="text-primary font-extrabold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>

      <OnboardingModal 
        isOpen={showOnboarding} 
        googleAccessToken={googleAccessToken} 
        defaultRole={formData.role} // ✅ Mengambil role yang sudah dipilih di UI
        onSuccess={handleOnboardingSuccess} 
      />
    </div>
  );
}