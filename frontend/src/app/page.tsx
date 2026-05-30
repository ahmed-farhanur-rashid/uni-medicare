'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, getDashboardPath } from '@/store/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, role, loadFromStorage, clearError } =
    useAuthStore();
  const [eId, setEId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isAuthenticated && role) {
      router.push(getDashboardPath(role));
    }
  }, [isAuthenticated, role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericEid = parseInt(eId, 10);
    if (isNaN(numericEid)) return;
    const success = await login(numericEid, password);
    if (success) {
      const currentRole = useAuthStore.getState().role;
      if (currentRole) {
        router.push(getDashboardPath(currentRole));
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden mesh-gradient-dark">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald/10 blur-3xl animate-float" />
          <div
            className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-violet/10 blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-2/3 left-1/3 w-32 h-32 rounded-full bg-sky/10 blur-3xl animate-float"
            style={{ animationDelay: '2s' }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald/20 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-emerald-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-white font-display tracking-wide">
                Uni Medicare
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white font-display leading-tight mb-6">
              Healthcare
              <br />
              <span className="text-emerald-light">reimagined</span> for
              <br />
              university life.
            </h1>

            <p className="text-lg text-silver/80 max-w-md leading-relaxed">
              Seamless appointment booking, digital prescriptions, lab results,
              and billing — all in one elegant platform.
            </p>

            {/* Decorative line */}
            <div className="mt-12 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-emerald/40 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-emerald/40" />
              <div className="h-px w-16 bg-gradient-to-r from-emerald/40 to-transparent" />
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { label: 'Students', value: '20+' },
                { label: 'Doctors', value: '5+' },
                { label: 'Departments', value: '5' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <p className="text-2xl font-bold text-white font-display">
                    {stat.value}
                  </p>
                  <p className="text-xs text-silver/60 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 mesh-gradient-1">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 animate-fade-in-down">
            <div className="w-10 h-10 rounded-xl bg-emerald flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-obsidian font-display">
              Uni Medicare
            </span>
          </div>

          <div className="animate-fade-in-up stagger-1">
            <h2 className="text-3xl font-bold text-obsidian font-display mb-2">
              Welcome back
            </h2>
            <p className="text-slate-muted mb-8">
              Sign in to access your medical portal
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-fade-in-up stagger-2"
          >
            {error && (
              <div className="p-4 rounded-xl bg-rose/5 border border-rose/20 text-rose text-sm flex items-center gap-3 animate-scale-in">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
                <button
                  type="button"
                  onClick={clearError}
                  className="ml-auto p-1 rounded-lg hover:bg-rose/10"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            <Input
              label="Employee / Student ID"
              type="number"
              placeholder="Enter your ID"
              value={eId}
              onChange={(e) => setEId(e.target.value)}
              required
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-silver hover:text-slate-soft transition-colors"
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-emerald-deep hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              isLoading={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center animate-fade-in-up stagger-3">
            <p className="text-sm text-slate-muted">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-emerald-deep font-medium hover:underline">
                Create one here
              </Link>
            </p>
          </div>

          <div className="mt-8 animate-fade-in-up stagger-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-cream-warm px-3 text-silver">
                  Test credentials
                </span>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-white/60 border border-border/40 text-xs text-slate-muted space-y-1.5">
              <p>
                <span className="font-semibold text-obsidian">Student:</span>{' '}
                ID 1001 — Password: Password123!
              </p>
              <p>
                <span className="font-semibold text-obsidian">Doctor:</span>{' '}
                ID 2001 — Password: Password123!
              </p>
              <p>
                <span className="font-semibold text-obsidian">Admin:</span>{' '}
                ID 5001 — Password: Password123!
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-silver animate-fade-in-up stagger-4">
            © 2026 Uni Medicare. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
