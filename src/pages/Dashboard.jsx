import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PackagePlus, Search, Store, MapPin } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State UI
  const [isLoading, setIsLoading] = useState(true);
  
  // State Data
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // State Form (Sesuai dengan revisi Anda)
  const [formData, setFormData] = useState({
    nama_komoditas: '', kategori: 'Kakao & Cokelat', harga_per_kg: '', stok_kg: '', deskripsi: '', lokasi_lahan: ''
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchProducts(token);
    }
  }, [navigate]);

  const fetchProducts = async (token, query = '') => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(localStorage.getItem('token'), searchQuery);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImage(e.target.files[0]);

  // FUNGSI BARU: Pelacakan Lokasi Otomatis via Satelit & OpenStreetMap
  const dapatkanLokasiLahan = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      alert("Sedang melacak posisi lahan via satelit... Pastikan Anda mengizinkan akses lokasi.");
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data.display_name) {
            setFormData(prev => ({ ...prev, lokasi_lahan: data.display_name }));
            alert("Lokasi lahan berhasil didapatkan secara akurat! ✅");
          }
        } catch (error) {
          alert("Koordinat didapat, tetapi gagal memuat teks alamat. Ketik manual atau coba lagi.");
        }
      }, () => {
        alert("Gagal membaca GPS. Pastikan fitur Lokasi/GPS aktif di perangkat Anda.");
      });
    } else {
      alert("Browser Anda tidak mendukung fitur Geolocation.");
    }
  };

  // Fungsi Tambah Produk
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (image) data.append('image', image);

    try {
      alert('Mengunggah data ke server... Mohon tunggu.');
      await axios.post(import.meta.env.VITE_API_URL + '/products', data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      fetchProducts(token);
      // Reset form setelah berhasil
      setFormData({nama_komoditas: '', kategori: 'Kakao & Cokelat', harga_per_kg: '', stok_kg: '', deskripsi: '', lokasi_lahan: ''});
      setImage(null);
      alert('Produk berhasil dipublikasikan!');
    } catch (error) {
      alert('Gagal mengunggah produk');
    }
  };

  const SkeletonCard = () => (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-48 bg-gray-200 w-full"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-50 rounded mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* FORM UPLOAD (Hanya untuk Petani & Admin) */}
        {(user.role === 'petani' || user.role === 'admin') && (
          <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <PackagePlus className="text-primary" size={24} />
              <h2 className="text-lg font-bold text-gray-800">{t('tambah_komoditas') || 'Tambah Komoditas'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" name="nama_komoditas" value={formData.nama_komoditas} placeholder="Nama Komoditas" required onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              
              {/* KATEGORI SESUAI REVISI ANDA */}
              <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition appearance-none cursor-pointer">
                <option value="Kakao & Cokelat">Kakao & Cokelat</option>
                <option value="Kopi">Kopi (Biji & Bubuk)</option>
                <option value="Cengkeh & Rempah">Cengkeh & Rempah</option>
                <option value="Jagung & Palawija">Jagung & Palawija</option>
                <option value="Kelapa & Kopra">Kelapa & Kopra</option>
                <option value="Kacang Mete">Kacang Mete</option>
                <option value="Hortikultura">Sayur & Buah Hortikultura</option>
                <option value="Lainnya">Lainnya (Komoditas Umum)</option>
              </select>
              
              <div className="flex gap-3">
                <input type="number" name="harga_per_kg" value={formData.harga_per_kg} placeholder="Harga/Kg" required onChange={handleChange} className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" />
                <input type="number" name="stok_kg" value={formData.stok_kg} placeholder="Stok (Kg)" required onChange={handleChange} className="w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" />
              </div>

              {/* UI LOKASI LAHAN DENGAN TOMBOL GPS */}
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">Lokasi Lahan / Titik Panen</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl p-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                    <MapPin size={20} className="text-gray-400 mr-2" />
                    <input type="text" name="lokasi_lahan" value={formData.lokasi_lahan} placeholder="Contoh: Jl. Industri Kecil..." required onChange={handleChange} className="bg-transparent outline-none w-full text-sm" />
                  </div>
                  <button onClick={dapatkanLokasiLahan} type="button" className="bg-blue-100 text-blue-600 p-3 rounded-xl hover:bg-blue-200 transition font-bold flex items-center justify-center shadow-sm" title="Gunakan GPS Saat Ini">
                    <MapPin size={24} className="animate-pulse" />
                  </button>
                </div>
              </div>
              
              <textarea name="deskripsi" value={formData.deskripsi} placeholder="Deskripsi detail..." onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" rows="3"></textarea>
              
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-primary">Klik untuk upload</span> atau drag foto ke sini
                  <p className="text-xs mt-1">{image ? image.name : 'PNG, JPG up to 5MB'}</p>
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-green-700 hover:-translate-y-0.5 transition-all mt-2">
                Publikasikan ke Pasar
              </button>
            </form>
          </div>
        )}

        {/* KATALOG PRODUK */}
        <div className={`xl:col-span-${(user.role === 'petani' || user.role === 'admin') ? '2' : '3'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{t('katalog') || 'Katalog Anda'}</h2>
            
            {/* Search Bar dipindah ke sini agar tidak hilang dari Dashboard */}
            <form onSubmit={handleSearch} className="flex max-w-sm items-center bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition shadow-sm w-full sm:w-auto">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input 
                type="text" placeholder={t('cari') || 'Cari produk...'} 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full ml-2 text-sm"
              />
            </form>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : products.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <PackagePlus className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-700">Tidak ada produk</h3>
                <p className="text-gray-500 text-sm">Coba cari dengan kata kunci lain atau tambah produk baru.</p>
              </div>
            ) : (
              products.map((item) => (
                <div key={item._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.nama_komoditas} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32}/></div>
                    )}
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {item.kategori}
                    </span>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-gray-800 mb-1">{item.nama_komoditas}</h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-extrabold text-primary">Rp {item.harga_per_kg?.toLocaleString('id-ID')}</span>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">Stok: {item.stok_kg}kg</span>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                          {item.petani_id?.nama?.charAt(0) || 'P'}
                        </div>
                        <span className="truncate max-w-[100px]">{item.petani_id?.nama || 'Anonim'}</span>
                      </div>

                      <button 
                        onClick={() => navigate(`/product/${item._id}`)} 
                        className="text-sm font-bold text-primary hover:text-green-700 transition"
                      >
                        Detail ➔
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}