import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BadgeCheck, Banknote, PackageCheck, RefreshCw, ShieldCheck, Sprout, Truck, Warehouse, Inbox, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const roleConfig = {
  kud: {
    title: 'Dashboard KUD',
    subtitle: 'Verifikasi lahan petani dan lanjutkan kontrak ke pabrik.',
    empty: 'Belum ada pengajuan verifikasi lahan saat ini.',
    actionLabel: 'Setujui Lahan',
    actionIcon: BadgeCheck,
    actionPath: (id) => `/escrow/${id}/verify-land`,
    actionSuccess: 'Lahan berhasil disetujui',
    visibleStatuses: ['pending', 'verifikasi_lahan'],
    actionStatus: 'pending',
    statLabel: 'Menunggu Verifikasi'
  },
  pabrik: {
    title: 'Dashboard Pabrik',
    subtitle: 'Bayar DP untuk mengunci kontrak dan melanjutkan produksi.',
    empty: 'Belum ada kontrak yang menunggu pembayaran DP.',
    actionLabel: 'Bayar DP',
    actionIcon: Banknote,
    actionPath: (id) => `/escrow/${id}/pay-dp`,
    actionSuccess: 'DP berhasil dibayar',
    visibleStatuses: ['verifikasi_lahan', 'dp_locked'],
    actionStatus: 'verifikasi_lahan',
    statLabel: 'DP Terkunci'
  },
  kios: {
    title: 'Dashboard Kios',
    subtitle: 'Serahkan pupuk untuk menyelesaikan fase kontrak.',
    empty: 'Belum ada pesanan pupuk yang siap diserahkan.',
    actionLabel: 'Serahkan Pupuk',
    actionIcon: Truck,
    actionPath: (id) => `/escrow/${id}/deliver-fertilizer`,
    actionSuccess: 'Pupuk berhasil diserahkan',
    visibleStatuses: ['dp_locked', 'pupuk_diserahkan'],
    actionStatus: 'dp_locked',
    statLabel: 'Siap Diserahkan'
  }
};

// Menambahkan border agar badge status lebih tajam
const statusTone = {
  pending: 'bg-gray-50 text-gray-600 border-gray-200',
  verifikasi_lahan: 'bg-amber-50 text-amber-700 border-amber-200',
  dp_locked: 'bg-blue-50 text-blue-700 border-blue-200',
  pupuk_diserahkan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  selesai: 'bg-green-50 text-green-700 border-green-200'
};

// Menerjemahkan status raw DB menjadi teks yang ramah pengguna
const statusLabel = {
  pending: 'Menunggu',
  verifikasi_lahan: 'Terverifikasi',
  dp_locked: 'DP Terbayar',
  pupuk_diserahkan: 'Pupuk Diserahkan',
  selesai: 'Selesai'
};

export default function RoleContractDashboard({ role }) {
  const config = roleConfig[role];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/escrow`, { withCredentials: true });
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Gagal memuat data kontrak');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const visibleItems = useMemo(() => items.filter((item) => config.visibleStatuses.includes(item.status)), [items, config.visibleStatuses]);

  const summary = useMemo(() => items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    acc.totalTonase += Number(item.tonase || 0);
    return acc;
  }, { totalTonase: 0 }), [items]);

  const handleAction = async (id) => {
    setBusyId(id);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}${config.actionPath(id)}`, {}, { withCredentials: true });
      toast.success(config.actionSuccess);
      await loadData(); // Reload otomatis setelah sukses
    } catch (error) {
      toast.error(error.response?.data?.pesan || 'Aksi gagal diproses');
    } finally {
      setBusyId(null);
    }
  };

  if (!config) return null;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mb-2">
            <Warehouse size={14} /> Modul Kontrak
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{config.subtitle}</h2>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-emerald-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> 
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      {/* STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<ShieldCheck className="text-emerald-600" />} label={config.statLabel} value={summary[config.actionStatus] || 0} bgIcon="bg-emerald-50" />
        <StatCard icon={<Sprout className="text-amber-600" />} label="Total Kontrak Aktif" value={items.length} bgIcon="bg-amber-50" />
        <StatCard icon={<PackageCheck className="text-blue-600" />} label="Total Tonase Masuk" value={`${summary.totalTonase.toLocaleString('id-ID')} ton`} bgIcon="bg-blue-50" />
      </div>

      {/* DATA LIST SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            Daftar Antrean Kontrak
          </h3>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
            {visibleItems.length} Dokumen
          </span>
        </div>

        <div className="bg-gray-50/30 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 size={40} className="animate-spin mb-4 text-emerald-600" />
              <p className="text-sm font-bold text-gray-500 animate-pulse">Menghubungkan ke Smart Contract...</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="bg-gray-100 p-4 rounded-full mb-4 text-gray-400">
                <Inbox size={40} />
              </div>
              <p className="font-bold text-gray-800 text-lg">{config.empty}</p>
              <p className="text-sm mt-2 text-gray-500 max-w-sm">
                Sistem akan memperbarui daftar ini secara otomatis jika ada pergerakan kontrak baru. Gunakan data *seeder* untuk melihat simulasi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-5">
              {visibleItems.map((item) => {
                const ActionIcon = config.actionIcon;
                const canAct = item.status === config.actionStatus;
                const isBusy = busyId === item._id;

                return (
                  <article key={item._id} className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-5 hover:border-emerald-200 transition-colors shadow-sm hover:shadow-md">
                    
                    {/* Header Item */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">{item.komoditas}</p>
                        <h4 className="text-lg font-black text-gray-900 leading-none">{item.petani_id?.nama || 'Petani Anonim'}</h4>
                        <p className="text-xs font-medium text-gray-500 mt-1.5">{item.petani_id?.alamat || 'Menunggu pembaruan lokasi'}</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest whitespace-nowrap ${statusTone[item.status] || statusTone.pending}`}>
                        {statusLabel[item.status] || item.status}
                      </span>
                    </div>

                    {/* Informasi Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <InfoBox label="Kapasitas" value={`${item.tonase} Ton`} />
                      <InfoBox label="Estimasi Nilai" value={`Rp ${Number(item.nilai_kontrak || 0).toLocaleString('id-ID')}`} />
                      <InfoBox label="Titik Lahan" value={item.petani_id?.koordinat_lokasi ? `${item.petani_id.koordinat_lokasi.lat.toFixed(3)}, ${item.petani_id.koordinat_lokasi.lng.toFixed(3)}` : 'Tidak ada'} />
                    </div>

                    {/* Footer Item & Aksi */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-auto">
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Catatan Tambahan</p>
                        <p className="text-xs text-gray-600 font-medium truncate">{item.catatan || 'Tidak ada catatan spesifik.'}</p>
                      </div>
                      
                      <button
                        onClick={() => handleAction(item._id)}
                        disabled={!canAct || isBusy}
                        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all
                          ${!canAct 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : isBusy
                              ? 'bg-emerald-700 text-white cursor-wait opacity-80'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5'
                          }`}
                      >
                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : <ActionIcon size={16} />} 
                        {isBusy ? 'Memproses...' : config.actionLabel}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgIcon }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 transition-all hover:border-emerald-100 hover:shadow-md">
      <div className={`p-3.5 rounded-2xl ${bgIcon}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">{label}</p>
        <div className="text-2xl font-black text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 hover:bg-white transition-colors">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-800 mt-1 truncate">{value}</p>
    </div>
  );
}