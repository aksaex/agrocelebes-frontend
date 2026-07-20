import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BadgeCheck, ClipboardList, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KiosInvoiceGuaranteePanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/escrow`, { withCredentials: true });
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Gagal memuat invoice guarantee');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const guaranteeRows = useMemo(() => {
    return items
      .filter((item) => ['dp_locked', 'pupuk_diserahkan', 'selesai'].includes(item.status))
      .map((item) => ({
        id: item._id,
        nama: item.petani_id?.nama || 'Petani Demo',
        komoditas: item.komoditas,
        nilai: item.nilai_kontrak,
        status: item.status,
        jaminan: 'Bank Guarantee Aktif'
      }));
  }, [items]);

  return (
    <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <ShieldCheck size={14} /> Invoice Guarantee
          </div>
          <h3 className="mt-3 font-black text-gray-900 text-xl">Daftar Petani dengan Jaminan Bank</h3>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-700 hover:bg-gray-100 transition">
          <RefreshCw size={16} /> Muat Ulang
        </button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="py-12 text-center text-gray-400 font-bold">Memuat invoice guarantee...</div>
        ) : guaranteeRows.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="font-bold text-gray-800">Belum ada petani dengan jaminan bank aktif.</p>
            <p className="text-sm mt-1">Jalankan seeder demo untuk melihat contoh data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-extrabold">Petani</th>
                  <th className="py-3 px-4 font-extrabold">Komoditas</th>
                  <th className="py-3 px-4 font-extrabold">Nilai Kontrak</th>
                  <th className="py-3 px-4 font-extrabold text-right">Status Jaminan</th>
                </tr>
              </thead>
              <tbody>
                {guaranteeRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900">{row.nama}</p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Kios Pupuk</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">{row.komoditas}</td>
                    <td className="py-4 px-4 text-sm font-bold text-gray-800">Rp {Number(row.nilai || 0).toLocaleString('id-ID')}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <BadgeCheck size={12} /> {row.jaminan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}