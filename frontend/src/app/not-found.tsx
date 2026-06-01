import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-warm">
      <div className="text-center max-w-md p-8">
        <div className="w-16 h-16 rounded-2xl bg-obsidian/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-obsidian">404</span>
        </div>
        <h2 className="text-xl font-bold text-obsidian font-display mb-2">Page not found</h2>
        <p className="text-sm text-slate-muted mb-6">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
