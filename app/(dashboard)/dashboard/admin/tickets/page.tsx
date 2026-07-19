'use client';

import { useState, useReducer, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  FileText,
  User,
  UserCheck,
  Flag,
  Calendar,
  Filter,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { ticketService, type Ticket, type AdminFilters } from '@/services/ticket.service';
import { uploadPhotos } from '@/services/upload.service';

const CATEGORIES = ['Payment', 'Delivery', 'KYC', 'Technical', 'Other'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  CLOSED: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-50 text-slate-600 border-slate-100',
  MEDIUM: 'bg-blue-50 text-blue-600 border-blue-100',
  HIGH: 'bg-orange-50 text-orange-600 border-orange-100',
  URGENT: 'bg-red-50 text-red-600 border-red-100 animate-pulse',
};

// --- Debounce Helper ---
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// --- Filters Reducer ---
type FiltersState = {
  page: number;
  search: string;
  status: string;
  category: string;
  priority: string;
  assigneeId: string;
  startDate: string;
  endDate: string;
};

type FiltersAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_STATUS'; status: string }
  | { type: 'SET_CATEGORY'; category: string }
  | { type: 'SET_PRIORITY'; priority: string }
  | { type: 'SET_ASSIGNEE'; assigneeId: string }
  | { type: 'SET_DATES'; startDate: string; endDate: string }
  | { type: 'RESET' };

const initialFilters: FiltersState = {
  page: 1,
  search: '',
  status: 'ALL',
  category: 'ALL',
  priority: 'ALL',
  assigneeId: 'ALL',
  startDate: '',
  endDate: '',
};

function filtersReducer(state: FiltersState, action: FiltersAction): FiltersState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.page };
    case 'SET_SEARCH':
      return { ...state, page: 1, search: action.search };
    case 'SET_STATUS':
      return { ...state, page: 1, status: action.status };
    case 'SET_CATEGORY':
      return { ...state, page: 1, category: action.category };
    case 'SET_PRIORITY':
      return { ...state, page: 1, priority: action.priority };
    case 'SET_ASSIGNEE':
      return { ...state, page: 1, assigneeId: action.assigneeId };
    case 'SET_DATES':
      return { ...state, page: 1, startDate: action.startDate, endDate: action.endDate };
    case 'RESET':
      return initialFilters;
    default:
      return state;
  }
}

export default function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
  const debouncedSearch = useDebouncedValue(filters.search, 400);

  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Admin reply states
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [isUploadingReply, setIsUploadingReply] = useState(false);

  // Build API filter params
  const apiFilters: AdminFilters = {
    page: filters.page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: filters.status === 'ALL' ? undefined : filters.status,
    category: filters.category === 'ALL' ? undefined : filters.category,
    priority: filters.priority === 'ALL' ? undefined : filters.priority,
    assigneeId: filters.assigneeId === 'ALL' ? undefined : filters.assigneeId,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };

  // Fetch tickets for admin
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isRefetching: isTicketsRefetching,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ['admin-tickets', apiFilters],
    queryFn: () => ticketService.getAllTickets(apiFilters),
  });

  // Fetch ticket details when expanded
  const { data: expandedTicket, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['admin-ticket-details', expandedTicketId],
    queryFn: () => ticketService.getTicketDetails(expandedTicketId!),
    enabled: !!expandedTicketId,
  });

  // Fetch admin list for assignees
  const { data: assignees } = useQuery({
    queryKey: ['admin-assignees'],
    queryFn: () => ticketService.getAssignees(),
  });

  // Mutations for ticket updates
  const assignMutation = useMutation({
    mutationFn: ({ ticketId, assigneeId }: { ticketId: string; assigneeId: string }) =>
      ticketService.assignTicket(ticketId, assigneeId),
    onSuccess: (updated) => {
      toast.success(`Ticket assigned to ${updated.assignee?.name || 'Support member'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-details', expandedTicketId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign ticket');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      ticketService.updateTicketStatus(ticketId, status),
    onSuccess: (updated) => {
      toast.success(`Ticket status updated to ${updated.status}`);
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-details', expandedTicketId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });

  const priorityMutation = useMutation({
    mutationFn: ({ ticketId, priority }: { ticketId: string; priority: string }) =>
      ticketService.updateTicketPriority(ticketId, priority),
    onSuccess: (updated) => {
      toast.success(`Ticket priority updated to ${updated.priority}`);
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-details', expandedTicketId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update priority');
    },
  });

  // Post comment reply mutation (supports attachments for admins)
  const addReplyMutation = useMutation({
    mutationFn: ({
      ticketId,
      message,
      attachments,
    }: {
      ticketId: string;
      message: string;
      attachments?: string[];
    }) => ticketService.addComment(ticketId, message, attachments),
    onSuccess: () => {
      setReplyMessage('');
      setReplyFiles([]);
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-details', expandedTicketId] });
      toast.success('Reply posted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to post reply');
    },
  });

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      if (replyFiles.length + filesArray.length > 5) {
        toast.error('You can upload a maximum of 5 files.');
        return;
      }

      const invalidFiles = filesArray.filter((file) => file.size > 3 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error('Each file must be under 3MB.');
        return;
      }

      setReplyFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeReplyFile = (index: number) => {
    setReplyFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !expandedTicketId) return;

    setIsUploadingReply(true);
    let attachmentUrls: string[] = [];

    try {
      if (replyFiles.length > 0) {
        const uploaded = await uploadPhotos(replyFiles);
        attachmentUrls = uploaded.map((file) => file.url);
      }

      addReplyMutation.mutate({
        ticketId: expandedTicketId,
        message: replyMessage,
        attachments: attachmentUrls,
      });
    } catch (err: any) {
      toast.error('Failed to upload attachments. Please try again.');
    } finally {
      setIsUploadingReply(false);
    }
  };

  // Format SLA response text
  const getSLAResponseText = (ticket: Ticket) => {
    if (ticket.slaFirstResponseAt) {
      const start = new Date(ticket.createdAt).getTime();
      const end = new Date(ticket.slaFirstResponseAt).getTime();
      const diffHrs = ((end - start) / (1000 * 60 * 60)).toFixed(1);
      return `Responded in ${diffHrs}h`;
    }
    // Calculate elapsed hours
    const elapsedHrs = ((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60)).toFixed(1);
    return `Pending response (${elapsedHrs}h elapsed)`;
  };

  const getSLAResolutionText = (ticket: Ticket) => {
    if (ticket.slaResolvedAt) {
      const start = new Date(ticket.createdAt).getTime();
      const end = new Date(ticket.slaResolvedAt).getTime();
      const diffDays = ((end - start) / (1000 * 60 * 60 * 24)).toFixed(1);
      return `Resolved in ${diffDays} days`;
    }
    if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
      return 'Resolved';
    }
    const elapsedDays = ((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1);
    return `Active (${elapsedDays} days open)`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-primary" />
            Support Tickets Control Room
          </h1>
          <p className="text-muted-foreground">
            Manage, assign, prioritize and resolve user support issues.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-primary/5 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Ticket ID, Title, Description or User Name..."
              value={filters.search}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', search: e.target.value })}
              className="pl-10 h-11 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Button
              variant={showAdvanced ? 'secondary' : 'outline'}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="h-11 gap-2 w-full md:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => refetchTickets()}
              className="h-11 w-11 shrink-0"
              disabled={isTicketsLoading || isTicketsRefetching}
            >
              <RefreshCw
                className={`h-4 w-4 ${isTicketsLoading || isTicketsRefetching ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-primary/5">
                {/* Category */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Category
                  </Label>
                  <Select
                    value={filters.category}
                    onValueChange={(val) => dispatch({ type: 'SET_CATEGORY', category: val })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat.toUpperCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Priority
                  </Label>
                  <Select
                    value={filters.priority}
                    onValueChange={(val) => dispatch({ type: 'SET_PRIORITY', priority: val })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Priorities</SelectItem>
                      {PRIORITIES.map((pri) => (
                        <SelectItem key={pri} value={pri}>
                          {pri}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Assignee
                  </Label>
                  <Select
                    value={filters.assigneeId}
                    onValueChange={(val) => dispatch({ type: 'SET_ASSIGNEE', assigneeId: val })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Assignees</SelectItem>
                      {assignees?.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date range filters */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Date Range
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        dispatch({
                          type: 'SET_DATES',
                          startDate: e.target.value,
                          endDate: filters.endDate,
                        })
                      }
                      className="h-10 text-xs px-2"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        dispatch({
                          type: 'SET_DATES',
                          startDate: filters.startDate,
                          endDate: e.target.value,
                        })
                      }
                      className="h-10 text-xs px-2"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-primary/5">
                <Button
                  variant="ghost"
                  onClick={() => dispatch({ type: 'RESET' })}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-primary/[0.03] p-1 rounded-xl border border-primary/5 self-start w-fit">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
          <button
            key={status}
            onClick={() => dispatch({ type: 'SET_STATUS', status })}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              filters.status === status
                ? 'bg-white shadow-sm text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {status === 'ALL' ? 'All Statuses' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ticket List Accordion */}
      <div className="space-y-4">
        {isTicketsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p>Loading administration tickets...</p>
          </div>
        ) : !ticketsData?.tickets || ticketsData.tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-2xl bg-card">
            <LifeBuoy className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="font-semibold text-lg">No support tickets found</p>
            <p className="text-sm text-muted-foreground mt-1">
              There are no support tickets matching the select query constraints.
            </p>
          </div>
        ) : (
          <>
            <Accordion
              type="single"
              collapsible
              value={expandedTicketId || ''}
              onValueChange={(val) => setExpandedTicketId(val || null)}
              className="space-y-4"
            >
              {ticketsData.tickets.map((ticket) => (
                <AccordionItem
                  key={ticket.id}
                  value={ticket.id}
                  className="bg-card border border-primary/5 rounded-2xl overflow-hidden px-0"
                >
                  <AccordionTrigger className="hover:no-underline px-6 py-5 flex items-center justify-between text-left group">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-5 w-full mr-4">
                      <span className="font-mono text-sm font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md shrink-0">
                        {ticket.ticketId}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-base truncate">
                            {ticket.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.user?.name || 'Unknown User'}
                          </span>
                          <span>•</span>
                          <span className="font-medium bg-primary/5 text-primary px-2 py-0.5 rounded">
                            {ticket.category}
                          </span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          {ticket.assignee && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-primary bg-primary/5 px-2 py-0.5 rounded">
                                <UserCheck className="h-3 w-3" />
                                {ticket.assignee.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center mt-2 sm:mt-0">
                        <Badge className={`border uppercase text-[10px] font-bold py-0.5 px-2 ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`border uppercase text-[10px] font-bold py-0.5 px-2 ${PRIORITY_COLORS[ticket.priority]}`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="border-t border-primary/5 bg-primary/[0.01] px-6 py-5">
                    {isDetailsLoading ? (
                      <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                        <span>Loading ticket thread & controls...</span>
                      </div>
                    ) : !expandedTicket ? (
                      <p className="text-destructive text-sm">Failed to retrieve ticket info.</p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Discussion thread column */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Description box */}
                          <div className="bg-white p-5 rounded-xl border border-primary/5 space-y-3 shadow-sm">
                            <div>
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                User Query Description
                              </span>
                              <p className="text-sm text-foreground whitespace-pre-line">
                                {expandedTicket.description}
                              </p>
                            </div>

                            {expandedTicket.attachments && expandedTicket.attachments.length > 0 && (
                              <div className="pt-2 border-t border-dashed mt-3">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                  User Attachments
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {expandedTicket.attachments.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-2 p-2 border rounded-lg bg-card hover:bg-primary/5 transition-all text-xs font-medium max-w-[200px] truncate"
                                    >
                                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                                      <span className="truncate">Attachment {idx + 1}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Chat thread */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold border-b border-primary/5 pb-2 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-primary" />
                              Conversation Thread
                            </h4>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                              {expandedTicket.comments.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic text-center py-4">
                                  No replies posted yet.
                                </p>
                              ) : (
                                expandedTicket.comments.map((comment) => {
                                  const isAdmin = comment.user.role === 'admin';
                                  return (
                                    <div
                                      key={comment.id}
                                      className={`flex gap-3 max-w-[85%] ${
                                        isAdmin ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'
                                      }`}
                                    >
                                      <div
                                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                          isAdmin ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {isAdmin ? 'A' : 'U'}
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span className="font-semibold text-foreground">
                                            {comment.user.name} {isAdmin && '(Staff)'}
                                          </span>
                                          <span>•</span>
                                          <span>
                                            {new Date(comment.createdAt).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </span>
                                        </div>
                                        <div
                                          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-line ${
                                            isAdmin
                                              ? 'bg-primary text-white rounded-tr-none'
                                              : 'bg-muted text-foreground rounded-tl-none'
                                          }`}
                                        >
                                          {comment.message}
                                        </div>
                                        {comment.attachments && comment.attachments.length > 0 && (
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {comment.attachments.map((fileUrl, fIdx) => (
                                              <a
                                                key={fIdx}
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 p-1 px-2 border rounded bg-card hover:bg-primary/5 text-[10px] max-w-[150px] truncate"
                                              >
                                                <Paperclip className="h-3 w-3 shrink-0" />
                                                <span className="truncate">File {fIdx + 1}</span>
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Reply Box with attachment support */}
                          <div className="border-t border-primary/5 pt-4">
                            {expandedTicket.status === 'CLOSED' || expandedTicket.status === 'RESOLVED' ? (
                              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs">
                                <AlertCircle className="h-4 w-4 text-slate-500" />
                                Ticket is {expandedTicket.status.toLowerCase()}. Actions are locked.
                              </div>
                            ) : (
                              <form onSubmit={handlePostReply} className="space-y-3">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Type staff response..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    disabled={addReplyMutation.isPending || isUploadingReply}
                                    className="flex-1 h-11"
                                  />
                                  <Button
                                    type="submit"
                                    disabled={
                                      addReplyMutation.isPending ||
                                      isUploadingReply ||
                                      !replyMessage.trim()
                                    }
                                    className="bg-primary hover:bg-primary/95 text-white h-11 px-5"
                                  >
                                    {addReplyMutation.isPending || isUploadingReply ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>

                                {/* Attachment options */}
                                <div className="flex items-center gap-4">
                                  <div className="relative shrink-0">
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*,application/pdf"
                                      onChange={handleReplyFileChange}
                                      disabled={replyFiles.length >= 5}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="text-xs gap-1.5 h-8"
                                      disabled={replyFiles.length >= 5}
                                    >
                                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                                      Attach Files ({replyFiles.length}/5)
                                    </Button>
                                  </div>

                                  <span className="text-[11px] text-muted-foreground">
                                    JPG, PNG, PDF up to 3MB each
                                  </span>
                                </div>

                                {replyFiles.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {replyFiles.map((file, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-1.5 p-1 px-2 bg-muted rounded-full text-[10px] font-medium"
                                      >
                                        <FileText className="h-3 w-3 text-primary" />
                                        <span className="max-w-[100px] truncate">{file.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => removeReplyFile(idx)}
                                          className="text-muted-foreground hover:text-destructive"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </form>
                            )}
                          </div>
                        </div>

                        {/* Admin Action Control Column */}
                        <div className="bg-white p-5 rounded-xl border border-primary/5 space-y-5 shadow-sm self-start">
                          <h4 className="text-sm font-bold border-b border-primary/5 pb-2 text-foreground">
                            Control Panel
                          </h4>

                          {/* Ticket Meta Context */}
                          <div className="space-y-3 text-xs border-b border-primary/5 pb-4">
                            <div>
                              <span className="text-muted-foreground block font-medium">Requester</span>
                              <span className="font-semibold text-foreground block">
                                {expandedTicket.user?.name}
                              </span>
                              <span className="text-muted-foreground block">
                                {expandedTicket.user?.email}
                              </span>
                            </div>

                            {expandedTicket.shipment && (
                              <div>
                                <span className="text-muted-foreground block font-medium">Related Shipment</span>
                                <span className="font-semibold text-primary block">
                                  {expandedTicket.shipment.itemName}
                                </span>
                              </div>
                            )}

                            {expandedTicket.trip && (
                              <div>
                                <span className="text-muted-foreground block font-medium">Related Trip</span>
                                <span className="font-semibold text-emerald-600 block">
                                  {expandedTicket.trip.flightNumber} ({expandedTicket.trip.fromCountry} → {expandedTicket.trip.toCountry})
                                </span>
                              </div>
                            )}
                          </div>

                          {/* SLA Metrics */}
                          <div className="space-y-3 border-b border-primary/5 pb-4 text-xs">
                            <h5 className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                              SLA Compliance
                            </h5>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                                  First Response:
                                </span>
                                <span className="font-semibold text-foreground">
                                  {getSLAResponseText(expandedTicket)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  Resolution Time:
                                </span>
                                <span className="font-semibold text-foreground">
                                  {getSLAResolutionText(expandedTicket)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Management drop-downs */}
                          <div className="space-y-4">
                            {/* Assignee */}
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                Assign Ticket
                              </Label>
                              <Select
                                value={expandedTicket.assigneeId || 'UNASSIGNED'}
                                onValueChange={(val) =>
                                  assignMutation.mutate({
                                    ticketId: expandedTicket.id,
                                    assigneeId: val,
                                  })
                                }
                                disabled={
                                  assignMutation.isPending ||
                                  expandedTicket.status === 'CLOSED' ||
                                  expandedTicket.status === 'RESOLVED'
                                }
                              >
                                <SelectTrigger className="w-full text-xs h-9">
                                  <SelectValue placeholder="Select staff member" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="UNASSIGNED" disabled>
                                    Unassigned
                                  </SelectItem>
                                  {assignees?.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                Update Status
                              </Label>
                              <Select
                                value={expandedTicket.status}
                                onValueChange={(val) =>
                                  statusMutation.mutate({
                                    ticketId: expandedTicket.id,
                                    status: val,
                                  })
                                }
                                disabled={statusMutation.isPending}
                              >
                                <SelectTrigger className="w-full text-xs h-9">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status.replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Priority */}
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                Set Priority
                              </Label>
                              <Select
                                value={expandedTicket.priority}
                                onValueChange={(val) =>
                                  priorityMutation.mutate({
                                    ticketId: expandedTicket.id,
                                    priority: val,
                                  })
                                }
                                disabled={
                                  priorityMutation.isPending ||
                                  expandedTicket.status === 'CLOSED' ||
                                  expandedTicket.status === 'RESOLVED'
                                }
                              >
                                <SelectTrigger className="w-full text-xs h-9">
                                  <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PRIORITIES.map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                      {priority}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Pagination */}
            {ticketsData.meta.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (filters.page > 1) dispatch({ type: 'SET_PAGE', page: filters.page - 1 });
                        }}
                        aria-disabled={filters.page === 1}
                        className={filters.page === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: ticketsData.meta.totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch({ type: 'SET_PAGE', page: p });
                          }}
                          isActive={filters.page === p}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (filters.page < ticketsData.meta.totalPages)
                            dispatch({ type: 'SET_PAGE', page: filters.page + 1 });
                        }}
                        aria-disabled={filters.page === ticketsData.meta.totalPages}
                        className={
                          filters.page === ticketsData.meta.totalPages
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
