'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useSocketStore } from '@/store/useSocketStore';

export function SocketInitializer() {
  const { data: session, isPending } = useSession();
  const connectSocket = useSocketStore((state) => state.connectSocket);
  const disconnectSocket = useSocketStore((state) => state.disconnectSocket);

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      // Optional cleanup on unmount
    };
  }, [session?.user, isPending, connectSocket, disconnectSocket]);

  return null;
}
