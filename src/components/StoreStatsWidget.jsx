import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Store, Package, ArrowRight, RefreshCcw } from 'lucide-react';

export default function StoreStatsWidget() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalProduk: 0, totalStok: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyStats = async () => {
      try {
        const token = localStorage.getItem('user');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/stats/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // PERBAIKAN: Pastikan data yang masuk benar-benar angka, bukan pesan error
        if (res.data && typeof res.data.totalProduk !== 'undefined') {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Gagal memuat statistik etalase", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyStats();
  }, []);

  // PERBAIKAN: Gunakan nilai default 0 (opsional chaining) agar toLocaleString tidak membuat layar Putih
  const amanTotalStok = stats?.totalStok || 0;
  const amanTotalProduk = stats?.totalProduk || 0;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition relative overflow-hidden group">
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-50 rounded-full blur-2xl group-hover:bg-green-100 transition-colors pointer-events-none"></div>

      <div className="mb-5 flex justify-between items-start relative z-10">
        <div>
           <h3 className="font-bold text-gray-800 text-lg">Etalase Saya</h3>
           <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">Pasar B2B AgroCelebes</p>
        </div>
        <div className="p-2 bg-green-50 text-green-600 rounded-xl flex-shrink-0">
           <Store size={20} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 relative z-10">
        {isLoading ? (
           <div className="flex justify-center items-center h-20 text-gray-400">
             <RefreshCcw className="animate-spin" size={24} />
           </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-gray-50 border border-gray-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center min-w-0">
               <span className="text-2xl sm:text-3xl font-black text-gray-800 truncate w-full px-1" title={amanTotalProduk}>
                 {amanTotalProduk}
               </span>
               <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase mt-1 w-full truncate px-1">
                 Produk Aktif
               </span>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center min-w-0">
               <span className="text-2xl sm:text-3xl font-black text-blue-700 truncate w-full px-1" title={`${amanTotalStok.toLocaleString('id-ID')} Kg`}>
                 {amanTotalStok.toLocaleString('id-ID')}
               </span>
               <span className="text-[9px] sm:text-[10px] font-bold text-blue-500 uppercase mt-1 flex items-center justify-center gap-1 w-full px-1">
                 <Package size={12} className="flex-shrink-0"/> 
                 <span className="truncate">Total Stok</span>
               </span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => navigate('/pasar-b2b', { state: { autoOpenMyStore: true } })} 
        className="mt-5 w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition relative z-10"
      >
        Kelola Etalase <ArrowRight size={16} />
      </button>
    </div>
  );
}