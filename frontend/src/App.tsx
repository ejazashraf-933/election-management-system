import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Elections from './pages/admin/Elections';
import ElectionPhases from './pages/admin/ElectionPhases';
import Nominations from './pages/admin/Nominations';
import Parties from './pages/admin/Parties';
import Constituencies from './pages/admin/Constituencies';
import PollingStations from './pages/admin/PollingStations';
import Form45Page from './pages/admin/Form45';
import ReservedSeats from './pages/admin/ReservedSeats';
import Candidates from './pages/admin/Candidates';
import Users from './pages/admin/Users';

// Voter pages
import Vote from './pages/voter/Vote';
import History from './pages/voter/History';
import VoterCandidates from './pages/voter/Candidates';
import RegisterCandidate from './pages/voter/RegisterCandidate';
import MyNomination from './pages/voter/MyNomination';

import Results from './pages/results/Results';

const authRoutes = ['/login', '/register'];

const ADMIN_ROLES = [
  'admin', 'superadmin', 'chief_election_commissioner',
  'district_returning_officer', 'returning_officer',
];
const OFFICER_ROLES = [...ADMIN_ROLES, 'presiding_officer'];
const ALL_AUTH_ROLES = [...OFFICER_ROLES, 'voter', 'candidate', 'polling_agent', 'observer'];

function Layout() {
  const location = useLocation();
  const isAuth = authRoutes.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isAuth && <Navbar />}
      <main style={{ flex: 1, background: '#f1f5f9' }}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard (admin/officers) */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={ADMIN_ROLES}><Dashboard /></ProtectedRoute>
          } />

          {/* Admin management */}
          <Route path="/admin/elections" element={
            <ProtectedRoute roles={ADMIN_ROLES}><Elections /></ProtectedRoute>
          } />
          <Route path="/admin/phases" element={
            <ProtectedRoute roles={ADMIN_ROLES}><ElectionPhases /></ProtectedRoute>
          } />
          <Route path="/admin/nominations" element={
            <ProtectedRoute roles={ADMIN_ROLES}><Nominations /></ProtectedRoute>
          } />
          <Route path="/admin/parties" element={
            <ProtectedRoute roles={ADMIN_ROLES}><Parties /></ProtectedRoute>
          } />
          <Route path="/admin/constituencies" element={
            <ProtectedRoute roles={ADMIN_ROLES}><Constituencies /></ProtectedRoute>
          } />
          <Route path="/admin/polling-stations" element={
            <ProtectedRoute roles={OFFICER_ROLES}><PollingStations /></ProtectedRoute>
          } />
          <Route path="/admin/form45" element={
            <ProtectedRoute roles={OFFICER_ROLES}><Form45Page /></ProtectedRoute>
          } />
          <Route path="/admin/reserved-seats" element={
            <ProtectedRoute roles={ADMIN_ROLES}><ReservedSeats /></ProtectedRoute>
          } />
          <Route path="/admin/candidates" element={
            <ProtectedRoute roles={ADMIN_ROLES}><Candidates /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={ADMIN_ROLES}><Users /></ProtectedRoute>
          } />

          {/* Voter pages */}
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
          <Route path="/my-nomination" element={
            <ProtectedRoute roles={['voter', 'candidate']}><MyNomination /></ProtectedRoute>
          } />

          {/* Results — visible to all authenticated users */}
          <Route path="/results" element={
            <ProtectedRoute roles={ALL_AUTH_ROLES}><Results /></ProtectedRoute>
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
