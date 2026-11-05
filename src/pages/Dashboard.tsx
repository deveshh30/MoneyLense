import { useEffect, useMemo, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getExpenses, getUser, saveUser, CATEGORY_COLORS, deleteExpense } from '../data/store';
import {
  getSummaryStats, getAlerts, getInsights, getPrediction,
  getCategoryBreakdown, getSpendingPersonality, getKeyInsight,
  getConsequences, getRegret, getSuggestions,
} from '../data/analytics';
import Card from '../components/Card';
import AlertBanner from '../components/AlertBanner';
import FixThisPanel from '../components/FixThisPanel';
import { TrendingUp, Wallet, Trash2, X, ArrowRight, Settings2, Check, IndianRupee, Sparkles, PlusCircle, Brain, Zap, Clock, Target, Lightbulb, AlertTriangle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

function HealthRing({ score }: { score: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-16 h-16 rounded-full blur-xl opacity-30"
        style={{ background: color }}
      />
      <svg width="90" height="90" className="-rotate-90 relative z-10">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="45" cy="45" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)', filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center z-20">
        <span className="text-xl font-black" style={{ color }}>{score}</span>
        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wide">Score</span>
      </div>
    </div>
  );
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-xl animate-fade-in-scale">
        <p className="font-semibold text-white">{payload[0].name}</p>
        <p className="text-emerald-400">₹{payload[0].value?.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [user, setUser] = useState(() => getUser());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(user.monthlyBudget));
  const [showFixThis, setShowFixThis] = useState(false);

  useEffect(() => {
    const handleUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail as { name: string; email: string; monthlyBudget: number };
      if (detail) {
        setUser({ name: detail.name, email: detail.email, monthlyBudget: detail.monthlyBudget });
        setBudgetInput(String(detail.monthlyBudget));
      }
    };
    const handleExpensesUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      setExpenses((customEvent as any).detail);
    };
    window.addEventListener('moneylens:userUpdated', handleUserUpdate as EventListener);
    window.addEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    return () => {
      window.removeEventListener('moneylens:userUpdated', handleUserUpdate as EventListener);
      window.removeEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    setExpenses(getExpenses());
    setUser(getUser());
    setBudgetInput(String(getUser().monthlyBudget));
  }, []);

  const stats = useMemo(() => getSummaryStats(expenses, user), [expenses, user]);
  const alerts = useMemo(() => getAlerts(expenses, user), [expenses, user]);
  const insights = useMemo(() => getInsights(expenses, user), [expenses, user]);
  const prediction = useMemo(() => getPrediction(expenses, user), [expenses, user]);
  const catBreak = useMemo(() => getCategoryBreakdown(expenses), [expenses]);
  const personality = useMemo(() => getSpendingPersonality(expenses), [expenses]);
  const keyInsight = useMemo(() => getKeyInsight(expenses), [expenses]);
  const consequences = useMemo(() => getConsequences(expenses), [expenses]);
  const regret = useMemo(() => getRegret(expenses), [expenses]);
  const suggestions = useMemo(() => getSuggestions(expenses), [expenses]);
  
  const handleDelete = (id: string) => setDeleteConfirm(id);
  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteExpense(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleSaveBudget = () => {
    const val = Number(budgetInput);
    if (!isNaN(val) && val >= 1000) {
      saveUser({ ...user, monthlyBudget: val });
      setUser({ ...user, monthlyBudget: val });
      setEditBudget(false);
    }
  };

  const predColor = prediction.riskLevel === 'safe' ? 'text-emerald-400' : prediction.riskLevel === 'warning' ? 'text-yellow-400' : 'text-red-400';
  const topInsight = insights[0];
  const hasExpenses = expenses.length > 0;
  const topConsequence = consequences[0];
  const regretColor = regret.severity === 'critical' ? 'text-red-400' : regret.severity === 'high' ? 'text-orange-400' : regret.severity === 'medium' ? 'text-yellow-400' : 'text-emerald-400';
  const regretBg = regret.severity === 'critical' ? 'border-red-500/20 bg-red-500/[0.03]' : regret.severity === 'high' ? 'border-orange-500/20 bg-orange-500/[0.03]' : regret.severity === 'medium' ? 'border-yellow-500/20 bg-yellow-500/[0.03]' : 'border-emerald-500/20 bg-emerald-500/[0.03]';

  return (
    <div className="space-y-5 pb-20 md:pb-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-baseline justify-between animate-fade-in-down">
        <div>
          <h1 className="text-[26px] font-black text-white tracking-tight">
            Hi, {user.name.split(' ')[0]} <span className="inline-block animate-float">👋</span>
          </h1>
          <p className="text-gray-500 text-sm -mt-1">Your financial behavior report</p>
        </div>
        <Link
          to="/add"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-semibold text-sm text-white transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 btn-ripple"
        >
          <PlusCircle size={16} />
          Add Expense
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Critical Alerts Only */}
      {alerts.filter(a => a.level === 'critical').slice(0, 2).map((alert, i) => (
        <div key={alert.id} className={`animate-fade-in-up stagger-${i + 1}`}>
          <AlertBanner alert={alert} />
        </div>
      ))}

      {/* ─── 1. SPENDING PERSONALITY ─── */}
      {hasExpenses && (
        <Card glow={personality.type === 'Disciplined Spender' ? 'green' : personality.type === 'Impulsive Spender' ? 'red' : 'blue'} delay={1}>
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: `${personality.color}15` }}
              >
                <span className="animate-float">{personality.emoji}</span>
              </div>
              <div
                className="absolute -inset-1 rounded-2xl blur-lg opacity-20"
                style={{ background: personality.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={14} className="text-purple-400 flex-shrink-0" />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Spending Personality</p>
              </div>
              <h3 className="text-lg font-black text-white mb-1" style={{ color: personality.color }}>
                {personality.type}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">{personality.reason}</p>
              {personality.traits.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {personality.traits.map((trait, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-lg glass text-gray-400 font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ─── 2. KEY INSIGHT OF THE WEEK ─── */}
      {hasExpenses && (
        <Card glow={keyInsight.type === 'danger' ? 'red' : keyInsight.type === 'warning' ? 'yellow' : keyInsight.type === 'success' ? 'green' : 'blue'} delay={2}>
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5 animate-float" style={{ animationDuration: '3s' }}>{keyInsight.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-yellow-400 flex-shrink-0" />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Key Insight of the Week</p>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{keyInsight.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{keyInsight.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  keyInsight.type === 'danger' ? 'bg-red-500/15 text-red-300' :
                  keyInsight.type === 'warning' ? 'bg-yellow-500/15 text-yellow-300' :
                  keyInsight.type === 'success' ? 'bg-emerald-500/15 text-emerald-300' :
                  'bg-blue-500/15 text-blue-300'
                }`}>
                  {keyInsight.impact}
                </span>
                <Link to="/insights" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-auto">
                  Full analysis →
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── MAIN STATS - 3 cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spent Card */}
        <Card glow="blue" delay={3}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center animate-float" style={{ animationDuration: '4s' }}>
              <TrendingUp size={20} className="text-blue-400" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full glass text-gray-300">
              {stats.spentPct}% used
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Spent This Month</p>
          <p className="text-3xl font-black text-white leading-none animate-fade-in">
            ₹{stats.totalMonthly.toLocaleString('en-IN')}
          </p>
          <div className="mt-3 bg-gray-800/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                stats.spentPct > 85 ? 'bg-red-500' : stats.spentPct > 65 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(stats.spentPct, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Daily avg: <span className="text-gray-300 font-medium">₹{stats.dailyAvg.toLocaleString('en-IN')}</span>
          </p>
        </Card>

        {/* Remaining Card */}
        <Card glow={stats.remaining < 0 ? 'red' : 'green'} delay={4}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center animate-float ${
              stats.remaining < 0 ? 'bg-red-500/15' : 'bg-emerald-500/15'
            }`} style={{ animationDuration: '4.5s' }}>
              <Wallet size={20} className={stats.remaining < 0 ? 'text-red-400' : 'text-emerald-400'} />
            </div>
            <div className={`text-xs font-bold px-2.5 py-1 rounded-full glass ${
              stats.remaining < 0 ? 'text-red-300' : 'text-emerald-300'
            }`}>
              {stats.daysLeftInMonth}d left
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
            {stats.remaining < 0 ? 'Over Budget' : 'Remaining'}
          </p>
          <p className={`text-3xl font-black leading-none ${stats.remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            ₹{Math.abs(stats.remaining).toLocaleString('en-IN')}
          </p>
          <p className="mt-3 text-xs text-gray-500">
            Budget: <span className="text-gray-300 font-medium">₹{user.monthlyBudget.toLocaleString('en-IN')}</span>
          </p>
        </Card>

        {/* Health Score */}
        <Card className="glass border-emerald-500/20" glow="green" delay={5}>
          <div className="flex items-center gap-4">
            <HealthRing score={stats.score} />
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Financial Health</p>
              <p className="text-2xl font-black text-white leading-none mb-1">{stats.grade}</p>
              <Link
                to="/health"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View details →
              </Link>
              <div className="mt-2 flex gap-1.5">
                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  stats.score >= 70 ? 'bg-emerald-500/15 text-emerald-300' :
                  stats.score >= 45 ? 'bg-yellow-500/15 text-yellow-300' :
                  'bg-red-500/15 text-red-300'
                }`}>
                  {stats.score >= 70 ? 'HEALTHY' : stats.score >= 45 ? 'WATCH' : 'AT RISK'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── 3. NON-CRITICAL ALERTS ─── */}
      {alerts.filter(a => a.level !== 'critical').slice(0, 3).length > 0 && (
        <div className="space-y-2">
          {alerts.filter(a => a.level !== 'critical').slice(0, 3).map((alert, i) => (
            <div key={alert.id} className={`animate-fade-in-up stagger-${i + 3}`}>
              <AlertBanner alert={alert} />
            </div>
          ))}
        </div>
      )}

      {/* ─── 4. REAL-LIFE CONSEQUENCE ─── */}
      {hasExpenses && topConsequence && (
        <Card className="border-amber-500/15" glow="yellow" delay={6}>
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5 animate-float" style={{ animationDuration: '3.5s' }}>{topConsequence.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Target size={14} className="text-amber-400 flex-shrink-0" />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Real-Life Impact</p>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{topConsequence.title}</h3>
              <p className="text-sm text-amber-300/80 font-medium mb-3">{topConsequence.message}</p>
              <div className="flex flex-wrap gap-2">
                {topConsequence.equivalents.map((eq, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 glass rounded-lg text-xs">
                    <span>{eq.emoji}</span>
                    <span className="text-gray-300 font-medium">{eq.count} {eq.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── 5. FUTURE REGRET ─── */}
      {hasExpenses && (
        <Card className={regretBg} delay={7}>
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5 animate-float" style={{ animationDuration: '4s' }}>
              {regret.severity === 'critical' ? '💀' : regret.severity === 'high' ? '⏳' : regret.severity === 'medium' ? '🔮' : '✅'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className={regretColor + ' flex-shrink-0'} />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Future Regret Projection</p>
              </div>
              <p className={`text-sm font-bold mb-1 ${regretColor}`}>{regret.message}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="text-xs text-gray-400">
                  <span className="text-gray-600">Monthly:</span>{' '}
                  <span className="text-white font-bold">₹{regret.monthlyProjection.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="text-gray-600">6 months:</span>{' '}
                  <span className="text-white font-bold">₹{regret.sixMonthProjection.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="text-gray-600">Yearly:</span>{' '}
                  <span className="text-white font-bold">₹{regret.yearlyProjection.toLocaleString('en-IN')}</span>
                </div>
              </div>
              {regret.categoryBreakdown.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {regret.categoryBreakdown.slice(0, 3).map((cb, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-lg glass text-gray-400">
                      {cb.category}: ₹{cb.sixMonthWaste.toLocaleString('en-IN')} in 6mo
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ─── 6. PREDICTION BANNER ─── */}
      <Card glow={prediction.riskLevel === 'safe' ? 'green' : prediction.riskLevel === 'warning' ? 'yellow' : 'red'} delay={8}>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                prediction.riskLevel === 'safe' ? 'bg-emerald-500/15' : prediction.riskLevel === 'warning' ? 'bg-yellow-500/15' : 'bg-red-500/15'
              }`}>
                <Sparkles size={18} className={predColor} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Runway Prediction</p>
                <p className="text-[15px] text-white">
                  Money lasts <span className={`font-black text-lg ${predColor}`}>{prediction.daysLeft > 99 ? '99+' : prediction.daysLeft} days</span>
                  <span className="text-gray-600 mx-2">•</span>
                  <span className="text-gray-300">₹{prediction.avgDailySpend}/day</span>
                </p>
              </div>
            </div>
            <Link
              to="/simulate"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 glass hover:bg-white/[0.08] rounded-xl text-xs font-semibold text-gray-300 whitespace-nowrap transition-all duration-300 hover:scale-105"
            >
              Simulate →
            </Link>
          </div>
          <p className="text-xs text-gray-500 pl-[52px]">{prediction.actionable}</p>
        </div>
      </Card>

      {/* ─── 7. SUGGESTED ACTIONS ─── */}
      {hasExpenses && suggestions.length > 0 && (
        <Card delay={9}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={16} className="text-yellow-400" />
              <h3 className="font-bold text-white text-sm">Suggested Actions</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-yellow-500/15 text-yellow-300 font-bold">{suggestions.length}</span>
            </div>
            <button
              onClick={() => setShowFixThis(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg text-xs font-bold text-white hover:scale-105 transition-all btn-ripple"
            >
              <Wrench size={14} />
              Fix This
            </button>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((s, i) => (
              <div key={s.id} className={`flex items-start gap-3 p-3 rounded-xl glass border border-white/[0.04] animate-slide-in-left card-hover`} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-lg flex-shrink-0 mt-0.5">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-bold text-white">{s.title}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                      s.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-300' :
                      s.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-300' :
                      'bg-red-500/15 text-red-300'
                    }`}>
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{s.description}</p>
                  <p className="text-xs text-emerald-400 font-bold mt-1">Save {s.savings}</p>
                </div>
              </div>
            ))}
          </div>
          {suggestions.length > 3 && (
            <Link to="/insights" className="block text-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 mt-2 transition-colors">
              View all {suggestions.length} suggestions →
            </Link>
          )}
        </Card>
      )}

      {/* BUDGET EDITOR */}
      <Card className="glass border-white/[0.06]" delay={10}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <IndianRupee size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Monthly Budget</p>
              {editBudget ? (
                <div className="flex items-center gap-2 mt-1 animate-fade-in-scale">
                  <input
                    type="number"
                    value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
                    className="w-32 px-3 py-1.5 glass border border-white/[0.08] rounded-xl text-white text-sm font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    min={1000}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveBudget}
                    className="w-7 h-7 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-all hover:scale-110 btn-ripple"
                  >
                    <Check size={14} className="text-white" />
                  </button>
                  <button
                    onClick={() => { setEditBudget(false); setBudgetInput(String(user.monthlyBudget)); }}
                    className="w-7 h-7 rounded-xl glass hover:bg-white/[0.08] flex items-center justify-center transition-all"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              ) : (
                <p className="text-lg font-black text-white">
                  ₹{user.monthlyBudget.toLocaleString('en-IN')}
                  <button
                    onClick={() => { setEditBudget(true); setBudgetInput(String(user.monthlyBudget)); }}
                    className="ml-2 inline-flex items-center text-gray-600 hover:text-emerald-400 transition-all hover:scale-110"
                    title="Edit budget"
                  >
                    <Settings2 size={14} />
                  </button>
                </p>
              )}
            </div>
          </div>
          {!editBudget && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Spent: <span className="text-white font-bold">₹{stats.totalMonthly.toLocaleString('en-IN')}</span></span>
              <span className="text-gray-700">•</span>
              <span>Left: <span className={stats.remaining >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>₹{Math.abs(stats.remaining).toLocaleString('en-IN')}</span></span>
            </div>
          )}
        </div>
      </Card>

      {/* Empty State for Fresh Users */}
      {!hasExpenses && (
        <Card className="text-center py-12 animate-fade-in-scale" delay={6}>
          <div className="text-5xl mb-4 animate-float">🎉</div>
          <h3 className="text-lg font-bold text-white mb-2">Welcome to MoneyLens!</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Start tracking your expenses to uncover hidden money leaks and get personalized insights.
          </p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-105 btn-ripple"
          >
            Add Your First Expense
            <ArrowRight size={16} />
          </Link>
        </Card>
      )}

      {/* ─── MAIN CONTENT GRID ─── */}
      {hasExpenses && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left: Top Insight + Categories */}
          <div className="lg:col-span-2 space-y-5">
            {/* Top Insight Card */}
            {topInsight && (
              <Card glow={topInsight.type === 'danger' ? 'red' : topInsight.type === 'warning' ? 'yellow' : 'blue'} delay={11}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5 animate-float" style={{ animationDuration: '3s' }}>{topInsight.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={14} className="text-orange-400 flex-shrink-0" />
                      <h3 className="font-bold text-white text-sm">{topInsight.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-2">{topInsight.description}</p>
                    <Link to="/insights" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                      View all insights →
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Category Breakdown - COMPACT */}
            <Card delay={12}>
              <h3 className="font-bold text-white text-sm mb-3">Where Money Goes</h3>
              {catBreak.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={catBreak.slice(0, 4)}
                          cx="50%"
                          cy="50%"
                          innerRadius={28}
                          outerRadius={42}
                          paddingAngle={2}
                          dataKey="total"
                          animationBegin={200}
                          animationDuration={800}
                        >
                          {catBreak.slice(0, 4).map((entry) => (
                            <Cell key={entry.category} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    {catBreak.slice(0, 4).map((cat, i) => (
                      <div key={cat.category} className="flex items-center gap-2 animate-slide-in-left" style={{ animationDelay: `${i * 0.1}s` }}>
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                        <span className="text-xs text-gray-400 truncate flex-1">{cat.category}</span>
                        <span className="text-xs font-bold text-white">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No expenses yet</p>
              )}
            </Card>
          </div>

          {/* Right: Recent Transactions */}
          <div className="lg:col-span-3">
            <Card className="h-full" delay={13}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm">Recent Transactions</h3>
                <Link to="/add" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 sm:hidden transition-colors">
                  + Add
                </Link>
              </div>
              {expenses.length > 0 ? (
                <>
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 -mr-1">
                    {expenses.slice(0, 10).map((exp, i) => (
                      <div key={exp.id} className="txn-item group flex items-center gap-3 p-2.5 rounded-xl" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: `${CATEGORY_COLORS[exp.category]}15` }}
                        >
                          {{ Food: '🍔', Travel: '🚗', Shopping: '🛍️', Subscription: '📱', Others: '📦' }[exp.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-gray-200 truncate leading-tight">{exp.description}</p>
                          <p className="text-[11px] text-gray-600">
                            {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-[13px] font-bold ${
                            exp.amount > 500 ? 'text-red-400' : exp.amount > 200 ? 'text-yellow-400' : 'text-gray-300'
                          }`}>
                            ₹{exp.amount}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="w-7 h-7 rounded-xl glass hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 size={13} className="text-gray-500 group-hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {expenses.length > 10 && (
                    <p className="text-center text-[11px] text-gray-600 mt-3 pt-3 border-t border-white/[0.04]">
                      Showing 10 of {expenses.length} transactions
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2 animate-float">📝</p>
                  <p className="text-sm text-gray-500">No transactions yet</p>
                  <Link to="/add" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 mt-1 inline-block transition-colors">
                    Add your first expense →
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div
            className="glass-strong rounded-2xl p-6 max-w-sm w-full shadow-2xl modal-content border border-white/[0.08]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4 animate-pulse-glow-red">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-lg font-black text-white text-center mb-1.5">Delete Transaction?</h3>
            <p className="text-gray-500 text-center text-sm mb-5 leading-relaxed">
              This expense will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 glass hover:bg-white/[0.08] rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02]"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] btn-ripple"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fix This Panel */}
      {showFixThis && <FixThisPanel onClose={() => setShowFixThis(false)} />}
    </div>
  );
}
