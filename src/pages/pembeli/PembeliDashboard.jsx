import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PriceWidget from '../../components/PriceWidget';
import { ArrowRight, Package, TrendingUp } from 'lucide-react';

export default function PembeliDashboard() {
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/latest`, { withCredentials: true });
        setLatestProducts(res.data);
      } catch (error) {
        console.error("Gagal ambil produk terbaru", error);
      }
    };
    fetchLatest();
  }, []);

  return (
    // Menggunakan Grid: 1 kolom di HP, 3 kolom di Laptop
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      
            {/* 2. SECTION: TREN PASAR (Mengambil 1 Kolom di Laptop) */}
      <section className="lg:col-span-1 flex flex-col gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-4 sm:p-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            <h2 className="font-bold text-gray-800 text-sm sm:text-base">Tren Pasar</h2>
          </div>
          <div className="p-4 flex-1">
            <PriceWidget />
          </div>
        </div>
      </section>
      
      {/* 1. SECTION: KOMODITAS SEGAR (Mengambil 2 Kolom di Laptop) */}
      <section className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-base sm:text-lg font-black text-gray-800 flex items-center gap-2 tracking-tight">
            <Package size={22} className="text-primary" /> Komoditas Segar Hari Ini
          </h2>
        </div>

        {latestProducts.length > 0 ? (
          // Grid Produk: 2 di HP, 3 di Laptop agar gambar tidak gepeng
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {latestProducts.map((prod) => (
              <Link key={prod._id} to={`/product/${prod._id}`} className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full">
                {/* Aspek rasio gambar dibuat konsisten 4:3 */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-50">
                  <img 
                    src={prod.image_url} 
                    alt={prod.nama_komoditas} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex flex-col flex-grow justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-800 line-clamp-2 leading-tight mb-2">
                    {prod.nama_komoditas}
                  </h4>
                  <p className="text-primary font-black text-sm sm:text-base">
                    Rp{prod.harga_per_kg.toLocaleString('id-ID')}
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-400">/kg</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
            <Package size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500">Belum ada komoditas segar hari ini.</p>
            <p className="text-xs text-gray-400 mt-1">Cek kembali nanti untuk penawaran terbaru!</p>
          </div>
        )}
      </section>

    </div>
  );
}