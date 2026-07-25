'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Package,
  Plane,
  DollarSign,
  ShieldAlert,
  LifeBuoy,
  Banknote,
  RefreshCw,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RoleGuard } from '@/components/auth/role-guard';
import { ROUTES } from '@/config/routes';
import { getAdminAnalytics } from '@/services/admin-analytics.service';
import { reviewKyc } from '@/services/profile.service';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();

  const {
    data: analytics,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: getAdminAnalytics,
    refetchOnWindowFocus: true,
  });

  const kycMutation = useMutation({
    mutationFn: ({ kycId, status }: { kycId: string; status: 'APPROVED' | 'REJECTED' }) =>
      reviewKyc(kycId, { status }),
    onSuccess: (_, variables) => {
      toast.success(`KYC submission ${variables.status.toLowerCase()} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message || 'Failed to update KYC status');
    },
  });

  const stats = analytics?.stats;
  const chartData = analytics?.chartData || [];
  const recentKyc = analytics?.recentKyc || [];
  const recentTickets = analytics?.recentTickets || [];

  return (
    <RoleGuard roles={['admin']}>
      <div className="space-y-6 sm:space-y-8 max-w-[1144px] mx-auto pb-12">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-card to-card p-6 rounded-2xl border border-primary/10 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider font-bold"
              >
                Admin Control Panel
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live System Operations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Platform Overview & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Monitor system activity, manage pending verifications, track transaction volume, and
              respond to support tickets.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="shrink-0 gap-2 border-primary/20 hover:bg-primary/5 text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            Sync Metrics
          </Button>
        </div>

        {/* Action Required Alert Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending KYC Alert */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Pending KYC Verifications
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {isLoading ? '...' : stats?.pendingKycCount || 0}
                  </div>
                </div>
              </div>
              <Button
                asChild
                size="xs"
                variant="outline"
                className="text-amber-700 border-amber-500/30 hover:bg-amber-500/10 font-semibold text-xs gap-1"
              >
                <Link href={ROUTES.ADMIN_KYC}>
                  Review
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Open Tickets Alert */}
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Open Support Tickets
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {isLoading ? '...' : stats?.openTicketsCount || 0}
                  </div>
                </div>
              </div>
              <Button
                asChild
                size="xs"
                variant="outline"
                className="text-blue-700 border-blue-500/30 hover:bg-blue-500/10 font-semibold text-xs gap-1"
              >
                <Link href={ROUTES.ADMIN_TICKETS}>
                  Manage
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Withdrawals Alert */}
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Pending Withdrawals
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {isLoading ? '...' : stats?.pendingWithdrawalsCount || 0}
                  </div>
                </div>
              </div>
              <Button
                asChild
                size="xs"
                variant="outline"
                className="text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 font-semibold text-xs gap-1"
              >
                <Link href={ROUTES.WITHDRAWALS}>
                  Process
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Executive KPI Metrics Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Platform Key Performance Indicators
            </h2>
            <span className="text-xs text-muted-foreground">Updated in real-time</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Users */}
            <Card className="border-primary/10 hover:border-primary/30 transition-all shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Platform Users
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-emerald-500/20 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20"
                  >
                    {stats?.approvedKycUsers || 0} Verified
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-foreground">
                  {isLoading ? '...' : stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  Registered senders & travelers
                </p>
              </CardContent>
            </Card>

            {/* Total Shipments */}
            <Card className="border-primary/10 hover:border-primary/30 transition-all shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Package className="h-4 w-4 text-primary" />
                    Shipment Volume
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-blue-500/20 text-blue-700 bg-blue-50 dark:bg-blue-950/20"
                  >
                    {stats?.activeShipments || 0} Active
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-foreground">
                  {isLoading ? '...' : stats?.totalShipments || 0}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Total Created</span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-semibold bg-primary/10 text-primary border-none"
                  >
                    {stats?.deliveredShipments || 0} Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Total Trips */}
            <Card className="border-primary/10 hover:border-primary/30 transition-all shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Plane className="h-4 w-4 text-emerald-600" />
                    Flight Trips
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-emerald-500/20 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20"
                  >
                    {stats?.activeTrips || 0} Active
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-foreground">
                  {isLoading ? '...' : stats?.totalTrips || 0}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">Total Added</span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border-none"
                  >
                    {stats?.completedTrips || 0} Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Platform Financials */}
            <Card className="border-primary/10 hover:border-primary/30 transition-all shadow-xs">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Gross Volume
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-emerald-600">
                  ${isLoading ? '0.00' : (stats?.totalVolume || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                  <span>Commission Earned:</span>
                  <span className="font-bold text-foreground">
                    ${(stats?.totalCommission || 0).toFixed(2)}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity & Revenue Analytics Charts */}
        <Card className="border-primary/10 shadow-xs">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold">
                  Platform Activity & Revenue Trend
                </CardTitle>
                <CardDescription className="text-xs">
                  Monthly aggregate of shipments created, trips added, and transaction volume ($).
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full pt-2">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Loading analytics chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="shipments"
                      name="Shipments"
                      fill="#0B3A8E"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="trips" name="Trips" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operational Quick Audit Tables Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending KYC Review Queue */}
          <Card className="border-primary/10 shadow-xs flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                    Pending KYC Queue
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Review and verify user identity submissions
                  </CardDescription>
                </div>
                <Button asChild size="xs" variant="ghost" className="text-primary text-xs">
                  <Link href={ROUTES.ADMIN_KYC}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {recentKyc.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No pending KYC submissions to review.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">Document</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentKyc.map((kyc) => (
                      <TableRow key={kyc.id} className="text-xs">
                        <TableCell className="font-medium">
                          <div className="font-semibold text-foreground">
                            {kyc.user?.name || 'User'}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{kyc.user?.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold border-primary/20 text-primary"
                          >
                            {kyc.documentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="xs"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              disabled={kycMutation.isPending}
                              onClick={() =>
                                kycMutation.mutate({ kycId: kyc.id, status: 'APPROVED' })
                              }
                              title="Approve KYC"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              disabled={kycMutation.isPending}
                              onClick={() =>
                                kycMutation.mutate({ kycId: kyc.id, status: 'REJECTED' })
                              }
                              title="Reject KYC"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Open Support Tickets */}
          <Card className="border-primary/10 shadow-xs flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-blue-600" />
                    Active Support Tickets
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Recent user tickets requiring support attention
                  </CardDescription>
                </div>
                <Button asChild size="xs" variant="ghost" className="text-primary text-xs">
                  <Link href={ROUTES.ADMIN_TICKETS}>View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {recentTickets.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No open support tickets at the moment.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Ticket</TableHead>
                      <TableHead className="text-xs">Priority</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="text-xs">
                        <TableCell className="font-medium">
                          <div className="font-semibold text-foreground truncate max-w-[180px]">
                            {ticket.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            #{ticket.ticketId} • {ticket.user?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold uppercase ${
                              ticket.priority === 'URGENT' || ticket.priority === 'HIGH'
                                ? 'border-rose-500/20 text-rose-600 bg-rose-50'
                                : 'border-blue-500/20 text-blue-600 bg-blue-50'
                            }`}
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold uppercase"
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
}
