import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      <div className="p-4 rounded-2xl bg-cream mb-4 text-slate-muted">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-obsidian font-display mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
