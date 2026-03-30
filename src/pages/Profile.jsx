import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Phone, MapPin, Building, Save, Mail, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '', email: '', role: '', no_hp: '', alamat: '', nama_perusahaan: ''
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(import.meta.env.VITE_API_URL + '/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data.pesan);
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...response.data.user }));
    } catch (error) {
      alert('Gagal menyimpan profil.');
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
                {formData.nama.charAt(0).toUpperCase()}
              </div>
              
              {/* Info Singkat */}
              <div className="pt-16 pb-8 px-6 text-center">
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">{formData.nama || 'Pengguna'}</h2>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mb-4">
                  <Mail size={14} /> {formData.email}
                </p>
                <div className="bg-green-50 text-green-700 text-xs px-4 py-2 rounded-xl font-medium border border-green-100">
                  Pastikan data Anda selalu *up-to-date* untuk kelancaran transaksi.
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

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Alamat Lengkap</label>
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition mt-1.5">
                      <MapPin size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                      <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} className="bg-transparent outline-none w-full text-gray-800" required placeholder="Jalan, Kecamatan, Kota" />
                    </div>
                  </div>
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