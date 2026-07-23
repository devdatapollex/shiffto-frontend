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

import { HomeQuickActions } from '@/components/dashboard/home-quick-actions';
import { HomeStatsOverview } from '@/components/dashboard/home-stats-overview';
import { OffersReceivedSection } from '@/components/shipments/offers-received-section';
import { RevenueChartCard } from '@/components/dashboard/revenue-chart-card';
import { ShipmentChartCard } from '@/components/dashboard/shipment-chart-card';
import { RecentShipmentsSection } from '@/components/dashboard/recent-shipments-section';
import { RecentTripsSection } from '@/components/dashboard/recent-trips-section';

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
    <div className="space-y-6 sm:space-y-8 max-w-[1144px] mx-auto pb-10">
      {/* Top Quick Actions Section from Figma */}
      <HomeQuickActions />

      {/* Stats Overview Section from Figma */}
      <HomeStatsOverview stats={stats} isLoading={isLoading} />

      {/* Offers Received Section from My Shipments Page (Horizontal Scroll) */}
      <OffersReceivedSection
        layoutMode="horizontal-scroll"
        titleClassName="text-[#0B3A8E] text-lg sm:text-xl font-bold tracking-tight"
      />

      {/* 2-Column Split Grid below Offers Received */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Half: Revenue Line Chart Card */}
        <RevenueChartCard />

        {/* Right Half: Shipment Deliveries Bar Chart Card */}
        <ShipmentChartCard />
      </div>

      {/* Recent Shipments Section */}
      <RecentShipmentsSection shipments={recentShipments} isLoading={isLoading} />

      {/* Recent Trips Section */}
      <RecentTripsSection trips={recentTrips} isLoading={isLoading} />

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
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-primary/20 text-primary"
                  >
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
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50"
                  >
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
              <p className="text-xs text-muted-foreground mt-1">Paid for shipment deliveries</p>
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
              <Button
                asChild
                size="xs"
                variant="ghost"
                className="text-primary hover:bg-primary/10 text-xs"
              >
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
              <Button
                asChild
                size="xs"
                variant="ghost"
                className="text-amber-600 hover:bg-amber-50 text-xs"
              >
                <Link href={ROUTES.PAYMENT_EARNINGS}>
                  View Transactions
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription>
              Protected in escrow until shipment delivery confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-amber-600">
              ${isLoading ? '0.00' : (stats?.pendingEarnings || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
