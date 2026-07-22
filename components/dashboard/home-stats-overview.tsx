'use client';

import {
  Package,
  Truck,
  CheckCircle2,
  CircleAlert,
  PlaneTakeoff,
  TowerControl,
} from 'lucide-react';

interface StatsData {
  shipmentsCreated?: number;
  activeShipments?: number;
  deliveredShipments?: number;
  pendingShipments?: number;
  tripsAdded?: number;
  activeTrips?: number;
}

interface HomeStatsOverviewProps {
  stats?: StatsData;
  isLoading?: boolean;
}

export function HomeStatsOverview({ stats, isLoading }: HomeStatsOverviewProps) {
  const formatValue = (val?: number) => {
    if (isLoading) return '00';
    const num = val ?? 0;
    return num < 10 && num >= 0 ? `0${num}` : `${num}`;
  };

  const pendingCount =
    stats?.pendingShipments ??
    (stats?.shipmentsCreated !== undefined && stats?.deliveredShipments !== undefined
      ? Math.max(
          0,
          stats.shipmentsCreated - stats.deliveredShipments - (stats.activeShipments || 0)
        )
      : 0);

  const statItems = [
    {
      id: 'total-shipment',
      label: 'Total shipment',
      value: formatValue(stats?.shipmentsCreated),
      icon: Package,
    },
    {
      id: 'active-shipment',
      label: 'Active shipment',
      value: formatValue(stats?.activeShipments),
      icon: Truck,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      value: formatValue(stats?.deliveredShipments),
      icon: CheckCircle2,
    },
    {
      id: 'pending-product',
      label: 'Pending Product',
      value: formatValue(pendingCount),
      icon: CircleAlert,
    },
    {
      id: 'total-trips',
      label: 'Total Trips',
      value: formatValue(stats?.tripsAdded),
      icon: PlaneTakeoff,
    },
    {
      id: 'active-trips',
      label: 'Active Trips',
      value: formatValue(stats?.activeTrips),
      icon: TowerControl,
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xs hover:border-slate-300 transition-all"
          >
            {/* Top Icon */}
            <div className="h-10 w-10 rounded-xl bg-[#f0f5ff] text-[#0B3A8E] flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 stroke-[1.75]" />
            </div>

            {/* Value & Label */}
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A8E] tracking-tight">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 truncate">
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
