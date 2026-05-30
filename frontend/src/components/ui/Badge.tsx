import { cn, getStatusColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-silver/15 text-slate-soft',
    success: 'bg-emerald/10 text-emerald-deep',
    warning: 'bg-amber/10 text-amber',
    danger: 'bg-rose/10 text-rose',
    info: 'bg-sky/10 text-sky',
    purple: 'bg-violet/10 text-violet',
  };

  const dotColors = {
    default: 'bg-slate-soft',
    success: 'bg-emerald',
    warning: 'bg-amber',
    danger: 'bg-rose',
    info: 'bg-sky',
    purple: 'bg-violet',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        {
          'px-2 py-0.5 text-[11px]': size === 'sm',
          'px-3 py-1 text-xs': size === 'md',
        },
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors = getStatusColor(status);
  const label = status.replace(/_/g, ' ');
  return (
    <Badge
      variant={
        status === 'completed' || status === 'paid'
          ? 'success'
          : status === 'cancelled'
            ? 'danger'
            : status === 'pending' || status === 'no_show'
              ? 'warning'
              : status === 'in_progress' || status === 'confirmed'
                ? 'info'
                : 'default'
      }
      dot
    >
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Badge>
  );
}
