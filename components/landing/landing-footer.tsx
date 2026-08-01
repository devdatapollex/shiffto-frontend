import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';
import logoWithName from '@/public/logo-with-name.png';

export function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12 flex flex-col gap-10">
        {/* Top Row: Brand Info & App Badges */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col items-start gap-2">
              <Image
                src={logoWithName}
                alt="Shiftto Logo"
                height={60}
                className="h-15 w-auto"
                priority
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Shiftto is an innovative peer-to-peer delivery platform that seamlessly connects
              travelers with individuals looking to send packages across international borders.
            </p>
          </div>

          {/* App Download Badges */}
          <div className="flex flex-col gap-3">
            <button className="border rounded-xl px-4 py-2 flex items-center gap-3 bg-background hover:bg-accent transition-colors">
              <div className="text-left leading-tight">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                  GET IT ON
                </div>
                <div className="text-xs font-semibold">Google Play</div>
              </div>
            </button>
            <button className="border rounded-xl px-4 py-2 flex items-center gap-3 bg-background hover:bg-accent transition-colors">
              <div className="text-left leading-tight">
                <div className="text-[9px] tracking-wider text-muted-foreground font-medium">
                  Download on the
                </div>
                <div className="text-xs font-semibold">App Store</div>
              </div>
            </button>
          </div>
        </div>

        {/* Middle Row: Navigation Links & Social Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#tracking" className="hover:text-foreground transition-colors">
              Tracking
            </Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link href="#faqs" className="hover:text-foreground transition-colors">
              FAQs
            </Link>
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link
              href="#"
              aria-label="X (Twitter)"
              className="hover:text-foreground transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              aria-label="Facebook"
              className="hover:text-foreground transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="hover:text-foreground transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              aria-label="LinkedIn"
              className="hover:text-foreground transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Row: Separator & Copyright / Legal */}
        <div className="border-t pt-6 flex justify-end text-xs text-muted-foreground">
          <div>
            &copy; 2026 Shiftto &middot;{' '}
            <Link href="#" className="hover:underline">
              Terms
            </Link>{' '}
            &middot;{' '}
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
