import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './pages/Dashboard';
import './index.css';
import './utils/storage.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
);
