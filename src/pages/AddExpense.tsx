import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addExpense, Category } from '../data/store';
import Card from '../components/Card';
import { PlusCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const CATEGORIES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: 'Food',         label: 'Food & Drinks',  emoji: '🍔', color: 'from-red-500/20 to-red-600/10 border-red-700/50 text-red-300' },
  { value: 'Travel',       label: 'Travel',         emoji: '🚗', color: 'from-blue-500/20 to-blue-600/10 border-blue-700/50 text-blue-300' },
  { value: 'Shopping',     label: 'Shopping',       emoji: '🛍️', color: 'from-purple-500/20 to-purple-600/10 border-purple-700/50 text-purple-300' },
  { value: 'Subscription', label: 'Subscription',   emoji: '📱', color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-700/50 text-yellow-300' },
  { value: 'Others',       label: 'Others',         emoji: '📦', color: 'from-gray-500/20 to-gray-600/10 border-gray-700/50 text-gray-300' },
];

const QUICK_AMOUNTS = [50, 100, 150, 200, 300, 500, 999, 1500];

export default function AddExpense() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '',
    category: '' as Category | '',
    description: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid amount greater than 0';
    if (!form.category)
      errs.category = 'Please select a category';
    if (!form.description.trim())
      errs.description = 'Please add a short description';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    addExpense({
      amount: Number(form.amount),
      category: form.category as Category,
      description: form.description.trim(),
      date: new Date(form.date).toISOString(),
    });

    setSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const amount = Number(form.amount);
  const amountWarning = amount > 0 && amount < 200 ? 'micro-spend (< ₹200) — adds to hidden leaks' : amount > 1000 ? 'high-value transaction' : '';
  const amountColor = amount > 0 && amount < 200 ? 'text-orange-400' : amount > 1000 ? 'text-red-400' : '';

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in-scale">
        <div className="w-24 h-24 rounded-full bg-emerald-500/15 flex items-center justify-center animate-success-pop">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white animate-fade-in-up">Expense Added!</h2>
        <p className="text-gray-500 animate-fade-in-up stagger-1">Redirecting to dashboard...</p>
        <div className="w-48 h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden animate-fade-in-up stagger-2">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-24 md:pb-6">
      <div className="flex items-center gap-3 animate-fade-in-down">
        <Link to="/" className="p-2 rounded-xl glass hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all duration-300 hover:scale-105">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Add Expense</h1>
          <p className="text-gray-500 text-sm">Track every rupee you spend</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <Card delay={1}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-600">₹</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full glass border border-white/[0.06] rounded-xl pl-10 pr-4 py-4 text-3xl font-black text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300"
            />
          </div>
          {errors.amount && <p className="text-red-400 text-xs mt-1.5 animate-fade-in">{errors.amount}</p>}
          {amountWarning && <p className={`text-xs mt-1.5 font-medium ${amountColor} animate-fade-in`}>⚠️ {amountWarning}</p>}

          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_AMOUNTS.map((q, i) => (
              <button
                type="button"
                key={q}
                onClick={() => setForm(f => ({ ...f, amount: String(q) }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 hover:scale-105 ${
                  form.amount === String(q)
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-900/20'
                    : 'glass border-white/[0.06] text-gray-500 hover:text-white hover:border-white/[0.12]'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                ₹{q}
              </button>
            ))}
          </div>
        </Card>

        {/* Category */}
        <Card delay={2}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat, i) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                className={`flex items-center gap-2.5 p-3 rounded-xl border bg-gradient-to-br transition-all duration-300 text-left hover:scale-[1.02] ${
                  form.category === cat.value
                    ? cat.color + ' shadow-lg'
                    : 'glass border-white/[0.06] text-gray-500 hover:text-white hover:border-white/[0.12]'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-xs font-semibold leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.category && <p className="text-red-400 text-xs mt-2 animate-fade-in">{errors.category}</p>}
        </Card>

        {/* Description */}
        <Card delay={3}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</label>
          <input
            type="text"
            placeholder="e.g. Lunch at college canteen"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full glass border border-white/[0.06] rounded-xl px-4 py-3 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 text-sm"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1.5 animate-fade-in">{errors.description}</p>}
        </Card>

        {/* Date */}
        <Card delay={4}>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Date & Time</label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full glass border border-white/[0.06] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all duration-300 text-sm [color-scheme:dark]"
          />
          <p className="text-xs text-gray-600 mt-1.5">Leave as-is for right now</p>
        </Card>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all duration-300 text-base shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-[1.02] btn-ripple animate-fade-in-up stagger-5"
        >
          <PlusCircle size={20} />
          Add Expense
        </button>
      </form>
    </div>
  );
}
