'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useSocketStore } from '@/store/useSocketStore';
import {
  shipmentMessageService,
  ShipmentMessage,
  ShipmentMessagesResponse,
} from '@/services/shipment-message.service';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { Send, Loader2, MessageSquare, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShipmentChatContentProps {
  shipmentId: string;
}

function formatMessageTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatMessageDateHeader(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function ShipmentChatContent({ shipmentId }: ShipmentChatContentProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const queryClient = useQueryClient();
  const socket = useSocketStore((state) => state.socket);
  const joinShipmentChat = useSocketStore((state) => state.joinShipmentChat);
  const leaveShipmentChat = useSocketStore((state) => state.leaveShipmentChat);

  const [inputMessage, setInputMessage] = useState('');
  const [isCounterpartyTyping, setIsCounterpartyTyping] = useState(false);
  const [socketPresenceOnline, setSocketPresenceOnline] = useState<boolean | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selfTypingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch chat data
  const { data, isLoading, error } = useQuery({
    queryKey: ['shipment-messages', shipmentId],
    queryFn: () => shipmentMessageService.getMessages(shipmentId),
    staleTime: 1000 * 30,
  });

  const messages = data?.messages || [];
  const counterparty = data?.counterparty;
  const counterpartyId = counterparty?.id;
  const isCounterpartyOnline = socketPresenceOnline ?? counterparty?.isOnline ?? false;

  // Mark messages as read on load
  useEffect(() => {
    if (shipmentId && messages.length > 0) {
      shipmentMessageService.markAsRead(shipmentId).catch(() => {});
    }
  }, [shipmentId, messages.length]);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  // Socket setup & event listeners
  useEffect(() => {
    if (!shipmentId || !socket) return;

    joinShipmentChat(shipmentId);

    const handleNewMessage = (newMsg: ShipmentMessage) => {
      queryClient.setQueryData<ShipmentMessagesResponse>(['shipment-messages', shipmentId], (old) => {
        if (!old) return old;
        const exists = old.messages.some((m: ShipmentMessage) => m.id === newMsg.id);
        if (exists) return old;
        return {
          ...old,
          messages: [...old.messages, newMsg],
        };
      });

      // Reset typing indicator when new message arrives
      setIsCounterpartyTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Auto mark read if current user is active recipient
      if (newMsg.senderId !== currentUserId) {
        shipmentMessageService.markAsRead(shipmentId).catch(() => {});
      }
    };

    const handleTyping = (typingData: { userId: string; isTyping: boolean }) => {
      if (typingData.userId !== currentUserId) {
        setIsCounterpartyTyping(typingData.isTyping);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (typingData.isTyping) {
          // Safety timeout to clear typing after 3.5s
          typingTimeoutRef.current = setTimeout(() => {
            setIsCounterpartyTyping(false);
          }, 3500);
        }
      }
    };

    const handlePresenceStatus = (presData: { counterpartyId: string; isOnline: boolean }) => {
      if (counterpartyId && presData.counterpartyId === counterpartyId) {
        setSocketPresenceOnline(presData.isOnline);
      }
    };

    socket.on('shipment-chat:new-message', handleNewMessage);
    socket.on('shipment-chat:typing', handleTyping);
    socket.on('shipment-chat:presence-status', handlePresenceStatus);

    if (counterpartyId) {
      socket.emit('shipment-chat:check-presence', { shipmentId, counterpartyId });
    }

    return () => {
      leaveShipmentChat(shipmentId);
      socket.off('shipment-chat:new-message', handleNewMessage);
      socket.off('shipment-chat:typing', handleTyping);
      socket.off('shipment-chat:presence-status', handlePresenceStatus);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (selfTypingTimerRef.current) clearTimeout(selfTypingTimerRef.current);
    };
  }, [shipmentId, socket, joinShipmentChat, leaveShipmentChat, currentUserId, queryClient, counterpartyId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (msgText: string) => shipmentMessageService.sendMessage(shipmentId, msgText),
    onSuccess: (newMsg) => {
      setInputMessage('');
      queryClient.setQueryData<ShipmentMessagesResponse>(['shipment-messages', shipmentId], (old) => {
        if (!old) return old;
        const exists = old.messages.some((m: ShipmentMessage) => m.id === newMsg.id);
        if (exists) return old;
        return {
          ...old,
          messages: [...old.messages, newMsg],
        };
      });
      // Stop typing signal immediately on send
      if (socket) {
        socket.emit('shipment-chat:typing', { shipmentId, isTyping: false });
      }
      setTimeout(() => scrollToBottom(true), 50);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (socket && shipmentId) {
      socket.emit('shipment-chat:typing', { shipmentId, isTyping: true });

      if (selfTypingTimerRef.current) clearTimeout(selfTypingTimerRef.current);
      selfTypingTimerRef.current = setTimeout(() => {
        socket.emit('shipment-chat:typing', { shipmentId, isTyping: false });
      }, 2000);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(trimmed);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <Loader2 className="h-8 w-8 text-[#0D307A] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading conversation...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
        <MessageSquare className="h-10 w-10 text-slate-300" />
        <p className="text-sm font-semibold text-slate-700">Unable to load messages</p>
        <p className="text-xs text-slate-400 max-w-xs">
          Make sure you are authorized and the shipment is active.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Drawer Header */}
      <div className="bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between shrink-0 shadow-xs">
        {counterparty ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              {counterparty.image ? (
                <Image
                  src={toRelativeImageUrl(counterparty.image)}
                  alt={counterparty.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#0D307A]/10 border border-[#0D307A]/20 flex items-center justify-center text-sm font-bold text-[#0D307A]">
                  {counterparty.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Online indicator dot */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isCounterpartyOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">{counterparty.name}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {counterparty.role}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                {isCounterpartyOnline ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span>Offline</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-sm font-bold text-slate-700">Shipment Chat</div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400">
            <MessageSquare className="h-10 w-10 text-slate-200 mb-2" />
            <p className="text-xs font-semibold text-slate-500">No messages yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Start the conversation with your {counterparty?.role || 'matched partner'}.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;

            // Date separator
            const showDateHeader =
              index === 0 ||
              new Date(messages[index - 1].createdAt).toDateString() !==
                new Date(msg.createdAt).toDateString();

            return (
              <div key={msg.id} className="space-y-3">
                {showDateHeader && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/60 px-3 py-1 rounded-full">
                      {formatMessageDateHeader(msg.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl shadow-xs text-sm leading-relaxed ${
                      isMe
                        ? 'bg-[#0D307A] text-white rounded-br-xs'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                        isMe ? 'text-slate-200/80' : 'text-slate-400'
                      }`}
                    >
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Real-time Typing Indicator */}
        {isCounterpartyTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1 animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {counterparty?.name || 'Counterparty'} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Message Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-lg"
      >
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder={`Message ${counterparty?.name || 'partner'}...`}
            className="w-full bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D307A]/20 focus:border-[#0D307A] transition-all placeholder:text-slate-400"
          />
        </div>

        <Button
          type="submit"
          disabled={!inputMessage.trim() || sendMessageMutation.isPending}
          className="bg-[#0D307A] hover:bg-[#092E72] text-white rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 disabled:opacity-50"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 ml-0.5" />
          )}
        </Button>
      </form>
    </div>
  );
}
