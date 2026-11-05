import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  endOfToday,
  isWithinInterval,
  getDay,
  getHours,
  parseISO,
  format,
} from 'date-fns';
import { Expense, Category, getUser } from './store';

export interface CategoryBreakdown {
  category: Category;
  total: number;
  percentage: number;
  count: number;
  color: string;
}

export interface InsightCard {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  emoji: string;
  title: string;
  description: string;
  value?: string;
}

export interface AlertCard {
  id: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  emoji: string;
}

export interface PredictionResult {
  avgDailySpend: number;
  daysLeft: number;
  runOutDate: string;
  monthlyProjection: number;
  sixMonthProjection: number;
  riskLevel: 'safe' | 'warning' | 'critical';
  actionable: string;
}

export interface HealthScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: { label: string; deduction: number; reason: string }[];
}

export interface SimulationResult {
  category: Category;
  reductionPct: number;
  currentMonthly: number;
  savedMonthly: number;
  savedWeekly: number;
  newMonthly: number;
}

export interface DailySpend {
  day: string;
  amount: number;
  isWeekend: boolean;
}

// ─── NEW: Spending Personality ────────────────────────────────────────────────

export interface SpendingPersonality {
  type: string;
  emoji: string;
  color: string;
  reason: string;
  traits: string[];
  score: number; // 0-100 match
}

export function getSpendingPersonality(expenses: Expense[]): SpendingPersonality {
  const monthExp = thisMonthExpenses(expenses);
  const weekExp = thisWeekExpenses(expenses);
  const totalSpent = sumAmount(monthExp);

  if (totalSpent === 0) {
    return {
      type: 'No Data Yet',
      emoji: '🔮',
      color: '#6b7280',
      reason: 'Start tracking expenses to discover your spending personality.',
      traits: [],
      score: 0,
    };
  }

  const catBreak = getCategoryBreakdown(expenses);
  const topCat = catBreak[0];
  const topPct = topCat?.percentage || 0;

  // Small transaction frequency
  const smallTxns = weekExp.filter(e => e.amount < 200);
  const smallTxnPct = weekExp.length > 0 ? (smallTxns.length / weekExp.length) * 100 : 0;

  // Weekend vs weekday
  const weekendExp = monthExp.filter(e => {
    const d = getDay(parseISO(e.date));
    return d === 0 || d === 6;
  });
  const weekdayExp = monthExp.filter(e => {
    const d = getDay(parseISO(e.date));
    return d >= 1 && d <= 5;
  });
  const weekendAvg = weekendExp.length > 0 ? sumAmount(weekendExp) / 8 : 0;
  const weekdayAvg = weekdayExp.length > 0 ? sumAmount(weekdayExp) / 22 : 0;
  const weekendRatio = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 0;

  // Late night
  const lateNight = monthExp.filter(e => {
    const h = getHours(parseISO(e.date));
    return h >= 23 || h < 3;
  });

  // Food frequency
  const foodExp = monthExp.filter(e => e.category === 'Food');
  const foodPct = totalSpent > 0 ? (sumAmount(foodExp) / totalSpent) * 100 : 0;

  // Calculate personality scores
  let impulsiveScore = 0;
  let weekendScore = 0;
  let addictScore = 0;
  let nightScore = 0;
  let balancedScore = 0;

  // Impulsive: many small transactions, high frequency
  impulsiveScore += Math.min(smallTxnPct * 0.8, 40);
  impulsiveScore += Math.min(weekExp.length * 3, 30);
  impulsiveScore += Math.min(foodExp.length * 2, 30);

  // Weekend overspender
  if (weekendRatio > 1.5) weekendScore += 50;
  if (weekendRatio > 2) weekendScore += 30;
  weekendScore += Math.min(weekendExp.length * 4, 20);

  // Category addict
  if (topPct > 50) addictScore += 40;
  if (topPct > 65) addictScore += 30;
  if (topPct > 75) addictScore += 20;
  if (topCat?.category === 'Food' && foodPct > 50) addictScore += 10;

  // Night owl
  if (lateNight.length >= 3) nightScore += 40;
  if (lateNight.length >= 5) nightScore += 30;
  if (lateNight.length >= 8) nightScore += 30;

  // Balanced: low on all negative indicators
  if (topPct < 40) balancedScore += 25;
  if (smallTxnPct < 30) balancedScore += 25;
  if (weekendRatio < 1.3) balancedScore += 25;
  if (lateNight.length < 2) balancedScore += 25;

  const scores = [
    { type: 'Impulsive Spender', emoji: '⚡', color: '#f97316', score: impulsiveScore, traits: [
      `${smallTxns.length} small transactions this week`,
      `${foodExp.length} food orders this month`,
      'Frequent micro-purchases detected',
    ]},
    { type: 'Weekend Overspender', emoji: '🎉', color: '#a855f7', score: weekendScore, traits: [
      `${Math.round((weekendRatio - 1) * 100)}% more spending on weekends`,
      `₹${Math.round(weekendAvg)}/day on weekends vs ₹${Math.round(weekdayAvg)}/day weekdays`,
      `${weekendExp.length} weekend transactions`,
    ]},
    { type: `${topCat?.category || 'Category'} Addict`, emoji: '🎯', color: '#ef4444', score: addictScore, traits: [
      `${topPct}% of spending goes to ${topCat?.category}`,
      `₹${topCat?.total.toLocaleString('en-IN')} on ${topCat?.category} this month`,
      `${topCat?.count} transactions in this category`,
    ]},
    { type: 'Night Owl Spender', emoji: '🌙', color: '#6366f1', score: nightScore, traits: [
      `${lateNight.length} late-night orders (11PM–3AM)`,
      `₹${sumAmount(lateNight).toLocaleString('en-IN')} spent at night`,
      'Late orders are 30-50% more expensive',
    ]},
    { type: 'Disciplined Spender', emoji: '🧘', color: '#10b981', score: balancedScore, traits: [
      'Balanced category distribution',
      'Low micro-transaction frequency',
      'Consistent weekday spending',
    ]},
  ];

  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];

  // Generate reason
  let reason = '';
  if (winner.type === 'Impulsive Spender') {
    reason = `You make ${weekExp.length} transactions per week with ${smallTxns.length} under ₹200. These small spends are silently draining your wallet.`;
  } else if (winner.type === 'Weekend Overspender') {
    reason = `You spend ${Math.round((weekendRatio - 1) * 100)}% more on weekends than weekdays. Your weekends are your biggest money leak.`;
  } else if (winner.type.includes('Addict')) {
    reason = `${topPct}% of your money goes to ${topCat?.category}. This single category is dominating your budget.`;
  } else if (winner.type === 'Night Owl Spender') {
    reason = `${lateNight.length} of your orders happen between 11PM–3AM. Late-night spending is your hidden weakness.`;
  } else {
    reason = `Your spending is well-distributed across categories with no dominant patterns. Keep it up!`;
  }

  return {
    type: winner.type,
    emoji: winner.emoji,
    color: winner.color,
    reason,
    traits: winner.traits.slice(0, 3),
    score: Math.min(100, winner.score),
  };
}

// ─── NEW: Real-Life Consequence Converter ─────────────────────────────────────

export interface ConsequenceResult {
  title: string;
  emoji: string;
  amount: number;
  category: string;
  equivalents: { emoji: string; label: string; count: number }[];
  message: string;
}

export function getConsequences(expenses: Expense[]): ConsequenceResult[] {
  const catBreak = getCategoryBreakdown(expenses);
  const results: ConsequenceResult[] = [];

  for (const cat of catBreak) {
    if (cat.total === 0) continue;

    const equivalents: { emoji: string; label: string; count: number }[] = [];

    if (cat.category === 'Food') {
      equivalents.push({ emoji: '🍳', label: 'home-cooked meals', count: Math.round(cat.total / 80) });
      equivalents.push({ emoji: '🍕', label: 'pizza orders', count: Math.round(cat.total / 400) });
      equivalents.push({ emoji: '📚', label: 'textbooks', count: Math.round(cat.total / 500) });
      equivalents.push({ emoji: '🎬', label: 'movie tickets', count: Math.round(cat.total / 250) });
    } else if (cat.category === 'Travel') {
      equivalents.push({ emoji: '🚌', label: 'bus passes (monthly)', count: Math.round(cat.total / 800) });
      equivalents.push({ emoji: '📖', label: 'books', count: Math.round(cat.total / 300) });
      equivalents.push({ emoji: '☕', label: 'coffees', count: Math.round(cat.total / 120) });
    } else if (cat.category === 'Shopping') {
      equivalents.push({ emoji: '📱', label: 'phone EMI months', count: Math.round(cat.total / 2000 * 10) });
      equivalents.push({ emoji: '🍳', label: 'days of groceries', count: Math.round(cat.total / 200) });
      equivalents.push({ emoji: '🎓', label: 'online courses', count: Math.round(cat.total / 999) });
    } else if (cat.category === 'Subscription') {
      equivalents.push({ emoji: '🍳', label: 'home-cooked meals', count: Math.round(cat.total / 80) });
      equivalents.push({ emoji: '📚', label: 'books', count: Math.round(cat.total / 300) });
      equivalents.push({ emoji: '☕', label: 'coffees', count: Math.round(cat.total / 120) });
    } else {
      equivalents.push({ emoji: '🍳', label: 'meals', count: Math.round(cat.total / 100) });
      equivalents.push({ emoji: '☕', label: 'coffees', count: Math.round(cat.total / 120) });
      equivalents.push({ emoji: '📚', label: 'books', count: Math.round(cat.total / 300) });
    }

    const topEquiv = equivalents[0];
    results.push({
      title: `${cat.category} Spending Reality Check`,
      emoji: { Food: '🍔', Travel: '🚗', Shopping: '🛍️', Subscription: '📱', Others: '📦' }[cat.category],
      amount: cat.total,
      category: cat.category,
      equivalents: equivalents.slice(0, 3),
      message: `₹${cat.total.toLocaleString('en-IN')} on ${cat.category} = approx ${topEquiv.count} ${topEquiv.label}`,
    });
  }

  return results.sort((a, b) => b.amount - a.amount);
}

// ─── NEW: Future Regret Engine ────────────────────────────────────────────────

export interface RegretResult {
  monthlyProjection: number;
  sixMonthProjection: number;
  yearlyProjection: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  categoryBreakdown: { category: string; sixMonthWaste: number }[];
}

export function getRegret(expenses: Expense[]): RegretResult {
  const user = getUser();
  const monthExp = getPastExpensesThisMonth(expenses);
  const totalSpent = sumAmount(monthExp);
  const dayOfMonth = new Date().getDate();
  const avgDailySpend = dayOfMonth > 0 ? totalSpent / dayOfMonth : totalSpent;

  const monthlyProjection = Math.round(avgDailySpend * 30);
  const sixMonthProjection = monthlyProjection * 6;
  const yearlyProjection = monthlyProjection * 12;

  const catBreak = getCategoryBreakdown(expenses);
  const categoryBreakdown = catBreak.map(c => ({
    category: c.category,
    sixMonthWaste: Math.round((c.total / (dayOfMonth || 1)) * 30 * 6),
  }));

  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let message = '';

  if (monthlyProjection > user.monthlyBudget * 1.3) {
    severity = 'critical';
    message = `At this rate, you'll waste ₹${sixMonthProjection.toLocaleString('en-IN')} in 6 months — that's ₹${(sixMonthProjection - user.monthlyBudget * 6).toLocaleString('en-IN')} OVER your budget!`;
  } else if (monthlyProjection > user.monthlyBudget * 1.1) {
    severity = 'high';
    message = `If this continues, you'll spend ₹${sixMonthProjection.toLocaleString('en-IN')} in 6 months — ₹${(sixMonthProjection - user.monthlyBudget * 6).toLocaleString('en-IN')} more than planned.`;
  } else if (monthlyProjection > user.monthlyBudget * 0.9) {
    severity = 'medium';
    message = `Projected 6-month spend: ₹${sixMonthProjection.toLocaleString('en-IN')}. You're close to your limit — small cuts now prevent big regrets later.`;
  } else {
    severity = 'low';
    message = `Projected 6-month spend: ₹${sixMonthProjection.toLocaleString('en-IN')}. You're within budget. Keep this up and you'll save ₹${(user.monthlyBudget * 6 - sixMonthProjection).toLocaleString('en-IN')} vs your budget!`;
  }

  return {
    monthlyProjection,
    sixMonthProjection,
    yearlyProjection,
    message,
    severity,
    categoryBreakdown: categoryBreakdown.sort((a, b) => b.sixMonthWaste - a.sixMonthWaste),
  };
}

// ─── NEW: Key Insight of the Week ─────────────────────────────────────────────

export interface KeyInsight {
  title: string;
  emoji: string;
  description: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  impact: string;
}

export function getKeyInsight(expenses: Expense[]): KeyInsight {
  const _monthExp = thisMonthExpenses(expenses);
  const weekExp = thisWeekExpenses(expenses);
  const totalSpent = sumAmount(_monthExp);
  const user = getUser();

  if (totalSpent === 0) {
    return {
      title: 'Start Tracking',
      emoji: '🔮',
      description: 'Add your first expense to unlock personalized insights about your spending behavior.',
      type: 'info',
      impact: 'No data yet',
    };
  }

  const catBreak = getCategoryBreakdown(expenses);
  const topCat = catBreak[0];
  const smallTxns = weekExp.filter(e => e.amount < 200);
  const foodExp = _monthExp.filter(e => e.category === 'Food');
  const foodTotal = sumAmount(foodExp);
  const foodPct = totalSpent > 0 ? (foodTotal / totalSpent) * 100 : 0;

  // Combine patterns into ONE strong insight
  const patterns: string[] = [];
  let severity: 'danger' | 'warning' | 'info' | 'success' = 'info';

  if (topCat && topCat.percentage > 50) {
    patterns.push(`${topCat.percentage}% of spending is on ${topCat.category}`);
    severity = 'danger';
  }

  if (smallTxns.length > 5) {
    patterns.push(`${smallTxns.length} micro-transactions this week`);
    if (severity !== 'danger') severity = 'warning';
  }

  if (foodPct > 50) {
    patterns.push(`₹${foodTotal.toLocaleString('en-IN')} on food alone`);
    if (severity !== 'danger') severity = 'warning';
  }

  const spentPct = totalSpent / user.monthlyBudget;
  if (spentPct > 0.8) {
    patterns.push(`${Math.round(spentPct * 100)}% of budget already used`);
    severity = 'danger';
  }

  if (patterns.length === 0) {
    return {
      title: 'Spending Looks Healthy!',
      emoji: '✅',
      description: `You've spent ₹${totalSpent.toLocaleString('en-IN')} this month (${Math.round(spentPct * 100)}% of budget). Your spending is well-distributed with no major leaks detected.`,
      type: 'success',
      impact: `₹${(user.monthlyBudget - totalSpent).toLocaleString('en-IN')} remaining`,
    };
  }

  const combinedDescription = patterns.join(', ') + ' — this combination is your primary money leak. Addressing these patterns could save you ₹' + Math.round(totalSpent * 0.2).toLocaleString('en-IN') + ' this month.';

  return {
    title: 'Your Money Leak This Week',
    emoji: severity === 'danger' ? '🚨' : severity === 'warning' ? '⚠️' : '💡',
    description: combinedDescription,
    type: severity,
    impact: `₹${Math.round(totalSpent * 0.2).toLocaleString('en-IN')} potentially recoverable`,
  };
}

// ─── NEW: Actionable Suggestions ──────────────────────────────────────────────

export interface Suggestion {
  id: string;
  emoji: string;
  title: string;
  description: string;
  savings: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: Category;
}

export function getSuggestions(expenses: Expense[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const monthExp = thisMonthExpenses(expenses);
  const weekExp = thisWeekExpenses(expenses);
  const catBreak = getCategoryBreakdown(expenses);
  const topCat = catBreak[0];
  const totalSpent = sumAmount(monthExp);
  const dayOfMonth = new Date().getDate();
  const dailyAvg = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;

  if (totalSpent === 0) return [];

  // Food suggestions
  const foodExp = monthExp.filter(e => e.category === 'Food');
  const foodTotal = sumAmount(foodExp);
  const foodCount = foodExp.length;

  if (foodTotal > 2000) {
    const weeklyOrders = Math.round(foodCount / (dayOfMonth / 7));
    const targetOrders = Math.max(3, weeklyOrders - 3);
    const savingsPerWeek = Math.round((weeklyOrders - targetOrders) * 250);
    suggestions.push({
      id: 's-food-1',
      emoji: '🍔',
      title: `Limit food orders to ${targetOrders}/week`,
      description: `You're ordering food ${weeklyOrders} times/week. Cutting to ${targetOrders} orders by meal-prepping 2 days saves significant money.`,
      savings: `₹${(savingsPerWeek * 4).toLocaleString('en-IN')}/month`,
      difficulty: 'medium',
      category: 'Food',
    });
  }

  if (foodTotal > 1500) {
    const dailyCap = Math.round(foodTotal / dayOfMonth);
    suggestions.push({
      id: 's-food-2',
      emoji: '🍳',
      title: `Set daily food cap at ₹${Math.round(dailyCap * 0.7)}`,
      description: `Your daily food average is ₹${dailyCap}. Reducing by 30% through home cooking and canteen meals instead of delivery.`,
      savings: `₹${Math.round(foodTotal * 0.3).toLocaleString('en-IN')}/month`,
      difficulty: 'easy',
      category: 'Food',
    });
  }

  // Small transaction suggestions
  const smallTxns = weekExp.filter(e => e.amount < 200);
  if (smallTxns.length > 5) {
    const smallTotal = sumAmount(smallTxns);
    suggestions.push({
      id: 's-small',
      emoji: '🔁',
      title: 'Bundle micro-purchases',
      description: `${smallTxns.length} small expenses (₹${smallTotal}) this week. Buy in bulk or weekly instead of daily — snacks, chai, etc.`,
      savings: `₹${Math.round(smallTotal * 0.4 * 4).toLocaleString('en-IN')}/month`,
      difficulty: 'easy',
      category: 'Others',
    });
  }

  // Subscription suggestions
  const subExp = monthExp.filter(e => e.category === 'Subscription');
  if (subExp.length >= 2) {
    const subTotal = sumAmount(subExp);
    suggestions.push({
      id: 's-sub',
      emoji: '📱',
      title: 'Audit your subscriptions',
      description: `${subExp.length} subscriptions costing ₹${subTotal.toLocaleString('en-IN')}/month. Cancel at least one you rarely use.`,
      savings: `₹${Math.round(subTotal / subExp.length).toLocaleString('en-IN')}/month`,
      difficulty: 'easy',
      category: 'Subscription',
    });
  }

  // Category dominance
  if (topCat && topCat.percentage > 50) {
    suggestions.push({
      id: 's-cat',
      emoji: '🎯',
      title: `Set a ${topCat.category} sub-budget`,
      description: `${topCat.percentage}% of spending goes to ${topCat.category}. Cap it at 35% of your monthly budget (₹${Math.round(getUser().monthlyBudget * 0.35).toLocaleString('en-IN')}).`,
      savings: `₹${Math.round(topCat.total * 0.3).toLocaleString('en-IN')}/month`,
      difficulty: 'medium',
      category: topCat.category,
    });
  }

  // Daily spending cap
  if (dailyAvg > 300) {
    const targetDaily = Math.round(dailyAvg * 0.7);
    suggestions.push({
      id: 's-daily',
      emoji: '📊',
      title: `Set daily spending cap at ₹${targetDaily}`,
      description: `You're averaging ₹${Math.round(dailyAvg)}/day. A ₹${targetDaily} daily cap would keep you on track for the month.`,
      savings: `₹${Math.round((dailyAvg - targetDaily) * 30).toLocaleString('en-IN')}/month`,
      difficulty: 'hard',
      category: 'Others',
    });
  }

  // Weekend spending
  const weekendExp = monthExp.filter(e => {
    const d = getDay(parseISO(e.date));
    return d === 0 || d === 6;
  });
  const weekdayExp = monthExp.filter(e => {
    const d = getDay(parseISO(e.date));
    return d >= 1 && d <= 5;
  });
  const weekendAvg = weekendExp.length > 0 ? sumAmount(weekendExp) / 8 : 0;
  const weekdayAvg = weekdayExp.length > 0 ? sumAmount(weekdayExp) / 22 : 0;
  if (weekendAvg > weekdayAvg * 1.5) {
    suggestions.push({
      id: 's-weekend',
      emoji: '📅',
      title: 'Plan a weekend budget',
      description: `You spend ₹${Math.round(weekendAvg)}/day on weekends vs ₹${Math.round(weekdayAvg)}/day weekdays. Set a ₹${Math.round(weekdayAvg * 1.3 * 2)}/day weekend limit.`,
      savings: `₹${Math.round((weekendAvg - weekdayAvg * 1.3) * 8).toLocaleString('en-IN')}/month`,
      difficulty: 'medium',
      category: 'Others',
    });
  }

  return suggestions.slice(0, 5);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function now() { return new Date(); }

function thisWeekExpenses(expenses: Expense[]): Expense[] {
  const start = startOfWeek(now(), { weekStartsOn: 1 });
  const end = endOfWeek(now(), { weekStartsOn: 1 });
  return expenses.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start, end });
  });
}

function thisMonthExpenses(expenses: Expense[]): Expense[] {
  const start = startOfMonth(now());
  const end = endOfMonth(now()); // Full month for charts/overview
  return expenses.filter(e => {
    const d = parseISO(e.date);
    return d >= start && d <= end;
  });
}

function getPastExpensesThisMonth(expenses: Expense[]): Expense[] {
  const start = startOfMonth(now());
  const end = endOfToday(); // Only past data for rate calculations
  return expenses.filter(e => {
    const d = parseISO(e.date);
    return d >= start && d <= end;
  });
}

function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

// ─── Category Breakdown ─────────────────────────────────────────────────────

const COLORS: Record<Category, string> = {
  Food:         '#ef4444',
  Travel:       '#3b82f6',
  Shopping:     '#a855f7',
  Subscription: '#f59e0b',
  Others:       '#6b7280',
};

export function getCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const monthExp = thisMonthExpenses(expenses);
  const total = sumAmount(monthExp);
  const map: Partial<Record<Category, { total: number; count: number }>> = {};

  for (const e of monthExp) {
    if (!map[e.category]) map[e.category] = { total: 0, count: 0 };
    map[e.category]!.total += e.amount;
    map[e.category]!.count += 1;
  }

  const categories: Category[] = ['Food', 'Travel', 'Shopping', 'Subscription', 'Others'];
  return categories
    .filter(c => map[c])
    .map(c => ({
      category: c,
      total: map[c]!.total,
      percentage: total > 0 ? Math.round((map[c]!.total / total) * 100) : 0,
      count: map[c]!.count,
      color: COLORS[c],
    }))
    .sort((a, b) => b.total - a.total);
}

// ─── Financial Health Score ─────────────────────────────────────────────────

export function getHealthScore(expenses: Expense[], userOverride?: import('./store').User): HealthScore {
  const user = userOverride || getUser();
  const monthExp = thisMonthExpenses(expenses);
  const weekExp = thisWeekExpenses(expenses);
  const totalSpent = sumAmount(monthExp);
  const breakdown: { label: string; deduction: number; reason: string }[] = [];

  let score = 100;

  // Rule: Overspending
  const spendPct = totalSpent / user.monthlyBudget;
  if (spendPct > 1) {
    score -= 20; breakdown.push({ label: 'Overspending', deduction: 20, reason: 'Exceeded monthly budget' });
  } else if (spendPct > 0.8) {
    score -= 12; breakdown.push({ label: 'High Spending', deduction: 12, reason: 'Over 80% of budget used' });
  } else if (spendPct > 0.6) {
    score -= 5; breakdown.push({ label: 'Moderate Spending', deduction: 5, reason: 'Over 60% of budget used' });
  }

  // Rule: Small transaction leaks
  const smallTxns = weekExp.filter(e => e.amount < 200);
  if (smallTxns.length > 8) {
    score -= 15; breakdown.push({ label: 'Micro-Transaction Leak', deduction: 15, reason: `${smallTxns.length} small expenses this week` });
  } else if (smallTxns.length > 5) {
    score -= 8; breakdown.push({ label: 'Frequent Small Spends', deduction: 8, reason: `${smallTxns.length} small expenses this week` });
  }

  // Rule: Category imbalance
  const catBreak = getCategoryBreakdown(expenses);
  const topCat = catBreak[0];
  if (topCat && topCat.percentage > 60) {
    score -= 15; breakdown.push({ label: 'Category Imbalance', deduction: 15, reason: `${topCat.percentage}% spent on ${topCat.category}` });
  } else if (topCat && topCat.percentage > 50) {
    score -= 8; breakdown.push({ label: 'Category Skew', deduction: 8, reason: `${topCat.percentage}% spent on ${topCat.category}` });
  }

  // Rule: High frequency spending
  const todayExp = expenses.filter(e => {
    const d = parseISO(e.date);
    const t = now();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  });
  if (todayExp.length > 6) {
    score -= 10; breakdown.push({ label: 'High Daily Frequency', deduction: 10, reason: `${todayExp.length} transactions today` });
  }

  // Rule: Late night spending
  const lateNight = monthExp.filter(e => {
    const h = getHours(parseISO(e.date));
    return h >= 23 || h < 3;
  });
  if (lateNight.length > 4) {
    score -= 5; breakdown.push({ label: 'Late-Night Spending', deduction: 5, reason: `${lateNight.length} late-night orders` });
  }

  score = Math.max(0, Math.min(100, score));
  const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
  return { score, grade, breakdown };
}

// ─── Insights Engine ────────────────────────────────────────────────────────

export function getInsights(expenses: Expense[], userOverride?: import('./store').User): InsightCard[] {
  const insights: InsightCard[] = [];
  const monthExp = thisMonthExpenses(expenses);
  const weekExp = thisWeekExpenses(expenses);
  const user = userOverride || getUser();
  const totalSpent = sumAmount(monthExp);

  // 1. Category dominance — UPGRADED wording
  const catBreak = getCategoryBreakdown(expenses);
  const topCat = catBreak[0];
  if (topCat && topCat.percentage > 50) {
    const balancedPct = 35; // ideal max for one category
    insights.push({
      id: 'cat-dom',
      type: topCat.percentage > 65 ? 'danger' : 'warning',
      emoji: '⚠️',
      title: `${topCat.percentage}% of spending is on ${topCat.category} — ${Math.round(topCat.percentage / balancedPct)}x higher than balanced`,
      description: `A balanced budget caps any category at ~35%. Your ${topCat.category} spending is ₹${topCat.total.toLocaleString('en-IN')} — set a sub-budget of ₹${Math.round(user.monthlyBudget * 0.35)} to fix this.`,
      value: `₹${topCat.total.toLocaleString('en-IN')}`,
    });
  }

  // 2. Small transaction leak — UPGRADED
  const smallTxns = weekExp.filter(e => e.amount < 200);
  if (smallTxns.length > 5) {
    const smallTotal = sumAmount(smallTxns);
    insights.push({
      id: 'small-leak',
      type: 'warning',
      emoji: '🔁',
      title: `${smallTxns.length} micro-transactions = ₹${smallTotal.toLocaleString('en-IN')} leaked this week`,
      description: `These ₹50–₹200 purchases feel insignificant but add up to ₹${(smallTotal * 4).toLocaleString('en-IN')}/month. That's a full weekend trip you're unknowingly spending.`,
      value: `₹${smallTotal.toLocaleString('en-IN')} leaked`,
    });
  }

  // 3. Weekend spike — UPGRADED
  const weekendExp = monthExp.filter(e => {
    const d = getDay(parseISO(e.date));
    return d === 0 || d === 6;
  });
  const weekdayExp = monthExp.filter(e => {
    const d = getDay(parseISO(e.date));
    return d >= 1 && d <= 5;
  });
  const weekendDays = 8;
  const weekdayDays = 22;
  const avgWeekend = weekendDays > 0 ? sumAmount(weekendExp) / weekendDays : 0;
  const avgWeekday = weekdayDays > 0 ? sumAmount(weekdayExp) / weekdayDays : 0;
  if (avgWeekend > avgWeekday * 1.5) {
    insights.push({
      id: 'weekend-spike',
      type: 'warning',
      emoji: '📅',
      title: `Weekend spending is ${Math.round((avgWeekend / avgWeekday - 1) * 100)}% higher than weekdays`,
      description: `₹${Math.round(avgWeekend)}/day on weekends vs ₹${Math.round(avgWeekday)}/day on weekdays. Your weekends cost ₹${Math.round((avgWeekend - avgWeekday) * 8).toLocaleString('en-IN')} extra per month.`,
      value: `₹${Math.round(avgWeekend)}/day weekends`,
    });
  }

  // 4. Late-night ordering habit — UPGRADED
  const lateNight = monthExp.filter(e => {
    const h = getHours(parseISO(e.date));
    return h >= 23 || h < 3;
  });
  if (lateNight.length >= 3) {
    insights.push({
      id: 'late-night',
      type: 'warning',
      emoji: '🌙',
      title: `${lateNight.length} late-night orders — ₹${sumAmount(lateNight).toLocaleString('en-IN')} after 11PM`,
      description: `Late-night hunger orders are 30–50% pricier than daytime meals. Planning evening snacks could save ₹${Math.round(sumAmount(lateNight) * 0.3).toLocaleString('en-IN')}/month.`,
      value: `₹${sumAmount(lateNight).toLocaleString('en-IN')} at night`,
    });
  }

  // 5. Subscription stacking — UPGRADED
  const subs = monthExp.filter(e => e.category === 'Subscription');
  if (subs.length >= 3) {
    insights.push({
      id: 'sub-stack',
      type: 'warning',
      emoji: '📱',
      title: `${subs.length} subscriptions = ₹${sumAmount(subs).toLocaleString('en-IN')}/month bleeding silently`,
      description: `That's ₹${(sumAmount(subs) * 12).toLocaleString('en-IN')}/year. Canceling just one saves ₹${Math.round(sumAmount(subs) / subs.length).toLocaleString('en-IN')}/month.`,
      value: `₹${sumAmount(subs).toLocaleString('en-IN')}/month`,
    });
  }

  // 6. Daily food frequency — UPGRADED
  const today = new Date();
  const todayFood = expenses.filter(e => {
    const d = parseISO(e.date);
    return e.category === 'Food' &&
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth();
  });
  if (todayFood.length >= 3) {
    insights.push({
      id: 'food-freq',
      type: todayFood.length >= 4 ? 'danger' : 'warning',
      emoji: '🍔',
      title: `${todayFood.length} food orders today — ₹${sumAmount(todayFood).toLocaleString('en-IN')} already`,
      description: `That's more food spending in one day than most students do in 2–3 days. Try meal prepping to cut impulse orders.`,
      value: `₹${sumAmount(todayFood).toLocaleString('en-IN')} today`,
    });
  }

  // 7. Budget pace — UPGRADED
  const spentPct = totalSpent / user.monthlyBudget;
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const expectedPct = dayOfMonth / daysInMonth;

  if (spentPct > expectedPct + 0.2) {
    insights.push({
      id: 'budget-pace',
      type: 'danger',
      emoji: '🔥',
      title: `Spending ${Math.round((spentPct - expectedPct) * 100)}% ahead of schedule`,
      description: `You've burned ${Math.round(spentPct * 100)}% of your budget with only ${Math.round(expectedPct * 100)}% of the month gone. At this pace, you'll run out ${Math.round((spentPct - expectedPct) * daysInMonth)} days early.`,
      value: `${Math.round((spentPct - expectedPct) * 100)}% ahead of pace`,
    });
  } else if (spentPct < expectedPct - 0.1) {
    insights.push({
      id: 'budget-good',
      type: 'success',
      emoji: '✅',
      title: 'Spending ahead of schedule — in a good way!',
      description: `Only ${Math.round(spentPct * 100)}% used with ${Math.round(expectedPct * 100)}% of month elapsed. You're ₹${(user.monthlyBudget - totalSpent).toLocaleString('en-IN')} under your expected pace.`,
      value: `₹${(user.monthlyBudget - totalSpent).toLocaleString('en-IN')} left`,
    });
  }

  // 8. Impulse shopping — UPGRADED
  const shoppingWeek = weekExp.filter(e => e.category === 'Shopping');
  if (sumAmount(shoppingWeek) > 2000) {
    insights.push({
      id: 'impulse-shop',
      type: 'danger',
      emoji: '🛍️',
      title: `₹${sumAmount(shoppingWeek).toLocaleString('en-IN')} on shopping this week — unusually high`,
      description: `This week's shopping is ${Math.round(sumAmount(shoppingWeek) / 500)}x the average. Apply the 48-hour rule: wait 2 days before any non-essential purchase.`,
      value: `₹${sumAmount(shoppingWeek).toLocaleString('en-IN')} this week`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'all-good',
      type: 'success',
      emoji: '🎉',
      title: 'No major leaks detected!',
      description: 'Your spending looks balanced. Keep maintaining this pattern.',
    });
  }

  return insights;
}

// ─── Alerts ─────────────────────────────────────────────────────────────────

export function getAlerts(expenses: Expense[], userOverride?: import('./store').User): AlertCard[] {
  const alerts: AlertCard[] = [];
  const user = userOverride || getUser();
  const weekExp = thisWeekExpenses(expenses);
  const monthExp = thisMonthExpenses(expenses);
  const totalSpent = sumAmount(monthExp);
  const weekSpent = sumAmount(weekExp);
  const weekBudget = user.monthlyBudget / 4;
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Budget threshold alerts — UPGRADED: aggressive & specific
  const spentPct = totalSpent / user.monthlyBudget;
  if (spentPct >= 1) {
    alerts.push({ id: 'over-budget', level: 'critical', emoji: '🚨', message: `You've EXCEEDED your ₹${user.monthlyBudget.toLocaleString('en-IN')} budget by ₹${Math.abs(user.monthlyBudget - totalSpent).toLocaleString('en-IN')}! Stop spending immediately.` });
  } else if (spentPct >= 0.9) {
    alerts.push({ id: 'near-budget', level: 'critical', emoji: '🔴', message: `🚨 ${Math.round(spentPct * 100)}% of budget burned with ${dayOfMonth} days gone. Only ₹${(user.monthlyBudget - totalSpent).toLocaleString('en-IN')} left — that's ₹${Math.round((user.monthlyBudget - totalSpent) / Math.max(1, 30 - dayOfMonth))}/day!` });
  } else if (spentPct >= 0.7) {
    const daysGone = dayOfMonth;
    alerts.push({ id: 'warn-budget', level: 'warning', emoji: '⚠️', message: `You've burned ${Math.round(spentPct * 100)}% of your budget in just ${daysGone} days. At this rate, you'll run out before month-end.` });
  } else if (spentPct >= 0.5) {
    alerts.push({ id: 'half-budget', level: 'info', emoji: '💡', message: `Half your budget is gone. You have ₹${(user.monthlyBudget - totalSpent).toLocaleString('en-IN')} for the remaining ${30 - dayOfMonth} days — that's ₹${Math.round((user.monthlyBudget - totalSpent) / Math.max(1, 30 - dayOfMonth))}/day.` });
  }

  // Weekly budget — UPGRADED
  const weekPct = weekBudget > 0 ? weekSpent / weekBudget : 0;
  if (weekPct >= 1) {
    alerts.push({ id: 'week-budget', level: 'critical', emoji: '📅', message: `Weekly budget EXCEEDED! You've spent ₹${Math.round(weekSpent).toLocaleString('en-IN')} of ₹${Math.round(weekBudget).toLocaleString('en-IN')} allocated.` });
  } else if (weekPct >= 0.7) {
    alerts.push({ id: 'week-budget-warn', level: 'warning', emoji: '⚠️', message: `${Math.round(weekPct * 100)}% of weekly budget used — ₹${Math.round(weekBudget - weekSpent).toLocaleString('en-IN')} left for the rest of the week.` });
  }

  // Same category >3 times today — UPGRADED
  const categories: Category[] = ['Food', 'Travel', 'Shopping', 'Subscription', 'Others'];
  for (const cat of categories) {
    const todayCat = expenses.filter(e => {
      const d = parseISO(e.date);
      return e.category === cat &&
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth();
    });
    if (todayCat.length >= 3) {
      const emojis: Record<string, string> = { Food: '🍔', Travel: '🚗', Shopping: '🛍️', Subscription: '📱', Others: '📦' };
      alerts.push({ id: `freq-${cat}`, level: 'warning', emoji: emojis[cat], message: `${todayCat.length} ${cat.toLowerCase()} transactions today — that's ${Math.round(todayCat.length / 1.5)}x your normal daily rate!` });
    }
  }

  // Sudden spending spike — UPGRADED
  const last7Days = expenses.filter(e => parseISO(e.date) >= subDays7());
  const avg7Day = last7Days.length > 0 ? sumAmount(last7Days) / 7 : 0;
  const todayTotal = sumAmount(expenses.filter(e => {
    const d = parseISO(e.date);
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  }));
  if (todayTotal > avg7Day * 2 && todayTotal > 500) {
    alerts.push({ id: 'spike', level: 'warning', emoji: '📈', message: `Today's ₹${todayTotal.toLocaleString('en-IN')} is ${Math.round(todayTotal / avg7Day)}x your daily average (₹${Math.round(avg7Day)}). Slow down!` });
  }

  // Small transaction leak alert — UPGRADED
  const smallWeek = weekExp.filter(e => e.amount < 200);
  if (smallWeek.length > 5) {
    alerts.push({ id: 'small-txn', level: 'warning', emoji: '💸', message: `${smallWeek.length} micro-transactions under ₹200 = ₹${sumAmount(smallWeek).toLocaleString('en-IN')} this week. These "small" spends are your hidden money leak!` });
  }

  return alerts;
}

function subDays7() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

// ─── Prediction ─────────────────────────────────────────────────────────────

export function getPrediction(expenses: Expense[], userOverride?: import('./store').User): PredictionResult {
  const user = userOverride || getUser();
  const monthExp = getPastExpensesThisMonth(expenses);
  const totalSpent = sumAmount(monthExp);
  const dayOfMonth = new Date().getDate();
  const avgDailySpend = dayOfMonth > 0 ? totalSpent / dayOfMonth : totalSpent;
  const remainingBudget = user.monthlyBudget - totalSpent;
  const daysLeft = avgDailySpend > 0 ? Math.max(0, Math.floor(remainingBudget / avgDailySpend)) : 999;

  const runDate = new Date();
  runDate.setDate(runDate.getDate() + daysLeft);

  const monthlyProjection = Math.round(avgDailySpend * 30);
  const sixMonthProjection = monthlyProjection * 6;

  const riskLevel: 'safe' | 'warning' | 'critical' =
    daysLeft > 15 ? 'safe' : daysLeft > 7 ? 'warning' : 'critical';

  // Actionable advice
  let actionable = '';
  if (riskLevel === 'critical') {
    const neededReduction = Math.round(avgDailySpend - (remainingBudget / Math.max(1, 30 - dayOfMonth)));
    actionable = `Reduce daily spending by ₹${Math.max(0, neededReduction)} to make it through the month. Cut food orders and avoid impulse buys.`;
  } else if (riskLevel === 'warning') {
    const safeDaily = Math.round(remainingBudget / Math.max(1, 30 - dayOfMonth));
    actionable = `Keep spending under ₹${safeDaily}/day for the remaining ${30 - dayOfMonth} days to stay on budget.`;
  } else {
    actionable = `You're in good shape! At ₹${Math.round(avgDailySpend)}/day, you'll have ₹${Math.round(remainingBudget - avgDailySpend * (30 - dayOfMonth)).toLocaleString('en-IN')} left at month-end.`;
  }

  return {
    avgDailySpend: Math.round(avgDailySpend),
    daysLeft,
    runOutDate: format(runDate, 'dd MMM yyyy'),
    monthlyProjection,
    sixMonthProjection,
    riskLevel,
    actionable,
  };
}

// ─── Simulation ──────────────────────────────────────────────────────────────

export function simulate(category: Category, reductionPct: number, expenses: Expense[]): SimulationResult {
  const monthExp = thisMonthExpenses(expenses);
  const catExp = monthExp.filter(e => e.category === category);
  const currentMonthly = sumAmount(catExp);
  const savedMonthly = Math.round(currentMonthly * (reductionPct / 100));
  const savedWeekly = Math.round(savedMonthly / 4);
  return {
    category,
    reductionPct,
    currentMonthly,
    savedMonthly,
    savedWeekly,
    newMonthly: currentMonthly - savedMonthly,
  };
}

// ─── Daily Spend Chart ───────────────────────────────────────────────────────

export function getDailySpend(expenses: Expense[], days = 7): DailySpend[] {
  const result: DailySpend[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = format(date, 'EEE');
    const dayExpenses = expenses.filter(e => {
      const d = parseISO(e.date);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
    });
    const dow = getDay(date);
    result.push({
      day: dayStr,
      amount: sumAmount(dayExpenses),
      isWeekend: dow === 0 || dow === 6,
    });
  }
  return result;
}

// ─── Summary Stats ───────────────────────────────────────────────────────────

export function getSummaryStats(expenses: Expense[], userOverride?: import('./store').User) {
  const user = userOverride || getUser();
  const monthExp = thisMonthExpenses(expenses);
  const pastMonthExp = getPastExpensesThisMonth(expenses);
  const weekExp = thisWeekExpenses(expenses);
  const totalMonthly = sumAmount(monthExp);
  const totalPastMonthly = sumAmount(pastMonthExp);
  const totalWeekly = sumAmount(weekExp);
  const remaining = user.monthlyBudget - totalMonthly;
  const { score, grade } = getHealthScore(expenses, user);
  const dayOfMonth = new Date().getDate();
  const dailyAvg = dayOfMonth > 0 ? Math.round(totalPastMonthly / dayOfMonth) : 0;

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = daysInMonth - today.getDate();

  return {
    totalMonthly,
    totalWeekly,
    remaining,
    monthlyBudget: user.monthlyBudget,
    score,
    grade,
    spentPct: Math.min(100, Math.round((totalMonthly / user.monthlyBudget) * 100)),
    dailyAvg,
    daysLeftInMonth,
  };
}
