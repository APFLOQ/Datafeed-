import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './utils/storage.js';
import TradingJournal from './TradingJournal.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TradingJournal />
  </React.StrictMode>
);
