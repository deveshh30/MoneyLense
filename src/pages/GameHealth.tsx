import { useEffect, useMemo, useState } from 'react';
import { getExpenses, getUser, saveUser, type User, type Expense } from '../data/store';
import { getHealthScore, getInsights } from '../data/analytics';
import Card from '../components/Card';
import { Trophy, Flame, Star, CheckCircle2, XCircle, ShieldCheck, Settings, IndianRupee, Check } from 'lucide-react';
import { parseISO, startOfWeek, isWithinInterval, endOfWeek } from 'date-fns';

function GradeBar({ label, deduction, reason, max = 20 }: { label: string; deduction: number; reason: string; max?: number }) {
  const pct = (deduction / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-red-400 font-bold">-{deduction} pts</span>
      </div>
      <div className="bg-gray-800/60 rounded-full h-2 overflow-hidden">
        <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-gray-600">{reason}</p>
    </div>
  );
}

const CHALLENGES = [
  { id: 'c1', emoji: '🍔', title: 'No Food Delivery Day', desc: 'Go one full day without ordering food online', points: 15 },
  { id: 'c2', emoji: '☕', title: '₹200 Day Cap', desc: 'Spend under ₹200 in any single day', points: 20 },
  { id: 'c3', emoji: '📱', title: 'Subscription Audit', desc: 'Cancel at least one unused subscription', points: 25 },
  { id: 'c4', emoji: '🌙', title: 'No Late-Night Orders', desc: 'Avoid all purchases after 10PM for 3 days', points: 20 },
  { id: 'c5', emoji: '🛍️', title: '48-Hour Shopping Rule', desc: 'Wait 48 hrs before any non-essential purchase', points: 15 },
  { id: 'c6', emoji: '🎯', title: 'Budget Week', desc: 'Stay under weekly budget for 7 consecutive days', points: 50 },
];

const BADGES = [
  { id: 'b1', emoji: '🥉', title: 'Budget Beginner', desc: 'Tracked first expense', earned: true },
  { id: 'b2', emoji: '🔍', title: 'Leak Detector', desc: 'Identified a money leak', earned: true },
  { id: 'b3', emoji: '🧘', title: 'Mindful Spender', desc: 'Score above 70 for 1 week', earned: false },
  { id: 'b4', emoji: '💰', title: 'Savings Starter', desc: 'Saved ₹1000 vs projection', earned: false },
  { id: 'b5', emoji: '🏆', title: 'Budget Master', desc: 'Stay under budget for full month', earned: false },
  { id: 'b6', emoji: '⚡', title: 'Streak King', desc: '7-day under-budget streak', earned: false },
];

export default function GameHealth() {
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [user, setUser] = useState(() => getUser());
  const health = useMemo(() => getHealthScore(expenses, user), [expenses, user]);
  useMemo(() => getInsights(expenses, user), [expenses, user]);

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [editBudget, setEditBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(String(user.monthlyBudget));

  useEffect(() => {
    const handleUserUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as User;
      if (detail) {
        setUser(detail);
        setNewBudget(String(detail.monthlyBudget));
      }
    };
    const handleExpensesUpdate = (e: Event) => {
      setExpenses((e as CustomEvent).detail as Expense[]);
    };
    window.addEventListener('moneylens:userUpdated', handleUserUpdate as EventListener);
    window.addEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    return () => {
      window.removeEventListener('moneylens:userUpdated', handleUserUpdate as EventListener);
      window.removeEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    setNewBudget(String(user.monthlyBudget));
  }, [user.monthlyBudget]);

  const toggleChallenge = (id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const challengePoints = [...completed].reduce((sum, id) => {
    const ch = CHALLENGES.find(c => c.id === id);
    return sum + (ch?.points ?? 0);
  }, 0);

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weeklySpent = expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  }).reduce((s, e) => s + e.amount, 0);
  const weeklyBudget = user.monthlyBudget / 4;
  const onTrackThisWeek = weeklySpent < weeklyBudget;

  const handleSaveBudget = () => {
    const val = Number(newBudget);
    if (!isNaN(val) && val >= 1000) {
      saveUser({ ...user, monthlyBudget: val });
      setUser({ ...user, monthlyBudget: val });
      setEditBudget(false);
    }
  };

  const scoreColor = health.score >= 70 ? '#10b981' : health.score >= 45 ? '#f59e0b' : '#ef4444';
  const r = 60;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (health.score / 100) * circumference;

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
          <Trophy className="text-yellow-400 animate-float" size={24} />
          Financial Health Hub
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gamify your way to better money habits</p>
      </div>

      {/* Big Health Score */}
      <Card glow={health.score >= 70 ? 'green' : health.score >= 45 ? 'yellow' : 'red'} delay={1}>
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center flex-shrink-0">
            {/* Glow behind ring */}
            <div
              className="absolute w-28 h-28 rounded-full blur-2xl opacity-20"
              style={{ background: scoreColor }}
            />
            <svg width="140" height="140" className="-rotate-90 relative z-10">
              <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              <circle
                cx="70" cy="70" r={r} fill="none"
                stroke={scoreColor} strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)', filter: `drop-shadow(0 0 8px ${scoreColor}40)` }}
              />
            </svg>
            <div className="absolute flex flex-col items-center z-20">
              <span className="text-4xl font-black" style={{ color: scoreColor }}>{health.score}</span>
              <span className="text-xs text-gray-500 font-bold">/ 100</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Financial Health Score</p>
            <p className="text-3xl font-black text-white mb-1">Grade {health.grade}</p>
            <p className="text-sm" style={{ color: scoreColor }}>
              {health.score >= 80 ? '🟢 Excellent financial behavior!' :
               health.score >= 65 ? '🟡 Good, but room to improve' :
               health.score >= 45 ? '🟠 Several issues detected' :
               '🔴 Critical — take action now'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${onTrackThisWeek ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {onTrackThisWeek ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                {onTrackThisWeek ? 'On track this week' : 'Over weekly budget'}
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-500/15 text-yellow-400 text-xs font-bold">
                <Flame size={12} className={onTrackThisWeek ? 'animate-pulse' : ''} />
                {challengePoints + health.score} XP
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Budget Editor */}
      <Card delay={2}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <IndianRupee size={13} className="text-emerald-400" /> Monthly Budget
          </h2>
          {!editBudget && (
            <button
              onClick={() => { setEditBudget(true); setNewBudget(String(user.monthlyBudget)); }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-all hover:scale-105"
            >
              <Settings size={12} /> Edit
            </button>
          )}
        </div>
        {editBudget ? (
          <div className="flex items-center gap-2 animate-fade-in-scale">
            <input
              type="number"
              value={newBudget}
              onChange={e => setNewBudget(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
              className="flex-1 px-4 py-2.5 glass border border-white/[0.06] rounded-xl text-white font-bold text-lg focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all"
              min={1000}
              autoFocus
            />
            <button
              onClick={handleSaveBudget}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-white text-sm flex items-center gap-1.5 transition-all hover:scale-105 btn-ripple"
            >
              <Check size={16} /> Save
            </button>
            <button
              onClick={() => { setEditBudget(false); setNewBudget(String(user.monthlyBudget)); }}
              className="px-4 py-2.5 glass hover:bg-white/[0.06] rounded-xl font-semibold text-gray-400 text-sm transition-all hover:scale-105"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-2xl font-black text-white">₹{user.monthlyBudget.toLocaleString('en-IN')}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Weekly: <span className="text-gray-300 font-medium">₹{Math.round(weeklyBudget).toLocaleString('en-IN')}</span></span>
            </div>
          </div>
        )}
      </Card>

      {/* Score Breakdown */}
      <Card delay={3}>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <ShieldCheck size={13} className="text-emerald-400" /> Score Breakdown
        </h2>
        <div className="space-y-3">
          {health.breakdown.map((d, i) => (
            <div key={d.label} className="animate-slide-in-left" style={{ animationDelay: `${i * 0.1}s` }}>
              <GradeBar label={d.label} deduction={d.deduction} reason={d.reason} />
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Streak */}
      <Card delay={4}>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Flame size={13} className="text-orange-400" /> Weekly Progress
        </h2>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${onTrackThisWeek ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
            {onTrackThisWeek ? (
              <CheckCircle2 size={24} className="text-emerald-400" />
            ) : (
              <XCircle size={24} className="text-red-400" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              {onTrackThisWeek ? 'On Track!' : 'Over Budget'}
            </p>
            <p className="text-xs text-gray-500">
              Spent ₹{weeklySpent.toLocaleString('en-IN')} of ₹{Math.round(weeklyBudget).toLocaleString('en-IN')} weekly budget
            </p>
          </div>
          <div className={`text-lg font-black ${onTrackThisWeek ? 'text-emerald-400' : 'text-red-400'}`}>
            {Math.round(((weeklyBudget - weeklySpent) / weeklyBudget) * 100)}%
          </div>
        </div>
      </Card>

      {/* Challenges */}
      <Card delay={5}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Star size={13} className="text-yellow-400" /> Challenges
          </h2>
          <span className="text-xs font-bold text-yellow-400">{challengePoints} XP earned</span>
        </div>
        <div className="space-y-2">
          {CHALLENGES.map((ch, i) => {
            const isCompleted = completed.has(ch.id);
            return (
              <button
                key={ch.id}
                onClick={() => toggleChallenge(ch.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left hover:scale-[1.01] ${
                  isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'glass border-white/[0.06] hover:border-white/[0.12]'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted ? 'bg-emerald-500/20' : 'glass'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <span className="text-sm">{ch.emoji}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-300' : 'text-gray-300'}`}>{ch.title}</p>
                  <p className="text-[10px] text-gray-600">{ch.desc}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/15 text-yellow-400'}`}>
                  +{ch.points} XP
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Badges */}
      <Card delay={6}>
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Trophy size={13} className="text-yellow-400" /> Achievement Badges
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BADGES.map((badge, i) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 card-hover ${
                badge.earned
                  ? 'glass border-yellow-500/20'
                  : 'glass border-white/[0.04] opacity-40'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="text-2xl mb-1">{badge.emoji}</span>
              <p className="text-[10px] font-semibold text-center text-gray-300 leading-tight">{badge.title}</p>
              <p className="text-[9px] text-gray-600 text-center mt-0.5 leading-tight">{badge.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
