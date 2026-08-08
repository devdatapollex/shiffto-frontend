import apiClient from '@/lib/api-client';

export interface ShipmentMessageSender {
  id: string;
  name: string;
  image?: string | null;
}

export interface ShipmentMessage {
  id: string;
  shipmentId: string;
  senderId: string;
  message: string;
  attachments: string[];
  isRead: boolean;
  createdAt: string;
  sender: ShipmentMessageSender;
}

export interface CounterpartyInfo {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  role: 'Sender' | 'Traveler' | 'Participant';
  isOnline: boolean;
}

export interface ShipmentMessagesResponse {
  shipment: {
    id: string;
    itemName: string;
    status: string;
    senderId: string;
    travelerId: string | null;
  };
  counterparty: CounterpartyInfo | null;
  messages: ShipmentMessage[];
}

const getMessages = async (shipmentId: string): Promise<ShipmentMessagesResponse> => {
  const { data } = await apiClient.get<{ data: ShipmentMessagesResponse }>(
    `/shipment-messages/${shipmentId}`
  );
  return data.data;
};

const sendMessage = async (
  shipmentId: string,
  message: string,
  attachments?: string[]
): Promise<ShipmentMessage> => {
  const { data } = await apiClient.post<{ data: ShipmentMessage }>(
    `/shipment-messages/${shipmentId}`,
    { message, attachments }
  );
  return data.data;
};

const markAsRead = async (shipmentId: string): Promise<{ count: number }> => {
  const { data } = await apiClient.patch<{ data: { count: number } }>(
    `/shipment-messages/${shipmentId}/read`
  );
  return data.data;
};

export const shipmentMessageService = {
  getMessages,
  sendMessage,
  markAsRead,
};
