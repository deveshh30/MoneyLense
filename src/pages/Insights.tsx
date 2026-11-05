import { useEffect, useMemo, useState } from 'react';
import { getExpenses, getUser, type User } from '../data/store';
import {
  getInsights, getAlerts, getCategoryBreakdown, getDailySpend,
  getSpendingPersonality, getSuggestions, getConsequences, getRegret,
} from '../data/analytics';
import InsightCardComponent from '../components/InsightCardComponent';
import AlertBanner from '../components/AlertBanner';
import Card from '../components/Card';
import FixThisPanel from '../components/FixThisPanel';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Brain, AlertTriangle, TrendingDown, Activity, Lightbulb, Target, Clock, Zap, ArrowRight, Wrench } from 'lucide-react';
import { parseISO, getHours } from 'date-fns';
import { Link } from 'react-router-dom';

const AreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong rounded-xl px-3 py-2 text-sm shadow-xl animate-fade-in-scale">
        <p className="font-semibold text-white">{label}</p>
        <p className="text-purple-400">₹{payload[0].value?.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function Insights() {
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [user, setUser] = useState(() => getUser());
  const [showFixThis, setShowFixThis] = useState(false);

  useEffect(() => {
    const handleUserUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as User;
      if (detail) setUser(detail);
    };
    const handleExpensesUpdate = (e: Event) => {
      setExpenses((e as CustomEvent).detail);
    };
    window.addEventListener('moneylens:userUpdated', handleUserUpdate as EventListener);
    window.addEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    return () => {
      window.removeEventListener('moneylens:userUpdated', handleUserUpdate as EventListener);
      window.removeEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    };
  }, []);

  const insights = useMemo(() => getInsights(expenses, user), [expenses, user]);
  const alerts = useMemo(() => getAlerts(expenses, user), [expenses, user]);
  const catBreak = useMemo(() => getCategoryBreakdown(expenses), [expenses]);
  const dailySpend = useMemo(() => getDailySpend(expenses, 14), [expenses]);
  const personality = useMemo(() => getSpendingPersonality(expenses), [expenses]);
  const suggestions = useMemo(() => getSuggestions(expenses), [expenses]);
  const consequences = useMemo(() => getConsequences(expenses), [expenses]);
  const regret = useMemo(() => getRegret(expenses), [expenses]);

  const hourlyData = useMemo(() => {
    const slots = [
      { label: 'Morning\n6–11AM', hours: [6,7,8,9,10], amount: 0 },
      { label: 'Afternoon\n12–4PM', hours: [12,13,14,15,16], amount: 0 },
      { label: 'Evening\n5–9PM', hours: [17,18,19,20,21], amount: 0 },
      { label: 'Night\n10PM–2AM', hours: [22,23,0,1,2], amount: 0 },
    ];
    for (const e of expenses) {
      const h = getHours(parseISO(e.date));
      for (const slot of slots) {
        if (slot.hours.includes(h)) { slot.amount += e.amount; break; }
      }
    }
    return slots;
  }, [expenses]);

  const radarData = useMemo(() => catBreak.map(c => ({
    category: c.category,
    value: c.percentage,
    fullMark: 100,
  })), [catBreak]);

  const dangerInsights = insights.filter(i => i.type === 'danger');
  const warningInsights = insights.filter(i => i.type === 'warning');
  const goodInsights = insights.filter(i => i.type === 'success');

  const hasExpenses = expenses.length > 0;

  const regretColor = regret.severity === 'critical' ? 'text-red-400' : regret.severity === 'high' ? 'text-orange-400' : regret.severity === 'medium' ? 'text-yellow-400' : 'text-emerald-400';
  const regretBg = regret.severity === 'critical' ? 'border-red-500/20 bg-red-500/[0.03]' : regret.severity === 'high' ? 'border-orange-500/20 bg-orange-500/[0.03]' : regret.severity === 'medium' ? 'border-yellow-500/20 bg-yellow-500/[0.03]' : 'border-emerald-500/20 bg-emerald-500/[0.03]';

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
            <Brain className="text-purple-400 animate-float" size={24} />
            Spending Intelligence
          </h1>
          <p className="text-gray-500 text-sm mt-1">Behavioral analysis of your money habits</p>
        </div>
        {hasExpenses && (
          <button
            onClick={() => setShowFixThis(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-xs font-bold text-white hover:scale-105 transition-all btn-ripple"
          >
            <Wrench size={14} />
            Fix This
          </button>
        )}
      </div>

      {!hasExpenses ? (
        <Card className="text-center py-12 animate-fade-in-scale">
          <div className="text-5xl mb-4 animate-float">🧠</div>
          <h3 className="text-lg font-bold text-white mb-2">No Data to Analyze Yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Add some expenses first and MoneyLens will detect your spending patterns, leaks, and habits.
          </p>
          <Link to="/add" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-semibold text-white hover:scale-105 transition-all">
            Add Expenses <ArrowRight size={14} />
          </Link>
        </Card>
      ) : (
        <>
          {/* ─── SPENDING PERSONALITY ─── */}
          <Card glow={personality.type === 'Disciplined Spender' ? 'green' : personality.type === 'Impulsive Spender' ? 'red' : 'blue'} delay={1}>
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${personality.color}15` }}>
                  <span className="animate-float">{personality.emoji}</span>
                </div>
                <div className="absolute -inset-1 rounded-2xl blur-lg opacity-20" style={{ background: personality.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={14} className="text-purple-400" />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Spending Personality</p>
                </div>
                <h3 className="text-lg font-black text-white mb-1" style={{ color: personality.color }}>{personality.type}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{personality.reason}</p>
                {personality.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {personality.traits.map((trait, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 rounded-lg glass text-gray-400 font-medium">{trait}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─── FUTURE REGET ─── */}
          <Card className={regretBg} delay={2}>
            <div className="flex items-start gap-3">
              <div className="text-2xl mt-0.5 animate-float" style={{ animationDuration: '4s' }}>
                {regret.severity === 'critical' ? '💀' : regret.severity === 'high' ? '⏳' : regret.severity === 'medium' ? '🔮' : '✅'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className={regretColor} />
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Future Regret Projection</p>
                </div>
                <p className={`text-sm font-bold mb-2 ${regretColor}`}>{regret.message}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Monthly</p>
                    <p className="text-sm font-black text-white">₹{regret.monthlyProjection.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="glass rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">6 Months</p>
                    <p className="text-sm font-black text-white">₹{regret.sixMonthProjection.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="glass rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Yearly</p>
                    <p className="text-sm font-black text-white">₹{regret.yearlyProjection.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                {regret.categoryBreakdown.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Where the money goes in 6 months:</p>
                    {regret.categoryBreakdown.map((cb, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catBreak.find(c => c.category === cb.category)?.color || '#6b7280' }} />
                        <span className="text-xs text-gray-400 flex-1">{cb.category}</span>
                        <span className="text-xs font-bold text-white">₹{cb.sixMonthWaste.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─── LIVE ALERTS ─── */}
          {alerts.length > 0 && (
            <div className="animate-fade-in-up">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <AlertTriangle size={13} className="text-red-400 animate-pulse" /> Live Alerts ({alerts.length})
              </h2>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={alert.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                    <AlertBanner alert={alert} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── REAL-LIFE CONSEQUENCES ─── */}
          {consequences.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Target size={13} className="text-amber-400" /> Real-Life Impact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {consequences.slice(0, 4).map((c, i) => (
                  <Card key={c.category} delay={i + 3} className="border-amber-500/10">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl">{c.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white mb-0.5">{c.category}: ₹{c.amount.toLocaleString('en-IN')}</p>
                        <p className="text-[11px] text-amber-300/70 mb-2">{c.message}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.equivalents.map((eq, j) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded-md glass text-gray-400">
                              {eq.emoji} {eq.count} {eq.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ─── SUGGESTED ACTIONS ─── */}
          {suggestions.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Lightbulb size={13} className="text-yellow-400" /> Suggested Actions
              </h2>
              <div className="space-y-2.5">
                {suggestions.map((s, i) => (
                  <Card key={s.id} delay={i + 4}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{s.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-bold text-white">{s.title}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                            s.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-300' :
                            s.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-300' :
                            'bg-red-500/15 text-red-300'
                          }`}>
                            {s.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{s.description}</p>
                        <p className="text-sm text-emerald-400 font-bold mt-1.5">💰 Save {s.savings}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ─── INSIGHT SUMMARY STATS ─── */}
          <div className="grid grid-cols-3 gap-3 animate-fade-in-up stagger-2">
            <div className="glass border-red-500/15 rounded-2xl p-4 text-center card-hover">
              <p className="text-3xl font-black text-red-400">{dangerInsights.length}</p>
              <p className="text-xs text-red-400/70 font-medium mt-1">Critical Issues</p>
            </div>
            <div className="glass border-yellow-500/15 rounded-2xl p-4 text-center card-hover">
              <p className="text-3xl font-black text-yellow-400">{warningInsights.length}</p>
              <p className="text-xs text-yellow-400/70 font-medium mt-1">Warnings</p>
            </div>
            <div className="glass border-emerald-500/15 rounded-2xl p-4 text-center card-hover">
              <p className="text-3xl font-black text-emerald-400">{goodInsights.length}</p>
              <p className="text-xs text-emerald-400/70 font-medium mt-1">Healthy</p>
            </div>
          </div>

          {/* ─── ALL INSIGHT CARDS ─── */}
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Zap size={13} className="text-purple-400" /> Detected Patterns ({insights.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.map((insight, i) => (
                <div key={insight.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
                  <InsightCardComponent insight={insight} />
                </div>
              ))}
            </div>
            {insights.length === 0 && (
              <Card className="text-center py-8">
                <p className="text-2xl mb-2 animate-float">✨</p>
                <p className="text-gray-500 text-sm">No issues detected — your spending looks healthy!</p>
              </Card>
            )}
          </div>

          {/* ─── CHARTS ROW ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Radar Chart - Category Balance */}
            <Card delay={6}>
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Activity size={14} className="text-purple-400" /> Category Balance
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Radar
                      name="Spending %"
                      dataKey="value"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.2}
                      strokeWidth={2}
                      animationDuration={1000}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Time-of-Day Spending */}
            <Card delay={7}>
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" /> Spending by Time
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip content={<AreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* 14-Day Trend */}
          <Card delay={8}>
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <TrendingDown size={14} className="text-emerald-400" /> 14-Day Spending Trend
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySpend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<AreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {/* Fix This Panel */}
      {showFixThis && <FixThisPanel onClose={() => setShowFixThis(false)} />}
    </div>
  );
}
