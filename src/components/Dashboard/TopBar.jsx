import { useState, useEffect } from 'react';
import { Bluetooth, Wifi, Battery, Search } from 'lucide-react';

function pad(n) { return String(n).padStart(2, '0'); }

export default function TopBar({ dateRange, onDateRangeChange }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${d.getHours()}:${pad(d.getMinutes())}`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mac-menubar">
      <div className="mac-menubar-left">
        <span className="mac-menubar-apple">Datafeed</span>
        <button className="mac-menubar-item">File</button>
        <button className="mac-menubar-item">Edit</button>
        <button className="mac-menubar-item">View</button>
        <button className="mac-menubar-item">Window</button>
        <button className="mac-menubar-item">Help</button>
      </div>

      <div className="mac-menubar-right">
        <div className="mac-menubar-status" title="Connected" />
        <Wifi size={14} className="text-text-faint" />
        <Battery size={14} className="text-text-faint" />
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="mac-select"
        >
          <option value="1m">1 Month</option>
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="1y">1 Year</option>
          <option value="all">All Time</option>
        </select>
        <span className="mac-menubar-time">{time}</span>
      </div>
    </div>
  );
}
