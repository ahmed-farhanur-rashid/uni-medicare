import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Uni Medicare — University Medical Center',
  description:
    'A comprehensive healthcare management platform for university medical centers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col noise-overlay">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
