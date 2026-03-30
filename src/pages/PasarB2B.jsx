import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Store, Package, MapPin } from 'lucide-react';

export default function PasarB2B() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: '', kategori: 'Semua', minHarga: '', maxHarga: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else fetchProducts(token);
  }, [navigate]);

  const fetchProducts = async (token) => {
    setIsLoading(true);
    try {
      let queryUrl = `${import.meta.env.VITE_API_URL}/products?kategori=${filters.kategori}`;
      if (filters.search) queryUrl += `&search=${filters.search}`;
      if (filters.minHarga) queryUrl += `&minHarga=${filters.minHarga}`;
      if (filters.maxHarga) queryUrl += `&maxHarga=${filters.maxHarga}`;

      const res = await axios.get(queryUrl, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchProducts(localStorage.getItem('token'));
  };

  return (
    // Struktur luar tidak lagi butuh min-h-screen karena sudah dijepit oleh MainLayout
    <div className="flex flex-col font-sans animate-fade-in pb-10">
      
      {/* =========================================
          FORM FILTER (Super Responsif)
          ========================================= */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm w-full">
        <form onSubmit={handleApplyFilter} className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-3 items-center">
          
          {/* Baris 1 (HP): Pencarian & Kategori (Grid 50:50) */}
          <div className="w-full xl:w-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition w-full">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Cari komoditas..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="bg-transparent border-none outline-none w-full ml-2 text-sm" />
            </div>
            
            {/* Kategori */}
            <select value={filters.kategori} onChange={(e) => setFilters({...filters, kategori: e.target.value})} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer appearance-none w-full">
              <option value="Semua">Semua Kategori</option>
              <option value="Kakao & Cokelat">Kakao & Cokelat</option>
              <option value="Kopi">Kopi (Biji & Bubuk)</option>
              <option value="Cengkeh & Rempah">Cengkeh & Rempah</option>
              <option value="Jagung & Palawija">Jagung & Palawija</option>
              <option value="Kelapa & Kopra">Kelapa & Kopra</option>
              <option value="Kacang Mete">Kacang Mete</option>
              <option value="Hortikultura">Sayur & Buah Hortikultura</option>
              <option value="Lainnya">Lainnya (Komoditas Umum)</option>
            </select>
          </div>

          {/* Baris 2 (HP): Harga Min, Harga Max, & Tombol Filter (Grid 3 Kolom) */}
          <div className="w-full xl:w-auto grid grid-cols-3 xl:flex gap-3">
            <input type="number" placeholder="Min Rp" value={filters.minHarga} onChange={(e) => setFilters({...filters, minHarga: e.target.value})} className="col-span-1 w-full xl:w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
            <input type="number" placeholder="Max Rp" value={filters.maxHarga} onChange={(e) => setFilters({...filters, maxHarga: e.target.value})} className="col-span-1 w-full xl:w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
            
            <button type="submit" className="col-span-1 w-full xl:w-auto bg-primary text-white py-2 px-6 rounded-xl font-bold hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2">
              <Filter size={18} /> <span className="hidden sm:inline xl:hidden">Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* =========================================
          KATALOG GRID
          ========================================= */}
      <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300 max-w-3xl mx-auto mt-10">
            <Store className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="font-bold text-lg text-gray-700">Tidak ada produk ditemukan</p>
            <p className="text-sm mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {products.map((item) => (
              <div key={item._id} onClick={() => navigate(`/product/${item._id}`)} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full">
                
                {/* Gambar Produk */}
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.nama_komoditas} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32}/></div>
                  )}
                  {/* Penyesuaian lebar label kategori agar tidak kepanjangan */}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm max-w-[80%] truncate text-center">
                    {item.kategori}
                  </span>
                </div>
                
                {/* Info Produk */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.nama_komoditas}</h3>
                  
                  <div className="flex justify-between items-end mt-3 mb-4 flex-grow">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Harga Direct-Trade</p>
                      <span className="text-xl font-extrabold text-primary">Rp {item.harga_per_kg?.toLocaleString('id-ID')}</span>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1.5 rounded-lg flex items-center gap-1 border border-blue-100">
                      <Package size={14}/> {item.stok_kg}kg
                    </span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500 mt-auto">
                    <MapPin size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{item.lokasi_lahan || item.petani_id?.alamat || "Sulawesi"}</span>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}