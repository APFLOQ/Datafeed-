export default function TopBar({ dateRange, onDateRangeChange }) {
  return (
    <div className="glass-topbar">
      <div className="flex items-center gap-4">
        <span className="glass-topbar-logo">Datafeed</span>
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="glass-select"
        >
          <option value="1m">1 Month</option>
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="1y">1 Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
    </div>
  );
}
