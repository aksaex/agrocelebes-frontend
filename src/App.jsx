import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Import Komponen Layout Utama (Sidebar & Topbar Menetap)
import MainLayout from './components/MainLayout';

// Import Google OAuth
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import Semua Halaman
import JurnalTani from './pages/JurnalTani';
import PostProduct from './pages/PostProduct';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import EditProduct from './pages/EditProduct';
import PasarB2B from './pages/PasarB2B';
import Profile from './pages/Profile';
import AiPenyuluh from './pages/AiPenyuluh';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import KalkulatorTani from './pages/KalkulatorTani';

// =====================================================================
// 1. AXIOS INTERCEPTOR (Sistem Auto-Logout jika Sesi Habis)
// =====================================================================
axios.interceptors.response.use(
  (response) => response, 
  (error) => {
    // Jika Backend menolak karena Token di Cookie Expired / Tidak Valid (401)
    if (error.response && error.response.status === 401) {
      // PERUBAHAN: Hapus HANYA data user, karena Token sudah bukan urusan localStorage
      localStorage.removeItem('user');
      toast.error('Sesi Anda telah habis. Silakan login kembali.', { duration: 4000 });
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// =====================================================================
// 2. SATPAM PINTU UTAMA (Protected Route Component)
// =====================================================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  // PERUBAHAN: Kita tidak lagi mengecek token dari localStorage!
  // Javascript tidak bisa membaca HttpOnly Cookie, jadi kita percayakan
  // identitas user pada localStorage. Keamanan aslinya tetap dicegat oleh Backend.
  const user = JSON.parse(localStorage.getItem('user'));

  // Aturan 1: Tidak ada data user? Tendang ke Login!
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Aturan 2: Punya data, tapi mencoba masuk ke ruangan khusus (misal: Admin)?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('Akses Ditolak! Anda tidak memiliki izin ke halaman ini.');
    return <Navigate to="/dashboard" replace />; 
  }

  // Jika lolos semua aturan, silakan masuk ke halaman yang dituju
  return children;
};

// =====================================================================
// 3. ROUTER UTAMA (GoogleOAuthProvider HARUS di sini)
// =====================================================================
function App() {
  return (
    // BUNGKUS SELURUH APLIKASI DENGAN GOOGLE PROVIDER
    <GoogleOAuthProvider clientId="674337918356-fc34bqr89b96dmjavff3r2nhodgs5tqs.apps.googleusercontent.com">
      <Router>
        {/* Toaster Global untuk Notifikasi Elegan */}
        <Toaster position="top-center" reverseOrder={false} />
        
        <Routes>
          {/* === JALUR PUBLIK (Bisa diakses siapa saja) === */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* === JALUR PRIVAT DENGAN LAYOUT (Sidebar Menetap) === */}
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/pasar-b2b" element={<ProtectedRoute><MainLayout><PasarB2B /></MainLayout></ProtectedRoute>} />
          <Route path="/ai-penyuluh" element={<ProtectedRoute><MainLayout><AiPenyuluh /></MainLayout></ProtectedRoute>} />
          <Route path="/kalkulator" element={<ProtectedRoute><MainLayout><KalkulatorTani /></MainLayout></ProtectedRoute>} />
          <Route path="/jurnal" element={<ProtectedRoute><MainLayout><JurnalTani /></MainLayout></ProtectedRoute>} />

          {/* === JALUR PRIVAT TANPA LAYOUT (Halaman Penuh) === */}
          <Route path="/post-product" element={<ProtectedRoute><PostProduct /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />

          {/* === JALUR VVIP KHUSUS SUPER ADMIN === */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* === JALUR TERSESAT (404 Not Found) === */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;