'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronDown, TrendingUp } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { getRevenueChart } from '@/services/profile.service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface RevenueDataPoint {
  day: string;
  spent: number;
  earned: number;
}

interface RevenueChartCardProps {
  totalAmount?: string;
  percentageChange?: string;
  dateRangeText?: string;
  data?: RevenueDataPoint[];
}

export function RevenueChartCard({
  totalAmount: overrideAmount,
  percentageChange: overridePercentage,
  dateRangeText: overrideDateRange,
  data: overrideData,
}: RevenueChartCardProps = {}) {
  const [isMounted, setIsMounted] = useState(false);

  const today = new Date();
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(today.getDate() - 6);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: sixDaysAgo,
    to: today,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startDateStr = dateRange?.from ? dateRange.from.toISOString().split('T')[0] : undefined;
  const endDateStr = dateRange?.to ? dateRange.to.toISOString().split('T')[0] : startDateStr;

  const { data: apiData } = useQuery({
    queryKey: ['revenue-chart', startDateStr, endDateStr],
    queryFn: () => getRevenueChart({ startDate: startDateStr, endDate: endDateStr }),
    refetchOnWindowFocus: true,
    enabled: !!startDateStr,
  });

  const totalAmount = overrideAmount || apiData?.totalAmount || '$0.00';
  const percentageChange = overridePercentage || apiData?.percentageChange || '0%';

  const formattedDateRangeText = dateRange?.from
    ? `${dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${
        dateRange.to
          ? ` - ${dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : ''
      }`
    : 'Select date range';

  const dateRangeText =
    overrideDateRange ||
    (apiData?.dateRangeText && dateRange?.from ? formattedDateRangeText : apiData?.dateRangeText) ||
    formattedDateRangeText;
  const chartData = overrideData || apiData?.chartData || [];

  // Dynamic Y Axis formatter
  const formatYAxis = (val: number) => {
    if (val === 0) return '$0';
    if (val >= 1000) {
      return `$${val % 1000 === 0 ? val / 1000 : (val / 1000).toFixed(1)}k`;
    }
    return `$${val}`;
  };

  // Custom Tooltip component matching Figma pills ($1.2k, $2.5k, $80)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const spentVal = payload.find((p: any) => p.dataKey === 'spent')?.value || 0;
      const earnedVal = payload.find((p: any) => p.dataKey === 'earned')?.value || 0;

      const formatPillVal = (num: number) => {
        if (num >= 1000) {
          return `$${(num / 1000).toFixed(1)}k`;
        }
        return `$${num}`;
      };

      return (
        <div className="flex items-center gap-2 pointer-events-none pb-4">
          <div className="bg-[#FFECD9] text-[#FF6F3F] border border-[#FFD8B3] px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-xs">
            {formatPillVal(spentVal)}
          </div>
          <div className="bg-[#2B4C7E] text-white px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-xs">
            {formatPillVal(earnedVal)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200/80 shadow-xs p-6 space-y-6 flex flex-col justify-between">
      {/* Top Header & Legend */}
      <div className="space-y-4">
        {/* Row 1: Title & Date Range Selection Popover */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Revenue</h2>

          {/* Direct Date Range Selection Popover using shadcn */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer outline-hidden shadow-2xs"
              >
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>{dateRangeText}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-auto p-0 rounded-lg border border-slate-200 shadow-xl bg-white"
            >
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="rounded-lg"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Row 2: Metric (Left) and Legend (Right) in SAME ROW */}
        <div className="flex items-end justify-between gap-4 pt-1">
          {/* Total Metric & Growth Badge */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#0B3A8E] tracking-tight">
              {totalAmount}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eefcf4] text-[#22c55e] border border-[#c6f6d5] text-xs font-extrabold">
                <TrendingUp className="h-3 w-3 stroke-[2.5]" />
                {percentageChange}
              </span>
              <span className="text-xs text-slate-400 font-medium">from last month</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 sm:gap-5 text-xs font-semibold text-slate-500 pb-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#FF8552] inline-block" />
              <span>Total Spent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#2B4C7E] inline-block" />
              <span>Total Earned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[220px] w-full pt-2">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Total Spent Gradient (Orange) */}
                <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8552" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF8552" stopOpacity={0.0} />
                </linearGradient>
                {/* Total Earned Gradient (Dark Blue) */}
                <linearGradient id="earnedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2B4C7E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2B4C7E" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="0" />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                tickFormatter={formatYAxis}
                domain={[0, 'auto']}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5 }}
              />

              {/* Total Earned Area (Dark Navy/Blue) */}
              <Area
                type="monotone"
                dataKey="earned"
                stroke="#2B4C7E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#earnedGradient)"
              />

              {/* Total Spent Area (Orange/Salmon) */}
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#FF8552"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#spentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-slate-50 animate-pulse rounded-lg" />
        )}
      </div>
    </div>
  );
}
