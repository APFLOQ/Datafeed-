import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/geist';
import '@fontsource/geist-mono';
import App from './App';
import './index.css';
import './utils/storage.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
