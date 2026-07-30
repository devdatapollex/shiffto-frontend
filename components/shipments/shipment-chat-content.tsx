'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useSocketStore } from '@/store/useSocketStore';
import {
  shipmentMessageService,
  ShipmentMessage,
  ShipmentMessagesResponse,
} from '@/services/shipment-message.service';
import { uploadPhotos } from '@/services/upload.service';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { Send, Loader2, MessageSquare, CheckCheck, Paperclip, FileText, X, Download, Eye, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller';
import {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from '@/components/ui/message';
import { BubbleGroup, Bubble, BubbleContent } from '@/components/ui/bubble';
import { Marker, MarkerContent } from '@/components/ui/marker';
import {
  AttachmentGroup,
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from '@/components/ui/attachment';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ShipmentChatContentProps {
  shipmentId: string;
}

interface LocalAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  previewUrl: string;
}

interface GroupedMessageCluster {
  id: string;
  senderId: string;
  isMe: boolean;
  showDateHeader: boolean;
  dateHeaderLabel: string;
  messages: ShipmentMessage[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit per file
const MAX_FILES_COUNT = 5;

function formatMessageTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
      return timeStr;
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeStr}`;
    }

    const dateFormatted = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${dateFormatted} ${timeStr}`;
  } catch {
    return '';
  }
}

function formatMessageFullTimestamp(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
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

function groupMessages(messages: ShipmentMessage[], currentUserId?: string): GroupedMessageCluster[] {
  if (!messages || messages.length === 0) return [];

  const clusters: GroupedMessageCluster[] = [];
  let currentCluster: GroupedMessageCluster | null = null;

  messages.forEach((msg, index) => {
    const isMe = msg.senderId === currentUserId;

    const showDateHeader =
      index === 0 ||
      new Date(messages[index - 1].createdAt).toDateString() !==
        new Date(msg.createdAt).toDateString();

    const dateHeaderLabel = formatMessageDateHeader(msg.createdAt);

    const prevMsg = index > 0 ? messages[index - 1] : null;
    const timeGapExceeded =
      prevMsg &&
      Math.abs(new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) >
        5 * 60 * 1000;

    const shouldStartNewGroup =
      !currentCluster ||
      showDateHeader ||
      timeGapExceeded ||
      msg.senderId !== currentCluster.senderId;

    if (shouldStartNewGroup) {
      currentCluster = {
        id: msg.id,
        senderId: msg.senderId,
        isMe,
        showDateHeader,
        dateHeaderLabel,
        messages: [msg],
      };
      clusters.push(currentCluster);
    } else if (currentCluster) {
      currentCluster.messages.push(msg);
    }
  });

  return clusters;
}

export function ShipmentChatContent({ shipmentId }: ShipmentChatContentProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const queryClient = useQueryClient();
  const socket = useSocketStore((state) => state.socket);
  const joinShipmentChat = useSocketStore((state) => state.joinShipmentChat);
  const leaveShipmentChat = useSocketStore((state) => state.leaveShipmentChat);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<LocalAttachment[]>([]);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCounterpartyTyping, setIsCounterpartyTyping] = useState(false);
  const [socketPresenceOnline, setSocketPresenceOnline] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const groupedClusters = useMemo(
    () => groupMessages(messages, currentUserId),
    [messages, currentUserId]
  );

  // Mark messages as read on load
  useEffect(() => {
    if (shipmentId && messages.length > 0) {
      shipmentMessageService.markAsRead(shipmentId).catch(() => {});
    }
  }, [shipmentId, messages.length]);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      selectedAttachments.forEach((att) => URL.revokeObjectURL(att.previewUrl));
    };
  }, [selectedAttachments]);

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

      setIsCounterpartyTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      if (newMsg.senderId !== currentUserId) {
        shipmentMessageService.markAsRead(shipmentId).catch(() => {});
      }
    };

    const handleTyping = (typingData: { userId: string; isTyping: boolean }) => {
      if (typingData.userId !== currentUserId) {
        setIsCounterpartyTyping(typingData.isTyping);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (typingData.isTyping) {
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
    mutationFn: ({ msgText, attachmentUrls }: { msgText: string; attachmentUrls?: string[] }) =>
      shipmentMessageService.sendMessage(shipmentId, msgText, attachmentUrls),
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
      if (socket) {
        socket.emit('shipment-chat:typing', { shipmentId, isTyping: false });
      }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (selectedAttachments.length + files.length > MAX_FILES_COUNT) {
      toast.error(`You can attach a maximum of ${MAX_FILES_COUNT} files at a time.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newAttachments: LocalAttachment[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds the 10MB size limit.`);
        return;
      }

      newAttachments.push({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    });

    if (newAttachments.length > 0) {
      setSelectedAttachments((prev) => [...prev, ...newAttachments]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setSelectedAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    const hasAttachments = selectedAttachments.length > 0;
    if ((!trimmed && !hasAttachments) || sendMessageMutation.isPending || isUploading) return;

    try {
      setIsUploading(true);
      let uploadedUrls: string[] = [];

      if (hasAttachments) {
        const filesToUpload = selectedAttachments.map((a) => a.file);
        const uploadResults = await uploadPhotos(filesToUpload);
        uploadedUrls = uploadResults.map((r) => r.url);
      }

      const messageText = trimmed || (hasAttachments ? 'Attachment' : '');

      sendMessageMutation.mutate(
        { msgText: messageText, attachmentUrls: uploadedUrls },
        {
          onSettled: () => {
            setIsUploading(false);
          },
          onSuccess: () => {
            selectedAttachments.forEach((att) => URL.revokeObjectURL(att.previewUrl));
            setSelectedAttachments([]);
          },
          onError: () => {
            toast.error('Failed to send message. Please try again.');
          },
        }
      );
    } catch {
      setIsUploading(false);
      toast.error('Failed to upload attachments. Please try again.');
    }
  };

  const isSending = sendMessageMutation.isPending || isUploading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <Loader2 className="size-8 text-[#0D307A] animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading conversation...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
        <MessageSquare className="size-10 text-slate-300" />
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
                  className="size-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="size-10 rounded-full bg-[#0D307A]/10 border border-[#0D307A]/20 flex items-center justify-center text-sm font-bold text-[#0D307A]">
                  {counterparty.name.charAt(0).toUpperCase()}
                </div>
              )}

              <span
                className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
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
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
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

      {/* Messages Scroll Area powered by shadcn MessageScroller */}
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="p-4">
            <MessageScrollerContent className="gap-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <MessageSquare className="size-10 text-slate-200 mb-2" />
                  <p className="text-xs font-semibold text-slate-500">No messages yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Start the conversation with your {counterparty?.role || 'matched partner'}.
                  </p>
                </div>
              ) : (
                groupedClusters.map((cluster) => (
                  <React.Fragment key={cluster.id}>
                    {cluster.showDateHeader && (
                      <MessageScrollerItem messageId={`date-${cluster.id}`}>
                        <Marker variant="separator" className="my-2 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                          <MarkerContent>{cluster.dateHeaderLabel}</MarkerContent>
                        </Marker>
                      </MessageScrollerItem>
                    )}

                    <MessageScrollerItem messageId={cluster.id} scrollAnchor={cluster.isMe}>
                      <Message align={cluster.isMe ? 'end' : 'start'}>
                        {!cluster.isMe && (
                          <MessageAvatar className="self-end mb-4 shrink-0">
                            {counterparty?.image ? (
                              <Image
                                src={toRelativeImageUrl(counterparty.image)}
                                alt={counterparty.name}
                                width={32}
                                height={32}
                                className="size-8 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="size-8 rounded-full bg-[#0D307A]/10 border border-[#0D307A]/20 flex items-center justify-center text-xs font-bold text-[#0D307A]">
                                {counterparty?.name ? counterparty.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                          </MessageAvatar>
                        )}

                        <MessageContent className="w-full">
                          <BubbleGroup className="gap-1 w-full">
                            {cluster.messages.map((msg, msgIdx) => {
                              const isLastInGroup = msgIdx === cluster.messages.length - 1;
                              const hasAttachments = msg.attachments && msg.attachments.length > 0;
                              const hasCustomText = Boolean(msg.message && msg.message !== 'Attachment');

                              return (
                                <div key={msg.id} className={`w-full flex flex-col ${cluster.isMe ? 'items-end' : 'items-start'}`}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Bubble variant={cluster.isMe ? 'default' : 'outline'} align={cluster.isMe ? 'end' : 'start'}>
                                        <BubbleContent
                                          className={
                                            cluster.isMe
                                              ? hasAttachments
                                                ? 'bg-white border border-slate-200/90 text-slate-800 shadow-xs p-1.5'
                                                : 'bg-primary text-white border-none'
                                              : 'bg-white border border-slate-200/80 text-slate-800 p-1.5'
                                          }
                                        >
                                          {hasCustomText && (
                                            <p className={`whitespace-pre-wrap break-words text-sm leading-relaxed px-1.5 py-1 ${cluster.isMe && hasAttachments ? 'text-slate-600 font-normal' : ''}`}>
                                              {msg.message}
                                            </p>
                                          )}

                                          {/* Render attachments directly inline */}
                                          {hasAttachments && (
                                            <div className={`flex flex-col gap-2 ${hasCustomText ? 'mt-1' : ''}`}>
                                              {msg.attachments.map((url, aIdx) => {
                                                const isImg =
                                                  /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url) ||
                                                  url.startsWith('data:image/');
                                                const isVid =
                                                  /\.(mp4|webm|mov|ogg)$/i.test(url) ||
                                                  url.startsWith('data:video/');
                                                const fileName =
                                                  url.split('/').pop()?.split('?')[0] || `Attachment ${aIdx + 1}`;

                                                if (isImg) {
                                                  return (
                                                    <div
                                                      key={aIdx}
                                                      onClick={() => setPreviewMediaUrl(url)}
                                                      className="relative overflow-hidden rounded-xl cursor-pointer group/img-preview w-full max-w-md sm:max-w-lg border border-slate-200/60 shadow-xs"
                                                    >
                                                      <img
                                                        src={toRelativeImageUrl(url)}
                                                        alt={fileName}
                                                        className="w-full h-auto max-h-[380px] object-cover transition-transform duration-200 group-hover/img-preview:scale-[1.02]"
                                                      />
                                                      <div className="absolute inset-0 bg-black/0 group-hover/img-preview:bg-black/15 transition-colors flex items-center justify-center">
                                                        <Eye className="size-6 text-white opacity-0 group-hover/img-preview:opacity-100 transition-opacity drop-shadow-md" />
                                                      </div>
                                                    </div>
                                                  );
                                                }

                                                if (isVid) {
                                                  return (
                                                    <div
                                                      key={aIdx}
                                                      onClick={() => setPreviewMediaUrl(url)}
                                                      className="relative overflow-hidden rounded-xl cursor-pointer group/img-preview w-full max-w-md sm:max-w-lg border border-slate-200/60 shadow-xs bg-black"
                                                    >
                                                      <video
                                                        src={toRelativeImageUrl(url)}
                                                        className="w-full h-auto max-h-[380px] object-cover"
                                                      />
                                                      <div className="absolute inset-0 bg-black/30 group-hover/img-preview:bg-black/40 transition-colors flex items-center justify-center">
                                                        <Play className="size-10 text-white drop-shadow-md" />
                                                      </div>
                                                    </div>
                                                  );
                                                }

                                                {/* Non-media files (PDF, DOCX): Direct download link without lightbox modal */}
                                                return (
                                                  <a
                                                    key={aIdx}
                                                    href={toRelativeImageUrl(url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download
                                                    className="block"
                                                  >
                                                    <Attachment
                                                      size="sm"
                                                      state="done"
                                                      className="bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80 cursor-pointer transition-colors"
                                                    >
                                                      <AttachmentMedia variant="icon">
                                                        <FileText className="size-4 text-slate-600" />
                                                      </AttachmentMedia>
                                                      <AttachmentContent>
                                                        <AttachmentTitle className="text-slate-800 font-medium truncate">
                                                          {fileName}
                                                        </AttachmentTitle>
                                                        <AttachmentDescription className="text-slate-400 text-[11px]">
                                                          Click to download
                                                        </AttachmentDescription>
                                                      </AttachmentContent>
                                                      <AttachmentActions>
                                                        <AttachmentAction
                                                          asChild
                                                          variant="ghost"
                                                          className="text-slate-500 hover:text-slate-700 hover:bg-slate-200/60"
                                                        >
                                                          <Download className="size-3" />
                                                        </AttachmentAction>
                                                      </AttachmentActions>
                                                    </Attachment>
                                                  </a>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </BubbleContent>
                                      </Bubble>
                                    </TooltipTrigger>
                                    <TooltipContent side={cluster.isMe ? 'left' : 'right'}>
                                      <span>{formatMessageFullTimestamp(msg.createdAt)}</span>
                                    </TooltipContent>
                                  </Tooltip>

                                  {/* Show timestamp footer ONLY for the last message in a group */}
                                  {isLastInGroup && (
                                    <MessageFooter className={`gap-1.5 text-[10px] whitespace-nowrap leading-none mt-1 ${cluster.isMe ? 'text-slate-400 justify-end' : 'text-slate-400'}`}>
                                      <span className="whitespace-nowrap inline-block">{formatMessageTime(msg.createdAt)}</span>
                                      {cluster.isMe && <CheckCheck className="size-3 shrink-0" />}
                                    </MessageFooter>
                                  )}
                                </div>
                              );
                            })}
                          </BubbleGroup>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  </React.Fragment>
                ))
              )}

              {/* Real-time Typing Indicator */}
              {isCounterpartyTyping && (
                <MessageScrollerItem messageId="typing-indicator">
                  <Message align="start">
                    <MessageAvatar className="self-end mb-4 shrink-0">
                      {counterparty?.image ? (
                        <Image
                          src={toRelativeImageUrl(counterparty.image)}
                          alt={counterparty.name}
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-[#0D307A]/10 border border-[#0D307A]/20 flex items-center justify-center text-xs font-bold text-[#0D307A]">
                          {counterparty?.name ? counterparty.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </MessageAvatar>
                    <MessageContent>
                      <div className="flex items-center gap-2 text-slate-400 text-xs py-1 animate-in fade-in duration-200">
                        <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-400">
                          {counterparty?.name || 'Counterparty'} is typing...
                        </span>
                      </div>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {/* Selected Attachments Preview Bar */}
      {selectedAttachments.length > 0 && (
        <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 shrink-0">
          <AttachmentGroup>
            {selectedAttachments.map((att) => (
              <Attachment
                key={att.id}
                size="sm"
                state={isUploading ? 'uploading' : 'done'}
                className="bg-white"
              >
                <AttachmentMedia variant={att.type.startsWith('image/') ? 'image' : 'icon'}>
                  {att.type.startsWith('image/') ? (
                    <img src={att.previewUrl} alt={att.name} className="size-full object-cover rounded-md" />
                  ) : (
                    <FileText className="size-4 text-slate-600" />
                  )}
                </AttachmentMedia>
                <AttachmentContent>
                  <AttachmentTitle>{att.name}</AttachmentTitle>
                  <AttachmentDescription>{(att.size / (1024 * 1024)).toFixed(1)} MB</AttachmentDescription>
                </AttachmentContent>
                <AttachmentActions>
                  {!isUploading && (
                    <AttachmentAction onClick={() => removeAttachment(att.id)} variant="ghost">
                      <X className="size-3" />
                    </AttachmentAction>
                  )}
                </AttachmentActions>
              </Attachment>
            ))}
          </AttachmentGroup>
        </div>
      )}

      {/* Footer Message Input Form */}
      <form
        onSubmit={handleSend}
        className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-lg"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isSending}
          onClick={() => fileInputRef.current?.click()}
          className="size-9 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0 disabled:opacity-50"
          title="Attach file or image"
        >
          <Paperclip className="size-4" />
        </Button>

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            disabled={isSending}
            onChange={handleInputChange}
            placeholder={`Message ${counterparty?.name || 'partner'}...`}
            className="w-full bg-slate-100 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D307A]/20 focus:border-[#0D307A] transition-all placeholder:text-slate-400 disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          disabled={(!inputMessage.trim() && selectedAttachments.length === 0) || isSending}
          className="bg-[#0D307A] hover:bg-[#092E72] text-white rounded-full size-10 p-0 flex items-center justify-center shrink-0 shadow-md transition-transform active:scale-95 disabled:opacity-50"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4 ml-0.5" />
          )}
        </Button>
      </form>

      {/* Media Fullscreen Lightbox Modal (Images & Videos only) */}
      <Dialog open={!!previewMediaUrl} onOpenChange={(open) => !open && setPreviewMediaUrl(null)}>
        <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw] h-[85vh] p-2 sm:p-4 bg-slate-950/95 border-slate-800 text-white flex flex-col items-center justify-center rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          {previewMediaUrl && (
            <div className="relative size-full flex flex-col items-center justify-center overflow-hidden">
              {/\.(mp4|webm|mov|ogg)$/i.test(previewMediaUrl) || previewMediaUrl.startsWith('data:video/') ? (
                <div className="relative size-full flex items-center justify-center p-2">
                  <video
                    controls
                    autoPlay
                    src={toRelativeImageUrl(previewMediaUrl)}
                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              ) : (
                <div className="relative size-full flex items-center justify-center p-2">
                  <img
                    src={toRelativeImageUrl(previewMediaUrl)}
                    alt="Media Preview"
                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
