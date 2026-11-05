// date-fns no longer needed — using native Date for seed data

export type Category = 'Food' | 'Travel' | 'Shopping' | 'Subscription' | 'Others';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  password: string;
  monthlyBudget: number;
  createdAt: string;
}

export interface User {
  name: string;
  email: string;
  monthlyBudget: number;
}

// Creates a date within the current month using day-of-month (1-28)
// This ensures seed data ALWAYS falls within the current month regardless of when you login
const makeDate = (dayOfMonth: number, hour: number, min = 0) => {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, hour, min, 0);
  return d.toISOString();
};

const SEED_EXPENSES: Expense[] = [
  // Day 1 - Multiple food orders (impulsive behavior)
  { id: 'e1',  amount: 180, category: 'Food',         description: 'Breakfast at canteen',          date: makeDate(1, 8) },
  { id: 'e2',  amount: 350, category: 'Food',         description: 'Zomato lunch order',            date: makeDate(1, 13) },
  { id: 'e3',  amount: 120, category: 'Food',         description: 'Evening snacks',                date: makeDate(1, 17) },
  { id: 'e4',  amount: 499, category: 'Food',         description: 'Swiggy late-night dinner',      date: makeDate(1, 23) },
  // Day 3 - Mixed spending
  { id: 'e5',  amount: 150, category: 'Food',         description: 'Tea & samosa',                  date: makeDate(3, 9) },
  { id: 'e6',  amount: 80,  category: 'Others',       description: 'Pen & notebook',                date: makeDate(3, 11) },
  { id: 'e7',  amount: 990, category: 'Shopping',     description: 'Amazon – earphones',            date: makeDate(3, 14) },
  { id: 'e8',  amount: 60,  category: 'Food',         description: 'Biscuits from store',           date: makeDate(3, 19) },
  { id: 'e9',  amount: 250, category: 'Food',         description: 'Midnight Maggi order',          date: makeDate(3, 1) },
  // Day 5 - Subscriptions + Travel
  { id: 'e10', amount: 199, category: 'Subscription', description: 'Spotify Premium',               date: makeDate(5, 10) },
  { id: 'e11', amount: 300, category: 'Travel',       description: 'Ola cab to college',            date: makeDate(5, 8) },
  { id: 'e12', amount: 450, category: 'Food',         description: 'Restaurant dinner',             date: makeDate(5, 20) },
  { id: 'e13', amount: 100, category: 'Others',       description: 'Printing notes',                date: makeDate(5, 14) },
  // Day 7 - Weekend spending spike
  { id: 'e14', amount: 1200, category: 'Shopping',    description: 'Weekend mall shopping',         date: makeDate(7, 15) },
  { id: 'e15', amount: 600,  category: 'Food',        description: 'Pizza with friends',            date: makeDate(7, 19) },
  { id: 'e16', amount: 400,  category: 'Travel',      description: 'Rapido shared cab',             date: makeDate(7, 13) },
  { id: 'e17', amount: 180,  category: 'Food',        description: 'Cold coffee & fries',           date: makeDate(7, 16) },
  { id: 'e18', amount: 90,   category: 'Food',        description: 'Ice cream',                     date: makeDate(7, 21) },
  // Day 9 - More subscriptions + shopping
  { id: 'e19', amount: 800,  category: 'Food',        description: 'Brunch buffet',                 date: makeDate(9, 11) },
  { id: 'e20', amount: 149, category: 'Subscription',description: 'YouTube Premium',               date: makeDate(9, 9) },
  { id: 'e21', amount: 500,  category: 'Shopping',    description: 'New T-shirt',                   date: makeDate(9, 17) },
  { id: 'e22', amount: 75,   category: 'Others',      description: 'Parking fee',                   date: makeDate(9, 12) },
  // Day 11 - Travel + small expenses
  { id: 'e23', amount: 250,  category: 'Food',        description: 'Lunch',                         date: makeDate(11, 13) },
  { id: 'e24', amount: 150,  category: 'Travel',      description: 'Metro card recharge',           date: makeDate(11, 8) },
  { id: 'e25', amount: 99,   category: 'Others',      description: 'Stationery',                    date: makeDate(11, 10) },
  // Day 13 - Weekend again
  { id: 'e26', amount: 340,  category: 'Food',        description: 'Dinner delivery',               date: makeDate(13, 21) },
  { id: 'e27', amount: 130,  category: 'Food',        description: 'Morning chai + snacks',         date: makeDate(13, 7) },
  { id: 'e28', amount: 499,  category: 'Subscription',description: 'Netflix monthly',               date: makeDate(13, 11) },
  // Day 15 - Small frequent leaks
  { id: 'e29', amount: 55,   category: 'Food',        description: 'Vending machine chips',         date: makeDate(15, 15) },
  { id: 'e30', amount: 85,   category: 'Food',        description: 'Campus canteen',                date: makeDate(15, 12) },
  { id: 'e31', amount: 40,   category: 'Others',      description: 'Photocopy',                     date: makeDate(15, 10) },
  // Day 17 - Big purchases
  { id: 'e32', amount: 1500, category: 'Shopping',    description: 'Sneakers online',               date: makeDate(17, 14) },
  { id: 'e33', amount: 200,  category: 'Travel',      description: 'Weekend trip fuel',             date: makeDate(17, 9) },
  { id: 'e34', amount: 350,  category: 'Food',        description: 'Biryani order',                 date: makeDate(17, 20) },
  // Day 19 - More subscriptions
  { id: 'e35', amount: 179,  category: 'Subscription',description: 'Amazon Prime',                  date: makeDate(19, 8) },
  { id: 'e36', amount: 120,  category: 'Food',        description: 'Late night noodles',            date: makeDate(19, 0) },
];

const DEMO_ACCOUNT_ID = 'demo-account-1';

const STORAGE_KEY_ACCOUNTS = 'moneylens_accounts';
const STORAGE_KEY_CURRENT_USER_ID = 'moneylens_current_user_id';

const DEFAULT_ACCOUNT: Account = {
  id: DEMO_ACCOUNT_ID,
  name: 'Alex Student',
  email: 'alex@university.edu',
  password: 'demo123',
  monthlyBudget: 8000,
  createdAt: new Date().toISOString(),
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

// Per-user expense key
function expenseKey(userId: string): string {
  return `moneylens_expenses_${userId}`;
}

// ============ AUTH FUNCTIONS ============

export function getAccounts(): Account[] {
  const accounts = loadFromStorage<Account[] | null>(STORAGE_KEY_ACCOUNTS, null);
  if (accounts === null) {
    saveToStorage(STORAGE_KEY_ACCOUNTS, [DEFAULT_ACCOUNT]);
    return [DEFAULT_ACCOUNT];
  }
  // Ensure demo account always exists
  if (!accounts.some(a => a.id === DEMO_ACCOUNT_ID)) {
    accounts.unshift(DEFAULT_ACCOUNT);
    saveToStorage(STORAGE_KEY_ACCOUNTS, accounts);
  }
  return accounts;
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);
}

export function setCurrentUserId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, id);
    const account = getAccounts().find(a => a.id === id);
    if (account) {
      window.dispatchEvent(new CustomEvent('moneylens:userUpdated', {
        detail: { name: account.name, email: account.email, monthlyBudget: account.monthlyBudget }
      }));
    }
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER_ID);
  }
}

export function register(name: string, email: string, password: string, monthlyBudget: number): { success: boolean; error?: string; account?: Account } {
  const accounts = getAccounts();

  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  if (monthlyBudget < 1000) {
    return { success: false, error: 'Monthly budget must be at least ₹1,000' };
  }

  const newAccount: Account = {
    id: `acc-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    monthlyBudget,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveToStorage(STORAGE_KEY_ACCOUNTS, accounts);
  setCurrentUserId(newAccount.id);

  // Fresh account = NO seed expenses. Empty array only.
  saveToStorage<Expense[]>(expenseKey(newAccount.id), []);

  return { success: true, account: newAccount };
}

export function login(email: string, password: string): { success: boolean; error?: string; account?: Account } {
  const accounts = getAccounts();
  const account = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

  if (!account) {
    return { success: false, error: 'No account found with this email' };
  }

  if (account.password !== password) {
    return { success: false, error: 'Incorrect password' };
  }

  setCurrentUserId(account.id);

  // Re-seed demo data on every login so dates are always fresh for current month
  if (account.id === DEMO_ACCOUNT_ID) {
    saveToStorage(expenseKey(account.id), SEED_EXPENSES);
  }

  return { success: true, account };
}

export function logout(): void {
  setCurrentUserId(null);
}

export function isAuthenticated(): boolean {
  return getCurrentUserId() !== null;
}

export function getCurrentAccount(): Account | null {
  const id = getCurrentUserId();
  if (!id) return null;
  return getAccounts().find(a => a.id === id) || null;
}

// ============ USER PROFILE ============

export function getUser(): User {
  const account = getCurrentAccount();
  if (account) {
    return {
      name: account.name,
      email: account.email,
      monthlyBudget: account.monthlyBudget,
    };
  }
  return { name: '', email: '', monthlyBudget: 0 };
}

export function saveUser(user: User): void {
  const accountId = getCurrentUserId();
  if (accountId) {
    const accounts = getAccounts();
    const idx = accounts.findIndex(a => a.id === accountId);
    if (idx !== -1) {
      accounts[idx] = {
        ...accounts[idx],
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
      };
      saveToStorage(STORAGE_KEY_ACCOUNTS, accounts);
    }
  }
  // Dispatch event with fresh data so ALL listeners (Dashboard, Layout, etc.) update
  window.dispatchEvent(new CustomEvent('moneylens:userUpdated', {
    detail: { name: user.name, email: user.email, monthlyBudget: user.monthlyBudget }
  }));
}

// ============ EXPENSES (per-user) ============

export function getExpenses(): Expense[] {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const key = expenseKey(userId);
  const stored = loadFromStorage<Expense[] | null>(key, null);

  if (stored === null) {
    // First time for this user — seed only if demo account
    if (userId === DEMO_ACCOUNT_ID) {
      saveToStorage(key, SEED_EXPENSES);
      return [...SEED_EXPENSES];
    }
    // Fresh user: empty array
    saveToStorage<Expense[]>(key, []);
    return [];
  }

  return stored;
}

export function addExpense(expense: Omit<Expense, 'id'>): Expense {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Not logged in');

  const expenses = getExpenses();
  const newExpense: Expense = { ...expense, id: `e${Date.now()}` };
  expenses.unshift(newExpense);
  saveToStorage(expenseKey(userId), expenses);
  window.dispatchEvent(new CustomEvent('moneylens:expensesUpdated', { detail: expenses }));
  return newExpense;
}

export function deleteExpense(id: string): void {
  const userId = getCurrentUserId();
  if (!userId) return;

  const expenses = getExpenses().filter(e => e.id !== id);
  saveToStorage(expenseKey(userId), expenses);
  window.dispatchEvent(new CustomEvent('moneylens:expensesUpdated', { detail: expenses }));
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Food:         '#ef4444',
  Travel:       '#3b82f6',
  Shopping:     '#a855f7',
  Subscription: '#f59e0b',
  Others:       '#6b7280',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  Food:         '🍔',
  Travel:       '🚗',
  Shopping:     '🛍️',
  Subscription: '📱',
  Others:       '📦',
};

// ============ SUGGESTION PROGRESS ============

export interface SuggestionProgress {
  suggestionId: string;
  markedDone: boolean;
  markedAt: string;
  challengeActive: boolean;
  challengeStartedAt: string;
  challengeDays: number;
}

export function getSuggestionProgress(): SuggestionProgress[] {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const data = localStorage.getItem(`moneylens_suggestions_${userId}`);
  return data ? JSON.parse(data) : [];
}

export function saveSuggestionProgress(progress: SuggestionProgress[]) {
  const userId = getCurrentUserId();
  if (!userId) return;
  localStorage.setItem(`moneylens_suggestions_${userId}`, JSON.stringify(progress));
}

export function markSuggestionDone(suggestionId: string) {
  const progress = getSuggestionProgress();
  const existing = progress.find(p => p.suggestionId === suggestionId);
  if (existing) {
    existing.markedDone = true;
    existing.markedAt = new Date().toISOString();
  } else {
    progress.push({
      suggestionId,
      markedDone: true,
      markedAt: new Date().toISOString(),
      challengeActive: false,
      challengeStartedAt: '',
      challengeDays: 0,
    });
  }
  saveSuggestionProgress(progress);
  window.dispatchEvent(new CustomEvent('moneylens:suggestionUpdated', { detail: progress }));
}

export function unmarkSuggestionDone(suggestionId: string) {
  const progress = getSuggestionProgress();
  const existing = progress.find(p => p.suggestionId === suggestionId);
  if (existing) {
    existing.markedDone = false;
    existing.markedAt = '';
  }
  saveSuggestionProgress(progress);
  window.dispatchEvent(new CustomEvent('moneylens:suggestionUpdated', { detail: progress }));
}

export function toggleChallenge(suggestionId: string, days = 3) {
  const progress = getSuggestionProgress();
  const existing = progress.find(p => p.suggestionId === suggestionId);
  if (existing) {
    if (existing.challengeActive) {
      existing.challengeActive = false;
      existing.challengeStartedAt = '';
      existing.challengeDays = 0;
    } else {
      existing.challengeActive = true;
      existing.challengeStartedAt = new Date().toISOString();
      existing.challengeDays = days;
    }
  } else {
    progress.push({
      suggestionId,
      markedDone: false,
      markedAt: '',
      challengeActive: true,
      challengeStartedAt: new Date().toISOString(),
      challengeDays: days,
    });
  }
  saveSuggestionProgress(progress);
  window.dispatchEvent(new CustomEvent('moneylens:suggestionUpdated', { detail: progress }));
}

export function getChallengeProgress(suggestionId: string): { active: boolean; daysLeft: number; started: boolean } {
  const progress = getSuggestionProgress();
  const existing = progress.find(p => p.suggestionId === suggestionId);
  if (!existing || !existing.challengeActive || !existing.challengeStartedAt) {
    return { active: false, daysLeft: 0, started: false };
  }
  const start = new Date(existing.challengeStartedAt);
  const now = new Date();
  const daysElapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, existing.challengeDays - daysElapsed);
  return { active: true, daysLeft, started: true };
}

export function getDoneCount(): number {
  return getSuggestionProgress().filter(p => p.markedDone).length;
}

export function getActiveChallenges(): number {
  return getSuggestionProgress().filter(p => p.challengeActive).length;
}

export function getTotalPotentialSavings(expenses: Expense[]): number {
  const { getSuggestions } = require('./analytics');
  const suggestions = getSuggestions(expenses);
  const progress = getSuggestionProgress();
  let total = 0;
  for (const s of suggestions) {
    const p = progress.find(prog => prog.suggestionId === s.id);
    if (!p?.markedDone) {
      const savingsMatch = s.savings.match(/₹([\d,]+)/);
      if (savingsMatch) {
        total += parseInt(savingsMatch[1].replace(/,/g, ''), 10);
      }
    }
  }
  return total;
}
