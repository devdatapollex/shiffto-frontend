import { ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { Package, Shield, Wallet } from 'lucide-react';
import Image from 'next/image';
import logo from '@/public/shiffto-icon.png';
import name from '@/public/shiffto-name.png';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-primary to-accent-foreground p-12 text-primary-foreground">
        <div className="space-y-8 my-auto">
          <h1 className="text-4xl font-bold leading-tight">
            One account.
            <br />
            Both sides of every shipment.
          </h1>
          <p className="text-lg text-primary-foreground/80">
            Send packages, travel with space to spare, and earn — all from a single unified wallet.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm text-primary-foreground/80">
                Create shipments and match with travelers on your route
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm text-primary-foreground/80">
                Payments held in escrow until delivery is confirmed
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm text-primary-foreground/80">
                Unified wallet — your earnings and spending, all in one place
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} SHIFFTO. All rights reserved.
        </p>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <Image src={logo} alt="SHIFFTO Icon" width={48} height={48} className="" />
            <Image src={name} alt="SHIFFTO Name" width={100} height={20} className="" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
