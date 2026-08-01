'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/routes';
import { useSession } from '@/lib/auth-client';
import logo from '@/public/shiffto-icon.png';
import name from '@/public/shiffto-name.png';

export function LandingHeader() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo Icon and Logo Name Image */}
        <Link href={ROUTES.HOME} className="flex items-center gap-3">
          <Image src={logo} alt="SHIFFTO Icon" width={36} height={36} className="h-9 w-auto" />
          <Image src={name} alt="SHIFFTO" width={100} height={20} className="h-5 w-auto" />
        </Link>

        {/* Right Aligned: Navigation Links & Login Button */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href={ROUTES.HOME} className="transition-colors hover:text-foreground">
              Home
            </Link>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How It Works
            </a>
            <a href="#about" className="transition-colors hover:text-foreground">
              About
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#tracking" className="transition-colors hover:text-foreground">
              Tracking
            </a>
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
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
