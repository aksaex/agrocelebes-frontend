import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, ShieldCheck } from 'lucide-react'; // ArrowLeft dihapus
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/forgot-password', { email, no_hp: noHp });
      toast.success(res.data.pesan);
      setTimeout(() => navigate(`/reset-password/${res.data.token}`), 1500);
    } catch (error) {
      toast.error(error.response?.data?.pesan || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Memenuhi 1 layar penuh tanpa scrollbar (overflow-hidden)
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Container Lebar (max-w-3xl) bergaya Split-Card untuk Desktop */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-3xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
        
        {/* SISI KIRI: Ikon dan Pesan (Lebih bersih tanpa tombol kembali) */}
        <div className="w-full md:w-5/12 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-green-100">
            <ShieldCheck className="text-primary" size={32} />
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">Pemulihan<br/>Akun</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2 md:mb-0">
            Masukkan email dan Nomor WhatsApp Anda untuk memverifikasi identitas. Kami akan langsung membuka akses pembuatan sandi baru.
          </p>
        </div>

        {/* SISI KANAN: Form Input & Link Bawah */}
        <div className="w-full md:w-7/12 bg-gray-50/50 p-6 md:p-8 rounded-[1.5rem] border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition shadow-sm">
              <Mail size={20} className="text-gray-400 mr-3" />
              <input 
                type="email" placeholder="Email Terdaftar" required 
                value={email} onChange={(e) => setEmail(e.target.value)} 
                className="bg-transparent outline-none w-full text-sm" 
              />
            </div>

            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition shadow-sm">
              <Phone size={20} className="text-gray-400 mr-3" />
              <input 
                type="text" placeholder="Nomor WhatsApp (Cth: 0812...)" required 
                value={noHp} onChange={(e) => setNoHp(e.target.value)} 
                className="bg-transparent outline-none w-full text-sm" 
              />
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full mt-2 bg-primary text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi Identitas'}
            </button>
            
          </form>

          {/* TEKS NAVIGASI BAWAH YANG KONSISTEN & ELEGAN */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Teringat sandi Anda? <Link to="/login" className="text-primary font-bold hover:underline">Masuk di sini</Link>
          </p>

        </div>

      </div>
    </div>
  );
}