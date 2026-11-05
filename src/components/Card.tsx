import { cn } from '../utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  glow?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'none';
  delay?: number;
  noHover?: boolean;
}

export default function Card({ className, children, glow = 'none', delay = 0, noHover = false }: CardProps) {
  const glowMap = {
    green:  'shadow-emerald-900/20 border-emerald-500/20',
    red:    'shadow-red-900/20 border-red-500/20',
    yellow: 'shadow-yellow-900/20 border-yellow-500/20',
    blue:   'shadow-blue-900/20 border-blue-500/20',
    purple: 'shadow-purple-900/20 border-purple-500/20',
    none:   'border-white/[0.06]',
  };

  const hoverClass = noHover ? '' : 'card-hover';
  const delayClass = delay > 0 ? `stagger-${Math.min(delay, 8)}` : '';

  return (
    <div className={cn(
      'glass rounded-2xl p-5 shadow-lg glass-shimmer',
      glowMap[glow],
      hoverClass,
      delayClass,
      'animate-fade-in-up',
      className
    )}>
      {children}
    </div>
  );
}
