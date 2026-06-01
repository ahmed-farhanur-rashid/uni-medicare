'use client';

import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '@/store/theme';
import { cn } from '@/lib/utils';

interface ConfirmPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export default function ConfirmPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Enter your admin password to continue.',
  isLoading = false,
}: ConfirmPasswordModalProps) {
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onConfirm(password);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-obsidian/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#1e2737]">
          <h2 className="text-lg font-semibold text-obsidian dark:text-gray-100 font-display">{title}</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-sm text-slate-muted dark:text-gray-400">{description}</p>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#1e2737] bg-white dark:bg-white/5 px-4 text-sm text-obsidian dark:text-gray-100 placeholder:text-silver dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald/30 focus:border-emerald"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-soft dark:text-gray-400 hover:text-obsidian dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isLoading}
              className="px-4 py-2 text-sm font-medium bg-emerald text-white rounded-xl hover:bg-emerald-deep disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isLoading ? 'Confirming...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
