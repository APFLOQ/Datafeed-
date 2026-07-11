export default function Footer() {
  return (
    <footer className="border-t border-glass-border py-8 px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-brand text-xl text-text" style={{ fontFamily: 'Fustat, sans-serif' }}>
          Datafeed
        </span>
        <p className="text-text-faint text-sm">&copy; 2026 Datafeed. All rights reserved.</p>
        <div className="flex gap-6 text-text-dim text-sm">
          <a href="#" className="hover:text-text transition-colors">Privacy</a>
          <a href="#" className="hover:text-text transition-colors">Terms</a>
          <a href="https://discord.gg/datafeed" className="hover:text-text transition-colors">Discord</a>
        </div>
      </div>
    </footer>
  );
}
