import apiClient from '@/lib/api-client';

export interface Ticket {
  id: string;
  ticketId: string;
  category: string;
  title: string;
  description: string;
  attachments: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  userId: string;
  assigneeId: string | null;
  slaFirstResponseAt: string | null;
  slaResolvedAt: string | null;
  senderId?: string | null;
  travelerId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  shipment?: {
    id: string;
    itemName: string;
    status: string;
    fromCountry?: string;
    toCountry?: string;
  } | null;
  trip?: {
    id: string;
    flightNumber: string;
    status: string;
    fromCountry?: string;
    toCountry?: string;
  } | null;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  attachments: string[];
  visibleTo: 'ALL' | 'SENDER' | 'TRAVELER';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AssociatedRecords {
  shipments: Array<{
    id: string;
    itemName: string;
    status: string;
    fromCountry: string;
    toCountry: string;
    createdAt: string;
  }>;
  trips: Array<{
    id: string;
    flightNumber: string;
    status: string;
    fromCountry: string;
    toCountry: string;
    createdAt: string;
  }>;
}

export interface PaginatedTickets {
  tickets: Ticket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTicketData {
  category: string;
  title: string;
  description: string;
  shipmentId?: string;
  tripId?: string;
  attachments?: string[];
}

export interface AdminFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

const getAssociatedRecords = async (): Promise<AssociatedRecords> => {
  const { data } = await apiClient.get<{ data: AssociatedRecords }>('/tickets/associated-records');
  return data.data;
};

const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
  const { data: response } = await apiClient.post<{ data: Ticket }>('/tickets', data);
  return response.data;
};

const getMyTickets = async (page: number = 1, status?: string): Promise<PaginatedTickets> => {
  const params: Record<string, string | number> = { page };
  if (status) params.status = status;
  const { data } = await apiClient.get<{ data: Ticket[]; meta: PaginatedTickets['meta'] }>('/tickets', { params });
  return {
    tickets: data.data,
    meta: data.meta,
  };
};

const getTicketDetails = async (id: string): Promise<Ticket & { comments: TicketComment[] }> => {
  const { data } = await apiClient.get<{ data: Ticket & { comments: TicketComment[] } }>(`/tickets/${id}`);
  return data.data;
};

const addComment = async (
  ticketId: string,
  message: string,
  attachments?: string[],
  visibleTo?: string
): Promise<TicketComment> => {
  const { data } = await apiClient.post<{ data: TicketComment }>(`/tickets/${ticketId}/comments`, {
    message,
    attachments,
    visibleTo,
  });
  return data.data;
};

const closeTicket = async (id: string): Promise<Ticket> => {
  const { data } = await apiClient.patch<{ data: Ticket }>(`/tickets/${id}/close`);
  return data.data;
};

// Admin services
const getAllTickets = async (filters: AdminFilters = {}): Promise<PaginatedTickets> => {
  const { data } = await apiClient.get<{ data: Ticket[]; meta: PaginatedTickets['meta'] }>('/tickets/admin/list', {
    params: filters,
  });
  return {
    tickets: data.data,
    meta: data.meta,
  };
};

const assignTicket = async (ticketId: string, assigneeId: string): Promise<Ticket> => {
  const { data } = await apiClient.patch<{ data: Ticket }>(`/tickets/admin/${ticketId}/assign`, {
    assigneeId,
  });
  return data.data;
};

const updateTicketStatus = async (ticketId: string, status: string): Promise<Ticket> => {
  const { data } = await apiClient.patch<{ data: Ticket }>(`/tickets/admin/${ticketId}/status`, {
    status,
  });
  return data.data;
};

const updateTicketPriority = async (ticketId: string, priority: string): Promise<Ticket> => {
  const { data } = await apiClient.patch<{ data: Ticket }>(`/tickets/admin/${ticketId}/priority`, {
    priority,
  });
  return data.data;
};

const getAssignees = async (): Promise<Array<{ id: string; name: string; email: string }>> => {
  const { data } = await apiClient.get<{ data: Array<{ id: string; name: string; email: string }> }>('/tickets/admin/assignees');
  return data.data;
};

export const ticketService = {
  getAssociatedRecords,
  createTicket,
  getMyTickets,
  getTicketDetails,
  addComment,
  closeTicket,
  getAllTickets,
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
  getAssignees,
};
