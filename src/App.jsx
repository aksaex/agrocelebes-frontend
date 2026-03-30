import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Import Komponen Layout Utama (Sidebar & Topbar Menetap)
import MainLayout from './components/MainLayout';

// Import Semua Halaman
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

// =====================================================================
// 1. AXIOS INTERCEPTOR (Sistem Auto-Logout jika Sesi Habis)
// =====================================================================
axios.interceptors.response.use(
  (response) => response, 
  (error) => {
    // Jika Backend menolak karena Token Expired / Tidak Valid (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
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
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // Aturan 1: Tidak punya tiket (Token)? Tendang ke Login!
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Aturan 2: Punya tiket, tapi mencoba masuk ke ruangan khusus (misal: Admin)?
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('Akses Ditolak! Anda tidak memiliki izin ke halaman ini.');
    return <Navigate to="/dashboard" replace />; 
  }

  // Jika lolos semua aturan, silakan masuk ke halaman yang dituju
  return children;
};

// =====================================================================
// 3. ROUTER UTAMA
// =====================================================================
function App() {
  return (
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
        
        {/* === JALUR PRIVAT TANPA LAYOUT (Halaman Penuh) === */}
        {/* Halaman ini tidak pakai Sidebar karena butuh fokus penuh */}
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
  );
}

export default App;