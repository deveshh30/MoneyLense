import { useState, useEffect, useMemo } from 'react';
import { 
  getExpenses, 
  getUser, 
  getSuggestionProgress,
  markSuggestionDone, 
  unmarkSuggestionDone,
  toggleChallenge,
  getChallengeProgress,
  getDoneCount,
  getActiveChallenges,
} from '../data/store';
import { getSuggestions } from '../data/analytics';
import Card from './Card';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Trophy, 
  ArrowLeft, 
  Zap, 
  Target,
  TrendingUp,
  Clock,
  X,
  Award,
  Undo2,
} from 'lucide-react';

interface FixThisPanelProps {
  onClose: () => void;
}

export default function FixThisPanel({ onClose }: FixThisPanelProps) {
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [_user] = useState(() => getUser());
  const [progress, setProgress] = useState(() => getSuggestionProgress());
  const [activeTab, setActiveTab] = useState<'suggestions' | 'challenges' | 'progress'>('suggestions');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProgress(getSuggestionProgress());
      setExpenses(getExpenses());
    };
    window.addEventListener('moneylens:suggestionUpdated', handleUpdate as EventListener);
    window.addEventListener('moneylens:expensesUpdated', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('moneylens:suggestionUpdated', handleUpdate as EventListener);
      window.removeEventListener('moneylens:expensesUpdated', handleUpdate as EventListener);
    };
  }, []);

  const suggestions = useMemo(() => getSuggestions(expenses), [expenses]);

  const doneCount = getDoneCount();
  const activeChallenges = getActiveChallenges();
  
  // Calculate total potential savings
  const totalPotentialSavings = useMemo(() => {
    return suggestions.reduce((total, s) => {
      const p = progress.find(prog => prog.suggestionId === s.id);
      if (!p?.markedDone) {
        const savingsMatch = s.savings.match(/₹([\d,]+)/);
        if (savingsMatch) {
          total += parseInt(savingsMatch[1].replace(/,/g, ''), 10);
        }
      }
      return total;
    }, 0);
  }, [suggestions, progress]);

  // Calculate actual savings from completed suggestions
  const actualSavings = useMemo(() => {
    return suggestions.reduce((total, s) => {
      const p = progress.find(prog => prog.suggestionId === s.id);
      if (p?.markedDone) {
        const savingsMatch = s.savings.match(/₹([\d,]+)/);
        if (savingsMatch) {
          total += parseInt(savingsMatch[1].replace(/,/g, ''), 10);
        }
      }
      return total;
    }, 0);
  }, [suggestions, progress]);

  const handleMarkDone = (id: string) => {
    const p = progress.find(prog => prog.suggestionId === id);
    if (p?.markedDone) {
      unmarkSuggestionDone(id);
    } else {
      markSuggestionDone(id);
      setShowSuccess(id);
      setTimeout(() => setShowSuccess(null), 2000);
    }
    setProgress(getSuggestionProgress());
  };

  const handleToggleChallenge = (id: string) => {
    toggleChallenge(id);
    setProgress(getSuggestionProgress());
  };

  const completionRate = suggestions.length > 0 ? Math.round((doneCount / suggestions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-hidden glass-strong rounded-t-3xl sm:rounded-3xl border border-white/[0.08] shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-strong border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl glass hover:bg-white/[0.08] flex items-center justify-center transition-all"
              >
                <ArrowLeft size={16} className="text-gray-400" />
              </button>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Zap className="text-yellow-400" size={20} />
                  Fix This
                </h2>
                <p className="text-xs text-gray-500">Actionable steps to improve your spending</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl glass hover:bg-white/[0.08] flex items-center justify-center transition-all"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 glass rounded-xl">
            {[
              { id: 'suggestions' as const, label: 'Suggestions', icon: LightbulbIcon },
              { id: 'challenges' as const, label: 'Challenges', icon: Flame },
              { id: 'progress' as const, label: 'Progress', icon: Trophy },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === 'challenges' && activeChallenges > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                    {activeChallenges}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {/* Savings Summary */}
              <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Potential Monthly Savings</p>
                    <p className="text-2xl font-black text-emerald-400">₹{totalPotentialSavings.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {doneCount} of {suggestions.length} actions completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                      <TrendingUp size={24} className="text-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 bg-gray-800/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </Card>

              {/* Suggestions List */}
              {suggestions.length === 0 ? (
                <Card className="text-center py-8">
                  <div className="text-4xl mb-3 animate-float">✨</div>
                  <p className="text-gray-400 text-sm">No suggestions right now. Your spending looks good!</p>
                </Card>
              ) : (
                suggestions.map((s, i) => {
                  const isDone = progress.find(p => p.suggestionId === s.id)?.markedDone;
                  const challenge = getChallengeProgress(s.id);
                  const savingsMatch = s.savings.match(/₹([\d,]+)/);
                  const savingsAmount = savingsMatch ? parseInt(savingsMatch[1].replace(/,/g, ''), 10) : 0;

                  return (
                    <Card 
                      key={s.id} 
                      delay={i + 1}
                      className={`transition-all duration-300 ${
                        isDone ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : 'border-white/[0.06]'
                      } ${showSuccess === s.id ? 'animate-bounce-in' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isDone ? 'bg-emerald-500/20' : 'bg-white/[0.05]'
                        }`}>
                          <span className="text-lg">{s.emoji}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`text-sm font-bold ${isDone ? 'text-emerald-400 line-through' : 'text-white'}`}>
                                {s.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                            </div>
                            <button
                              onClick={() => handleMarkDone(s.id)}
                              title={isDone ? 'Click to undo' : 'Mark as done'}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                                isDone 
                                  ? 'bg-emerald-500 text-white hover:bg-amber-500 hover:scale-110' 
                                  : 'glass hover:bg-emerald-500/20 text-gray-500 hover:text-emerald-400'
                              }`}
                            >
                              {isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </button>
                          </div>

                          {/* Savings Badge */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                              💰 Save ₹{savingsAmount.toLocaleString('en-IN')}/month
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                              s.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-300' :
                              s.difficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-300' :
                              'bg-red-500/15 text-red-300'
                            }`}>
                              {s.difficulty}
                            </span>
                          </div>

                          {/* Challenge Button */}
                          <button
                            onClick={() => handleToggleChallenge(s.id)}
                            className={`mt-2 flex items-center gap-1.5 text-xs font-semibold transition-all ${
                              challenge.active 
                                ? 'text-orange-400 hover:text-orange-300' 
                                : 'text-gray-500 hover:text-orange-400'
                            }`}
                          >
                            <Flame size={14} className={challenge.active ? 'animate-pulse' : ''} />
                            {challenge.active ? `Challenge Active (${challenge.daysLeft}d left)` : 'Start Challenge'}
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {/* Active Challenges */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Flame className="text-orange-400" size={16} />
                  Active Challenges
                </h3>
                {suggestions.filter(s => {
                  const challenge = getChallengeProgress(s.id);
                  return challenge.active;
                }).length === 0 ? (
                  <Card className="text-center py-6">
                    <div className="text-3xl mb-2 animate-float">🔥</div>
                    <p className="text-gray-400 text-sm">No active challenges</p>
                    <p className="text-gray-600 text-xs mt-1">Start a challenge from the Suggestions tab</p>
                  </Card>
                ) : (
                  suggestions.filter(s => {
                    const challenge = getChallengeProgress(s.id);
                    return challenge.active;
                  }).map((s, i) => {
                    const challenge = getChallengeProgress(s.id);
                    return (
                      <Card key={s.id} delay={i + 1} className="border-orange-500/20 bg-orange-500/[0.03]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <Flame size={20} className="text-orange-400 animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">{s.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 bg-gray-800/60 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
                                style={{ width: `${((3) - challenge.daysLeft) / 3 * 100}%` }}
                              />
                              </div>
                              <span className="text-xs font-bold text-orange-400">{challenge.daysLeft}d left</span>
                            </div>
                            <button
                              onClick={() => handleToggleChallenge(s.id)}
                              className="mt-2 text-xs text-gray-500 hover:text-red-400 transition-colors"
                            >
                              End Challenge
                            </button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Available Challenges */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Target className="text-purple-400" size={16} />
                  Available Challenges
                </h3>
                {suggestions.filter(s => {
                  const challenge = getChallengeProgress(s.id);
                  return !challenge.active;
                }).length === 0 ? (
                  <Card className="text-center py-6">
                    <p className="text-gray-400 text-sm">All challenges are active!</p>
                  </Card>
                ) : (
                  suggestions.filter(s => {
                    const challenge = getChallengeProgress(s.id);
                    return !challenge.active;
                  }).map((s, i) => (
                    <Card key={s.id} delay={i + 1}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{s.emoji}</span>
                          <div>
                            <h4 className="text-sm font-bold text-white">{s.title}</h4>
                            <p className="text-xs text-gray-500">{s.savings}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggleChallenge(s.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-xs font-bold text-white hover:scale-105 transition-all"
                        >
                          Start
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4">
              {/* Progress Overview */}
              <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-400">{doneCount}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-orange-400">{activeChallenges}</p>
                    <p className="text-xs text-gray-500">Active Challenges</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-blue-400">₹{actualSavings.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">Saved/Month</p>
                  </div>
                </div>
              </Card>

              {/* Completion Rate */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Completion Rate</h3>
                  <span className="text-sm font-bold text-emerald-400">{completionRate}%</span>
                </div>
                <div className="bg-gray-800/60 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {doneCount} of {suggestions.length} suggestions completed
                </p>
              </Card>

              {/* Completed Suggestions */}
              {doneCount > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Award className="text-yellow-400" size={16} />
                    Completed Actions
                  </h3>
                  {suggestions.filter(s => progress.find(p => p.suggestionId === s.id)?.markedDone).map((s, i) => (
                    <Card key={s.id} delay={i + 1} className="border-emerald-500/20 bg-emerald-500/[0.03]">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-emerald-400">{s.title}</h4>
                          <p className="text-xs text-gray-500">{s.savings}</p>
                        </div>
                        <button
                          onClick={() => {
                            unmarkSuggestionDone(s.id);
                            setProgress(getSuggestionProgress());
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                          title="Undo — mark as not done"
                        >
                          <Undo2 size={14} />
                          <span className="hidden sm:inline">Undo</span>
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Remaining Suggestions */}
              {suggestions.length > doneCount && (
                <div>
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Clock className="text-gray-400" size={16} />
                    Remaining Actions
                  </h3>
                  {suggestions.filter(s => !progress.find(p => p.suggestionId === s.id)?.markedDone).map((s, i) => (
                    <Card key={s.id} delay={i + 1}>
                      <div className="flex items-center gap-3">
                        <Circle size={20} className="text-gray-500 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white">{s.title}</h4>
                          <p className="text-xs text-gray-500">{s.savings}</p>
                        </div>
                        <button
                          onClick={() => handleMarkDone(s.id)}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 transition-all"
                        >
                          Mark Done
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LightbulbIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}
