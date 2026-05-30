import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  grain?: boolean;
}

export default function Card({
  children,
  className,
  hover = false,
  grain = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-border/60 shadow-sm',
        hover && 'card-hover',
        grain && 'grain',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-6 py-5 border-b border-border/40',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('px-6 py-5', className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-border/40 bg-cream-warm/50 rounded-b-2xl',
        className
      )}
    >
      {children}
    </div>
  );
}
