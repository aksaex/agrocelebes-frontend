import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Image, Send, X, Paperclip, AlertCircle } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [pesan, setPesan] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sisaKuota, setSisaKuota] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Halo! Saya Penyuluh Pintar. Ada yang bisa saya bantu terkait pertanian hari ini?' }
  ]);
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load Riwayat dari DB saat pertama kali buka
  useEffect(() => {
    if (isOpen) {
      axios.get(`${import.meta.env.VITE_API_URL}/chat/history`, {
        withCredentials: true // Wajib agar Cookie Token terkirim!
      }).then(res => {
        if (res.data.length > 0) setChatHistory(res.data);
      }).catch(err => console.error("Gagal load riwayat", err));
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const kirimPesan = async (e) => {
    e.preventDefault();
    if (!pesan.trim() && !image) return;

    const formData = new FormData();
    formData.append('pesan', pesan);
    if (image) formData.append('image', image);

    const userEntry = { role: 'user', text: pesan || "Mengirim gambar..." };
    setChatHistory(prev => [...prev, userEntry]);
    
    // Reset input
    setPesan('');
    setImage(null);
    setPreview(null);
    setLoading(true);

    try {
      // 👇 REVISI: Hapus pencarian token manual, gunakan Cookie otomatis!
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, formData, {
        withCredentials: true, // Wajib agar HttpOnly Cookie ikut terkirim
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      setChatHistory(prev => [...prev, { role: 'bot', text: response.data.balasan }]);
      setSisaKuota(response.data.sisaKuota);
    } catch (error) {
      const errorMsg = error.response?.data?.balasan || 'Maaf, sistem sedang sibuk. Silakan coba lagi.';
      setChatHistory(prev => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-green-700 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
          <Send size={28} />
        </button>
      ) : (
        <div className="bg-white w-[90vw] sm:w-[400px] h-[500px] sm:h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
          
          {/* Header */}
          <div className="bg-primary p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">🤖</div>
              <div>
                <h3 className="font-bold">Penyuluh Pintar</h3>
                <p className="text-[10px] text-green-200">
                   {sisaKuota !== null ? `Sisa Kuota: ${sisaKuota} Tanya` : 'Online'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X /></button>
          </div>

          {/* Area Chat */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {chatHistory.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                  chat.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Preview Gambar */}
          {preview && (
            <div className="px-4 py-2 bg-gray-100 flex items-center gap-2">
              <img src={preview} className="w-12 h-12 object-cover rounded-lg border-2 border-primary" />
              <button onClick={() => {setImage(null); setPreview(null)}} className="text-red-500"><X size={16}/></button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={kirimPesan} className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-2xl">
              <button type="button" onClick={() => fileInputRef.current.click()} className="text-gray-500 hover:text-primary">
                <Paperclip size={20} />
              </button>
              <input 
                type="file" ref={fileInputRef} hidden accept="image/*" 
                onChange={handleImageChange}
              />
              <input 
                type="text" value={pesan} onChange={(e) => setPesan(e.target.value)}
                placeholder="Tulis pesan..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
              />
              <button type="submit" disabled={loading} className="text-primary disabled:text-gray-400">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}