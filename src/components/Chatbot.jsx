import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [pesan, setPesan] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Halo! Saya Penyuluh Pintar AgroCelebes. Ada yang bisa saya bantu terkait pertanyaan pertanian Anda hari ini?' }
  ]);
  
  const chatEndRef = useRef(null);

  // Auto-scroll ke pesan paling bawah saat ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isOpen]);

  const kirimPesan = async (e) => {
    e.preventDefault();
    if (!pesan.trim()) return;

    const pesanUser = pesan;
    setPesan(''); 
    
    setChatHistory(prev => [...prev, { role: 'user', text: pesanUser }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, 
        { pesan: pesanUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatHistory(prev => [...prev, { role: 'bot', text: response.data.balasan }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Maaf, saya sedang mengalami gangguan jaringan. Coba lagi nanti ya!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CSS KHUSUS UNTUK SCROLLBAR CHAT YANG ELEGAN */}
      <style>{`
        .chat-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background-color: #16a34a;
          border-radius: 10px;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-primary hover:bg-green-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transform transition-transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </button>
        )}

        {isOpen && (
          <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 h-[32rem]">
            
            {/* Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
                <div>
                  <h3 className="font-bold text-sm">Penyuluh AI</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-green-100">Online</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* AREA PERCAKAPAN (Scrollable dengan Custom Scrollbar) */}
            <div className="flex-1 p-4 bg-[#f8fafc] overflow-y-auto chat-scrollbar flex flex-col gap-4">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 max-w-[85%] text-sm leading-relaxed shadow-sm ${
                    chat.role === 'user' 
                      ? 'bg-primary text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              )}
              {/* Dummy div agar auto-scroll ke bawah berfungsi sempurna */}
              <div ref={chatEndRef} />
            </div>

            {/* Form Input Pesan */}
            <form onSubmit={kirimPesan} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Tanyakan masalah tanamanmu..." 
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
              <button 
                type="submit" 
                disabled={loading || !pesan.trim()}
                className="bg-primary text-white p-3 rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
            
          </div>
        )}
      </div>
    </>
  );
}