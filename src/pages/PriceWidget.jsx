import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PriceWidget() {
  const dummyPrices = [
    { id: 1, nama: 'Kakao (Kering)', harga: 125000, trend: 'up', persen: '+2.5%' },
    { id: 2, nama: 'Kopi Arabika', harga: 95000, trend: 'up', persen: '+1.2%' },
    { id: 3, nama: 'Cengkeh', harga: 110000, trend: 'down', persen: '-0.8%' },
    { id: 4, nama: 'Kopra', harga: 10500, trend: 'flat', persen: '0.0%' },
  ];

  const getTrendStyle = (trend) => {
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-500 bg-gray-50';
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Harga Komoditas</h3>
      <div className="space-y-3">
        {dummyPrices.map((item) => (
          <div key={item.id} className="flex items-center justify-between group">
            <div>
              <p className="text-sm font-semibold text-gray-700">{item.nama}</p>
              <p className="text-xs text-gray-400">Rp {item.harga.toLocaleString('id-ID')}/kg</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${getTrendStyle(item.trend)}`}>
              {item.trend === 'up' && <TrendingUp size={12} />}
              {item.trend === 'down' && <TrendingDown size={12} />}
              {item.persen}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}