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
        'rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-[#1e2737] p-5 shadow-sm card-hover grain',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-muted dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-obsidian dark:text-gray-100 font-display tracking-tight">
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
                {trend.isPositive ? '\u2191' : '\u2193'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-silver dark:text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-cream dark:bg-white/5 text-emerald-deep">
          {icon}
        </div>
      </div>
    </div>
  );
}
