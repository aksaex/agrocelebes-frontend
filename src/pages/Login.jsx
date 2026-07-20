import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react'; // ✨ TAMBAHKAN Eye dan EyeOff
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import OnboardingModal from '../components/OnboardingModal';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✨ STATE UNTUK TOGGLE PASSWORD

  // STATE UNTUK MODAL
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState('');

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const toastId = toast.loading('Memverifikasi...');
      try {
        setGoogleAccessToken(tokenResponse.access_token);
        const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/google', { access_token: tokenResponse.access_token });
        if (res.data.isNewUser) {
          toast.dismiss(toastId);
          setShowOnboarding(true); 
        } else {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          toast.success(`Selamat datang, ${res.data.user.nama}!`, { id: toastId });
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Gagal masuk dengan Google.', { id: toastId });
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Koneksi dibatalkan.'),
    prompt: 'select_account'
  });

  const handleOnboardingSuccess = (data) => {
    localStorage.setItem('user', JSON.stringify(data.user));
    setShowOnboarding(false);
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      
      localStorage.setItem('user', JSON.stringify(response.data.user)); 
      navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error('Email atau Password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-4xl border border-gray-100 flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
        
        {/* SISI KIRI */}
        <div className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
            <ShieldCheck className="text-primary" size={36} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">Selamat Datang</h2>
          <p className="text-gray-500 text-sm mb-6">Masuk ke akun AgroCelebes Anda.</p>
          <div className="hidden md:block w-16 h-1 bg-primary rounded-full mb-6"></div>
          <p className="hidden md:block text-sm text-gray-600 font-medium">
            Belum punya akun? <br/>
            <Link to="/register" className="text-primary font-extrabold hover:underline mt-1 inline-flex items-center gap-1 group">
              Daftar sekarang <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>

        {/* SISI KANAN */}
        <div className="w-full md:w-1/2 bg-gray-50/50 p-6 sm:p-8 rounded-3xl border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary transition shadow-sm">
              <Mail size={20} className="text-gray-400 mr-3" />
              <input type="email" placeholder="Email Terdaftar" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent outline-none w-full text-sm font-medium" />
            </div>

            {/* ✨ BAGIAN PASSWORD YANG DIUBAH */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary transition shadow-sm">
              <Lock size={20} className="text-gray-400 mr-3" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-transparent outline-none w-full text-sm font-medium" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition ml-2"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-red-500 font-bold hover:underline hover:text-red-700">Lupa Sandi?</Link>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition shadow-md">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
            
            <div className="flex items-center py-2 text-gray-400 text-xs font-bold uppercase text-center">
              <div className="flex-grow border-t"></div>
              <span className="px-4">atau</span>
              <div className="flex-grow border-t"></div>
            </div>

            <button type="button" onClick={handleGoogleLogin} className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Masuk dengan Google
            </button>
          </form>

          <p className="md:hidden mt-8 text-center text-sm text-gray-600">
            Belum punya akun? <Link to="/register" className="text-primary font-bold hover:underline">Daftar di sini</Link>
          </p>
        </div>
      </div>

      <OnboardingModal 
        isOpen={showOnboarding} 
        googleAccessToken={googleAccessToken} 
        onSuccess={handleOnboardingSuccess} 
      />

    </div>
  );
}