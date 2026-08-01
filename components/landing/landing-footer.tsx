import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function LandingFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <span>SHIFFTO</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SHIFFTO Logistics Platform. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href={ROUTES.LOGIN} className="hover:underline">
              Sign In
            </Link>
            <Link href={ROUTES.REGISTER} className="hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
