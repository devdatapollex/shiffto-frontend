'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Plane,
  Scale,
  Boxes,
  Calendar,
  User as UserIcon,
  Tag,
  Mail,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  X,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { getShipments } from '@/services/shipment.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCountryByCode } from '@/lib/constants/countries';

// Interfaces for Offers and Shipment History
interface Traveler {
  name: string;
  avatar?: string;
  code: string;
  date: string;
  offeredPrice: number;
}

interface Offer {
  id: string;
  timeRemaining: string;
  timeColor: 'red' | 'yellow' | 'green';
  itemName: string;
  itemImage?: string;
  fromCountry: string;
  toCountry: string;
  weight: number;
  quantity: number;
  price: number;
  traveler: Traveler;
}

interface ShipmentHistoryItem {
  id: string;
  itemName: string;
  image?: string;
  status: 'Active' | 'Delivered' | 'Awaiting match' | 'Canceled';
  route: string;
  amount: number;
  assignedTo: {
    name: string;
    avatar?: string;
  } | null;
  isApiData?: boolean;
}

export default function MyShipmentsPage() {
  // Local state for offers (initialized with the 3 mock offers in the screenshot)
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 'offer-1',
      timeRemaining: '08:45',
      timeColor: 'red',
      itemName: 'Apple Airpods Pro (Gen 2)',
      itemImage:
        'https://images.unsplash.com/photo-1588449668338-d1f33b5c40d1?w=200&auto=format&fit=crop&q=60',
      fromCountry: 'Bangladesh',
      toCountry: 'China',
      weight: 0.3,
      quantity: 2,
      price: 60,
      traveler: {
        name: 'Ahmed Khan',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
        code: 'BG 0306',
        date: '30 June, 2026',
        offeredPrice: 50,
      },
    },
    {
      id: 'offer-2',
      timeRemaining: '21:12',
      timeColor: 'yellow',
      itemName: 'Samsung Galaxy S25',
      itemImage:
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=60',
      fromCountry: 'Vietnam',
      toCountry: 'USA',
      weight: 0.2,
      quantity: 1,
      price: 70,
      traveler: {
        name: 'Lisa Tran',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
        code: 'BG 0307',
        date: '15 July, 2025',
        offeredPrice: 65,
      },
    },
    {
      id: 'offer-3',
      timeRemaining: '29:16',
      timeColor: 'green',
      itemName: 'Nike Jordan Shoe',
      itemImage:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=60',
      fromCountry: 'Japan',
      toCountry: 'Canada',
      weight: 0.3,
      quantity: 1,
      price: 80,
      traveler: {
        name: 'John Doe',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
        code: 'BG 0308',
        date: '22 August, 2026',
        offeredPrice: 75,
      },
    },
  ]);

  const [historyList, setHistoryList] = useState<ShipmentHistoryItem[]>([]);

  // Tab Filtering & Search states
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Delivered' | 'Canceled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'route'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch real user shipments from the API using React Query
  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['shipments'],
    queryFn: () => getShipments(),
  });

  // Derived state: Combine API shipments and local historyList dynamically in render body to prevent cascading render effects.
  const apiItems: ShipmentHistoryItem[] = apiResponse?.data
    ? apiResponse.data.map((item) => ({
        id: `SH-${item.id.substring(item.id.length - 6, item.id.length).toUpperCase()}`,
        itemName: item.itemName,
        image: item.itemPhotos?.[0] || undefined,
        status: 'Awaiting match' as const, // Initial status for new API shipments
        route: `${item.fromCountry} - ${item.toCountry}`,
        amount: item.pricePerKg * item.weight,
        assignedTo: null,
        isApiData: true,
      }))
    : [];

  const shipmentHistory: ShipmentHistoryItem[] = apiItems;

  // Handle Offer Actions
  const handleAcceptOffer = (offer: Offer) => {
    // 1. Remove the offer
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));

    // 2. Add an "Active" item to the shipment history table representing this matched shipment
    const matchedShipment: ShipmentHistoryItem = {
      id: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: offer.itemName,
      image: offer.itemImage,
      status: 'Active',
      route: `${getCountryByCode(offer.fromCountry)?.name} - ${getCountryByCode(offer.toCountry)?.name}`,
      amount: offer.traveler.offeredPrice,
      assignedTo: {
        name: offer.traveler.name,
        avatar: offer.traveler.avatar,
      },
    };

    setHistoryList((prev) => [matchedShipment, ...prev]);
    toast.success(
      `You accepted the offer from ${offer.traveler.name} for $${offer.traveler.offeredPrice}!`
    );
  };

  const handleRejectOffer = (offer: Offer) => {
    // Remove the offer from state
    setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    toast.info(`Offer from ${offer.traveler.name} declined.`);
  };

  // Filter history list based on active tab and search query
  const filteredList = shipmentHistory
    .filter((item) => {
      // Tab filter
      if (activeTab !== 'All' && item.status !== activeTab) return false;

      // Search filter (searches by item name, ID, or route)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.itemName.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.route.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.itemName.localeCompare(b.itemName);
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'route') {
        comparison = a.route.localeCompare(b.route);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: 'name' | 'amount' | 'route') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* 1. OFFERS RECEIVED SECTION */}
      <div className="space-y-4 bg-background p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-xl  text-muted-foreground tracking-tight">Offers received</h2>
          <Badge className="bg-primary text-white font-bold h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
            {offers.length}
          </Badge>
        </div>

        <AnimatePresence mode="popLayout">
          {offers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-slate-100 bg-white shadow-sm text-center"
            >
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">
                No pending offers for your shipments right now.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => {
                // Color mapping for time badges
                const timeColorClass =
                  offer.timeColor === 'red'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : offer.timeColor === 'yellow'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100';

                return (
                  <motion.div
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md duration-200"
                  >
                    <div>
                      {/* Top Pill / Badge row */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${timeColorClass}`}
                        >
                          <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                          {offer.timeRemaining}
                        </span>
                        <span className="text-lg font-bold text-[#0B3A8E]">${offer.price}</span>
                      </div>

                      {/* Shipment Meta Details */}
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {offer.itemImage ? (
                            <img
                              src={offer.itemImage}
                              alt={offer.itemName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 truncate">
                            {offer.itemName}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Plane className="h-3.5 w-3.5 text-slate-400 rotate-45 shrink-0" />
                            {offer.fromCountry} - {offer.toCountry}
                          </p>
                          <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium pt-0.5">
                            <span className="flex items-center gap-1">
                              <Scale className="h-3 w-3 shrink-0" />
                              {offer.weight} Kg
                            </span>
                            <span className="flex items-center gap-1">
                              <Boxes className="h-3 w-3 shrink-0" />
                              {offer.quantity}pcs
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Traveler Offer Box */}
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {offer.traveler.avatar ? (
                              <img
                                src={offer.traveler.avatar}
                                alt={offer.traveler.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <span>{offer.traveler.name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-800 truncate">
                              {offer.traveler.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                              <span className="flex items-center gap-1">
                                <Tag className="h-2.5 w-2.5 shrink-0" />
                                {offer.traveler.code}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-2.5 w-2.5 shrink-0" />
                                {offer.traveler.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right pl-2 shrink-0">
                          <span className="text-sm font-bold text-[#0D307A] block">
                            ${offer.traveler.offeredPrice}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">
                            Offered price
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectOffer(offer)}
                        className="flex-1 bg-background border-slate-200 text-foreground hover:bg-slate-50 font-semibold"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptOffer(offer)}
                        className="flex-1 bg-[#0B3A8E] hover:bg-[#092E72] text-white font-semibold shadow-sm"
                      >
                        Accept
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. SHIPMENT HISTORY SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        {/* Title and Controls Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <h3 className="text-lg font-bold text-[#0B3A8E]">Shipment History</h3>

          {/* Search, Filters, Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search shipment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full sm:w-60 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-xs transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-slate-200 text-slate-500 hover:text-slate-700 bg-white"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            {/* Sort Order Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-slate-200 text-slate-500 hover:text-slate-700 bg-white"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => toggleSort('name')}>
                  Sort by Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('amount')}>
                  Sort by Price {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('route')}>
                  Sort by Route {sortBy === 'route' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
          {(['All', 'Active', 'Delivered', 'Canceled'] as const).map((tab) => {
            const isTabActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                  isTabActive
                    ? 'bg-[#0D307A]/10 text-[#0D307A] border-transparent'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Shipments Table List */}
        {isLoading ? (
          <div className="space-y-4 py-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 h-16 w-full bg-slate-50 animate-pulse rounded-lg px-4"
              />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Package className="h-12 w-12 text-slate-200 mb-3" />
            <p className="text-sm font-medium text-slate-500">No shipments found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try resetting your search query or creating a new shipment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4 font-semibold">Shipment name & ID</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Route</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Assigned to</th>
                  <th className="px-5 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                <AnimatePresence initial={false}>
                  {filteredList.map((item) => {
                    // Status Badge Mapping
                    const statusConfig = {
                      Active: 'bg-blue-50 text-blue-700 border-blue-100',
                      Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      'Awaiting match': 'bg-amber-50 text-amber-700 border-amber-100',
                      Canceled: 'bg-slate-50 text-slate-500 border-slate-200',
                    };

                    const statusClass = statusConfig[item.status] || statusConfig['Awaiting match'];

                    return (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/60 transition-colors duration-150"
                      >
                        {/* Shipment Name & ID */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.itemName}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground block truncate">
                                {item.itemName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold tracking-wider block mt-0.5">
                                {item.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Route */}
                        <td className="px-5 py-4">
                          <span className="text-muted-foreground font-light">{item.route}</span>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4">
                          <span className="font-semibold text-muted-foreground">
                            ${item.amount.toFixed(2)}
                          </span>
                        </td>

                        {/* Assigned To */}
                        <td className="px-5 py-4">
                          {item.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6.5 h-6.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] overflow-hidden shrink-0">
                                {item.assignedTo.avatar ? (
                                  <img
                                    src={item.assignedTo.avatar}
                                    alt={item.assignedTo.name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <span>{item.assignedTo.name.charAt(0)}</span>
                                )}
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                {item.assignedTo.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">N/A</span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.assignedTo && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                              >
                                <Mail className="h-4.5 w-4.5" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                                >
                                  <MoreHorizontal className="h-4.5 w-4.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View details</DropdownMenuItem>
                                {item.status === 'Awaiting match' && (
                                  <DropdownMenuItem className="text-destructive">
                                    Cancel shipment
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
