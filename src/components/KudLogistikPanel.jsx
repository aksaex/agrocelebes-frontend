import React, { useState } from 'react';
import { Truck, MapPin, Calendar, Gavel, CheckCircle2, ChevronRight, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data Lelang Aktif
const mockAuctions = [
  {
    id: 'TRX-9921',
    komoditas: 'Jagung Pipil Kuning',
    tonase: 15,
    rute: { asal: 'KUD Mekar, Sulsel', tujuan: 'Pabrik Pakan Tbk, Makassar' },
    tanggal: '20 Juli 2026',
    status: 'bidding',
    bids: [
      { id: 'b1', vendor: 'Lintas Trans Mandiri', harga: 2100000, armada: 'Truk Fuso (8 Ton)', rating: 4.8 },
      { id: 'b2', vendor: 'Sinar Logistik', harga: 1950000, armada: 'Truk Tronton (15 Ton)', rating: 4.5 },
      { id: 'b3', vendor: 'Agro Express', harga: 2050000, armada: 'Truk Fuso (8 Ton)', rating: 4.9 },
    ]
  },
  {
    id: 'TRX-9922',
    komoditas: 'Gabah Kering Panen',
    tonase: 8,
    rute: { asal: 'KUD Subur, Sulsel', tujuan: 'Gudang Bulog, Parepare' },
    tanggal: '22 Juli 2026',
    status: 'bidding',
    bids: [
      { id: 'b4', vendor: 'Cepat Angkut', harga: 1200000, armada: 'Truk Colt Diesel', rating: 4.2 },
    ]
  }
];

export default function KudLogistikPanel() {
  const [auctions, setAuctions] = useState(mockAuctions);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const handleAcceptBid = (auctionId, bidId, vendorName) => {
    toast.success(`Tawaran dari ${vendorName} berhasil disetujui!`);
    
    // Update status lelang menjadi selesai
    setAuctions(prev => prev.map(auc => 
      auc.id === auctionId ? { ...auc, status: 'assigned', selectedBid: bidId } : auc
    ));
    setSelectedAuction(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 mb-2">
            <Truck size={14} /> Bursa Angkutan
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Lelang Logistik Panen</h2>
          <p className="text-sm text-gray-500 mt-1">Dapatkan penawaran harga truk terbaik dari mitra logistik terverifikasi.</p>
        </div>
        <button 
          onClick={() => toast('Fitur form lelang akan segera hadir', { icon: '🏗️' })}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 hover:shadow-lg transition-all"
        >
          <Gavel size={16} /> Buat Lelang Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        
        {/* KOLOM KIRI: DAFTAR LELANG AKTIF */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 ml-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            Lelang Berjalan ({auctions.filter(a => a.status === 'bidding').length})
          </h3>
          
          {auctions.map((auction) => (
            <div 
              key={auction.id} 
              onClick={() => auction.status === 'bidding' && setSelectedAuction(auction)}
              className={`rounded-2xl border transition-all p-5 cursor-pointer 
                ${auction.status === 'assigned' 
                  ? 'bg-gray-50 border-gray-200 opacity-70' 
                  : selectedAuction?.id === auction.id
                    ? 'bg-blue-50/50 border-blue-300 shadow-md'
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {auction.id}
                    </span>
                    {auction.status === 'assigned' && (
                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                         <CheckCircle2 size={12}/> Selesai
                       </span>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-gray-900">{auction.komoditas}</h4>
                  <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mt-1">
                    <Package size={14} /> {auction.tonase} Ton Muatan
                  </p>
                </div>
                
                {auction.status === 'bidding' && (
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">{auction.bids.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Penawaran</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1"><MapPin size={10}/> Titik Muat</p>
                  <p className="text-xs font-bold text-gray-800 truncate">{auction.rute.asal}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 shrink-0" />
                <div className="flex-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5 flex items-center gap-1"><MapPin size={10}/> Tujuan</p>
                  <p className="text-xs font-bold text-gray-800 truncate">{auction.rute.tujuan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KOLOM KANAN: DETAIL PENAWARAN (BIDS) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-1 flex flex-col h-fit sticky top-24">
          {selectedAuction ? (
            <div className="p-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Tinjau Penawaran</h3>
                  <p className="text-xs font-medium text-gray-500">{selectedAuction.id} • {selectedAuction.komoditas}</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Gavel size={20} />
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {/* Mengurutkan bids dari harga termurah */}
                {selectedAuction.bids.sort((a, b) => a.harga - b.harga).map((bid, index) => (
                  <div key={bid.id} className="border border-gray-100 rounded-2xl p-4 hover:border-blue-200 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          {bid.vendor} 
                          {index === 0 && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Termurah</span>}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-blue-500"/> Rating: {bid.rating}/5.0
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-gray-800">Rp {bid.harga.toLocaleString('id-ID')}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Tarif</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {bid.armada}
                      </span>
                      <button 
                        onClick={() => handleAcceptBid(selectedAuction.id, bid.id, bid.vendor)}
                        className="text-xs font-bold bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        Pilih Vendor <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="bg-gray-50 p-4 rounded-full mb-4 text-gray-300">
                <Truck size={48} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Pilih Lelang Aktif</h3>
              <p className="text-sm text-gray-500 max-w-[250px]">
                Klik salah satu tiket lelang di sebelah kiri untuk melihat daftar vendor logistik yang mengajukan penawaran harga.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}