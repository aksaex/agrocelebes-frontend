import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Minus, RefreshCcw, AlertCircle } from 'lucide-react';

export default function PriceWidget() {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRealPrices = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/stats/prices`);
      // PERBAIKAN: Pastikan yang diterima adalah Array. Jika database error dan mengirim object pesan, ini tidak akan memutihkan layar!
      if (Array.isArray(res.data)) {
        setPrices(res.data);
      } else {
        setPrices([]);
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealPrices();
  }, []);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition">
      <div className="mb-5 flex justify-between items-start">
        <div>
           <h3 className="font-bold text-gray-800 text-lg">Indeks Harga Pasar</h3>
           <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">Rata-rata di Pasar B2B AgroCelebes</p>
        </div>
        <button onClick={fetchRealPrices} className="p-2 bg-gray-50 rounded-full hover:bg-gray-200 text-gray-500 transition">
          <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center h-32 text-gray-400">
             <RefreshCcw className="animate-spin mb-2" size={24} />
             <p className="text-xs font-bold uppercase">Mengkalkulasi Pasar...</p>
           </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center h-32 text-red-400">
             <AlertCircle className="mb-2" size={24} />
             <p className="text-xs font-bold uppercase text-center">Gagal memuat harga</p>
           </div>
        ) : prices.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-32 text-gray-400">
             <Minus className="mb-2" size={24} />
             <p className="text-xs font-bold uppercase text-center">Belum ada komoditas di pasar</p>
           </div>
        ) : (
          prices.map((item, index) => {
            // PERBAIKAN PENCEGAH CRASH MATEMATIKA
            const amanHarga = item.rataHarga || 0;
            return (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-green-100 shadow-sm">
                    {item._id ? item._id.charAt(0) : '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-700 truncate">{item._id || 'Tidak diketahui'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.jumlahProduk || 0} Pelapak</p>
                  </div>
                </div>
                          
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-sm font-black text-gray-900 block">
                    Rp {Math.round(amanHarga).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[9px] text-primary font-black bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1 uppercase">
                    Stabil
                  </span>
                </div>
              </div>
            )
          }).slice(0, 4)
        )}
      </div>
    </div>
  );
}