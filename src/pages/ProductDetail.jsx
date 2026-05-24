import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Package, Phone, CheckCircle, Store, Edit, Trash2, Navigation, TrendingUp } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [userLokal, setUserLokal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('user');
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

  // ==========================================
  // PERBAIKAN 1: FORMAT PESAN WHATSAPP & EMOJI
  // ==========================================
const handleNegoWhatsApp = () => {
    const nomorPetani = product.petani_id?.no_hp || '080000000000';
    let formattedNumber = nomorPetani.replace(/\D/g, ''); 
    if (formattedNumber.startsWith('0')) formattedNumber = '62' + formattedNumber.substring(1);
    
    const namaPembeli = userLokal?.nama || 'Saya';
    const namaPerusahaan = userLokal?.nama_perusahaan || '';
    
    let identitas = '';
    if (userLokal?.role === 'pembeli' && namaPerusahaan) {
      identitas = `Saya ${namaPembeli} dari perusahaan *${namaPerusahaan}* tertarik`;
    } else {
      identitas = `Saya ${namaPembeli} tertarik`;
    }
    const pesanMentah = `Halo Bapak/Ibu ${product.petani_id?.nama || 'Petani'},

${identitas} dengan komoditas Anda di AgroCelebes:
Nama Komoditas : *${product.nama_komoditas}*
Harga : *Rp ${product.harga_per_kg.toLocaleString('id-ID')} / Kg*

Apakah stok ${product.stok_kg} Kg masih tersedia?`;
    
    const pesanEncoded = encodeURIComponent(pesanMentah);
    window.open(`https://wa.me/${formattedNumber}?text=${pesanEncoded}`, '_blank');
  };

  const handleDelete = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('user')}` }
        });
        alert("Produk berhasil dihapus!");
        navigate('/pasar-b2b');
      } catch (error) {
        alert("Gagal menghapus produk.");
      }
    }
  };

  // ==========================================
  // PERBAIKAN 2: LINK NAVIGASI GOOGLE MAPS
  // ==========================================
  const alamatLengkap = product.lokasi_lahan || product.petani_id?.alamat || 'Sulawesi Selatan';
  // Menggunakan endpoint 'dir' (Directions) agar Google Maps otomatis membuat rute dari lokasi user ke lokasi lahan
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(alamatLengkap)}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col pb-20 lg:pb-0">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-200 transition text-gray-700 flex-shrink-0">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">Detail Komoditas</h1>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* BAGIAN KIRI: GAMBAR */}
          <div className="lg:w-1/2 relative h-64 sm:h-96 lg:h-auto bg-gray-100">
            {product.image_url ? (
              <img src={product.image_url} alt={product.nama_komoditas} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <Store size={60} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Belum ada foto</span>
              </div>
            )}
            
            {/* Badge Kategori */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary font-extrabold px-4 py-1.5 rounded-full shadow-lg text-xs tracking-wide uppercase flex items-center gap-1.5 border border-white/50">
              <TrendingUp size={14} /> {product.kategori}
            </div>
          </div>

          {/* BAGIAN KANAN: DETAIL KONTEN */}
          <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col">
            <div className="flex-grow">
              
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 leading-tight">
                {product.nama_komoditas}
              </h1>
              
              <p className="text-gray-500 leading-relaxed text-sm sm:text-base mb-8">
                {product.deskripsi || "Penjual tidak menyertakan deskripsi tambahan untuk produk ini."}
              </p>
              
              {/* KOTAK HARGA & STOK (Lebih responsif) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 sm:p-5 rounded-2xl border border-green-100 shadow-sm">
                  <p className="text-[11px] sm:text-xs text-green-700 mb-1 font-bold uppercase tracking-wide">Harga per Kg</p>
                  <p className="text-xl sm:text-3xl font-black text-primary">
                    Rp {product.harga_per_kg.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-sm">
                  <p className="text-[11px] sm:text-xs text-blue-700 mb-1 font-bold uppercase tracking-wide flex items-center gap-1">
                    <Package size={14}/> Stok Saat Ini
                  </p>
                  <p className="text-xl sm:text-3xl font-black text-blue-900">
                    {product.stok_kg} <span className="text-sm font-semibold">kg</span>
                  </p>
                </div>
              </div>

              {/* INFORMASI PETANI & LOKASI */}
              <div className="border border-gray-100 rounded-2xl p-5 mb-6 sm:mb-8 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Informasi Lahan & Penjual</h3>
                
                <div className="flex items-start gap-4">
                  {/* Avatar Bulat */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border border-gray-200 text-primary rounded-full flex items-center justify-center font-black text-xl uppercase flex-shrink-0 shadow-sm">
                    {product.petani_id?.nama?.charAt(0) || '?'}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-extrabold text-gray-900 text-base sm:text-lg flex items-center gap-1.5 mb-1">
                      {product.petani_id?.nama || 'Petani Anonim'} 
                      {product.petani_id?.isVerified && <CheckCircle size={16} className="text-blue-500" title="Terverifikasi" />}
                    </p>
                    
                    <p className="text-xs sm:text-sm text-gray-500 leading-snug flex items-start gap-1.5 mb-3">
                      <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{alamatLengkap}</span>
                    </p>

                    {/* Tombol Rute Maps */}
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-xl text-xs sm:text-sm transition w-full sm:w-auto"
                    >
                      <Navigation size={16} /> Rute Navigasi Lahan
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* TOMBOL AKSI (DESKTOP) */}
            <div className="hidden lg:block pt-4">
              <ActionButtons isOwner={isOwner} id={id} navigate={navigate} handleDelete={handleDelete} handleNegoWhatsApp={handleNegoWhatsApp} />
            </div>
          </div>

        </div>
      </main>

      {/* FIXED BOTTOM ACTION BAR UNTUK HP (MOBILE ONLY) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <ActionButtons isOwner={isOwner} id={id} navigate={navigate} handleDelete={handleDelete} handleNegoWhatsApp={handleNegoWhatsApp} />
      </div>

    </div>
  );
}

// Komponen Pembantu untuk Tombol agar tidak menulis kode 2x (Mobile & Desktop)
function ActionButtons({ isOwner, id, navigate, handleDelete, handleNegoWhatsApp }) {
  if (isOwner) {
    return (
      <div className="flex gap-3">
        <button onClick={() => navigate(`/edit-product/${id}`)} className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 transition border border-yellow-200">
          <Edit size={18} /> Edit
        </button>
        <button onClick={handleDelete} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-3.5 rounded-xl font-extrabold flex items-center justify-center gap-2 transition border border-red-200">
          <Trash2 size={18} /> Hapus
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleNegoWhatsApp} 
      className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all"
    >
      <Phone size={20} /> Nego via WhatsApp
    </button>
  );
}