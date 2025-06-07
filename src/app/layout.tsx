
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import { AuthNav } from '@/components/AuthNav'; // We'll create this component

export const metadata: Metadata = {
  title: 'Service Tracker',
  description: 'Track your services efficiently',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest"/>
      </head>
      <body className="font-body antialiased">
        <AuthProvider> {/* Wrap with AuthProvider */}
          <header className="bg-card border-b">
            <nav className="container mx-auto flex items-center justify-between p-4">
              <Link href="/" className="text-2xl font-bold text-primary-foreground">
                ServiceTracker
              </Link>
              <AuthNav />
            </nav>
          </header>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
