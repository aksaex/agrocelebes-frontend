import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Perbaikan ikon default Leaflet yang sering hilang di React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function KudMapPanel({ koordinat, namaPetani, luasHa, ndviScore }) {
  // Jika petani belum punya koordinat, fallback ke titik tengah Barru, Sulawesi Selatan
  const lat = koordinat?.lat || -4.4231;
  const lng = koordinat?.lng || 119.8933;

  // Buat kotak area (bounding box) visual di sekitar titik GPS petani
  // Diubah menjadi 0.0005 agar kotak di peta sangat spesifik dan sinkron dengan backend
  const offset = 0.0002;
  const rectangleBounds = [
    [lat - offset, lng - offset],
    [lat + offset, lng + offset]
    
  ];

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden shadow-md border border-gray-200 z-0">
      <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        {/* Layer Peta Dasar OpenStreetMap sebagai background/fallback */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🌟 LAYER CITRA SATELIT SENTINEL HUB (Visual Warna Asli) */}
        <WMSTileLayer
          url="https://services.sentinel-hub.com/ogc/wms/60de79ca-16a7-4afd-bcbd-0261bf0156fa"
          layers="1-TRUE-COLOR" // 👈 UBAH BAGIAN INI SESUAI LAYER ID DI DASBOR ANDA
          maxZoom={18}
          format="image/png" // Ubah ke png agar lebih stabil saat ditumpuk di atas OSM
          transparent={true} // Wajib true agar Leaflet bisa menumpuknya dengan baik
          attribution='&copy; <a href="https://www.sentinel-hub.com">Sentinel Hub Planet</a>'
        />
        
        {/* Titik Lokasi Petani */}
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold">{namaPetani || 'Lahan Petani'}</p>
              <p>Luas: {luasHa} Ha</p>
              <p className="text-emerald-600 font-semibold">Skor NDVI: {ndviScore || 'Belum dipindai'}</p>
            </div>
          </Popup>
        </Marker>

        {/* Kotak Area Pantau Satelit (Diubah menjadi outline merah terang agar terlihat di atas satelit hijau) */}
        <Rectangle bounds={rectangleBounds} pathOptions={{ color: '#ef4444', weight: 3, fillOpacity: 0.1 }} />
      </MapContainer>
    </div>
  );
}