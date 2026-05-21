import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom'; // <--- Tambahkan useLocation
import { Search, Filter, Store, Package, MapPin, Plus, Globe, UserSquare2 } from 'lucide-react';

export default function PasarB2B() {
  const navigate = useNavigate();
  const location = useLocation(); // <--- Panggil useLocation di sini
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // LOGIKA PINTAR: Cek apakah ada pesan rahasia 'autoOpenMyStore' dari halaman sebelumnya.
  // Jika ada, langsung set ke 'saya'. Jika tidak ada, default ke 'semua'.
  const [viewMode, setViewMode] = useState(location.state?.autoOpenMyStore ? 'saya' : 'semua');
  
  // ... (Sisa kode ke bawah tetap sama persis)
  
  const [filters, setFilters] = useState({
    search: '', kategori: 'Semua', minHarga: '', maxHarga: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
        navigate('/login');
    } else {
        setUser(JSON.parse(userData));
        fetchProducts(token);
    }
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

  // LOGIKA PINTAR: Memfilter produk berdasarkan pembuatnya jika viewMode === 'saya'
  const displayedProducts = viewMode === 'semua' 
    ? products 
    : products.filter(item => item.petani_id?._id === user?.id);

  return (
    <div className="flex flex-col font-sans animate-fade-in pb-10 relative min-h-screen">
      
      {/* FORM FILTER */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm w-full">
        <form onSubmit={handleApplyFilter} className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-3 items-center">
          
          <div className="w-full xl:w-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition w-full">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Cari komoditas..." value={filters.search} onChange={(e) => setFilters({...filters, search: e.target.value})} className="bg-transparent border-none outline-none w-full ml-2 text-sm" />
            </div>
            
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

          <div className="w-full xl:w-auto grid grid-cols-3 xl:flex gap-3">
            <input type="number" placeholder="Min Rp" value={filters.minHarga} onChange={(e) => setFilters({...filters, minHarga: e.target.value})} className="col-span-1 w-full xl:w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
            <input type="number" placeholder="Max Rp" value={filters.maxHarga} onChange={(e) => setFilters({...filters, maxHarga: e.target.value})} className="col-span-1 w-full xl:w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
            
            <button type="submit" className="col-span-1 w-full xl:w-auto bg-primary text-white py-2 px-6 rounded-xl font-bold hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2">
              <Filter size={18} /> <span className="hidden sm:inline xl:hidden">Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* KATALOG GRID & TOGGLE ETALASE SAYA */}
      <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        
        {/* TAB TOGGLE: Hanya muncul jika user adalah petani atau admin */}
        {user && (user.role === 'petani' || user.role === 'admin') && (
          <div className="flex bg-gray-100 p-1.5 rounded-xl w-full sm:w-fit mb-6 shadow-inner">
            <button 
              onClick={() => setViewMode('semua')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${viewMode === 'semua' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Globe size={16} className="sm:w-[18px] sm:h-[18px]" /> Semua 
            </button>
            <button 
              onClick={() => setViewMode('saya')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${viewMode === 'saya' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <UserSquare2 size={16} className="sm:w-[18px] sm:h-[18px]" /> Etalase Saya
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
             <p className="font-bold text-sm uppercase tracking-wider">Memuat Pasar...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          
          /* EMPTY STATE (Menyesuaikan dengan viewMode) */
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300 max-w-3xl mx-auto mt-4 px-4 w-full">
            <Store className="mx-auto text-gray-300 mb-4" size={56} />
            <p className="font-bold text-lg text-gray-800">
              {viewMode === 'saya' ? 'Etalase Anda Masih Kosong' : 'Tidak Ada Komoditas'}
            </p>
            <p className="text-sm mt-2 max-w-md mx-auto">
              {viewMode === 'saya' 
                ? 'Anda belum memposting hasil panen apa pun. Tekan tombol + di pojok kanan bawah untuk mulai berjualan.' 
                : 'Coba sesuaikan filter atau kata kunci pencarian Anda untuk menemukan komoditas yang tepat.'}
            </p>
          </div>

        ) : (
          /* DAFTAR PRODUK (DENGAN LAYOUT YANG DIKUNCI / TRUNCATE) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {displayedProducts.map((item) => (
              <div key={item._id} onClick={() => navigate(`/product/${item._id}`)} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full relative">
                
                {/* Badge "Milik Anda" agar petani lebih gampang nge-spot produknya di tab Semua */}
                {viewMode === 'semua' && item.petani_id?._id === user?.id && (
                  <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md z-10 shadow-sm">
                    Milik Anda
                  </div>
                )}

                <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.nama_komoditas} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32}/></div>
                  )}
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-primary text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm max-w-[70%] truncate text-center">
                    {item.kategori}
                  </span>
                </div>
                
                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-1 mb-1" title={item.nama_komoditas}>{item.nama_komoditas}</h3>
                  
                  {/* PERBAIKAN: Flex layout dengan min-w-0 untuk mencegah overflow */}
                  <div className="flex justify-between items-end mt-2 mb-4 flex-grow gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 truncate">Harga Direct-Trade</p>
                      <span className="text-lg sm:text-xl font-extrabold text-primary truncate block" title={`Rp ${item.harga_per_kg?.toLocaleString('id-ID')}`}>
                        Rp {item.harga_per_kg?.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {/* Kotak stok yang tidak akan tergencet (flex-shrink-0) tapi tetap membatasi max-width */}
                    <span className="text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1.5 rounded-lg flex items-center gap-1 border border-blue-100 flex-shrink-0 max-w-[40%] truncate" title={`${item.stok_kg} kg`}>
                      <Package size={12} className="flex-shrink-0 sm:w-[14px] sm:h-[14px]"/> 
                      <span className="truncate">{item.stok_kg}kg</span>
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 flex items-start gap-1.5 text-xs text-gray-500 mt-auto">
                    <MapPin size={12} className="text-red-500 flex-shrink-0 mt-0.5 sm:w-[14px] sm:h-[14px]" />
                    <span className="line-clamp-2 leading-relaxed text-[11px] sm:text-xs" title={item.lokasi_lahan || item.petani_id?.alamat}>
                      {item.lokasi_lahan || item.petani_id?.alamat || "Sulawesi"}
                    </span>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOMBOL MELAYANG (FAB) */}
      {user && (user.role === 'petani' || user.role === 'admin') && (
        <button 
          onClick={() => navigate('/post-product')}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 hover:scale-110 active:scale-95 transition-all z-50 group"
          title="Jual Komoditas Baru"
        >
          <Plus size={28} className="sm:w-[32px] sm:h-[32px] group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

    </div>
  );
}