import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  authError: string | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  joinShipmentChat: (shipmentId: string) => void;
  leaveShipmentChat: (shipmentId: string) => void;
}

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  authError: null,

  connectSocket: () => {
    const currentSocket = get().socket;
    if (currentSocket && (currentSocket.connected || currentSocket.active)) return;

    if (currentSocket) {
      currentSocket.disconnect();
    }

    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      set({ isConnected: true, authError: null });
    });

    socketInstance.on('disconnect', () => {
      set({ isConnected: false });
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      set({ authError: err.message, isConnected: false });
    });

    set({ socket: socketInstance });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, authError: null });
    }
  },

  joinRoom: (roomId: string) => {
    const { socket } = get();
    if (socket && roomId) {
      socket.emit('join-ticket', roomId);
    }
  },

  leaveRoom: (roomId: string) => {
    const { socket } = get();
    if (socket && roomId) {
      socket.emit('leave-ticket', roomId);
    }
  },

  joinShipmentChat: (shipmentId: string) => {
    const { socket } = get();
    if (socket && shipmentId) {
      socket.emit('join-shipment-chat', shipmentId);
    }
  },

  leaveShipmentChat: (shipmentId: string) => {
    const { socket } = get();
    if (socket && shipmentId) {
      socket.emit('leave-shipment-chat', shipmentId);
    }
  },
}));
