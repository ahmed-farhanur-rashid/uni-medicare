import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-border/60 p-5 shadow-sm card-hover grain',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-muted">{title}</p>
          <p className="text-2xl font-bold text-obsidian font-display tracking-tight">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-semibold',
                  trend.isPositive ? 'text-emerald' : 'text-rose'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-silver">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-cream text-emerald-deep">
          {icon}
        </div>
      </div>
    </div>
  );
}
