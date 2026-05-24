import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, MapPin, ArrowLeft, ImagePlus, Store, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PostProduct() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    nama_komoditas: '', kategori: 'Kakao & Cokelat', harga_per_kg: '', stok_kg: '', deskripsi: '', lokasi_lahan: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'petani' && parsedUser.role !== 'admin') {
        toast.error("Hanya Petani yang dapat memposting komoditas.");
        navigate('/pasar-b2b');
      }
      setUser(parsedUser);
    }
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const dapatkanLokasiLahan = (e) => {
    e.preventDefault();
    setIsLocating(true);
    toast.loading("Melacak posisi satelit resolusi tinggi...", { id: 'gpsPost' });
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data.display_name) {
            setFormData(prev => ({ ...prev, lokasi_lahan: data.display_name }));
            toast.success("Lokasi satelit berhasil dikunci!", { id: 'gpsPost' });
          }
        } catch (error) {
          toast.error("Gagal memuat alamat otomatis.", { id: 'gpsPost' });
        } finally {
          setIsLocating(false);
        }
      }, () => {
         toast.error("Gagal melacak. Pastikan GPS aktif.", { id: 'gpsPost' });
         setIsLocating(false);
      }, 
      // PERBAIKAN: Memaksa menggunakan GPS Satelit asli, bukan IP Internet
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } else {
      toast.error("Browser tidak mendukung GPS.", { id: 'gpsPost' });
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('user');
    
    if (!formData.lokasi_lahan) {
      toast.error("Mohon tekan tombol 'Gunakan GPS' untuk menentukan lokasi lahan!");
      setIsSubmitting(false);
      return;
    }

    if (!image) {
      toast.error("Foto komoditas wajib diunggah!");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('image', image);

    const loadingToast = toast.loading('Mengunggah data ke Pasar B2B...');

    try {
      await axios.post(import.meta.env.VITE_API_URL + '/products', data, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      toast.success('Komoditas Berhasil Dipublikasikan!', { id: loadingToast });
      navigate('/pasar-b2b');
    } catch (error) {
      toast.error('Gagal mengunggah produk. Coba lagi.', { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-10">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
          <button onClick={() => navigate('/pasar-b2b')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-600 flex-shrink-0">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg md:text-xl font-extrabold text-gray-900 flex items-center gap-2 truncate">
            <PackagePlus className="text-primary flex-shrink-0"/> Posting Komoditas
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 w-full max-w-4xl mx-auto mt-2 md:mt-6 animate-fade-in">
        <form onSubmit={handleSubmit} className="bg-white p-5 md:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5 md:gap-6">
          
          <div className="mb-2">
             <h2 className="text-xl font-bold text-gray-800">Detail Hasil Panen</h2>
             <p className="text-sm text-gray-500">Lengkapi data di bawah ini untuk menawarkan komoditas Anda ke pembeli.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Nama Komoditas *</label>
              <input type="text" name="nama_komoditas" value={formData.nama_komoditas} onChange={handleChange} placeholder="Cth: Biji Kakao Fermentasi" className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base" required />
            </div>
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Kategori *</label>
              <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition appearance-none cursor-pointer text-sm md:text-base" required>
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
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Harga (Rp / Kg) *</label>
              <input type="number" min="1" name="harga_per_kg" value={formData.harga_per_kg} onChange={handleChange} placeholder="Contoh: 120000" className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base" required />
            </div>
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Stok Total (Kg) *</label>
              <input type="number" min="1" name="stok_kg" value={formData.stok_kg} onChange={handleChange} placeholder="Contoh: 500" className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base" required />
            </div>
          </div>

          {/* PERBAIKAN: LOKASI TERKUNCI SEPERTI EDIT PRODUCT */}
          <div>
            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1">
              Lokasi Lahan / Titik Panen <span className="text-red-500 lowercase font-normal">(Wajib GPS)</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
              <div className={`flex-1 flex items-center p-3.5 md:p-4 rounded-xl border transition ${formData.lokasi_lahan ? 'bg-green-50 border-green-500' : 'bg-gray-100 border-gray-200'}`}>
                <MapPin size={20} className={`${formData.lokasi_lahan ? 'text-green-500' : 'text-gray-400'} mr-2 flex-shrink-0`} />
                <input 
                  type="text" 
                  name="lokasi_lahan" 
                  value={formData.lokasi_lahan} 
                  readOnly // Terkunci
                  placeholder="Klik tombol GPS di samping ➔" 
                  className="w-full bg-transparent outline-none cursor-not-allowed text-sm md:text-base text-gray-600" 
                  required 
                />
              </div>
              <button 
                onClick={dapatkanLokasiLahan} 
                type="button" 
                disabled={isLocating}
                className={`p-3.5 md:p-4 rounded-xl transition font-bold shadow-sm flex items-center justify-center gap-2 sm:w-auto ${formData.lokasi_lahan ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`} 
                title="Deteksi GPS"
              >
                {formData.lokasi_lahan ? <CheckCircle2 size={20} /> : <MapPin size={20} className={isLocating ? 'animate-bounce' : ''} />} 
                <span className="sm:hidden text-sm">{formData.lokasi_lahan ? 'Lokasi Dikunci' : 'Gunakan GPS'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Deskripsi Detail *</label>
            <textarea rows="4" name="deskripsi" value={formData.deskripsi} onChange={handleChange} placeholder="Jelaskan kualitas, proses pasca-panen, tingkat kadar air, dll..." className="w-full mt-1.5 p-3.5 md:p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-primary/30 transition text-sm md:text-base resize-y" required></textarea>
          </div>

          <div>
            <label className="text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">Foto Komoditas *</label>
            <div className="mt-1.5 flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border-2 border-dashed border-primary/50 bg-green-50/30 rounded-2xl">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 mx-auto sm:mx-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview Upload" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                     <Store size={28} className="mb-1 opacity-50"/>
                     <span className="text-[10px] uppercase font-bold">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left w-full">
                <p className="font-bold text-gray-800 text-sm md:text-base">Upload Foto Asli</p>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">Pembeli B2B lebih tertarik pada foto komoditas yang jelas dan belum diedit. Format JPG/PNG Maks 5MB.</p>
                <label className="cursor-pointer inline-flex items-center justify-center w-full sm:w-auto gap-2 bg-white border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition shadow-sm text-primary">
                  <ImagePlus size={18} /> {imagePreview ? 'Ganti Foto' : 'Pilih File Gambar'}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="mt-2 md:mt-4 w-full bg-primary text-white py-3.5 md:py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:bg-gray-400 shadow-md shadow-primary/20">
            <PackagePlus size={20} /> {isSubmitting ? 'Mempublikasikan...' : 'Publikasikan ke Pasar'}
          </button>

        </form>
      </main>
    </div>
  );
}