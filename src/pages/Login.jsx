import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast'; 

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(`Selamat datang kembali, ${response.data.user.nama}!`);
      
      // PENGALIHAN PINTAR BERBASIS PERAN (ROLE)
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      toast.error(error.response?.data?.pesan || 'Email atau Password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Container Utama: Mengikuti gaya Register.jsx (max-w-4xl) */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-4xl border border-gray-100 flex flex-col md:flex-row gap-8 lg:gap-16 items-center">
        
        {/* SISI KIRI: Branding & Sambutan */}
        <div className="w-full md:w-1/2 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
            <ShieldCheck className="text-primary" size={36} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">Selamat Datang<br/>Kembali</h2>
          <p className="text-gray-500 text-sm mb-6">Masuk ke akun AgroCelebes Anda untuk mengelola komoditas dan memantau pasar B2B.</p>
          
          <div className="hidden md:block w-16 h-1 bg-primary rounded-full mb-6"></div>
          
          <p className="hidden md:block text-sm text-gray-600 font-medium">
            Belum punya akun? <br/>
            <Link to="/register" className="text-primary font-extrabold hover:underline mt-1 inline-flex items-center gap-1 group">
              Daftar sekarang <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>

        {/* SISI KANAN: Form Login */}
        <div className="w-full md:w-1/2 bg-gray-50/50 p-2 rounded-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
              <Mail size={20} className="text-gray-400 mr-3" />
              <input 
                type="email" placeholder="Email Terdaftar" required value={email}
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-transparent outline-none w-full text-sm" 
              />
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
              <Lock size={20} className="text-gray-400 mr-3" />
              <input 
                type="password" placeholder="Password" required value={password}
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-transparent outline-none w-full text-sm" 
              />
            </div>

            <div className="flex justify-end mt-[-10px]">
              <Link to="/forgot-password" className="text-sm text-red-500 font-semibold hover:underline">
                Lupa Sandi?
              </Link>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full mt-2 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md group"
            >
              {loading ? 'Memverifikasi...' : <><LogIn size={20} /> Masuk ke Sistem</>}
            </button>
          </form>

          {/* Muncul di HP saja karena di desktop dipindah ke kiri */}
          <p className="md:hidden mt-8 text-center text-sm text-gray-600">
            Belum punya akun? <Link to="/register" className="text-primary font-bold hover:underline">Daftar di sini</Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}