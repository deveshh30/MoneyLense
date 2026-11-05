import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Lightbulb, TrendingUp, Gamepad2, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentAccount } from '../data/store';

const nav = [
  { path: '/',          label: 'Dashboard',  Icon: LayoutDashboard },
  { path: '/add',       label: 'Add Expense', Icon: PlusCircle },
  { path: '/insights',  label: 'Insights',   Icon: Lightbulb },
  { path: '/simulate',  label: 'Simulator',  Icon: TrendingUp },
  { path: '/game',      label: 'Health',     Icon: Gamepad2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [account, setAccount] = useState(getCurrentAccount());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateAccount = () => setAccount(getCurrentAccount());
    window.addEventListener('moneylens:userUpdated', updateAccount);
    window.addEventListener('moneylens:authChanged', updateAccount);
    return () => {
      window.removeEventListener('moneylens:userUpdated', updateAccount);
      window.removeEventListener('moneylens:authChanged', updateAccount);
    };
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleLogout = () => {
    if (confirm('Sign out of MoneyLens?')) {
      (window as any).__moneylens_logout?.();
    }
  };

  return (
    <div className="min-h-screen text-white flex flex-col relative">
      {/* Animated Background Orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Top Nav */}
      <header className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-strong shadow-lg shadow-black/20'
          : 'bg-gray-950/80 backdrop-blur-xl'
      } border-b border-white/[0.06]`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-lg shadow-lg shadow-emerald-900/40 group-hover:shadow-emerald-900/60 transition-all duration-300 group-hover:scale-105">
              🔍
            </div>
            <div>
              <span className="font-bold text-white text-lg leading-none tracking-tight">MoneyLens</span>
              <span className="block text-[10px] text-gray-500 leading-none mt-0.5 group-hover:text-gray-400 transition-colors">Leak Detector</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ path, label, Icon }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'text-emerald-400'
                      : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-emerald-500/10 rounded-xl animate-fade-in" />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
            {/* User menu */}
            {account && (
              <div className="ml-3 pl-3 border-l border-white/[0.06] flex items-center gap-2">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-medium text-white leading-none">{account.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-500 leading-none mt-0.5">₹{account.monthlyBudget.toLocaleString('en-IN')}/mo</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-red-500/15 text-gray-500 hover:text-red-400 flex items-center justify-center transition-all duration-300 group"
                  title="Sign out"
                >
                  <LogOut size={14} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden glass-strong border-t border-white/[0.06] px-4 py-3 flex flex-col gap-1 animate-fade-in-down">
            {account && (
              <div className="px-3 py-2.5 mb-2 flex items-center justify-between glass-subtle rounded-xl">
                <div>
                  <div className="text-sm font-medium text-white">{account.name}</div>
                  <div className="text-xs text-gray-500">{account.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
            {nav.map(({ path, label, Icon }) => {
              const active = pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 relative z-10 page-enter">
        {children}
      </main>

      {/* Bottom mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-white/[0.06] flex z-40 pb-safe">
        {nav.slice(0, 4).map(({ path, label, Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-300 relative ${
                active ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-400 rounded-full animate-fade-in" />
              )}
              <Icon size={18} className={active ? 'animate-float' : ''} />
              <span className="leading-none">{label.split(' ')[0]}</span>
            </Link>
          );
        })}
        {/* Profile/Logout button in bottom nav */}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-gray-600 hover:text-red-400 transition-all duration-300"
        >
          <LogOut size={18} />
          <span className="leading-none">Logout</span>
        </button>
      </nav>
    </div>
  );
}
