import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Password tidak cocok!");
    }
    if (password.length < 6) {
      return toast.error("Password minimal 6 karakter!");
    }

    setLoading(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, { password });
      toast.success(res.data.pesan || "Password berhasil diubah!");
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.pesan || "Token tidak valid atau kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Container Proporsional (max-w-3xl) untuk Grid 2 Kolom Mini */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-3xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        
        {/* SISI KIRI: Branding & Pesan Keamanan */}
        <div className="w-full md:w-5/12 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
            <ShieldCheck className="text-primary" size={36} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">Keamanan<br/>Akun Baru</h2>
          <p className="text-gray-500 text-sm mb-6">Langkah terakhir! Buat sandi yang kuat dan rahasia untuk mengamankan kembali akun AgroCelebes Anda.</p>
          <div className="hidden md:block w-16 h-1 bg-primary rounded-full"></div>
        </div>

        {/* SISI KANAN: Form Input */}
        <div className="w-full md:w-7/12 bg-gray-50/50 p-2 rounded-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Sandi Baru</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition shadow-sm">
                <Lock size={18} className="text-gray-400 mr-3" />
                <input 
                  type="password" placeholder="Minimal 6 karakter" required 
                  value={password} onChange={(e) => setPassword(e.target.value)} 
                  className="bg-transparent outline-none w-full text-sm" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Konfirmasi Sandi Baru</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition shadow-sm">
                <CheckCircle2 size={18} className="text-gray-400 mr-3" />
                <input 
                  type="password" placeholder="Ketik ulang sandi baru" required 
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="bg-transparent outline-none w-full text-sm" 
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full mt-4 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md group"
            >
              {loading ? 'Memproses...' : 'Simpan Sandi Baru'}
        </button>
      </form>
    </div>

      </div>
    </div>
  );
}