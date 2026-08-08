'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/routes';
import { useSession } from '@/lib/auth-client';
import logo from '@/public/shiffto-icon.png';
import name from '@/public/shiffto-name.png';
import logoWithName from '@/public/logo-with-name.png';

export function LandingHeader() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo Icon and Logo Name Image */}
        <Link href={ROUTES.HOME} className="flex items-center">
          <Image src={logoWithName} alt="SHIFFTO Icon" height={40} className="h-10" />
        </Link>

        {/* Right Aligned: Navigation Links & Login Button */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href={ROUTES.HOME} className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href={ROUTES.HOW_IT_WORKS} className="transition-colors hover:text-foreground">
              How It Works
            </Link>
            <Link href={ROUTES.ABOUT} className="transition-colors hover:text-foreground">
              About
            </Link>
            <Link href={ROUTES.CONTACT} className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>

          {isAuthenticated ? (
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
