import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <h1 className="text-9xl font-extrabold text-gray-200 mb-4 tracking-tighter">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Waduh, Anda Tersesat!</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Halaman yang Anda cari mungkin sudah dihapus, diubah namanya, atau memang tidak pernah ada di server AgroCelebes.
      </p>
      <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-green-700 transition shadow-lg hover:-translate-y-1">
        <Home size={20} /> Kembali ke Beranda
      </Link>
    </div>
  );
}