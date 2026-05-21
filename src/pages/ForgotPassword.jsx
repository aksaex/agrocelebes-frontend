import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Mencari data akun...');
    
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/forgot-password', { email });
      
      // Munculkan pesan sukses (Email terkirim)
      toast.success(res.data.pesan, { id: toastId, duration: 5000 });
      
      // Kosongkan form agar aman
      setEmail('');
      
      // TIDAK ADA LAGI setTimeout(() => navigate(...)) di sini!
      // Pengguna dipaksa buka email mereka sendiri untuk dapat linknya.
      
    } catch (error) {
      toast.error(error.response?.data?.pesan || 'Email tidak terdaftar di sistem.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-3xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        
        <div className="w-full md:w-5/12 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">Pemulihan<br/>Via Email</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4 md:mb-0">
            Masukkan alamat email yang Anda gunakan saat mendaftar. Kami akan memverifikasinya untuk memulihkan akses Anda.
          </p>
          <div className="hidden md:block w-16 h-1 bg-primary rounded-full mt-6"></div>
        </div>

        <div className="w-full md:w-7/12 bg-gray-50/50 p-6 md:p-8 rounded-[1.5rem] border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
               <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">Alamat Email Terdaftar</label>
               <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition shadow-sm">
                 <Mail size={20} className="text-gray-400 mr-3" />
                 <input 
                   type="email" placeholder="contoh@gmail.com" required 
                   value={email} onChange={(e) => setEmail(e.target.value)} 
                   className="bg-transparent outline-none w-full text-sm font-medium text-gray-700" 
                 />
               </div>
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full mt-2 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md group"
            >
              {loading ? 'Memverifikasi...' : <>Cari Akun Saya <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
            
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Teringat sandi Anda? <Link to="/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
          </p>

        </div>
      </div>
    </div>
  );
}