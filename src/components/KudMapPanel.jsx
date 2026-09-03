import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
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
  const offset = 0.004;
  const rectangleBounds = [
    [lat - offset, lng - offset],
    [lat + offset, lng + offset]
  ];

  return (
    <div className="w-full h-72 rounded-2xl overflow-hidden shadow-md border border-gray-200 z-0">
      <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        {/* Layer Peta Satelit OpenStreetMap / Esri */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

        {/* Kotak Area Pantau Satelit Sentinel-2 */}
        <Rectangle bounds={rectangleBounds} pathOptions={{ color: 'green', weight: 2, fillOpacity: 0.2 }} />
      </MapContainer>
    </div>
  );
}