import React, { useState } from 'react';
import toast from 'react-hot-toast';
// Pastikan komponen ini tersedia di folder Anda untuk tab 'distribusi'
import RoleContractDashboard from '../../components/RoleContractDashboard'; 
import { Store, Package, FileText, ShieldCheck, Sprout, AlertCircle, TrendingUp, Building2, CheckCircle2, ArrowRightLeft, CreditCard } from 'lucide-react';

// Mock Data Stok Gudang Kios
const mockStok = [
  { id: 1, nama: 'Pupuk Urea (Subsidi)', stok: 2500, satuan: 'Kg', status: 'Aman', warna: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 2, nama: 'NPK Phonska', stok: 450, satuan: 'Kg', status: 'Kritis', warna: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 3, nama: 'Pupuk SP-36', stok: 1200, satuan: 'Kg', status: 'Aman', warna: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 4, nama: 'Pestisida Cair Nabati', stok: 120, satuan: 'Liter', status: 'Menipis', warna: 'text-amber-600', bg: 'bg-amber-50' }
];

// Mock Data Invoice Guarantee (Uang dari Pabrik yang tertahan di Escrow)
const initialInvoices = [
  { 
    id: 'INV-ESC-001', 
    petani: 'Kelompok Tani Harapan (Pak Rustan)', 
    pabrik: 'PT Agro Pangan Sulsel', 
    nominal: 15500000, 
    status: 'Tersedia', // Artinya pupuk sudah diserahkan, dana siap dicairkan kios
    tanggal: '18 Agt 2026'
  },
  { 
    id: 'INV-ESC-002', 
    petani: 'KUD Sumber Makmur', 
    pabrik: 'PT Beras Nusantara', 
    nominal: 8200000, 
    status: 'Terkunci', // Artinya DP sudah masuk Escrow, tapi kios belum kasih pupuk
    tanggal: '19 Agt 2026'
  },
  { 
    id: 'INV-ESC-003', 
    petani: 'Kelompok Tani Sejahtera', 
    pabrik: 'PT Agro Pangan Sulsel', 
    nominal: 21000000, 
    status: 'Dicairkan', 
    tanggal: '15 Agt 2026'
  }
];

export default function KiosDashboard() {
  const [activeTab, setActiveTab] = useState('distribusi');
  const [invoices, setInvoices] = useState(initialInvoices);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fungsi Simulasi Pencairan BI-FAST
  const handleCairkanDana = (id) => {
    setIsProcessing(true);
    const toastId = toast.loading('Mengontak API BPD Sulselbar (BI-FAST)...');
    
    setTimeout(() => {
      setInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, status: 'Dicairkan' } : inv
      ));
      toast.success('Dana berhasil masuk ke rekening Kios Anda!', { id: toastId });
      setIsProcessing(false);
    }, 2000);
  };

  const totalCair = invoices.filter(i => i.status === 'Dicairkan').reduce((acc, curr) => acc + curr.nominal, 0);
  const totalTersedia = invoices.filter(i => i.status === 'Tersedia').reduce((acc, curr) => acc + curr.nominal, 0);

  return (
    <div className="flex flex-col font-sans animate-fade-in pb-10 min-h-screen w-full bg-orange-50/30">
      
      {/* HEADER STICKY */}
      <div className="bg-white border-b border-amber-200/60 sticky top-0 z-20 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-4 text-amber-900">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl border border-amber-200">
                <Store size={28} />
              </div>
              <div>
                 <h1 className="font-black text-xl md:text-2xl leading-tight">
                   Dashboard Kios Tani
                 </h1>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                   <ShieldCheck size={14} className="text-emerald-500"/> Kios Mitra Resmi KUD
                 </p>
              </div>
            </div>
            
            {/* Metrik Mini Header */}
            <div className="hidden sm:flex gap-6 text-right bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Total Pupuk Disalurkan</p>
                <p className="text-lg font-black text-gray-800">14.5 <span className="text-xs text-gray-500 font-medium">Ton</span></p>
              </div>
            </div>
          </div>

          {/* TAB NAVIGASI */}
          <div className="flex bg-gray-100/80 p-1.5 rounded-xl w-full sm:max-w-2xl overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('distribusi')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'distribusi' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sprout size={16} /> Serahkan Pupuk
            </button>
            <button 
              onClick={() => setActiveTab('invoice')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'invoice' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={16} /> Jaminan Invoice
            </button>
            <button 
              onClick={() => setActiveTab('stok')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'stok' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Package size={16} /> Stok Gudang
            </button>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1">
        
        {/* TAB 1: DISTRIBUSI PUPUK */}
        {activeTab === 'distribusi' && (
          <div className="animate-fade-in">
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
               <div className="bg-amber-500 text-white p-1.5 rounded-full mt-0.5 shrink-0">
                 <AlertCircle size={14} />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-amber-900">Aksi Dibutuhkan: Penyaluran Pupuk</h4>
                 <p className="text-xs text-amber-700 mt-1">
                   Daftar di bawah ini adalah kontrak yang DP-nya sudah dibayar oleh Pabrik. Segera distribusikan pupuk ke petani agar jaminan invoice dana Anda aktif.
                 </p>
               </div>
            </div>
            <RoleContractDashboard role="kios" />
          </div>
        )}

        {/* TAB 2: INVOICE GUARANTEE (Solusi Kritis Closed-Loop Saprotan) */}
        {activeTab === 'invoice' && (
          <div className="animate-fade-in flex flex-col gap-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                   <CreditCard className="absolute -right-4 -bottom-4 opacity-20" size={100} />
                   <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">Saldo Dapat Dicairkan</p>
                   <h2 className="text-3xl font-black mb-4">Rp {totalTersedia.toLocaleString('id-ID')}</h2>
                   <p className="text-xs text-emerald-100/80">Dana ini berasal dari DP Pabrik di Escrow BPD yang pupuknya sudah Anda serahkan ke petani.</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
                   <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Sukses Dicairkan (Bulan Ini)</p>
                   <h2 className="text-3xl font-black text-gray-800">Rp {totalCair.toLocaleString('id-ID')}</h2>
                </div>
             </div>

             <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                   <h3 className="font-bold text-gray-800">Daftar Tagihan Escrow (Smart Contract)</h3>
                </div>
                <div className="divide-y divide-gray-100">
                   {invoices.map((inv) => (
                      <div key={inv.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                         <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-2xl shrink-0 ${inv.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-600' : inv.status === 'Terkunci' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                               <FileText size={24} />
                            </div>
                            <div>
                               <p className="font-black text-gray-800 text-lg">Rp {inv.nominal.toLocaleString('id-ID')}</p>
                               <p className="text-sm font-bold text-gray-600 mt-1">{inv.id}</p>
                               <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <Building2 size={12}/> {inv.pabrik} <ArrowRightLeft size={12} className="mx-1"/> <Sprout size={12}/> {inv.petani}
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                               inv.status === 'Tersedia' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                               inv.status === 'Terkunci' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                               'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                               Status: {inv.status}
                            </span>
                            {inv.status === 'Tersedia' && (
                               <button 
                                 onClick={() => handleCairkanDana(inv.id)}
                                 disabled={isProcessing}
                                 className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md disabled:bg-gray-400"
                               >
                                 Cairkan ke Rekening
                               </button>
                            )}
                            {inv.status === 'Terkunci' && (
                               <p className="text-[10px] text-amber-600 font-medium">Serahkan pupuk untuk mencairkan</p>
                            )}
                            {inv.status === 'Dicairkan' && (
                               <p className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Selesai</p>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* TAB 3: STOK GUDANG */}
        {activeTab === 'stok' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-black text-gray-800">Manajemen Stok Kios</h2>
               <button className="text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg transition-colors border border-amber-200">
                 Order Stok Baru
               </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mockStok.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:border-amber-300 transition-colors flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${item.bg} ${item.warna}`}>
                      <Package size={24} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${item.bg} ${item.warna} border-current/20`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{item.nama}</h3>
                  <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Tersedia</p>
                      <p className="text-2xl font-black text-gray-900 leading-none">
                        {item.stok.toLocaleString('id-ID')} <span className="text-sm text-gray-500 font-bold">{item.satuan}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner Edukasi */}
            <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-amber-400"/> Analisis Permintaan AI
                </h3>
                <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                  Berdasarkan tren jadwal tanam KUD saat ini, permintaan <strong>NPK Phonska</strong> diprediksi akan melonjak dalam 2 minggu ke depan. Disarankan untuk menambah stok minimal 1.500 Kg untuk menghindari kekurangan pasokan.
                </p>
              </div>
              <button className="w-full sm:w-auto shrink-0 bg-amber-500 hover:bg-amber-600 text-gray-900 font-black px-6 py-3 rounded-xl transition-transform hover:-translate-y-0.5 shadow-md">
                Lihat Laporan Prediksi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}