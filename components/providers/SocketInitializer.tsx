'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { useSocketStore } from '@/store/useSocketStore';

export function SocketInitializer() {
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();
  const { socket, connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [session?.user, isPending, connectSocket, disconnectSocket]);

  // Global Real-Time Socket Listeners for Notifications, Sidebar Counters & Page Data
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: {
      id: string;
      title: string;
      message: string;
      createdAt: string;
    }) => {
      // 1. Show real-time Toast Notification
      toast.info(notification.title, {
        description: notification.message,
      });

      // 2. Invalidate notifications query to update Bell badge and Notifications Page live
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleAdminCountsUpdated = () => {
      // Invalidate Admin sidebar count query
      queryClient.invalidateQueries({ queryKey: ['admin-sidebar-counts'] });

      // Invalidate Admin page list data queries so active tables update live
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      queryClient.invalidateQueries({ queryKey: ['admin-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    };

    const handleOffersCountUpdated = () => {
      // Invalidate User offers count query
      queryClient.invalidateQueries({ queryKey: ['received-offers-count'] });

      // Invalidate User offers & shipments page data queries
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-shipments'] });
    };

    const handleAvailableShipmentsCountUpdated = () => {
      // Invalidate User available shipments count query
      queryClient.invalidateQueries({ queryKey: ['available-shipments-count'] });

      // Invalidate available shipments & my-trips page data queries
      queryClient.invalidateQueries({ queryKey: ['available-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['my-trips'] });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('admin-counts:updated', handleAdminCountsUpdated);
    socket.on('offers-count:updated', handleOffersCountUpdated);
    socket.on('available-shipments-count:updated', handleAvailableShipmentsCountUpdated);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('admin-counts:updated', handleAdminCountsUpdated);
      socket.off('offers-count:updated', handleOffersCountUpdated);
      socket.off('available-shipments-count:updated', handleAvailableShipmentsCountUpdated);
    };
  }, [socket, queryClient]);

  return null;
}
