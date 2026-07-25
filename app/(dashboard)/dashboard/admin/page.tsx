'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Package,
  Truck,
  CheckCircle2,
  PlaneTakeoff,
  TowerControl,
  DollarSign,
  LifeBuoy,
  Banknote,
  Scale,
  ArrowUpRight,
  TrendingUp,
  Percent,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { RoleGuard } from '@/components/auth/role-guard';
import { ROUTES } from '@/config/routes';
import { getAdminAnalytics } from '@/services/admin-analytics.service';

export default function AdminDashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: getAdminAnalytics,
    refetchOnWindowFocus: true,
  });

  const stats = analytics?.stats;
  const chartData = analytics?.chartData || [];

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

  return (
    <RoleGuard roles={['admin']}>
      <div className="space-y-6 sm:space-y-8 max-w-[1144px] mx-auto pb-12">
        {/* Action Required Section - 5 Card Shapes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B3A8E] tracking-tight">
              Action Required
            </h2>
            <span className="text-xs font-medium text-slate-400">High priority tasks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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

            {/* Pending Release Card */}
            <Link
              href={ROUTES.SETTLEMENTS}
              className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-[#7c3aed]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center shrink-0 border border-[#ede9fe]">
                  <Scale className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#f5f3ff] group-hover:text-[#7c3aed] flex items-center justify-center transition-colors">
                  <ChevronRight className="h-4 w-4 stroke-[2] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div className="space-y-1">
                {isLoading ? (
                  <div className="h-8 w-12 bg-slate-200/80 rounded-lg animate-pulse my-0.5" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A8E] tracking-tight">
                    {formatValue(stats?.pendingReleasesCount)}
                  </div>
                )}
                <div className="text-xs sm:text-sm font-semibold text-slate-700">
                  Pending Releases
                </div>
              </div>

              <div className="text-xs font-semibold text-[#7c3aed] group-hover:underline flex items-center gap-1 pt-1 border-t border-slate-100">
                <span>Manage Escrow</span>
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

        {/* Main Stats Overview */}
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

        {/* Financial Summary Cards - 2 Large & Wide Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Gross Volume Card */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-6 sm:p-7 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Gross Transaction Volume
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B3A8E] tracking-tight">
                {isLoading
                  ? '...'
                  : `$${(stats?.totalVolume || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </div>
              <div className="text-xs font-medium text-[#10b981] flex items-center gap-1 pt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Total platform volume processed</span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-xl bg-[#eefcf4] text-[#10b981] border border-[#c6f6d5] flex items-center justify-center shrink-0">
              <DollarSign className="h-7 w-7 stroke-[2]" />
            </div>
          </div>

          {/* Platform Commission Card */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-6 sm:p-7 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all">
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Platform Commission
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0B3A8E] tracking-tight">
                {isLoading
                  ? '...'
                  : `$${(stats?.totalCommission || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </div>
              <div className="text-xs font-medium text-[#0B3A8E] flex items-center gap-1 pt-1">
                <Percent className="h-3.5 w-3.5" />
                <span>Total earnings collected from completed payouts</span>
              </div>
            </div>
            <div className="h-14 w-14 rounded-xl bg-[#f0f5ff] text-[#0B3A8E] border border-[#dbeafe] flex items-center justify-center shrink-0">
              <Percent className="h-7 w-7 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Platform Monthly Activity & Revenue Chart */}
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
      </div>
    </RoleGuard>
  );
}
