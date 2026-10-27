import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import api from '../../services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to update notifications.');
    }
  };

  const displayedNotifications = filterUnread
    ? notifications.filter(n => !n.isRead)
    : notifications;

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="Stay updated with team invitations, faculty proposal feedback, milestone approvals, and scheduled sync meetings."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterUnread(!filterUnread)}
            >
              {filterUnread ? 'Show All' : 'Show Unread Only'}
            </Button>
            {unreadCount > 0 && (
              <Button
                size="sm"
                icon={CheckCheck}
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardBody className="p-0">
          {displayedNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {displayedNotifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif._id, notif.relatedResource?.link)}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                    notif.isRead ? 'bg-white hover:bg-slate-50/70' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.isRead
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-indigo-600 text-white shadow-2xs'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {notif.relatedResource?.link && (
                      <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10">
              <EmptyState
                icon={Bell}
                title={filterUnread ? 'No Unread Notifications' : 'No Notifications'}
                description="You're all caught up! Updates regarding your team, proposals, and meetings will show up here."
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
