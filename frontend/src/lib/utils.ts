import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
  dot: string;
} {
  const statusMap: Record<
    string,
    { bg: string; text: string; dot: string }
  > = {
    scheduled: {
      bg: 'bg-sky/10',
      text: 'text-sky',
      dot: 'bg-sky',
    },
    confirmed: {
      bg: 'bg-emerald/10',
      text: 'text-emerald',
      dot: 'bg-emerald',
    },
    completed: {
      bg: 'bg-emerald-deep/10',
      text: 'text-emerald-deep',
      dot: 'bg-emerald-deep',
    },
    cancelled: {
      bg: 'bg-rose/10',
      text: 'text-rose',
      dot: 'bg-rose',
    },
    no_show: {
      bg: 'bg-amber/10',
      text: 'text-amber',
      dot: 'bg-amber',
    },
    pending: {
      bg: 'bg-amber/10',
      text: 'text-amber',
      dot: 'bg-amber',
    },
    paid: {
      bg: 'bg-emerald/10',
      text: 'text-emerald',
      dot: 'bg-emerald',
    },
    waived: {
      bg: 'bg-violet/10',
      text: 'text-violet',
      dot: 'bg-violet',
    },
    in_progress: {
      bg: 'bg-sky/10',
      text: 'text-sky',
      dot: 'bg-sky',
    },
    booked: {
      bg: 'bg-silver/15',
      text: 'text-slate-soft',
      dot: 'bg-slate-soft',
    },
    arrived: {
      bg: 'bg-violet/10',
      text: 'text-violet',
      dot: 'bg-violet',
    },
  };
  return (
    statusMap[status] || {
      bg: 'bg-silver/20',
      text: 'text-slate-muted',
      dot: 'bg-slate-muted',
    }
  );
}

export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
