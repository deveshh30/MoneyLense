import { InsightCard } from '../data/analytics';
import { cn } from '../utils/cn';

const typeStyles = {
  danger:  { bg: 'glass', border: 'border-red-500/20', badge: 'bg-red-500/15 text-red-400', dot: 'bg-red-500' },
  warning: { bg: 'glass', border: 'border-yellow-500/20', badge: 'bg-yellow-500/15 text-yellow-400', dot: 'bg-yellow-500' },
  info:    { bg: 'glass', border: 'border-blue-500/20', badge: 'bg-blue-500/15 text-blue-400', dot: 'bg-blue-500' },
  success: { bg: 'glass', border: 'border-emerald-500/20', badge: 'bg-emerald-500/15 text-emerald-400', dot: 'bg-emerald-500' },
};

const typeLabels = {
  danger:  'Critical',
  warning: 'Warning',
  info:    'Info',
  success: 'Healthy',
};

interface Props {
  insight: InsightCard;
  animate?: boolean;
}

export default function InsightCardComponent({ insight, animate = true }: Props) {
  const s = typeStyles[insight.type];

  return (
    <div className={cn(
      'rounded-2xl border p-5 transition-all duration-300 card-hover',
      s.bg, s.border,
      animate && 'cursor-default'
    )}>
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 mt-0.5 animate-float" style={{ animationDuration: '3.5s' }}>{insight.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg', s.badge)}>
              {typeLabels[insight.type]}
            </span>
            {insight.value && (
              <span className="text-xs font-semibold text-white/70 bg-white/[0.06] px-2 py-0.5 rounded-lg">
                {insight.value}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug">{insight.title}</h3>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}
