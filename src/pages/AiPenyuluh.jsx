import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, ImagePlus, Bot, X, Loader2 } from 'lucide-react';

export default function AiPenyuluh() {
  const [pesan, setPesan] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State untuk menyimpan riwayat chat
  const [chatHistory, setChatHistory] = useState([
    { 
      role: 'bot', 
      text: 'Halo! Saya Penyuluh Pintar AgroCelebes. Anda bisa bertanya soal pertanian atau **mengunggah foto** tanaman/hama untuk saya analisis. Ada yang bisa saya bantu hari ini?' 
    }
  ]);
  
  const chatEndRef = useRef(null);

  // Auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Buat preview gambar
    }
  };

  const hapusGambar = () => {
    setImage(null);
    setImagePreview(null);
  };

  const kirimPesan = async (e) => {
    e.preventDefault();
    if (!pesan.trim() && !image) return;

    const pesanUser = pesan;
    const gambarDikirim = imagePreview; // Simpan preview untuk ditampilkan di chat user
    
    // Reset form input
    setPesan(''); 
    hapusGambar();
    
    // Tambahkan pesan user ke layar
    setChatHistory(prev => [...prev, { role: 'user', text: pesanUser, image: gambarDikirim }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (pesanUser) formData.append('pesan', pesanUser);
      if (image) formData.append('image', image);

      const response = await axios.post(import.meta.env.VITE_API_URL + '/chat', formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        } 
      });

      // Tampilkan balasan AI
      setChatHistory(prev => [...prev, { role: 'bot', text: response.data.balasan }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Maaf, saya sedang mengalami gangguan koneksi ke server pusat. Silakan coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // CLASS 'absolute inset-0' SANGAT PENTING: Membuat halaman ini nge-pas di dalam MainLayout
    <div className="flex flex-col absolute inset-0 bg-gray-50 font-sans animate-fade-in">
      
      {/* AREA CHAT (Otomatis menyesuaikan tinggi layar dan bisa di-scroll) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
          {chatHistory.map((chat, index) => (
            <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar AI */}
              {chat.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                  <Bot size={18} />
                </div>
              )}

              {/* Balon Chat */}
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm text-[15px] leading-relaxed ${
                chat.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                {/* Jika user mengirim gambar, tampilkan di atas teks */}
                {chat.image && (
                  <img src={chat.image} alt="Upload User" className="w-48 h-auto rounded-xl mb-3 border border-black/10 shadow-sm" />
                )}
                {/* Teks Chat AI di-render agar **Tebal** bisa jadi tebal sungguhan */}
                <div dangerouslySetInnerHTML={{ __html: chat.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
              </div>

            </div>
          ))}

          {/* Indikator Loading saat AI berpikir */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-3 flex-shrink-0 mt-1 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span className="text-sm text-gray-500 font-medium">Memproses data satelit dan visual...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* FORM INPUT STICKY DI BAWAH (Menempel dengan elegan) */}
      <footer className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-3xl mx-auto">
          
          {/* Preview Gambar Sebelum Dikirim */}
          {imagePreview && (
            <div className="mb-3 relative inline-block animate-fade-in">
              <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-primary shadow-sm" />
              <button onClick={hapusGambar} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition transform hover:scale-110">
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={kirimPesan} className="flex items-end gap-2 bg-gray-50 border border-gray-200 p-2 rounded-2xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
            
            <label className="p-3 text-gray-400 hover:text-primary hover:bg-green-50 rounded-xl cursor-pointer transition">
              <ImagePlus size={24} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            <textarea 
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder="Ketik keluhan tanaman atau unggah foto..." 
              className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[44px] py-3 text-gray-800 text-[15px]"
              rows="1"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                // Submit pakai tombol Enter (kecuali Shift+Enter untuk baris baru)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  kirimPesan(e);
                }
              }}
            />

            <button 
              type="submit" 
              disabled={loading || (!pesan.trim() && !image)}
              className="p-3 bg-primary text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors shadow-md mb-0.5"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3 font-medium">Penyuluh Pintar AI dapat membuat kesalahan. Harap verifikasi info penting secara mandiri.</p>
        </div>
      </footer>

    </div>
  );
}