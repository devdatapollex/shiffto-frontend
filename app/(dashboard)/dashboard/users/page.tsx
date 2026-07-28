'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  CheckCircle,
  UserMinus,
  Calendar,
  Award,
  Package,
  Plane,
  ChevronRight,
  ShieldAlert,
  Trash2,
  Lock,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { userService, type AdminUserListItem } from '@/services/user.service';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-primary text-white border-primary font-bold shadow-xs',
  SUSPENDED: 'bg-primary text-white border-primary font-bold shadow-xs',
  DEACTIVATED: 'bg-primary text-white border-primary font-bold shadow-xs',
  PENDING_KYC: 'bg-primary text-white border-primary font-bold shadow-xs',
};

const KYC_COLORS: Record<string, string> = {
  APPROVED: 'bg-primary text-white border-primary font-bold shadow-xs',
  PENDING: 'bg-primary text-white border-primary font-bold shadow-xs',
  REJECTED: 'bg-primary text-white border-primary font-bold shadow-xs',
  NOT_SUBMITTED:
    'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 font-semibold',
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(12);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // reset to page 1 on search
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch paginated admin users
  const {
    data: usersData,
    isLoading: isUsersLoading,
    isRefetching: isUsersRefetching,
    refetch,
  } = useQuery({
    queryKey: ['admin-users-list', currentPage, limitPerPage, statusFilter, debouncedSearch],
    queryFn: () =>
      userService.getAllUsers({
        page: currentPage,
        limit: limitPerPage,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
      }),
  });

  // Bulk actions mutation
  const bulkMutation = useMutation({
    mutationFn: ({
      userIds,
      action,
    }: {
      userIds: string[];
      action: 'SUSPEND' | 'DEACTIVATE' | 'DELETE';
    }) => userService.bulkAction(userIds, action),
    onSuccess: (_, variables) => {
      toast.success(`Successfully executed bulk ${variables.action.toLowerCase()} action`);
      setSelectedUserIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Bulk action failed');
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && usersData?.data) {
      setSelectedUserIds(usersData.data.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const executeBulkAction = (action: 'SUSPEND' | 'DEACTIVATE' | 'DELETE') => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    const confirmMsg =
      action === 'DELETE'
        ? `Are you sure you want to delete these ${selectedUserIds.length} users? This cannot be undone.`
        : `Execute bulk ${action.toLowerCase()} on ${selectedUserIds.length} users?`;

    if (window.confirm(confirmMsg)) {
      bulkMutation.mutate({ userIds: selectedUserIds, action });
    }
  };

  const isAllSelected =
    usersData?.data &&
    usersData.data.length > 0 &&
    selectedUserIds.length === usersData.data.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor, inspect profiles, update commissions, approve KYC, and manage users.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1 border-primary/10 hover:bg-primary/5 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isUsersRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/5 pb-4 mb-2">
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-300/70">
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'INACTIVE', label: 'Inactive' },
            { id: 'PENDING_KYC', label: 'Pending KYC' },
            { id: 'SUSPENDED', label: 'Suspended' },
            { id: 'DEACTIVATED', label: 'Deactivated' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
                setSelectedUserIds([]);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                statusFilter === tab.id
                  ? 'bg-white shadow-sm text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-primary/10 focus-visible:ring-primary bg-card/50"
          />
        </div>
      </div>

      {/* Bulk Actions Header */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 px-4 bg-slate-100/50 border border-slate-300/70 rounded-lg animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-semibold text-primary">
            {selectedUserIds.length} users selected
          </span>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => executeBulkAction('SUSPEND')}
              className="text-red-600 border-red-200 bg-white hover:bg-red-50 hover:text-red-700 text-xs py-1 h-7"
            >
              <Lock className="h-3 w-3 mr-1" />
              Suspend
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={() => executeBulkAction('DEACTIVATE')}
              className="text-slate-600 border-slate-200 bg-white hover:bg-slate-50 text-xs py-1 h-7"
            >
              <UserMinus className="h-3 w-3 mr-1" />
              Deactivate
            </Button>
            <Button
              size="xs"
              variant="destructive"
              onClick={() => executeBulkAction('DELETE')}
              className="text-xs py-1 h-7"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* User cards / table */}
      {isUsersLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : !usersData?.data || usersData.data.length === 0 ? (
        <div className="text-center py-16 bg-card border border-primary/5 rounded-lg">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No users found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            No users matched the selected filter criteria or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select all header for table view option */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-primary/5 text-xs text-muted-foreground">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
              aria-label="Select all users"
              className="bg-white data-[state=unchecked]:bg-white border-slate-300"
            />
            <span>Select All Visible Users</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usersData.data.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              return (
                <motion.div key={user.id} layout className="h-full">
                  <Card
                    className={`h-full flex flex-col justify-between transition-all duration-300 py-0 gap-0 overflow-hidden ${
                      isSelected
                        ? 'border-primary/40 ring-2 ring-primary/10 shadow-md bg-card'
                        : 'border-primary/10 hover:border-primary/30 hover:shadow-md bg-card'
                    }`}
                  >
                    {/* Card Header */}
                    <CardHeader className="p-5 pb-4 border-b border-primary/5 flex flex-row items-start justify-between gap-3 space-y-0">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                          aria-label={`Select ${user.name}`}
                          className="shrink-0"
                        />

                        {/* Avatar */}
                        <div className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground bg-primary shrink-0 overflow-hidden shadow-inner">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Name/Email */}
                        <div className="overflow-hidden min-w-0">
                          <CardTitle className="text-base font-semibold text-foreground truncate hover:text-primary transition-colors flex items-center gap-1.5">
                            <Link href={`/dashboard/users/${user.id}`} className="truncate">
                              {user.name}
                            </Link>
                            {user.trustScore >= 90 && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-50 shrink-0" />
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground truncate mt-0.5">
                            {user.email}
                          </CardDescription>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <CardAction>
                        <Badge
                          className={`border uppercase text-[9px] font-bold py-0.5 px-2 ${STATUS_COLORS[user.status]}`}
                        >
                          {user.status.replace('_', ' ')}
                        </Badge>
                      </CardAction>
                    </CardHeader>

                    {/* Card Content stats & details */}
                    <CardContent className="p-5 py-4 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        {/* Activity Stats */}
                        <div className="grid grid-cols-3 gap-2 border border-primary/10 py-3 bg-primary/[0.02] rounded-lg px-2 text-center">
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Shipments
                            </span>
                            <span className="text-sm font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                              <Package className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {user.activity.shipmentsCreated}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Trips
                            </span>
                            <span className="text-sm font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                              <Plane className="h-3.5 w-3.5 text-muted-foreground/60" />
                              {user.activity.tripsAdded}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Deliveries
                            </span>
                            <span className="text-sm font-bold text-foreground flex items-center justify-center gap-1 mt-0.5">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              {user.activity.deliveriesCompleted}
                            </span>
                          </div>
                        </div>

                        {/* Meta Details */}
                        <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>
                              Trust Score: <strong className="text-foreground">{user.trustScore}</strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 justify-end">
                            <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            <span>
                              KYC:{' '}
                              <Badge
                                variant="outline"
                                className={`py-0 px-1.5 text-[9px] font-bold ${KYC_COLORS[user.kycStatus]}`}
                              >
                                {user.kycStatus.replace('_', ' ')}
                              </Badge>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right text-[10px] text-muted-foreground truncate self-center">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>

                      {/* View details footer button inside main card section */}
                      <div className="border-t border-primary/5 pt-0 mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Commission: <strong className="text-foreground">{user.commissionRate}%</strong>
                        </span>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:text-primary-foreground hover:bg-primary text-xs flex items-center gap-1 rounded-lg h-8 px-3"
                        >
                          <Link href={`/dashboard/users/${user.id}`}>
                            View Profile
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination & Limit Selector */}
          <div className="pt-6 border-t border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show per page:</span>
              <Select
                value={String(limitPerPage)}
                onValueChange={(val) => {
                  setLimitPerPage(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8 text-xs border-primary/10">
                  <SelectValue placeholder="12" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                  <SelectItem value="96">96</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-2">
                Showing {usersData.data.length} of {usersData.meta.total} users
              </span>
            </div>

            {usersData.meta.total > limitPerPage && (
              <Pagination className="m-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      className={
                        currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(usersData.meta.total / limitPerPage) }).map(
                    (_, idx) => (
                      <PaginationItem key={idx}>
                        <PaginationLink
                          isActive={currentPage === idx + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(idx + 1);
                          }}
                          className="h-8 w-8 text-xs cursor-pointer"
                        >
                          {idx + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        const totalPages = Math.ceil(usersData.meta.total / limitPerPage);
                        if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                      }}
                      className={
                        currentPage >= Math.ceil(usersData.meta.total / limitPerPage)
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
