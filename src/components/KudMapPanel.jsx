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

export default function KudMapPanel({ koordinat, namaPetani, luasHa, ndviScore, gambarSawah }) {
  // Jika petani belum punya koordinat, fallback ke titik tengah Barru, Sulawesi Selatan
  // 🕵️ DETEKTIF FRONTEND: Cek apakah props gambarSawah masuk ke sini?
  console.log("🗺️ DATA PROPS DI KUD MAPPANEL:");
  console.log("- Nama Petani:", namaPetani);
  console.log("- URL Gambar Sawah:", gambarSawah);

  const lat = koordinat?.lat || -4.4231;
  const lng = koordinat?.lng || 119.8933;

  // Buat kotak area (bounding box) visual di sekitar titik GPS petani
  const offset = 0.0002;
  const rectangleBounds = [
    [lat - offset, lng - offset],
    [lat + offset, lng + offset]
  ];

  // Gunakan URL dari GEE, jika kosong gunakan gambar dummy (fallback)
  const imageUrl = gambarSawah || 'https://dummyimage.com/400x400/10b981/ffffff&text=Menunggu+Data+GEE';

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 p-3 bg-white">
      
      {/* CONTAINER GAMBAR SATELIT GEE */}
      <div className="w-full md:w-1/2 h-72 rounded-xl overflow-hidden shadow-sm border border-emerald-100 relative bg-gray-50 flex-shrink-0 flex items-center justify-center">
         <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md z-10 tracking-wider">
           CITRA GEE (TRUE COLOR)
         </div>
         {imageUrl ? (
           <img 
             src={imageUrl} 
             alt="Citra Satelit Lahan" 
             className="w-full h-full object-cover"
             style={{ imageRendering: 'auto' }} // Mencegah pemaksaan kotak-kotak piksel kasar
           />
         ) : (
           <div className="text-center p-4">
             <span className="font-bold text-xs text-emerald-600">Menunggu Data GEE</span>
           </div>
         )}
      </div>

      {/* CONTAINER PETA LEAFLET */}
      <div className="w-full md:w-1/2 h-72 rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0">
        <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          {/* Layer Peta Dasar OpenStreetMap sebagai background/fallback */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

          {/* Kotak Area Pantau Satelit */}
          <Rectangle bounds={rectangleBounds} pathOptions={{ color: '#ef4444', weight: 3, fillOpacity: 0.1 }} />
        </MapContainer>
      </div>
    </div>
  );
}