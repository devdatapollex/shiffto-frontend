'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  LifeBuoy,
  Plus,
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
  ArrowRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { ticketService, type Ticket } from '@/services/ticket.service';
import { uploadPhotos } from '@/services/upload.service';
import { useSession } from '@/lib/auth-client';

const CATEGORIES = ['Order', 'Trip', 'Payment', 'Delivery', 'KYC', 'Technical', 'Other'];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-primary text-white border-primary font-bold shadow-xs',
  IN_PROGRESS: 'bg-primary text-white border-primary font-bold shadow-xs',
  RESOLVED: 'bg-primary text-white border-primary font-bold shadow-xs',
  CLOSED: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 font-semibold',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-50 text-slate-600 border-slate-100',
  MEDIUM: 'bg-blue-50 text-blue-600 border-blue-100',
  HIGH: 'bg-orange-50 text-orange-600 border-orange-100',
  URGENT: 'bg-red-50 text-red-600 border-red-100 animate-pulse',
};

export default function UserSupportPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocalhost) {
        return 'http://localhost:5000';
      }
    }
    return '';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // New ticket form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRelationId, setNewRelationId] = useState<string>('NONE');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Reset relation ID on category change to keep options aligned
  useEffect(() => {
    setNewRelationId('NONE');
  }, [newCategory]);

  // Comment input state
  const [commentMessage, setCommentMessage] = useState('');

  // Fetch my tickets
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isRefetching: isTicketsRefetching,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ['my-tickets', currentPage, statusFilter],
    queryFn: () =>
      ticketService.getMyTickets(currentPage, statusFilter === 'ALL' ? undefined : statusFilter),
  });

  // Fetch associated records (shipments/trips) for dropdown
  const { data: associatedRecords } = useQuery({
    queryKey: ['ticket-associated-records'],
    queryFn: () => ticketService.getAssociatedRecords(),
    enabled: isCreateOpen,
  });

  // Fetch ticket details when expanded
  const { data: expandedTicket, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['ticket-details', expandedTicketId],
    queryFn: () => ticketService.getTicketDetails(expandedTicketId!),
    enabled: !!expandedTicketId,
  });

  useEffect(() => {
    if (expandedTicket) {
      setTimeout(scrollToBottom, 100);
    }
  }, [expandedTicket?.comments]);

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: ticketService.createTicket,
    onSuccess: () => {
      toast.success('Support ticket created successfully');
      setIsCreateOpen(false);
      resetCreateForm();
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create support ticket');
    },
  });

  // Post comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) =>
      ticketService.addComment(ticketId, message),
    onSuccess: () => {
      setCommentMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket-details', expandedTicketId] });
      toast.success('Message sent');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });

  // Close ticket mutation
  const closeTicketMutation = useMutation({
    mutationFn: ticketService.closeTicket,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-details', expandedTicketId] });
      toast.success(`Ticket ${updated.ticketId} marked as Closed`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to close ticket');
    },
  });

  // Socket.io real-time listener
  useEffect(() => {
    if (!expandedTicketId) return;

    const socket: Socket = io(getSocketUrl());

    socket.emit('join-ticket', expandedTicketId);

    socket.on('new-comment', (newComment: any) => {
      queryClient.setQueryData(['ticket-details', expandedTicketId], (oldData: any) => {
        if (!oldData) return oldData;
        const exists = oldData.comments.some((c: any) => c.id === newComment.id);
        if (exists) return oldData;

        // Strict privacy check for real-time socket comments
        const isCommentFromAdmin = newComment.user?.role === 'admin';
        if (isCommentFromAdmin) {
          const isTraveler = oldData.travelerId === currentUserId && oldData.senderId !== currentUserId;
          const myRoleTag = isTraveler ? 'TRAVELER' : 'SENDER';
          if (newComment.visibleTo !== 'ALL' && newComment.visibleTo !== myRoleTag) {
            return oldData;
          }
        } else {
          // If comment is from a regular user, only display if I am the author
          if (newComment.userId !== currentUserId) {
            return oldData;
          }
        }

        return {
          ...oldData,
          comments: [...oldData.comments, newComment],
        };
      });
    });

    socket.on('ticket-status-updated', ({ status }: { status: string }) => {
      queryClient.setQueryData(['ticket-details', expandedTicketId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          status,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    });

    return () => {
      socket.emit('leave-ticket', expandedTicketId);
      socket.disconnect();
    };
  }, [expandedTicketId, queryClient]);

  const resetCreateForm = () => {
    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setNewRelationId('NONE');
    setSelectedFiles([]);
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Validate total number of files
      if (selectedFiles.length + filesArray.length > 5) {
        toast.error('You can upload a maximum of 5 files.');
        return;
      }

      // Validate file size (max 3MB each)
      const invalidFiles = filesArray.filter((file) => file.size > 3 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error('Each file must be under 3MB.');
        return;
      }

      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !newCategory || !newDescription.trim()) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    if (newCategory === 'Order' && (newRelationId === 'NONE' || !newRelationId.startsWith('shipment:'))) {
      toast.error('Please select a related order/shipment');
      return;
    }

    if (newCategory === 'Trip' && (newRelationId === 'NONE' || !newRelationId.startsWith('trip:'))) {
      toast.error('Please select a related trip');
      return;
    }

    setIsUploading(true);
    let attachmentUrls: string[] = [];

    try {
      if (selectedFiles.length > 0) {
        const uploaded = await uploadPhotos(selectedFiles);
        attachmentUrls = uploaded.map((file) => file.url);
      }

      // Determine relation types
      let shipmentId: string | undefined;
      let tripId: string | undefined;

      if (newRelationId !== 'NONE') {
        const [type, id] = newRelationId.split(':');
        if (type === 'shipment') {
          shipmentId = id;
        } else if (type === 'trip') {
          tripId = id;
        }
      }

      createTicketMutation.mutate({
        title: newTitle,
        category: newCategory,
        description: newDescription,
        shipmentId,
        tripId,
        attachments: attachmentUrls,
      });
    } catch (err: any) {
      toast.error('Failed to upload attachments. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentMessage.trim() || !expandedTicketId) return;

    addCommentMutation.mutate({
      ticketId: expandedTicketId,
      message: commentMessage,
    });
  };

  const handleCloseTicket = (ticketId: string) => {
    if (confirm('Are you sure you want to close this ticket? It cannot be reopened.')) {
      closeTicketMutation.mutate(ticketId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LifeBuoy className="h-8 w-8 text-primary" />
            Support Center
          </h1>
          <p className="text-muted-foreground">
            Report issues and get assistance regarding your shipments or trips.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/95 text-white gap-2 h-11"
        >
          <Plus className="h-5 w-5" />
          Create Support Ticket
        </Button>
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/5 pb-4">
        <div className="flex items-center gap-1 bg-primary/[0.03] p-1 rounded-xl border border-primary/5">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                statusFilter === status
                  ? 'bg-white shadow-sm text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'ALL' ? 'All Tickets' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => refetchTickets()}
          className="h-10 w-10 shrink-0"
          disabled={isTicketsLoading || isTicketsRefetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isTicketsLoading || isTicketsRefetching ? 'animate-spin' : ''}`}
          />
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {isTicketsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p>Loading tickets...</p>
          </div>
        ) : !ticketsData?.tickets || ticketsData.tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed rounded-lg bg-card">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">No tickets found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter === 'ALL'
                  ? "You haven't created any support tickets yet."
                  : `No tickets matching status "${statusFilter}" were found.`}
              </p>
            </div>
            {statusFilter !== 'ALL' && (
              <Button variant="outline" onClick={() => setStatusFilter('ALL')} className="mt-2">
                Clear Filters
              </Button>
            )}
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
                  className="bg-card border border-primary/5 rounded-lg overflow-hidden px-0"
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
                          <span className="font-medium bg-primary/5 text-primary px-2 py-0.5 rounded">
                            {ticket.category}
                          </span>
                          <span>•</span>
                          <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          {ticket.shipment && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-primary">
                                Shipment: {ticket.shipment.itemName}
                              </span>
                            </>
                          )}
                          {ticket.trip && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                                Trip: {ticket.trip.flightNumber}
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
                        <span>Loading conversation history...</span>
                      </div>
                    ) : !expandedTicket ? (
                      <p className="text-destructive text-sm">Failed to load ticket details.</p>
                    ) : (
                      <div className="space-y-6">
                        {/* Description & Attachments */}
                        <div className="space-y-3 bg-white p-5 rounded-xl border border-primary/5">
                          <div>
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                              Description
                            </span>
                            <p className="text-sm text-foreground whitespace-pre-line">
                              {expandedTicket.description}
                            </p>
                          </div>

                          {expandedTicket.attachments && expandedTicket.attachments.length > 0 && (
                            <div className="pt-2 border-t border-dashed mt-3">
                              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                Attachments
                              </span>
                              <div className="flex flex-wrap gap-3">
                                {expandedTicket.attachments.map((url, idx) => (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-2 border rounded-lg bg-card hover:bg-primary/5 transition-all text-xs font-medium max-w-[200px] truncate"
                                  >
                                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                                    <span className="truncate">File {idx + 1}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Conversation History */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold border-b border-primary/5 pb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Conversation History
                          </h4>

                          <div className="space-y-4 h-[300px] overflow-y-auto pr-2">
                            {expandedTicket.comments.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic text-center py-4">
                                No messages yet.
                              </p>
                            ) : (
                              expandedTicket.comments.map((comment) => {
                                const isAdmin = comment.user.role === 'admin';
                                return (
                                  <div
                                    key={comment.id}
                                    className={`flex gap-3 max-w-[85%] ${
                                      isAdmin ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
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
                                          {comment.user.name}
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
                                        className={`rounded-lg px-4 py-2.5 text-sm shadow-sm whitespace-pre-line ${
                                          isAdmin
                                            ? 'bg-muted text-foreground rounded-tl-none'
                                            : 'bg-primary text-white rounded-tr-none'
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
                                              <span className="truncate">Admin File {fIdx + 1}</span>
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </div>

                        {/* Reply Form / Ticket Actions */}
                        <div className="border-t border-primary/5 pt-4 flex flex-col gap-4">
                          {expandedTicket.status === 'CLOSED' || expandedTicket.status === 'RESOLVED' ? (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs">
                              <AlertCircle className="h-4 w-4 text-slate-500" />
                              This ticket is marked as {expandedTicket.status.toLowerCase()}. You cannot post replies. Please create a new ticket if needed.
                            </div>
                          ) : (
                            <form onSubmit={handleAddComment} className="flex gap-2">
                              <Input
                                placeholder="Type your message here..."
                                value={commentMessage}
                                onChange={(e) => setCommentMessage(e.target.value)}
                                disabled={addCommentMutation.isPending}
                                className="flex-1"
                              />
                              <Button
                                type="submit"
                                disabled={addCommentMutation.isPending || !commentMessage.trim()}
                                className="bg-primary hover:bg-primary/95 text-white"
                              >
                                {addCommentMutation.isPending ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </form>
                          )}

                          {expandedTicket.status !== 'CLOSED' && expandedTicket.status !== 'RESOLVED' && (
                            <div className="flex justify-end border-t border-primary/5 pt-3 mt-1">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCloseTicket(expandedTicket.id)}
                                disabled={closeTicketMutation.isPending}
                                className="text-xs font-semibold gap-1.5"
                              >
                                <X className="h-4 w-4" />
                                Close Ticket
                              </Button>
                            </div>
                          )}
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
                          if (currentPage > 1) setCurrentPage((c) => c - 1);
                        }}
                        aria-disabled={currentPage === 1}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: ticketsData.meta.totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(p);
                          }}
                          isActive={currentPage === p}
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
                          if (currentPage < ticketsData.meta.totalPages) setCurrentPage((c) => c + 1);
                        }}
                        aria-disabled={currentPage === ticketsData.meta.totalPages}
                        className={currentPage === ticketsData.meta.totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => setIsCreateOpen(open)}>
        <DialogContent className="sm:max-w-[550px] rounded-lg overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
              <LifeBuoy className="h-6 w-6" />
              Create Support Ticket
            </DialogTitle>
            <DialogDescription>
              Provide all details below. Required fields are marked with (*).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 py-2">
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-sm font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Relation (Order / Trip Dropdown) */}
            {newCategory === 'Order' && (
              <div className="space-y-1.5">
                <Label htmlFor="relation" className="text-sm font-semibold">
                  Related Order <span className="text-destructive">*</span>
                </Label>
                <Select value={newRelationId} onValueChange={setNewRelationId}>
                  <SelectTrigger id="relation" className="w-full">
                    <SelectValue placeholder="Select active/recent shipment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE" disabled>
                      Select an order
                    </SelectItem>
                    {associatedRecords?.shipments && associatedRecords.shipments.length > 0 ? (
                      associatedRecords.shipments.map((shipment) => (
                        <SelectItem key={shipment.id} value={`shipment:${shipment.id}`}>
                          Shipment: {shipment.itemName} ({shipment.status})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="NONE" disabled>
                        No active/recent shipments found.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newCategory === 'Trip' && (
              <div className="space-y-1.5">
                <Label htmlFor="relation" className="text-sm font-semibold">
                  Related Trip <span className="text-destructive">*</span>
                </Label>
                <Select value={newRelationId} onValueChange={setNewRelationId}>
                  <SelectTrigger id="relation" className="w-full">
                    <SelectValue placeholder="Select active/recent trip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE" disabled>
                      Select a trip
                    </SelectItem>
                    {associatedRecords?.trips && associatedRecords.trips.length > 0 ? (
                      associatedRecords.trips.map((trip) => (
                        <SelectItem key={trip.id} value={`trip:${trip.id}`}>
                          Trip: {trip.flightNumber} ({trip.status})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="NONE" disabled>
                        No active/recent trips found.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-semibold">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-semibold">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Please describe the issue in detail. If related to payment or delivery, provide relevant details."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="min-h-[120px] resize-y"
                required
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center justify-between">
                <span>Attachments (JPG/PNG/PDF, max 3MB each)</span>
                <span className="text-xs text-muted-foreground">{selectedFiles.length}/5 files</span>
              </Label>
              <div className="border-2 border-dashed border-primary/10 rounded-xl p-4 text-center hover:bg-primary/[0.01] transition-all relative">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  disabled={selectedFiles.length >= 5}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Paperclip className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <span className="text-sm text-muted-foreground block">
                  Click or drag files here to upload (max 5 files)
                </span>
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-1.5 px-2.5 bg-muted rounded-full text-xs font-medium"
                    >
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createTicketMutation.isPending || isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createTicketMutation.isPending ||
                  isUploading ||
                  newRelationId === 'NONE' ||
                  !newTitle.trim() ||
                  !newCategory ||
                  !newDescription.trim()
                }
                className="bg-primary hover:bg-primary/95 text-white"
              >
                {createTicketMutation.isPending || isUploading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
