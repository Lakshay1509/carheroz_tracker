
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export function AuthNav() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname(); // Get current pathname

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button
            variant={pathname === '/login' ? 'default' : 'ghost'}
            size="sm"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            variant={pathname === '/signup' ? 'default' : 'outline'}
            size="sm"
            asChild
            className={pathname === '/signup' ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );
}
