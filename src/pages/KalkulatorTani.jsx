import { useState } from 'react';
import { Calculator, AlertCircle, RefreshCw, Sprout, HandCoins, PackageOpen, Calendar, Bot } from 'lucide-react';

export default function KalkulatorTani() {
  const [komoditas, setKomoditas] = useState('jagung');
  const [luasLahan, setLuasLahan] = useState('');
  const [bulanTanam, setBulanTanam] = useState('januari'); // State baru untuk bulan
  
  const [hasil, setHasil] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // DATA MASTER: Konstanta Pertanian (Simulasi Standar/Hektar)
  const masterData = {
    jagung: {
      nama: 'Jagung Hibrida',
      bibit_per_ha: 20, // kg
      harga_bibit: 80000, // Rp/kg
      npk_per_ha: 300, // kg
      harga_npk: 15000, // Rp/kg
      hasil_panen_ha: 7000, // kg (7 ton)
      harga_jual_estimasi: 4500 // Rp/kg
    },
    padi: {
      nama: 'Padi Sawah',
      bibit_per_ha: 25,
      harga_bibit: 15000,
      npk_per_ha: 250,
      harga_npk: 15000,
      hasil_panen_ha: 6000,
      harga_jual_estimasi: 6500
    },
    kakao: {
      nama: 'Kakao (Peremajaan/Baru)',
      bibit_per_ha: 1000, // pohon
      harga_bibit: 10000, // Rp/pohon
      npk_per_ha: 400, // kg (untuk masa produktif)
      harga_npk: 15000,
      hasil_panen_ha: 1500, // kg biji kering (estimasi produktif penuh)
      harga_jual_estimasi: 120000 // Rp/kg
    }
  };

  // MESIN AI MINI: Rule-based recommendation berdasarkan Iklim Sulawesi Selatan
  const generateAIRecommendation = (komoditas, bulan) => {
    // Musim di Sulsel: Kemarau (Mei - Okt, puncak Agu-Sep), Hujan (Nov - Apr, puncak Des-Jan)
    const kemarau = ['mei', 'juni', 'juli', 'agustus', 'september', 'oktober'];
    const hujan = ['november', 'desember', 'januari', 'februari', 'maret', 'april'];
    const puncakKemarau = ['agustus', 'september'];
    
    let rekomendasi = "";
    let status = "aman"; // aman, waspada, bahaya

    if (komoditas === 'jagung') {
      if (kemarau.includes(bulan)) {
        if (puncakKemarau.includes(bulan)) {
          rekomendasi = "Sangat Berisiko! Ini adalah puncak musim kemarau. Menanam jagung sekarang membutuhkan irigasi pompa yang ekstensif. Jika mengandalkan tadah hujan, potensi gagal panen sangat tinggi.";
          status = "bahaya";
        } else {
          rekomendasi = "Waspada Curah Hujan. Pastikan ketersediaan air tanah cukup untuk fase vegetatif (pertumbuhan awal). Pertimbangkan varietas jagung yang lebih tahan kering.";
          status = "waspada";
        }
      } else {
        rekomendasi = "Waktu Tanam Ideal! Curah hujan di bulan ini sangat mendukung pertumbuhan jagung. Waspadai genangan air berlebih di lahan agar akar tidak busuk.";
        status = "aman";
      }
    } 
    else if (komoditas === 'padi') {
      if (kemarau.includes(bulan)) {
        rekomendasi = "Risiko Kekeringan! Pastikan sawah Anda memiliki akses irigasi teknis yang stabil (bendungan/sumur bor). Jangan memaksakan tanam padi jika sumber air terbatas.";
        status = "bahaya";
      } else {
        rekomendasi = "Musim Tanam Cocok. Ketersediaan air melimpah. Fokus pada pencegahan hama wereng dan penyakit jamur yang sering muncul saat kelembapan sangat tinggi.";
        status = "aman";
      }
    }
    else if (komoditas === 'kakao') {
      if (kemarau.includes(bulan)) {
        rekomendasi = "Jangan Tanam Bibit Baru! Memindahkan bibit kakao ke lahan pada musim kemarau akan menyebabkan tingkat kematian bibit (stres air) di atas 60%. Tunda hingga musim hujan tiba.";
        status = "bahaya";
      } else {
        rekomendasi = "Waktu Pemindahan Ideal. Curah hujan membantu bibit kakao beradaptasi di lahan baru. Pastikan tanaman pelindung (naungan) sudah siap agar daun muda tidak terbakar matahari.";
        status = "aman";
      }
    }

    return { pesan: rekomendasi, status };
  };

  const handleHitung = (e) => {
    e.preventDefault();
    if (!luasLahan || luasLahan <= 0) return;
    
    setIsCalculating(true);
    setHasil(null);
    
    setTimeout(() => {
      const data = masterData[komoditas];
      const lahan = parseFloat(luasLahan);

      const totalBibit = data.bibit_per_ha * lahan;
      const biayaBibit = totalBibit * data.harga_bibit;
      
      const totalNPK = data.npk_per_ha * lahan;
      const biayaNPK = totalNPK * data.harga_npk;
      
      const totalModal = biayaBibit + biayaNPK;
      
      const estimasiPanen = data.hasil_panen_ha * lahan;
      const estimasiPendapatan = estimasiPanen * data.harga_jual_estimasi;
      
      const estimasiLabaRugi = estimasiPendapatan - totalModal;

      const aiAnalysis = generateAIRecommendation(komoditas, bulanTanam);

      setHasil({
        ...data,
        lahan,
        totalBibit,
        biayaBibit,
        totalNPK,
        biayaNPK,
        totalModal,
        estimasiPanen,
        estimasiPendapatan,
        estimasiLabaRugi,
        aiAnalysis
      });
      
      setIsCalculating(false);
    }, 1000); // Sedikit diperlama agar efek "AI Berpikir" terasa
  };

  return (
    <div className="flex flex-col font-sans animate-fade-in pb-10 relative min-h-screen bg-gray-50/50">
      
      {/* FORM INPUT STICKY */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm w-full">
        <form onSubmit={handleHitung} className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-3 items-center">
          
          <div className="hidden xl:flex items-center gap-2 mr-4 text-primary">
            <Calculator size={24} />
            <h1 className="font-black text-lg">Konsultan AI & Kalkulator Tani</h1>
          </div>

          <div className="w-full xl:w-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <select 
              value={komoditas} 
              onChange={(e) => setKomoditas(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition cursor-pointer appearance-none w-full font-bold text-gray-700"
            >
              <option value="jagung">🌽 Jagung Hibrida</option>
              <option value="padi">🌾 Padi Sawah</option>
              <option value="kakao">🍫 Kakao (Biji Kering)</option>
            </select>
            
            {/* Input Bulan Rencana Tanam (Baru) */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition w-full">
              <Calendar size={18} className="text-gray-400 mr-2 flex-shrink-0" />
              <select 
                value={bulanTanam} 
                onChange={(e) => setBulanTanam(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm font-bold text-gray-700 cursor-pointer appearance-none"
              >
                <option value="januari">Januari (Hujan)</option>
                <option value="februari">Februari (Hujan)</option>
                <option value="maret">Maret (Transisi)</option>
                <option value="april">April (Transisi)</option>
                <option value="mei">Mei (Awal Kemarau)</option>
                <option value="juni">Juni (Kemarau)</option>
                <option value="juli">Juli (Kemarau)</option>
                <option value="agustus">Agustus (Puncak Kemarau)</option>
                <option value="september">September (Puncak Kemarau)</option>
                <option value="oktober">Oktober (Transisi)</option>
                <option value="november">November (Awal Hujan)</option>
                <option value="desember">Desember (Hujan)</option>
              </select>
            </div>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition w-full">
              <input 
                type="number" step="0.01" min="0.1" max="9999"
                placeholder="Luas Lahan..." 
                value={luasLahan} 
                onChange={(e) => setLuasLahan(e.target.value)} 
                className="bg-transparent border-none outline-none w-full text-sm font-bold text-gray-700" 
                required
              />
              <span className="text-gray-400 font-bold ml-2 text-sm">Hektar</span>
            </div>
          </div>

          <div className="w-full xl:w-auto flex gap-3">
            <button 
              type="submit" 
              disabled={isCalculating}
              className="w-full xl:w-48 bg-primary text-white py-3 px-6 rounded-xl font-bold hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isCalculating ? <RefreshCw className="animate-spin" size={18}/> : <><Bot size={18} /> Analisis AI</>}
            </button>
          </div>
        </form>
      </div>

      {/* AREA HASIL */}
      <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1">
        
        {!hasil && !isCalculating ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-300 max-w-3xl mx-auto mt-10 px-4">
            <Bot className="mx-auto text-primary mb-4" size={56} />
            <p className="font-bold text-lg text-gray-800">AI Agronomist Siap Membantu</p>
            <p className="text-sm mt-2 max-w-lg mx-auto">Masukkan komoditas, rencana bulan tanam, dan luas lahan Anda. AI kami akan memadukan data iklim historis BMKG untuk memberikan saran terbaik agar Anda terhindar dari gagal panen.</p>
          </div>
        ) : isCalculating ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
             <p className="font-bold text-gray-500">Menganalisis pola cuaca & risiko tanah...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-800 break-words">Hasil Analisis: {hasil.nama}</h2>
                <p className="text-gray-500 text-sm font-medium">Lahan seluas <span className="text-primary font-bold">{hasil.lahan} Hektar</span></p>
              </div>
            </div>

            {/* KOTAK REKOMENDASI AI (BARU) */}
            <div className={`mb-6 p-5 sm:p-6 rounded-3xl border-2 flex items-start gap-4 shadow-sm ${
              hasil.aiAnalysis.status === 'bahaya' ? 'bg-red-50 border-red-200' :
              hasil.aiAnalysis.status === 'waspada' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
               <div className={`p-3 rounded-2xl flex-shrink-0 ${
                 hasil.aiAnalysis.status === 'bahaya' ? 'bg-red-100 text-red-600' :
                 hasil.aiAnalysis.status === 'waspada' ? 'bg-yellow-100 text-yellow-600' :
                 'bg-blue-100 text-blue-600'
               }`}>
                  <Bot size={28} />
               </div>
               <div>
                  <h3 className={`font-black text-base sm:text-lg uppercase tracking-wider mb-1 ${
                    hasil.aiAnalysis.status === 'bahaya' ? 'text-red-700' :
                    hasil.aiAnalysis.status === 'waspada' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    Rekomendasi AI Penyuluh
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-gray-700 leading-relaxed">
                    {hasil.aiAnalysis.pesan}
                  </p>
               </div>
            </div>

            {/* KARTU HITUNGAN KEUANGAN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 sm:p-3 bg-orange-50 text-orange-500 rounded-xl"><Sprout size={24}/></div>
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg">Kebutuhan Dasar</h3>
                </div>
                
                <div className="flex-1 flex flex-col gap-5">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Bibit / Benih</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gray-50 pb-2 gap-1 sm:gap-0">
                      <span className="text-lg md:text-xl font-black text-gray-800 break-words">{hasil.totalBibit.toLocaleString('id-ID')} <span className="text-xs sm:text-sm font-medium text-gray-400">{komoditas === 'kakao' ? 'Pohon' : 'Kg'}</span></span>
                      <span className="text-sm md:text-base font-bold text-orange-600 break-words">Rp {hasil.biayaBibit.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Pupuk NPK</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-gray-50 pb-2 gap-1 sm:gap-0">
                      <span className="text-lg md:text-xl font-black text-gray-800 break-words">{hasil.totalNPK.toLocaleString('id-ID')} <span className="text-xs sm:text-sm font-medium text-gray-400">Kg</span></span>
                      <span className="text-sm md:text-base font-bold text-orange-600 break-words">Rp {hasil.biayaNPK.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-[10px] sm:text-xs text-gray-500 font-bold mb-1">Total Modal Material</p>
                  <span className="text-xl sm:text-2xl font-black text-orange-600 break-words">Rp {hasil.totalModal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-500 rounded-xl"><PackageOpen size={24}/></div>
                  <h3 className="font-bold text-gray-800 text-base sm:text-lg">Volume Panen</h3>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Estimasi Total Panen</p>
                  <div className="flex items-end gap-2 mb-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 break-words">{hasil.estimasiPanen.toLocaleString('id-ID')}</span>
                    <span className="text-base sm:text-xl font-bold text-gray-400 mb-1 sm:mb-1.5">Kg</span>
                  </div>
                  <p className="text-[11px] sm:text-sm font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1.5 rounded-lg w-fit break-words">
                    Asumsi Harga: Rp {hasil.harga_jual_estimasi.toLocaleString('id-ID')} / Kg
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-primary p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col h-full text-white transform transition hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl"><HandCoins size={24} className="text-white"/></div>
                  <h3 className="font-bold text-white text-base sm:text-lg">Proyeksi Keuntungan</h3>
                </div>
                
                <div className="flex-1 flex flex-col justify-end">
                  <p className="text-[10px] sm:text-xs text-green-100 uppercase tracking-widest font-bold mb-2">Estimasi Laba Kotor</p>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white block leading-tight tracking-tight break-words">
                    Rp {hasil.estimasiLabaRugi.toLocaleString('id-ID')}
                  </span>
                  
                  <div className="mt-6 pt-4 border-t border-white/20 flex items-start gap-2">
                    <AlertCircle size={16} className="text-green-200 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] sm:text-xs text-green-100 font-medium leading-relaxed">
                      Laba kotor dihitung dari (Total Volume x Harga Jual) dikurangi Total Modal Material. Belum termasuk upah tenaga kerja dan lahan.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}