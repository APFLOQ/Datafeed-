import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import './index.css';
import './utils/storage.js';

function App() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="glass rounded-[20px] p-8 text-center">
          <p className="text-text-dim">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) return <Dashboard />;

  return (
    <>
      <Landing onSignUp={() => setShowAuth(true)} />
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
