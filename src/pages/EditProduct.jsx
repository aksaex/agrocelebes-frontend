import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, ImagePlus, MapPin, Store, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editImage, setEditImage] = useState(null);
  const [previewLama, setPreviewLama] = useState(null);
  
  // 1. TAMBAH 'kategori' ke dalam State
  const [editData, setEditData] = useState({
    nama_komoditas: '', kategori: '', harga_per_kg: '', stok_kg: '', deskripsi: '', lokasi_lahan: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else fetchProductData(token);
  }, [id, navigate]);

  const fetchProductData = async (token) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditData({
        nama_komoditas: res.data.nama_komoditas,
        kategori: res.data.kategori || 'Lainnya', // 2. Load data kategori lama
        harga_per_kg: res.data.harga_per_kg,
        stok_kg: res.data.stok_kg,
        deskripsi: res.data.deskripsi,
        lokasi_lahan: res.data.lokasi_lahan || ''
      });
      setPreviewLama(res.data.image_url);
      setIsLoading(false);
    } catch (err) {
      toast.error("Produk tidak ditemukan!");
      navigate('/dashboard');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const loadingToast = toast.loading('Menyimpan perubahan...');

    try {
      const formData = new FormData();
      formData.append('nama_komoditas', editData.nama_komoditas);
      formData.append('kategori', editData.kategori); // 3. Kirim data kategori
      formData.append('harga_per_kg', editData.harga_per_kg);
      formData.append('stok_kg', editData.stok_kg);
      formData.append('deskripsi', editData.deskripsi);
      formData.append('lokasi_lahan', editData.lokasi_lahan);
      if (editImage) formData.append('image', editImage);

      await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
      });
      toast.success("Data produk berhasil diperbarui!", { id: loadingToast });
      navigate(`/product/${id}`);
    } catch (error) {
      toast.error("Gagal memperbarui produk.", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const dapatkanLokasiLahan = (e) => {
    e.preventDefault();
    toast.loading("Melacak posisi satelit...", { id: 'gpsEdit' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data.display_name) {
            setEditData(prev => ({ ...prev, lokasi_lahan: data.display_name }));
            toast.success("Lokasi otomatis didapatkan!", { id: 'gpsEdit' });
          }
        } catch (error) {
          toast.error("Gagal memuat alamat otomatis.", { id: 'gpsEdit' });
        }
      });
    } else {
      toast.error("Browser tidak mendukung GPS.", { id: 'gpsEdit' });
    }
  };

  if (isLoading) return <div className="min-h-screen flex justify-center items-center font-bold text-primary animate-pulse">Memuat Form Edit...</div>;

  return (
    // Penyesuaian padding untuk Mobile
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-10">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600 flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 flex items-center gap-2 truncate">
            <Edit className="text-primary flex-shrink-0"/> Edit Komoditas
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 w-full max-w-4xl mx-auto mt-2 md:mt-6">
        <form onSubmit={handleSaveEdit} className="bg-white p-5 md:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5 md:gap-6">
          
          {/* GRID UNTUK NAMA & KATEGORI (2 Kolom di Desktop, 1 Kolom di HP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Nama Komoditas</label>
              <input type="text" value={editData.nama_komoditas} onChange={(e) => setEditData({...editData, nama_komoditas: e.target.value})} className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base" required />
            </div>

            {/* 4. INPUT KATEGORI BARU SESUAI REVISI */}
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Kategori</label>
              <select 
                name="kategori" 
                value={editData.kategori} 
                onChange={(e) => setEditData({...editData, kategori: e.target.value})} 
                className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition appearance-none cursor-pointer text-sm md:text-base"
                required
              >
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Harga (Rp / Kg)</label>
              <input type="number" min="1" value={editData.harga_per_kg} onChange={(e) => setEditData({...editData, harga_per_kg: e.target.value})} className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base" required />
            </div>
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Stok Tersedia (Kg)</label>
              <input type="number" min="1" value={editData.stok_kg} onChange={(e) => setEditData({...editData, stok_kg: e.target.value})} className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base" required />
            </div>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Lokasi Lahan / Titik Panen</label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
              <input type="text" value={editData.lokasi_lahan} onChange={(e) => setEditData({...editData, lokasi_lahan: e.target.value})} className="flex-1 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base" required />
              <button onClick={dapatkanLokasiLahan} type="button" className="bg-blue-100 text-blue-600 p-3.5 md:p-4 rounded-xl hover:bg-blue-200 transition font-bold shadow-sm flex items-center justify-center gap-2 sm:w-auto" title="Deteksi GPS">
                <MapPin size={20} /> <span className="sm:hidden text-sm">Gunakan GPS</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Deskripsi Detail</label>
            <textarea rows="4" value={editData.deskripsi} onChange={(e) => setEditData({...editData, deskripsi: e.target.value})} className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base resize-y"></textarea>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Foto Komoditas</label>
            <div className="mt-1.5 flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300 mx-auto sm:mx-0">
                {editImage ? (
                  <img src={URL.createObjectURL(editImage)} alt="Preview Baru" className="w-full h-full object-cover" />
                ) : previewLama ? (
                  <img src={previewLama} alt="Lama" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Store size={32}/></div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left w-full">
                <p className="font-semibold text-gray-800 text-sm md:text-base">Ganti Foto Baru?</p>
                <p className="text-xs text-gray-500 mb-3">Format JPG/PNG. Biarkan kosong jika tidak ingin mengubah foto lama.</p>
                <label className="cursor-pointer inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-white border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition shadow-sm">
                  <ImagePlus size={18} className="text-primary" /> Pilih File Gambar
                  <input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files[0])} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="mt-2 md:mt-4 w-full bg-primary text-white py-3.5 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md">
            <Save size={20} /> {isSaving ? 'Menyimpan Perubahan...' : 'Simpan Pembaruan'}
          </button>
        </form>
      </main>
    </div>
  );
}