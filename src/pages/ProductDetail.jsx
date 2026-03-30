import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Package, Phone, CheckCircle, Store, Edit, Trash2 } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [userLokal, setUserLokal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    setUserLokal(user);

    if (!token) navigate('/login');
    else fetchProductData(token);
  }, [id, navigate]);

  const fetchProductData = (token) => {
    axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setProduct(res.data);
      setIsLoading(false);
    })
    .catch(() => {
      alert("Produk tidak ditemukan!");
      navigate('/pasar-b2b');
    });
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-primary font-bold animate-pulse">Memuat Detail Produk...</p>
      </div>
    );
  }

  const isOwner = userLokal?.id === product.petani_id?._id || userLokal?.role === 'admin';

  const handleNegoWhatsApp = () => {
    const nomorPetani = product.petani_id?.no_hp || '080000000000';
    let formattedNumber = nomorPetani.replace(/\D/g, ''); 
    if (formattedNumber.startsWith('0')) formattedNumber = '62' + formattedNumber.substring(1);
    
    const namaPembeli = userLokal?.nama || 'Saya';
    const identitas = userLokal?.role === 'pembeli' ? `Perusahaan saya (${namaPembeli}) tertarik` : `Saya ${namaPembeli} tertarik`;
    const pesan = `Halo Bapak/Ibu ${product.petani_id?.nama},%0A%0A${identitas} dengan komoditas Anda di AgroCelebes:%0A📦 *${product.nama_komoditas}*%0A💰 Rp ${product.harga_per_kg.toLocaleString('id-ID')} / Kg%0A%0AApakah stok ${product.stok_kg} Kg masih tersedia?`;
    
    window.open(`https://wa.me/${formattedNumber}?text=${pesan}`, '_blank');
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert("Produk berhasil dihapus!");
        navigate('/pasar-b2b');
      } catch (error) {
        alert("Gagal menghapus produk.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* HEADER SIMPLE */}
      <header className="bg-white border-b border-gray-200 p-4 md:p-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600 flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Detail Komoditas</h1>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row h-full">
          
          {/* SISI KIRI: GAMBAR (Tinggi menyesuaikan, sangat proporsional) */}
          <div className="lg:w-1/2 bg-gray-100 relative min-h-[300px] sm:min-h-[400px] lg:min-h-full">
            {product.image_url ? (
              <img src={product.image_url} alt={product.nama_komoditas} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400"><Store size={80} /></div>
            )}
            <span className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm text-primary font-bold px-5 py-2 rounded-full shadow-md text-sm">
              {product.kategori}
            </span>
          </div>

          {/* SISI KANAN: INFORMASI */}
          <div className="lg:w-1/2 p-6 sm:p-10 flex flex-col">
            <div className="flex-grow">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product.nama_komoditas}</h1>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm sm:text-base">{product.deskripsi || "Tidak ada deskripsi tambahan."}</p>
              
              {/* KOTAK HARGA & STOK */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                  <p className="text-xs sm:text-sm text-green-700 mb-1 font-semibold">Harga Direct-Trade</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary">Rp {product.harga_per_kg.toLocaleString('id-ID')} <span className="text-sm font-normal">/kg</span></p>
                </div>
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                  <p className="text-xs sm:text-sm text-blue-700 mb-1 font-semibold flex items-center gap-1"><Package size={16}/> Stok Tersedia</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-blue-900">{product.stok_kg} <span className="text-sm font-normal">kg</span></p>
                </div>
              </div>

              {/* INFORMASI PETANI & LOKASI */}
              <div className="border-t border-gray-100 pt-8 mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Informasi Penjual & Lahan</h3>
                <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl uppercase flex-shrink-0">
                    {product.petani_id?.nama?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg flex items-center gap-1">
                      {product.petani_id?.nama || 'Petani Anonim'} 
                      {product.petani_id?.isVerified && <CheckCircle size={18} className="text-blue-500" title="Akun Terverifikasi" />}
                    </p>
                    {/* Link Google Maps yang Rapi */}
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.lokasi_lahan || product.petani_id?.alamat || '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm transition"
                    >
                      <MapPin size={16} /> 📍 Buka Peta Lokasi
                    </a>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      <span className="font-semibold text-gray-700">Lahan:</span> {product.lokasi_lahan || product.petani_id?.alamat || "Sulawesi Selatan"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* TOMBOL AKSI BAWAH */}
            <div className="mt-auto pt-4">
              {isOwner ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* TOMBOL EDIT SEKARANG MENGARAH KE HALAMAN BARU */}
                  <button onClick={() => navigate(`/edit-product/${id}`)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition">
                    <Edit size={20} /> Edit Produk
                  </button>
                  <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition">
                    <Trash2 size={20} /> Hapus
                  </button>
                </div>
              ) : (
                <button onClick={handleNegoWhatsApp} className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transform transition hover:-translate-y-1">
                  <Phone size={24} /> Nego via WhatsApp
                </button>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}