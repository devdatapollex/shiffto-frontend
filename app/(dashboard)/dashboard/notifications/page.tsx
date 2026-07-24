'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Package,
  Plane,
  LifeBuoy,
  ShieldAlert,
  Info,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/use-notifications';
import { type Notification } from '@/services/notification.service';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.read;
    return true;
  });

  const getNotificationIcon = (title: string, message: string) => {
    const combined = (title + ' ' + message).toLowerCase();
    if (combined.includes('ticket') || combined.includes('support') || combined.includes('reply')) {
      return <LifeBuoy className="h-5 w-5 text-primary" />;
    }
    if (
      combined.includes('shipment') ||
      combined.includes('order') ||
      combined.includes('package')
    ) {
      return <Package className="h-5 w-5 text-sky-600" />;
    }
    if (combined.includes('trip') || combined.includes('flight')) {
      return <Plane className="h-5 w-5 text-emerald-600" />;
    }
    if (combined.includes('kyc') || combined.includes('verify')) {
      return <ShieldAlert className="h-5 w-5 text-amber-600" />;
    }
    return <Bell className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 border border-primary/5 rounded-lg shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-primary text-white border-primary font-bold text-xs">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated on your active shipments, trips, and support ticket activities.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/5 text-xs font-semibold gap-1.5 h-9"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="ALL" className="text-xs px-4 rounded-lg font-medium">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="UNREAD" className="text-xs px-4 rounded-lg font-medium">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-card border border-primary/5 rounded-lg">
          <Clock className="h-7 w-7 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-card border border-primary/5 rounded-lg">
          <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">No notifications found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === 'UNREAD'
              ? 'You have read all your notifications!'
              : 'You have no notifications at this time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((n: Notification) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onClick={() => {
                  if (!n.read) {
                    markAsRead(n.id);
                  }
                }}
                className={`flex items-start gap-4 p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                  !n.read
                    ? 'bg-card border-primary/20 shadow-xs ring-1 ring-primary/5'
                    : 'bg-card/60 border-primary/5 hover:border-primary/15'
                }`}
              >
                {/* Notification Icon */}
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    !n.read ? 'bg-primary/10' : 'bg-muted/80'
                  }`}
                >
                  {getNotificationIcon(n.title, n.message)}
                </div>

                {/* Notification Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        !n.read ? 'text-foreground font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>

                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground/70 font-medium">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(n.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
