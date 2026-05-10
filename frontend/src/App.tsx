import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Elections from './pages/admin/Elections';
import Parties from './pages/admin/Parties';
import Constituencies from './pages/admin/Constituencies';
import Candidates from './pages/admin/Candidates';
import Users from './pages/admin/Users';
import Vote from './pages/voter/Vote';
import History from './pages/voter/History';
import VoterCandidates from './pages/voter/Candidates';
import RegisterCandidate from './pages/voter/RegisterCandidate';
import Results from './pages/results/Results';

const authRoutes = ['/login', '/register'];

function Layout() {
  const location = useLocation();
  const isAuth = authRoutes.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAuth && <Navbar />}
      <main style={{ flex: 1, background: '#f1f5f9' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin/elections" element={
            <ProtectedRoute roles={['admin', 'superadmin']}><Elections /></ProtectedRoute>
          } />
          <Route path="/admin/parties" element={
            <ProtectedRoute roles={['admin', 'superadmin']}><Parties /></ProtectedRoute>
          } />
          <Route path="/admin/constituencies" element={
            <ProtectedRoute roles={['admin', 'superadmin']}><Constituencies /></ProtectedRoute>
          } />
          <Route path="/admin/candidates" element={
            <ProtectedRoute roles={['admin', 'superadmin']}><Candidates /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin', 'superadmin']}><Users /></ProtectedRoute>
          } />

          <Route path="/vote" element={
            <ProtectedRoute roles={['voter', 'candidate']}><Vote /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute roles={['voter', 'candidate']}><History /></ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute roles={['voter', 'candidate']}><VoterCandidates /></ProtectedRoute>
          } />
          <Route path="/register-candidate" element={
            <ProtectedRoute roles={['voter']}><RegisterCandidate /></ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute><Results /></ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
