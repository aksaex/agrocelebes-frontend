import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Import Komponen Layout Utama
import MainLayout from './components/MainLayout';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ==========================================
// IMPORT DASHBOARD & ADMIN PAGE
// ==========================================
import PetaniDashboard from './pages/petani/PetaniDashboard';
import KudDashboard from './pages/kud/KudDashboard';
import PabrikDashboard from './pages/pabrik/PabrikDashboard';
import KiosDashboard from './pages/kios/KiosDashboard';
import LogistikDashboard from './pages/logistik/LogistikDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserMenej from './pages/admin/usermenej'; 

// Import Halaman Lainnya
import JurnalTani from './pages/JurnalTani';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AiPenyuluh from './pages/AiPenyuluh';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import KalkulatorTani from './pages/KalkulatorTani';

// =====================================================================
// 1. AXIOS INTERCEPTOR (Pencegah Login Loop & Penangan Token Expired)
// =====================================================================
axios.interceptors.response.use(
  (response) => response, 
  (error) => {
    const requestUrl = error.config?.url || '';
    // Jangan lakukan redirect jika error 401 berasal dari pengecekan sesi awal
    const isAuthBootstrapCall = requestUrl.includes('/auth/me');

    if (error.response && error.response.status === 401 && !isAuthBootstrapCall && window.location.pathname !== '/login') {
      localStorage.removeItem('user');
      toast.error('Sesi Anda telah habis. Silakan login kembali.', { duration: 4000 });
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// =====================================================================
// 2. SATPAM PINTU UTAMA (Role-Based Access Control)
// =====================================================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Jika belum login, tendang ke halaman login
  if (!user) return <Navigate to="/login" replace />;

  // Jika punya role tapi tidak sesuai izin rute, tendang ke dashboard bawaannya
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('Akses Ditolak! Anda tidak memiliki izin ke halaman ini.');
    return <Navigate to="/dashboard" replace />; 
  }

  return children;
};

// =====================================================================
// 3. POLISI LALU LINTAS DASHBOARD (Dinamic Redirect)
// =====================================================================
const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'petani') return <Navigate to="/petani/dashboard" replace />;
  if (user.role === 'kud') return <Navigate to="/kud/dashboard" replace />;
  if (user.role === 'pabrik') return <Navigate to="/pabrik/dashboard" replace />;
  if (user.role === 'kios') return <Navigate to="/kios/dashboard" replace />;
  if (user.role === 'logistik') return <Navigate to="/logistik/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

// =====================================================================
// 4. ROUTER UTAMA
// =====================================================================
function App() {
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Mengecek apakah ada cookie/sesi aktif di server saat web baru dibuka
    const bootstrapSession = async () => {
      const bootstrapClient = axios.create({ withCredentials: true });

      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setSessionReady(true);
          return;
        }

        const response = await bootstrapClient.get(`${import.meta.env.VITE_API_URL}/auth/me`);

        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        localStorage.removeItem('user');
      } finally {
        setSessionReady(true);
      }
    };

    bootstrapSession();
  }, []);

  // Jangan render apapun sebelum pengecekan sesi selesai (mencegah kedipan UI)
  if (!sessionReady) return null;

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "674337918356-fc34bqr89b96dmjavff3r2nhodgs5tqs.apps.googleusercontent.com"}>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* === JALUR PUBLIK === */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Otomatis ter-redirect sesuai Role */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* === JALUR PRIVAT DASHBOARD (SPESIFIK ROLE) === */}
          <Route path="/petani/dashboard" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><PetaniDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/kud/dashboard" element={<ProtectedRoute allowedRoles={['kud']}><MainLayout><KudDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/pabrik/dashboard" element={<ProtectedRoute allowedRoles={['pabrik']}><MainLayout><PabrikDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/kios/dashboard" element={<ProtectedRoute allowedRoles={['kios']}><MainLayout><KiosDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/logistik/dashboard" element={<ProtectedRoute allowedRoles={['logistik']}><MainLayout><LogistikDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* === JALUR KHUSUS ADMIN === */}
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><UserMenej /></MainLayout></ProtectedRoute>} />

          {/* === JALUR PRIVAT GLOBAL (FITUR PETANI DLL) === */}
          <Route path="/ai-penyuluh" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><AiPenyuluh /></MainLayout></ProtectedRoute>} />
          <Route path="/kalkulator" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><KalkulatorTani /></MainLayout></ProtectedRoute>} />
          <Route path="/jurnal" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><JurnalTani /></MainLayout></ProtectedRoute>} />
          
          {/* Akses Profil untuk semua Role yang login */}
          <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
          
          {/* Jalur 404 jika URL tidak ditemukan */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;