'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { getUserAnalytics } from '@/services/profile.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Plane,
  Search,
  TrendingUp,
  ArrowDown,
  ShieldCheck,
  Award,
  Wallet,
  Clock,
  ChevronRight,
  LifeBuoy,
  PlusCircle,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'there';

  const {
    data: analytics,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['user-analytics'],
    queryFn: getUserAnalytics,
    refetchOnWindowFocus: true,
  });

  const stats = analytics?.stats;
  const user = analytics?.user;
  const recentShipments = analytics?.recentShipments || [];
  const recentTrips = analytics?.recentTrips || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground font-bold text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
              {user?.image ? (
                <img src={user.image} alt={userName} className="h-full w-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Welcome back, {userName}!
                </h1>
                {user?.kycStatus === 'APPROVED' && (
                  <Badge className="bg-emerald-500 text-white border-emerald-500 text-[10px] font-bold py-0.5 px-2">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                <span>Manage shipments, trips, and finances in one place.</span>
                {user && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-foreground bg-background/80 px-2 py-0.5 rounded-lg border border-primary/10">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    Trust Score: {user.trustScore}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-primary/10 hover:bg-primary/5 text-xs h-9 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-primary ${isRefetching ? 'animate-spin' : ''}`} />
              Sync Stats
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs h-9 gap-1.5 shadow-sm">
              <Link href={ROUTES.CREATE_SHIPMENT}>
                <PlusCircle className="h-3.5 w-3.5" />
                New Shipment
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={ROUTES.CREATE_SHIPMENT}>
          <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer h-full border-primary/10">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Create Shipment</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Send a package safely with a verified traveler</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={ROUTES.CREATE_TRIP}>
          <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer h-full border-primary/10">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Add Trip</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Traveling? Earn income carrying packages</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={ROUTES.BROWSE_SHIPMENT}>
          <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer h-full border-primary/10">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm">Browse Shipments</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Find available shipments along your travel route</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Overview Analytics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Analytics & Activity</h2>
          <span className="text-xs text-muted-foreground">Live updates from your account</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Shipments Created */}
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  Shipments Created
                </span>
                {stats?.activeShipments !== undefined && (
                  <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary">
                    {stats.activeShipments} Active
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">
                {isLoading ? '...' : stats?.shipmentsCreated || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.deliveredShipments || 0} successfully delivered
              </p>
            </CardContent>
          </Card>

          {/* Trips Added */}
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Plane className="h-4 w-4 text-emerald-600" />
                  Trips Added
                </span>
                {stats?.activeTrips !== undefined && (
                  <Badge variant="outline" className="text-[9px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50">
                    {stats.activeTrips} Active
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">
                {isLoading ? '...' : stats?.tripsAdded || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.completedTrips || 0} completed flights
              </p>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Total Earnings
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-emerald-600">
                ${isLoading ? '0.00' : (stats?.totalEarnings || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(stats?.pendingEarnings || 0).toFixed(2)} pending in escrow
              </p>
            </CardContent>
          </Card>

          {/* Total Spending */}
          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <ArrowDown className="h-4 w-4 text-primary" />
                  Total Spending
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-primary">
                ${isLoading ? '0.00' : (stats?.totalSpending || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Paid for shipment deliveries
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wallet Balances */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Available Wallet Balance
              </CardTitle>
              <Button asChild size="xs" variant="ghost" className="text-primary hover:bg-primary/10 text-xs">
                <Link href={ROUTES.WALLET}>
                  Manage Wallet
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>Ready for payout or spending on new shipments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary">
              ${isLoading ? '0.00' : (stats?.availableBalance || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-card to-amber-500/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Escrow Held Balance
              </CardTitle>
              <Button asChild size="xs" variant="ghost" className="text-amber-600 hover:bg-amber-50 text-xs">
                <Link href={ROUTES.PAYMENT_EARNINGS}>
                  View Transactions
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>Protected in escrow until shipment delivery confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-amber-600">
              ${isLoading ? '0.00' : (stats?.pendingEarnings || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Lists (2 columns) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Shipments */}
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-primary/5">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Your Recent Shipments
              </CardTitle>
            </div>
            <Button asChild variant="ghost" size="xs" className="text-xs text-primary hover:bg-primary/5">
              <Link href={ROUTES.MY_SHIPMENTS}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {recentShipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No shipments created yet.
              </div>
            ) : (
              recentShipments.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-primary/5 bg-muted/20 text-xs hover:border-primary/20 transition-all"
                >
                  <div>
                    <span className="font-bold text-foreground block">{s.itemName}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      {s.fromCountry} → {s.toCountry}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className="bg-primary text-white border-primary font-bold text-[9px]">
                      {s.status}
                    </Badge>
                    <span className="text-[11px] font-semibold text-foreground block">
                      ${s.totalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-primary/5">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Plane className="h-4 w-4 text-emerald-600" />
                Your Recent Trips
              </CardTitle>
            </div>
            <Button asChild variant="ghost" size="xs" className="text-xs text-primary hover:bg-primary/5">
              <Link href={ROUTES.MY_TRIPS}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {recentTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                <Plane className="h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-600" />
                No trips added yet.
              </div>
            ) : (
              recentTrips.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-primary/5 bg-muted/20 text-xs hover:border-primary/20 transition-all"
                >
                  <div>
                    <span className="font-bold text-foreground block">Flight {t.flightNumber}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      {t.fromCountry} → {t.toCountry}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className="bg-emerald-600 text-white border-emerald-600 font-bold text-[9px]">
                      {t.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground block">
                      {new Date(t.flightDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
