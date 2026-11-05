import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Insights from './pages/Insights';
import Simulator from './pages/Simulator';
import GameHealth from './pages/GameHealth';
import Auth from './pages/Auth';
import { isAuthenticated, logout } from './data/store';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(isAuthenticated());
  
  useEffect(() => {
    const checkAuth = () => setAuthed(isAuthenticated());
    // Listen for storage changes (logout from other tab)
    window.addEventListener('storage', checkAuth);
    // Custom event for same-tab auth changes
    window.addEventListener('moneylens:authChanged', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('moneylens:authChanged', checkAuth);
    };
  }, []);
  
  if (!authed) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  
  const handleAuthSuccess = () => {
    setAuthed(true);
    window.dispatchEvent(new Event('moneylens:authChanged'));
  };
  
  const handleLogout = () => {
    logout();
    setAuthed(false);
    window.dispatchEvent(new Event('moneylens:authChanged'));
  };
  
  // Expose logout globally for Layout to use
  (window as any).__moneylens_logout = handleLogout;
  
  if (!authed) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
  
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute><AddExpense /></ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute><Insights /></ProtectedRoute>
          } />
          <Route path="/simulate" element={
            <ProtectedRoute><Simulator /></ProtectedRoute>
          } />
          <Route path="/game" element={
            <ProtectedRoute><GameHealth /></ProtectedRoute>
          } />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
