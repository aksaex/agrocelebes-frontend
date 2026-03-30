import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Trash2, Users, ArrowLeft, Building, Sprout, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast'; // Menggunakan notifikasi modern

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Pengecekan keamanan sudah ditangani oleh ProtectedRoute di App.jsx
    // Jadi kita bisa langsung fokus mengambil data.
    fetchUsers(localStorage.getItem('token'));
  }, []);

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      toast.error('Gagal mengambil data pengguna.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id, nama) => {
    // Kita tetap menggunakan window.confirm karena ini adalah tindakan destruktif tingkat tinggi
    if (window.confirm(`⚠️ PERINGATAN FATAL!\n\nAnda akan menghapus akun "${nama}" beserta seluruh produk komoditas dan fotonya secara permanen.\n\nLanjutkan?`)) {
      const toastId = toast.loading('Menghapus pengguna dan data terkait...');
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success(`Pengguna ${nama} berhasil dihapus!`, { id: toastId });
        setUsers(users.filter(u => u._id !== id)); // Hapus dari layar seketika
      } catch (error) {
        toast.error(error.response?.data?.pesan || 'Gagal menghapus pengguna.', { id: toastId });
      }
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-primary animate-pulse bg-gray-50">Memuat Control Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12">
      
      {/* HEADER HIJAU TUA (Mengingatkan pada warna utama Landing Page) */}
      <div className="bg-[#0f3d1f] pt-8 pb-28 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Tombol Kembali yang Elegan */}
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-green-50 bg-white/10 hover:bg-white/20 hover:text-white px-5 py-2.5 rounded-full transition-all font-semibold text-sm mb-8 backdrop-blur-sm border border-white/10 shadow-sm">
            <ArrowLeft size={18} /> Kembali
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
                <ShieldAlert size={36} className="text-red-400" /> Control Panel
              </h1>
              <p className="text-green-100/80 mt-2 text-sm md:text-base max-w-lg">Pusat kendali administratif AgroCelebes. Kelola pengguna dan pantau ekosistem sistem dengan hati-hati.</p>
            </div>
            
            {/* Widget Total Pengguna */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-white/10 shadow-lg min-w-[200px]">
              <div className="bg-primary p-3 rounded-xl shadow-inner"><Users size={24} className="text-white"/></div>
              <div>
                <p className="text-xs text-green-100 font-bold uppercase tracking-wider">Total Pengguna</p>
                <p className="text-2xl font-extrabold text-white">{users.length} <span className="text-sm font-medium opacity-80">Akun</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA (Menumpuk di atas Header Hijau) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* TAMPILAN DESKTOP (TABEL KLASIK YANG RAPI) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest font-bold">
                  <th className="p-6">Informasi Pengguna</th>
                  <th className="p-6">Peran (Role)</th>
                  <th className="p-6">Kontak & Lokasi</th>
                  <th className="p-6">Tgl Terdaftar</th>
                  <th className="p-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-green-50/30 transition duration-200">
                    <td className="p-6">
                      <p className="font-extrabold text-gray-900 text-lg">{user.nama}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Mail size={14}/> {user.email}</p>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                        user.role === 'petani' ? 'bg-green-50 text-primary border border-green-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {user.role === 'admin' && <ShieldAlert size={14}/>}
                        {user.role === 'petani' && <Sprout size={14}/>}
                        {user.role === 'pembeli' && <Building size={14}/>}
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-gray-700 flex items-center gap-1"><Phone size={14} className="text-gray-400"/> {user.no_hp}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px] flex items-center gap-1 mt-1"><MapPin size={14} className="text-gray-400 flex-shrink-0"/> {user.alamat || user.nama_perusahaan}</p>
                    </td>
                    <td className="p-6 text-sm text-gray-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-6 text-center">
                      {user.role !== 'admin' ? (
                        <button 
                          onClick={() => handleDeleteUser(user._id, user.nama)}
                          className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition shadow-sm"
                          title="Hapus Akun Permanen"
                        >
                          <Trash2 size={20} />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg">Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TAMPILAN MOBILE (KARTU BERSUSUN - ANTI SCROLL SAMPING) */}
          <div className="md:hidden flex flex-col divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user._id} className="p-5 flex flex-col gap-4 bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{user.nama}</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Mail size={12}/> {user.email}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                    user.role === 'petani' ? 'bg-green-50 text-primary border border-green-100' :
                    'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {user.role}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                  <p className="text-xs font-bold text-gray-700 flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {user.no_hp}</p>
                  <p className="text-xs text-gray-600 flex items-start gap-2"><MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5"/> <span className="line-clamp-2">{user.alamat || user.nama_perusahaan}</span></p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[11px] text-gray-400 font-medium">Terdaftar: {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  
                  {user.role !== 'admin' ? (
                    <button 
                      onClick={() => handleDeleteUser(user._id, user.nama)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition text-xs font-bold border border-red-100"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">Super Admin</span>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}