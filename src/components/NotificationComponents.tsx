
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthComponents';
import { 
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
} from '@/lib/supabaseHelpers';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Bell, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_type?: string;
  related_id?: string;
  user_id: string;
}

export const NotificationIcon = () => {
  const { getUser } = useAuth();
  const user = getUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Set up polling for notifications
      const interval = setInterval(fetchUnreadCount, 60000); // Every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };
  
  const handleNotificationsClosed = () => {
    fetchUnreadCount();
  };
  
  return (
    <>
      <button 
        onClick={toggleNotifications}
        className="relative p-2 hover:bg-gray-100 rounded-full"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-fridge-red hover:bg-red-500"
            variant="destructive"
          >
            {unreadCount}
          </Badge>
        )}
      </button>
      
      {isNotificationsOpen && (
        <NotificationsDialog 
          open={isNotificationsOpen}
          onClose={() => {
            setIsNotificationsOpen(false);
            handleNotificationsClosed();
          }}
        />
      )}
    </>
  );
};

interface NotificationsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationsDialog: React.FC<NotificationsDialogProps> = ({ open, onClose }) => {
  const { getUser } = useAuth();
  const user = getUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  useEffect(() => {
    if (user && open) {
      loadNotifications();
    }
  }, [user, open]);
  
  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await fetchNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    
    // Mark as read if not already read
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };
  
  const handleMarkAllRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };
  
  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>
            {notifications.length > 0 
              ? 'Click on a notification to view details.' 
              : 'No notifications to display.'}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          <div className="flex flex-col overflow-hidden h-full">
            <div className="flex justify-end mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all as read
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[300px] flex-grow">
              <div className="space-y-1">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-3 py-2 rounded-md cursor-pointer flex items-center gap-2 hover:bg-gray-100
                      ${notification.is_read ? 'bg-white' : 'bg-blue-50'}`}
                  >
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium text-sm truncate ${notification.is_read ? '' : 'font-bold'}`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedNotification && (
              <div className="mt-4 p-4 border-t">
                <h3 className="font-bold text-lg mb-2">{selectedNotification.title}</h3>
                <p className="mb-2">{selectedNotification.message}</p>
                <div className="text-xs text-gray-500">
                  {formatDate(selectedNotification.created_at)}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
