import { useState } from 'react';
import { login, register, getAccounts } from '../data/store';

type Mode = 'login' | 'register';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('alex@university.edu');
  const [loginPassword, setLoginPassword] = useState('demo123');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBudget, setRegBudget] = useState('8000');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoLogin = () => {
    setLoginEmail('alex@university.edu');
    setLoginPassword('demo123');
    setError('');
    setSuccessMsg('Demo credentials loaded! Click Sign In');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = login(loginEmail, loginPassword);
    setLoading(false);
    if (result.success) {
      setSuccessMsg(`Welcome back, ${result.account?.name}!`);
      setTimeout(() => onAuthSuccess(), 400);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const budget = parseInt(regBudget, 10);
    const result = register(regName, regEmail, regPassword, budget);
    setLoading(false);
    if (result.success) {
      setSuccessMsg(`Account created! Welcome, ${regName}!`);
      setTimeout(() => onAuthSuccess(), 400);
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const accounts = getAccounts();
  const hasDemoAccount = accounts.some(a => a.email === 'alex@university.edu');

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-gray-950 to-emerald-950/30" />
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-900/50 mb-4 animate-float">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Money<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Lens</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Hidden Money Leak Detector for Students</p>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-6 shadow-2xl shadow-black/20 border border-white/[0.08] animate-fade-in-scale">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 p-1.5 glass-subtle rounded-2xl">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-2 animate-fade-in-scale">
              <span className="text-base leading-none mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-2 animate-success-pop">
              <span className="text-base leading-none mt-0.5">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Demo Banner */}
              {hasDemoAccount && (
                <div className="p-3 rounded-xl glass-subtle border-amber-500/10 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <span className="text-amber-400 text-lg animate-float">💡</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-amber-300 mb-1">Try Demo Account</div>
                      <div className="text-[11px] text-gray-500 mb-2 font-mono">
                        alex@university.edu / demo123
                      </div>
                      <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-medium transition-all duration-300 hover:scale-105"
                      >
                        Fill Demo Credentials →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="animate-fade-in-up stagger-1">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>

              <div className="animate-fade-in-up stagger-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] btn-ripple animate-fade-in-up stagger-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In →'
                )}
              </button>

              <p className="text-center text-xs text-gray-600 pt-2">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="animate-fade-in-up stagger-1">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300"
                  placeholder="Rahul Sharma"
                />
              </div>

              <div className="animate-fade-in-up stagger-2">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300"
                  placeholder="you@university.edu"
                />
              </div>

              <div className="animate-fade-in-up stagger-3">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl glass border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300"
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="animate-fade-in-up stagger-4">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1">Monthly Budget (₹)</label>
                <input
                  type="number"
                  value={regBudget}
                  onChange={e => setRegBudget(e.target.value)}
                  required
                  min={1000}
                  className="w-full px-4 py-3 rounded-xl glass border border-white/[0.06] text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300"
                  placeholder="8000"
                />
                <div className="flex gap-2 mt-2">
                  {[5000, 8000, 12000, 15000].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setRegBudget(String(b))}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-300 ${
                        regBudget === String(b)
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'glass border-white/[0.06] text-gray-500 hover:text-white hover:border-white/[0.12]'
                      }`}
                    >
                      ₹{b >= 1000 ? `${b / 1000}k` : b}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] btn-ripple animate-fade-in-up stagger-5"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account →'
                )}
              </button>

              <p className="text-center text-xs text-gray-600 pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-700 mt-6">
          Your data stays on your device. No cloud, no tracking.
        </p>
      </div>
    </div>
  );
}
