'use client';

import { cn } from '@/lib/utils';

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-mid dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-[#1e2737] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald/30 bg-white dark:bg-white/5 text-obsidian dark:text-gray-100"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
