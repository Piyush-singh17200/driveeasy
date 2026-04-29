import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const Cars = lazy(() => import('./pages/Cars'));
const CarDetail = lazy(() => import('./pages/CarDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Bookings = lazy(() => import('./pages/Bookings'));
const BookingDetail = lazy(() => import('./pages/BookingDetail'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const { getMe } = useAuthStore();
  useSocket();

  useEffect(() => {
    getMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a35', color: '#fff', border: '1px solid #e94560' },
          duration: 4000,
        }}
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cars" element={<Cars />} />
            <Route path="cars/:id" element={<CarDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="bookings" element={
              <ProtectedRoute><Bookings /></ProtectedRoute>
            } />
            <Route path="bookings/:id" element={
              <ProtectedRoute><BookingDetail /></ProtectedRoute>
            } />
            <Route path="owner" element={
              <ProtectedRoute roles={['owner', 'admin']}><OwnerDashboard /></ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;