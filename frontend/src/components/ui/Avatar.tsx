import { cn, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colors = [
  'bg-emerald/15 text-emerald-deep',
  'bg-sky/15 text-sky',
  'bg-violet/15 text-violet',
  'bg-amber/15 text-amber',
  'bg-rose/15 text-rose',
  'bg-emerald-deep/15 text-emerald-deep',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({
  name,
  src,
  size = 'md',
  className,
}: AvatarProps) {
  const initials = getInitials(name);
  const colorClass = getColor(name);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-semibold shrink-0',
        sizeMap[size],
        !src && colorClass,
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
