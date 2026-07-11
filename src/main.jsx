import React from 'react';
import ReactDOM from 'react-dom/client';
import './storagePolyfill.js';
import TradingJournal from './TradingJournal.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TradingJournal />
  </React.StrictMode>
);
