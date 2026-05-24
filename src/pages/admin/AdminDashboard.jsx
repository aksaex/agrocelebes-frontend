import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, Package, TrendingUp, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import PriceWidget from '../../components/PriceWidget'; // <-- WIDGET HARGA DITAMBAHKAN

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPetani: 0,
    totalPembeli: 0,
    totalKomoditas: 0, // Disesuaikan dengan response backend
    produkBaru: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      // 1. Ambil Statistik (Diisolasi agar tidak mengganggu tabel jika gagal)
      try {
        const resStats = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`);
        if (resStats.data) setStats(resStats.data);
      } catch (error) {
        console.error("Gagal mengambil statistik", error);
      }

      // 2. Ambil Tabel User
      try {
        const resUsers = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`);
        if (resUsers.data) setRecentUsers(resUsers.data.slice(0, 5));
      } catch (error) {
        console.error("Gagal mengambil data users", error);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in w-full max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* HEADER BERSIH & PROFESIONAL (Tanpa basa-basi) */}
      <div className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-3 font-black text-gray-800 text-lg tracking-tight">
            <ShieldAlert size={24} className="text-red-600" />
            <span>Kelola User</span>
         </div>
         <Link to="/admin/users" className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition flex items-center gap-2">
<ArrowRight size={16} />
         </Link>
      </div>

      {/* GRID STATISTIK DINAMIS (Kini Membaca Backend Langsung) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Petani" value={stats.totalPetani} icon={<Users className="text-green-600" />} />
        <StatCard title="Pembeli" value={stats.totalPembeli} icon={<Users className="text-blue-600" />} />
        <StatCard title="Komoditas" value={stats.totalKomoditas} icon={<Package className="text-purple-600" />} />
        <StatCard title="Produk Baru (24h)" value={stats.produkBaru} icon={<TrendingUp className="text-orange-600" />} />
      </div>

      {/* AREA UTAMA: TABEL USER & INDEKS HARGA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI (LEBIH LEBAR): TABEL PENGGUNA TERBARU */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Pendaftaran Pengguna Terbaru
            </h3>
          </div>
          
          <div className="overflow-x-auto flex-1 p-2">
            {loadingTable ? (
              <div className="flex justify-center items-center h-40 text-sm font-bold text-gray-400 animate-pulse">
                Menarik data dari database...
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-extrabold">Nama Pengguna</th>
                    <th className="py-3 px-4 font-extrabold hidden sm:table-cell">Email</th>
                    <th className="py-3 px-4 font-extrabold text-right">Peran</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-gray-400 text-sm">Belum ada pengguna di sistem.</td>
                    </tr>
                  ) : (
                    recentUsers.map((u) => (
                      <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-800 text-sm">{u.nama}</p>
                          {u.nama_perusahaan && <p className="text-[10px] text-gray-500 mt-0.5">{u.nama_perusahaan}</p>}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-600 font-medium hidden sm:table-cell">{u.email}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                            u.role === 'petani' ? 'bg-green-100 text-green-700' :
                            u.role === 'pembeli' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: INDEKS HARGA PASAR (Lebih Relevan untuk Admin) */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
             <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-sm">Harga Komoditas B2B</h3>
             </div>
          </div>
          <div className="p-4 flex-1">
             <PriceWidget />
          </div>
        </div>

      </div>
    </div>
  );
}

// Komponen Reusable Card Statistik
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-300">
      <div className="p-3.5 bg-gray-50 rounded-xl flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] text-gray-400 font-extrabold uppercase tracking-wider truncate">{title}</p>
        <h3 className="text-xl sm:text-2xl font-black text-gray-800 mt-0.5 truncate">
          {Number(value).toLocaleString('id-ID')}
        </h3>
      </div>
    </div>
  );
}