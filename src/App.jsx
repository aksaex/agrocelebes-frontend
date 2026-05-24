import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Import Komponen Layout Utama
import MainLayout from './components/MainLayout';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ==========================================
// IMPORT DASHBOARD & ADMIN PAGE
// ==========================================
import PetaniDashboard from './pages/petani/PetaniDashboard';
import PembeliDashboard from './pages/pembeli/PembeliDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserMenej from './pages/admin/UserMenej'; // <-- IMPORT HALAMAN MANAJEMEN USER

// Import Halaman Lainnya
import JurnalTani from './pages/JurnalTani';
import PostProduct from './pages/PostProduct';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import EditProduct from './pages/EditProduct';
import PasarB2B from './pages/PasarB2B';
import Profile from './pages/Profile';
import AiPenyuluh from './pages/AiPenyuluh';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import KalkulatorTani from './pages/KalkulatorTani';

// =====================================================================
// 1. AXIOS INTERCEPTOR
// =====================================================================
axios.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      toast.error('Sesi Anda telah habis. Silakan login kembali.', { duration: 4000 });
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// =====================================================================
// 2. SATPAM PINTU UTAMA
// =====================================================================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error('Akses Ditolak! Anda tidak memiliki izin ke halaman ini.');
    return <Navigate to="/dashboard" replace />; 
  }

  return children;
};

// =====================================================================
// 3. POLISI LALU LINTAS DASHBOARD
// =====================================================================
const DashboardRouter = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'petani') return <Navigate to="/petani/dashboard" replace />;
  if (user.role === 'pembeli') return <Navigate to="/pembeli/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

// =====================================================================
// 4. ROUTER UTAMA
// =====================================================================
function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "674337918356-fc34bqr89b96dmjavff3r2nhodgs5tqs.apps.googleusercontent.com"}>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* === JALUR PRIVAT DASHBOARD === */}
          <Route path="/petani/dashboard" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><PetaniDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/pembeli/dashboard" element={<ProtectedRoute allowedRoles={['pembeli']}><MainLayout><PembeliDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* === JALUR KHUSUS ADMIN === */}
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><UserMenej /></MainLayout></ProtectedRoute>} />

          {/* === JALUR PRIVAT GLOBAL === */}
          <Route path="/pasar-b2b" element={<ProtectedRoute><MainLayout><PasarB2B /></MainLayout></ProtectedRoute>} />
          
          <Route path="/ai-penyuluh" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><AiPenyuluh /></MainLayout></ProtectedRoute>} />
          <Route path="/kalkulator" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><KalkulatorTani /></MainLayout></ProtectedRoute>} />
          <Route path="/jurnal" element={<ProtectedRoute allowedRoles={['petani']}><MainLayout><JurnalTani /></MainLayout></ProtectedRoute>} />

          <Route path="/post-product" element={<ProtectedRoute allowedRoles={['petani']}><PostProduct /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          
          <Route path="/edit-product/:id" element={<ProtectedRoute allowedRoles={['petani', 'admin']}><EditProduct /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;