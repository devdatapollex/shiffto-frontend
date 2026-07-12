'use client';

import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plane, Search, TrendingUp, ArrowDown } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}!</h1>
        <p className="text-muted-foreground mt-1">
          Manage your shipments, trips, and finances — all in one place.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={ROUTES.MY_SHIPMENTS}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Package className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Create Shipment</h3>
              <p className="text-sm text-muted-foreground mt-1">Send a package with a traveler</p>
            </CardContent>
          </Card>
        </Link>

        <Link href={ROUTES.MY_TRIPS}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Plane className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Add Trip</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Traveling? Earn by carrying shipments
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={ROUTES.BROWSE_SHIPMENT}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Search className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold">Browse Shipments</h3>
              <p className="text-sm text-muted-foreground mt-1">Find shipments along your route</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Shipments Created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">
                Start by creating your first shipment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Trips Added
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Add a trip to start earning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Total Earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">
                Earnings from completed deliveries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-destructive" />
                Total Spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground mt-1">Spending on shipments sent</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wallet Balances */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Wallet</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Balance</CardTitle>
              <CardDescription>Available for spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">$0.00</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending</CardTitle>
              <CardDescription>Held in escrow until delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">$0.00</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
