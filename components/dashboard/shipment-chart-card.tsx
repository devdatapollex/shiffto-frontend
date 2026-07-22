'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronDown, TrendingUp } from 'lucide-react';
import { getShipmentChart } from '@/services/profile.service';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShipmentDataPoint {
  month: string;
  canceled: number;
  completed: number;
}

interface ShipmentChartCardProps {
  totalDeliveries?: string;
  percentageChange?: string;
  selectedYear?: string;
  data?: ShipmentDataPoint[];
}

export function ShipmentChartCard({
  totalDeliveries: overrideDeliveries,
  percentageChange: overridePercentage,
  selectedYear: initialYear,
  data: overrideData,
}: ShipmentChartCardProps = {}) {
  const [isMounted, setIsMounted] = useState(false);
  const currentYearNum = new Date().getFullYear();
  const [year, setYear] = useState<string>(initialYear || currentYearNum.toString());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: apiData } = useQuery({
    queryKey: ['shipment-chart', year],
    queryFn: () => getShipmentChart(year),
    refetchOnWindowFocus: true,
  });

  const totalDeliveries = overrideDeliveries || apiData?.totalDeliveries || '0 deliveries';
  const percentageChange = overridePercentage || apiData?.percentageChange || '0%';
  const chartData = overrideData || apiData?.data || [];

  const defaultYears = Array.from({ length: 4 }, (_, i) => (currentYearNum - i).toString());
  const yearsList = apiData?.availableYears && apiData.availableYears.length > 0 ? apiData.availableYears : defaultYears;

  // Dynamic Y Axis formatter
  const formatYAxis = (val: number) => {
    if (val === 0) return '0';
    if (val >= 1000) {
      return `${val % 1000 === 0 ? val / 1000 : (val / 1000).toFixed(1)}k`;
    }
    return `${val}`;
  };

  // Custom Tooltip showing BOTH Canceled & Completed values for the month
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const canceledVal = payload.find((p: any) => p.dataKey === 'canceled')?.value || 0;
      const completedVal = payload.find((p: any) => p.dataKey === 'completed')?.value || 0;

      const formatVal = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}k` : `${num}`);

      return (
        <div className="bg-slate-900 text-white rounded-xl p-2.5 shadow-xl text-xs font-semibold space-y-1 z-50 pointer-events-none min-w-[120px]">
          <div className="text-[11px] text-slate-400 font-bold border-b border-slate-700/60 pb-1 mb-1">
            {label}
          </div>
          <div className="flex items-center justify-between gap-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-[#E2E8F0] inline-block" />
              Canceled:
            </span>
            <span className="font-extrabold text-white">{formatVal(canceledVal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-xs bg-[#FF9E79] inline-block" />
              Completed:
            </span>
            <span className="font-extrabold text-white">{formatVal(completedVal)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col justify-between">
      {/* Top Header & Legend */}
      <div className="space-y-4">
        {/* Row 1: Title & Year Selector Dropdown */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shipment</h2>

          {/* Year Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer outline-hidden shadow-2xs"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{year}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 rounded-xl bg-white border border-slate-200 p-1.5 shadow-md z-50">
              {yearsList.map((yr) => (
                <DropdownMenuItem
                  key={yr}
                  onClick={() => setYear(yr)}
                  className={`text-xs px-3 py-2 rounded-lg cursor-pointer font-medium ${year === yr ? 'bg-blue-50 text-[#0B3A8E] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {yr}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Row 2: Metric (Left) and Legend (Right) in SAME ROW */}
        <div className="flex items-end justify-between gap-4 pt-1">
          {/* Total Deliveries Metric & Growth Badge */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0B3A8E] tracking-tight">
              {totalDeliveries}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eefcf4] text-[#22c55e] border border-[#c6f6d5] text-xs font-extrabold">
                <TrendingUp className="h-3 w-3 stroke-[2.5]" />
                {percentageChange}
              </span>
              <span className="text-xs text-slate-400 font-medium">from last year</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 sm:gap-5 text-xs font-semibold text-slate-500 pb-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#E2E8F0] border border-slate-300/60 inline-block" />
              <span>Canceled</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#FF9E79] inline-block" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[220px] w-full pt-2">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barGap={3}>
              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                tickFormatter={formatYAxis}
                domain={[0, 'auto']}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />

              {/* Canceled Deliveries Bar (Light Grey/Striped look) */}
              <Bar
                dataKey="canceled"
                fill="#E2E8F0"
                radius={[4, 4, 0, 0]}
                barSize={9}
              />

              {/* Completed Deliveries Bar (Peach / Orange) */}
              <Bar
                dataKey="completed"
                fill="#FF9E79"
                radius={[4, 4, 0, 0]}
                barSize={9}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-slate-50 animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
}
