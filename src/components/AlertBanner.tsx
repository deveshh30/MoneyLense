import { AlertCard } from '../data/analytics';
import { cn } from '../utils/cn';

const levelStyles = {
  critical: 'glass border-red-500/20 text-red-300',
  warning:  'glass border-yellow-500/20 text-yellow-300',
  info:     'glass border-blue-500/20 text-blue-300',
};

const glowClasses = {
  critical: 'animate-pulse-glow-red',
  warning:  'animate-pulse-glow-yellow',
  info:     '',
};

export default function AlertBanner({ alert }: { alert: AlertCard }) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium card-hover',
      levelStyles[alert.level],
      glowClasses[alert.level]
    )}>
      <span className="text-xl flex-shrink-0 animate-float" style={{ animationDuration: '3s' }}>{alert.emoji}</span>
      <span>{alert.message}</span>
    </div>
  );
}
