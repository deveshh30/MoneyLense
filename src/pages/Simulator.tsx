import { useState, useMemo, useEffect } from 'react';
import { getExpenses, Category } from '../data/store';
import { simulate, getCategoryBreakdown, getRegret } from '../data/analytics';
import Card from '../components/Card';
import { TrendingUp, Zap, PiggyBank, Target, Clock, ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES: { value: Category; emoji: string; label: string }[] = [
  { value: 'Food',         emoji: '🍔', label: 'Food & Drinks' },
  { value: 'Travel',       emoji: '🚗', label: 'Travel' },
  { value: 'Shopping',     emoji: '🛍️', label: 'Shopping' },
  { value: 'Subscription', emoji: '📱', label: 'Subscriptions' },
  { value: 'Others',       emoji: '📦', label: 'Others' },
];

// Real-life equivalents for savings
function getSavingsEquivalents(amount: number) {
  return [
    { emoji: '☕', label: 'coffees', count: Math.round(amount / 120), unit: 'per month' },
    { emoji: '🍳', label: 'home meals', count: Math.round(amount / 80), unit: 'per month' },
    { emoji: '📚', label: 'books', count: Math.round(amount / 300), unit: 'per month' },
    { emoji: '🎬', label: 'movie tickets', count: Math.round(amount / 250), unit: 'per month' },
    { emoji: '🚌', label: 'bus passes', count: Math.round(amount / 800), unit: 'per month' },
  ].filter(e => e.count > 0).slice(0, 3);
}

export default function Simulator() {
  const [expenses, setExpenses] = useState(() => getExpenses());
  const catBreak = useMemo(() => getCategoryBreakdown(expenses), [expenses]);
  const regret = useMemo(() => getRegret(expenses), [expenses]);
  const [selectedCat, setSelectedCat] = useState<Category>('Food');
  const [reductionPct, setReductionPct] = useState(30);

  useEffect(() => {
    const handleExpensesUpdate = (e: Event) => {
      setExpenses((e as CustomEvent).detail);
    };
    window.addEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    return () => {
      window.removeEventListener('moneylens:expensesUpdated', handleExpensesUpdate as EventListener);
    };
  }, []);

  const result = useMemo(() => simulate(selectedCat, reductionPct, expenses), [selectedCat, reductionPct, expenses]);

  const annualSavings = result.savedMonthly * 12;
  const sixMonthSavings = result.savedMonthly * 6;
  const savingsEquivalents = getSavingsEquivalents(result.savedMonthly);
  const annualEquivalents = getSavingsEquivalents(annualSavings);

  // Calculate improved projection if user applies this reduction
  const improvedSixMonthProjection = regret.sixMonthProjection - sixMonthSavings;

  const hasExpenses = expenses.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-6">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
          <TrendingUp className="text-cyan-400 animate-float" size={24} />
          What-If Simulator
        </h1>
        <p className="text-gray-500 text-sm mt-1">See how small changes unlock big savings</p>
      </div>

      {!hasExpenses ? (
        <Card className="text-center py-12 animate-fade-in-scale">
          <div className="text-5xl mb-4 animate-float">🎯</div>
          <h3 className="text-lg font-bold text-white mb-2">No Expenses to Simulate</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Add some expenses first, then come back to see how reducing spending in any category saves you money.
          </p>
          <Link to="/add" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-semibold text-white hover:scale-105 transition-all">
            Add Expenses <ArrowRight size={14} />
          </Link>
        </Card>
      ) : (
        <>
          {/* Category Selector */}
          <Card delay={1}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Category to Cut</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat, i) => {
                const catData = catBreak.find(c => c.category === cat.value);
                const isSelected = selectedCat === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCat(cat.value)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-300 text-left hover:scale-[1.02] ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-900/20'
                        : 'glass border-white/[0.06] text-gray-500 hover:text-white hover:border-white/[0.12]'
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold">{cat.label}</p>
                      {catData && (
                        <p className="text-[10px] text-gray-600">₹{catData.total.toLocaleString('en-IN')}/mo</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Slider */}
          <Card delay={2}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reduction Amount</label>
              <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">{reductionPct}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={90}
              step={5}
              value={reductionPct}
              onChange={e => setReductionPct(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${reductionPct}%, #1f2937 ${reductionPct}%, #1f2937 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1.5">
              <span>5%</span>
              <span>Conservative cut (20–30%)</span>
              <span>90%</span>
            </div>

            <div className="mt-4 p-3 glass rounded-xl border border-white/[0.06] text-sm text-gray-400 animate-fade-in">
              💡 "If you reduce <span className="text-cyan-400 font-bold">{selectedCat}</span> spending by{' '}
              <span className="text-cyan-400 font-bold">{reductionPct}%</span>..."
            </div>
          </Card>

          {/* Results */}
          {result.currentMonthly > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 animate-fade-in-up stagger-3">
                <Card glow="green" delay={3}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-emerald-400" />
                    <p className="text-xs text-gray-500 font-bold uppercase">Monthly Savings</p>
                  </div>
                  <p className="text-3xl font-black text-emerald-400">₹{result.savedMonthly.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">per month saved</p>
                </Card>
                <Card glow="blue" delay={4}>
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank size={16} className="text-blue-400" />
                    <p className="text-xs text-gray-500 font-bold uppercase">Yearly Savings</p>
                  </div>
                  <p className="text-3xl font-black text-blue-400">₹{annualSavings.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">per year saved</p>
                </Card>
              </div>

              {/* Real-Life Impact of Savings */}
              <Card className="glass border-amber-500/15" delay={5}>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-amber-400" />
                  <h3 className="font-bold text-white text-sm">What You Could Buy Instead</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {savingsEquivalents.map((eq, i) => (
                    <div key={i} className="glass rounded-xl p-3 text-center card-hover">
                      <p className="text-2xl mb-1">{eq.emoji}</p>
                      <p className="text-sm font-bold text-white">{eq.count}</p>
                      <p className="text-[10px] text-gray-500">{eq.label}/{eq.unit}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Improved Future Projection */}
              <Card className="glass border-emerald-500/15" delay={6}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Your Future If You Make This Change</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-3">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Current 6-month projection</p>
                    <p className="text-lg font-black text-red-400">₹{regret.sixMonthProjection.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="glass rounded-xl p-3 border border-emerald-500/20">
                    <p className="text-[10px] text-emerald-400 uppercase mb-1">With this cut</p>
                    <p className="text-lg font-black text-emerald-400">₹{improvedSixMonthProjection.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="mt-3 p-3 glass rounded-xl">
                  <p className="text-sm text-gray-300">
                    <span className="text-emerald-400 font-bold">₹{sixMonthSavings.toLocaleString('en-IN')}</span> saved over 6 months
                    {sixMonthSavings > 5000 && (
                      <span className="block text-xs text-gray-500 mt-1">
                        That's enough for {Math.round(sixMonthSavings / 15000) * 100}% of a new phone! 📱
                      </span>
                    )}
                  </p>
                </div>
              </Card>

              {/* Fun Annual Equivalents */}
              <Card className="glass border-purple-500/15" delay={7}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} className="text-purple-400" />
                  <h3 className="font-bold text-white text-sm">Annual Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {annualEquivalents.map((eq, i) => (
                    <div key={i} className="p-3 glass rounded-xl card-hover">
                      <p className="text-2xl mb-1">{eq.emoji}</p>
                      <p className="text-sm font-bold text-white">{eq.count} {eq.label}</p>
                      <p className="text-[10px] text-gray-600">per year</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <Card className="text-center py-8 animate-fade-in-scale">
              <p className="text-2xl mb-2 animate-float">🤷</p>
              <p className="text-gray-500 text-sm">No spending in {selectedCat} to reduce</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
