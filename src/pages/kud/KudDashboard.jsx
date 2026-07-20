import KudLogistikPanel from '../../components/KudLogistikPanel';
import React, { useState } from 'react';
import RoleContractDashboard from '../../components/RoleContractDashboard';
import KudSatellitePanel from '../../components/KudSatellitePanel';
import { Map, FileText, Truck, ShieldCheck } from 'lucide-react';

export default function KudDashboard() {
  const [activeTab, setActiveTab] = useState('pemantauan');

  return (
    <div className="flex flex-col font-sans animate-fade-in pb-10 min-h-screen w-full bg-gray-50/50">
      
      {/* HEADER STICKY */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 text-emerald-700 mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
               <h1 className="font-black text-xl md:text-2xl leading-tight text-gray-800">
                 Dashboard Koperasi (KUD)
               </h1>
               <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">
                 Pusat Kendali Manajemen Lahan & Kontrak
               </p>
            </div>
          </div>

          {/* TAB NAVIGASI */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl w-full sm:max-w-xl overflow-hidden">
            <button 
              onClick={() => setActiveTab('pemantauan')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all truncate px-2 ${activeTab === 'pemantauan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Map size={16} /> <span className="truncate">Pemantauan Satelit</span>
            </button>
            <button 
              onClick={() => setActiveTab('kontrak')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all truncate px-2 ${activeTab === 'kontrak' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText size={16} /> <span className="truncate">Smart Contract</span>
            </button>
            <button 
              onClick={() => setActiveTab('logistik')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all truncate px-2 ${activeTab === 'logistik' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Truck size={16} /> <span className="truncate">Logistik</span>
            </button>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1">
        {activeTab === 'pemantauan' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">Pemantauan Lahan Satelit</h2>
              <p className="text-sm text-gray-500">Awasi progres panen dan kesehatan lahan anggota KUD.</p>
            </div>
            <KudSatellitePanel />
          </div>
        )}

        {activeTab === 'kontrak' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800">Manajemen Kontrak Pabrik</h2>
              <p className="text-sm text-gray-500">Kelola kuota, invoice, dan pencairan dana *smart contract*.</p>
            </div>
            <RoleContractDashboard role="kud" />
          </div>
        )}

        {activeTab === 'logistik' && (
  <div className="animate-fade-in">
    <KudLogistikPanel />
  </div>
)}
      </div>

    </div>
  );
}