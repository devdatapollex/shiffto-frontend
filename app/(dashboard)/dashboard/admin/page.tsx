'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Package,
  Truck,
  CheckCircle2,
  CircleAlert,
  PlaneTakeoff,
  TowerControl,
  DollarSign,
  ShieldCheck,
  LifeBuoy,
  Banknote,
  RefreshCw,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Check,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

  const formatValue = (val?: number) => {
    const num = val ?? 0;
    return num < 10 && num >= 0 ? `0${num}` : `${num}`;
  };

  const overviewStatItems = [
    {
      id: 'total-users',
      label: 'Total Users',
      value: formatValue(stats?.totalUsers),
      subLabel: `${stats?.approvedKycUsers || 0} Verified`,
      icon: Users,
      iconBg: 'bg-[#f0f5ff]',
      iconColor: 'text-[#0B3A8E]',
    },
    {
      id: 'total-shipment',
      label: 'Total Shipment',
      value: formatValue(stats?.totalShipments),
      subLabel: `${stats?.deliveredShipments || 0} Delivered`,
      icon: Package,
      iconBg: 'bg-[#f0f5ff]',
      iconColor: 'text-[#0B3A8E]',
    },
    {
      id: 'active-shipment',
      label: 'Active Shipment',
      value: formatValue(stats?.activeShipments),
      subLabel: 'In progress',
      icon: Truck,
      iconBg: 'bg-[#eef4ff]',
      iconColor: 'text-[#3b82f6]',
    },
    {
      id: 'delivered-shipment',
      label: 'Delivered',
      value: formatValue(stats?.deliveredShipments),
      subLabel: 'Completed',
      icon: CheckCircle2,
      iconBg: 'bg-[#eefcf4]',
      iconColor: 'text-[#10b981]',
    },
    {
      id: 'total-trips',
      label: 'Total Trips',
      value: formatValue(stats?.totalTrips),
      subLabel: `${stats?.completedTrips || 0} Completed`,
      icon: PlaneTakeoff,
      iconBg: 'bg-[#f0f5ff]',
      iconColor: 'text-[#0B3A8E]',
    },
    {
      id: 'active-trips',
      label: 'Active Trips',
      value: formatValue(stats?.activeTrips),
      subLabel: 'Upcoming flights',
      icon: TowerControl,
      iconBg: 'bg-[#eefcf4]',
      iconColor: 'text-[#10b981]',
    },
  ];

  const financialItems = [
    {
      id: 'gross-volume',
      label: 'Gross Volume',
      value: `$${(stats?.totalVolume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconBg: 'bg-[#eefcf4]',
      iconColor: 'text-[#10b981]',
    },
    {
      id: 'commission',
      label: 'Platform Commission',
      value: `$${(stats?.totalCommission || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Percent,
      iconBg: 'bg-[#f0f5ff]',
      iconColor: 'text-[#0B3A8E]',
    },
    {
      id: 'pending-kyc',
      label: 'Pending KYC',
      value: formatValue(stats?.pendingKycCount),
      icon: ShieldAlert,
      iconBg: 'bg-[#fff5f0]',
      iconColor: 'text-[#FF6F3F]',
    },
    {
      id: 'open-tickets',
      label: 'Open Tickets',
      value: formatValue(stats?.openTicketsCount),
      icon: LifeBuoy,
      iconBg: 'bg-[#eef4ff]',
      iconColor: 'text-[#3b82f6]',
    },
  ];

  return (
    <RoleGuard roles={['admin']}>
      <div className="space-y-6 sm:space-y-8 max-w-[1144px] mx-auto pb-12">
        {/* Top Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-lg border border-slate-200/80 p-5 sm:p-7 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f5ff] text-[#0B3A8E] border border-[#dbeafe] text-xs font-extrabold uppercase tracking-wider">
                Admin Panel
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
                Live System Metrics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B3A8E]">
              Admin Home Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              Monitor overall platform volume, pending user verifications, support activity, and
              operational statistics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200/90 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs self-start sm:self-center shrink-0"
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>

        {/* Action Required Banner Section - 4 Typical Card Shapes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B3A8E] tracking-tight">
              Action Required
            </h2>
            <span className="text-xs font-medium text-slate-400">High priority tasks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Pending KYC Card */}
            <Link
              href={ROUTES.ADMIN_KYC}
              className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#FF6F3F]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[#fff5f0] text-[#FF6F3F] flex items-center justify-center shrink-0 border border-[#ffedd5]">
                  <ShieldAlert className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#fff5f0] group-hover:text-[#FF6F3F] flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="space-y-1">
                {isLoading ? (
                  <div className="h-8 w-12 bg-slate-200/80 rounded-lg animate-pulse my-0.5" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A8E] tracking-tight">
                    {formatValue(stats?.pendingKycCount)}
                  </div>
                )}
                <div className="text-xs sm:text-sm font-semibold text-slate-700">Pending KYC</div>
              </div>

              <div className="text-xs font-semibold text-[#FF6F3F] group-hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
                <span>Review Submissions</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </Link>

            {/* Pending Trip Card */}
            <Link
              href={ROUTES.ADMIN_TRIPS}
              className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#FF8552]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[#fff8f0] text-[#FF8552] flex items-center justify-center shrink-0 border border-[#ffe8dc]">
                  <PlaneTakeoff className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#fff8f0] group-hover:text-[#FF8552] flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="space-y-1">
                {isLoading ? (
                  <div className="h-8 w-12 bg-slate-200/80 rounded-lg animate-pulse my-0.5" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A8E] tracking-tight">
                    {formatValue(stats?.pendingTripsCount)}
                  </div>
                )}
                <div className="text-xs sm:text-sm font-semibold text-slate-700">Pending Trips</div>
              </div>

              <div className="text-xs font-semibold text-[#FF8552] group-hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
                <span>Review Trips</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </Link>

            {/* Open Tickets Card */}
            <Link
              href={ROUTES.ADMIN_TICKETS}
              className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#0B3A8E]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[#f0f5ff] text-[#0B3A8E] flex items-center justify-center shrink-0 border border-[#dbeafe]">
                  <LifeBuoy className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#f0f5ff] group-hover:text-[#0B3A8E] flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="space-y-1">
                {isLoading ? (
                  <div className="h-8 w-12 bg-slate-200/80 rounded-lg animate-pulse my-0.5" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A8E] tracking-tight">
                    {formatValue(stats?.openTicketsCount)}
                  </div>
                )}
                <div className="text-xs sm:text-sm font-semibold text-slate-700">Open Tickets</div>
              </div>

              <div className="text-xs font-semibold text-[#0B3A8E] group-hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
                <span>Manage Support</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </Link>

            {/* Pending Withdrawal Card */}
            <Link
              href={ROUTES.WITHDRAWALS}
              className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#10b981]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[#eefcf4] text-[#10b981] flex items-center justify-center shrink-0 border border-[#c6f6d5]">
                  <Banknote className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#eefcf4] group-hover:text-[#10b981] flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="space-y-1">
                {isLoading ? (
                  <div className="h-8 w-12 bg-slate-200/80 rounded-lg animate-pulse my-0.5" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A8E] tracking-tight">
                    {formatValue(stats?.pendingWithdrawalsCount)}
                  </div>
                )}
                <div className="text-xs sm:text-sm font-semibold text-slate-700">
                  Pending Withdrawals
                </div>
              </div>

              <div className="text-xs font-semibold text-[#10b981] group-hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
                <span>Process Payouts</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </Link>
          </div>
        </div>

        {/* Main Stats Overview (Matching User Home Page HomeStatsOverview Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B3A8E] tracking-tight">
              Platform Statistics
            </h2>
            <span className="text-xs font-medium text-slate-400">Live account totals</span>
          </div>

          {/* 6-Column Grid matching User Home Page */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {overviewStatItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/80 rounded-lg p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div
                    className={`h-10 w-10 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="h-5 w-5 stroke-[1.75]" />
                  </div>

                  <div className="space-y-0.5">
                    {isLoading ? (
                      <div className="h-8 w-12 bg-slate-200/80 rounded-lg animate-pulse my-0.5" />
                    ) : (
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A8E] tracking-tight">
                        {item.value}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm font-medium text-slate-400 truncate">
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {financialItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-lg p-5 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-medium text-slate-400">{item.label}</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0B3A8E] tracking-tight">
                    {isLoading ? '...' : item.value}
                  </div>
                </div>
                <div
                  className={`h-11 w-11 rounded-lg ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
                >
                  <Icon className="h-5.5 w-5.5 stroke-[1.75]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform Monthly Activity & Revenue Chart (Styled like RevenueChartCard) */}
        <div className="w-full bg-white rounded-lg border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#0B3A8E] tracking-tight">
                Platform Activity & Revenue Trend
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Monthly aggregate volume of shipments, trips, and gross platform transaction volume
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#0B3A8E] inline-block" />
                <span>Shipments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981] inline-block" />
                <span>Trips</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full pt-2">
            {isLoading ? (
              <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">
                Loading chart analytics...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                  />
                  <Bar dataKey="shipments" name="Shipments" fill="#0B3A8E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="trips" name="Trips" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Operational Audit Tables Grid (Styled like RecentShipmentsSection) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending KYC Submissions Table */}
          <div className="w-full bg-white rounded-lg border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-[#fff5f0] text-[#FF6F3F] flex items-center justify-center shrink-0 border border-[#ffedd5]">
                  <ShieldCheck className="h-4.5 w-4.5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B3A8E] tracking-tight">
                    Pending KYC Submissions
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Verify user documentation</p>
                </div>
              </div>
              <Link
                href={ROUTES.ADMIN_KYC}
                className="text-xs font-semibold text-[#0B3A8E] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              {recentKyc.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No pending KYC submissions.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Document</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentKyc.map((kyc) => (
                      <tr key={kyc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">
                            {kyc.user?.name || 'User'}
                          </div>
                          <div className="text-[11px] text-slate-400">{kyc.user?.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-[#f0f5ff] text-[#0B3A8E] text-[10px] font-extrabold uppercase border border-[#dbeafe]">
                            {kyc.documentType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={kycMutation.isPending}
                              onClick={() =>
                                kycMutation.mutate({ kycId: kyc.id, status: 'APPROVED' })
                              }
                              className="h-7 w-7 rounded-lg bg-[#eefcf4] text-[#22c55e] border border-[#c6f6d5] hover:bg-[#dcfce7] flex items-center justify-center transition-colors cursor-pointer"
                              title="Approve"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </button>
                            <button
                              type="button"
                              disabled={kycMutation.isPending}
                              onClick={() =>
                                kycMutation.mutate({ kycId: kyc.id, status: 'REJECTED' })
                              }
                              className="h-7 w-7 rounded-lg bg-[#fff5f0] text-[#FF6F3F] border border-[#ffedd5] hover:bg-[#ffe8dc] flex items-center justify-center transition-colors cursor-pointer"
                              title="Reject"
                            >
                              <XCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Active Support Tickets Table */}
          <div className="w-full bg-white rounded-lg border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-[#f0f5ff] text-[#0B3A8E] flex items-center justify-center shrink-0 border border-[#dbeafe]">
                  <LifeBuoy className="h-4.5 w-4.5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B3A8E] tracking-tight">
                    Active Support Tickets
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Customer assistance queue</p>
                </div>
              </div>
              <Link
                href={ROUTES.ADMIN_TICKETS}
                className="text-xs font-semibold text-[#0B3A8E] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              {recentTickets.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No active support tickets.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="py-2.5 px-3">Ticket</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 truncate max-w-[170px]">
                            {ticket.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            #{ticket.ticketId} • {ticket.user?.name}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              ticket.priority === 'URGENT' || ticket.priority === 'HIGH'
                                ? 'bg-[#fff5f0] text-[#FF6F3F] border-[#ffedd5]'
                                : 'bg-[#f0f5ff] text-[#0B3A8E] border-[#dbeafe]'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
