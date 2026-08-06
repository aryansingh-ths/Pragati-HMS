import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Megaphone, Building2, AtSign, CheckCheck, Clock, ChevronRight, Zap, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

export default function NotificationBell({ fetchWithAuth }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all | unread | direct
  const drawerRef = useRef(null);

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/notifications`);
      if (res?.ok) {
        const data = await res.json();
        setNotifications(data.data?.notifications || []);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, [fetchWithAuth]);

  // Poll every 15 seconds
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close drawer on Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      await fetchWithAuth(`${API_BASE}/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
    } catch (e) {
      console.error('Failed to mark as read:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetchWithAuth(`${API_BASE}/api/notifications/read-all`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'direct') return n.notification_type === 'DIRECT';
    return true;
  });

  // Get icon for notification type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'DIRECT': return <AtSign size={14} className="text-violet-500" />;
      case 'DEPARTMENT': return <Building2 size={14} className="text-sky-500" />;
      default: return <Megaphone size={14} className="text-amber-500" />;
    }
  };

  // Get badge color for notification type
  const getTypeBadge = (type) => {
    switch (type) {
      case 'DIRECT': return 'bg-violet-50 text-violet-600 border-violet-200';
      case 'DEPARTMENT': return 'bg-sky-50 text-sky-600 border-sky-200';
      default: return 'bg-amber-50 text-amber-600 border-amber-200';
    }
  };

  // Format relative time
  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'direct', label: 'Direct', count: notifications.filter(n => n.notification_type === 'DIRECT').length },
  ];

  return (
    <>
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors border border-zinc-200 shadow-sm"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-zinc-600" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-black shadow-lg shadow-rose-500/40 border-2 border-white"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop Overlay */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Slide-out Drawer */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[9999] flex flex-col"
            style={{
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderLeft: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.08)'
            }}
          >
            {/* Drawer Header */}
            <div className="px-6 pt-6 pb-4 border-b border-zinc-200/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                    <Bell size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900">Notifications</h2>
                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-zinc-500" />
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-zinc-100/80 rounded-xl p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-zinc-900 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={markAllAsRead}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase tracking-wider transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all as read
                </motion.button>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d8 transparent' }}>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-16 text-zinc-400"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Bell size={32} className="opacity-30 mb-3" />
                  </motion.div>
                  <p className="text-xs font-bold">
                    {activeTab === 'unread' ? 'No unread notifications' :
                     activeTab === 'direct' ? 'No direct messages' :
                     'No notifications yet'}
                  </p>
                  <p className="text-[10px] mt-1 opacity-70">You're all caught up!</p>
                </motion.div>
              ) : (
                filteredNotifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.03 } }}
                    whileHover={{ x: -2, backgroundColor: notif.is_read ? 'rgba(250, 250, 250, 0.8)' : 'rgba(254, 243, 199, 0.4)' }}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                    className={`relative group p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      notif.is_read
                        ? 'bg-white/50 border-zinc-100'
                        : 'bg-amber-50/40 border-amber-200/50 shadow-sm'
                    }`}
                  >
                    {/* Unread dot indicator */}
                    {!notif.is_read && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/40"
                      />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                        notif.notification_type === 'DIRECT'
                          ? 'bg-violet-50 border-violet-200'
                          : notif.notification_type === 'DEPARTMENT'
                            ? 'bg-sky-50 border-sky-200'
                            : notif.priority === 'URGENT'
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-amber-50 border-amber-200'
                      }`}>
                        {notif.priority === 'URGENT'
                          ? <AlertTriangle size={14} className="text-rose-500" />
                          : getTypeIcon(notif.notification_type)
                        }
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        {/* Badges row */}
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getTypeBadge(notif.notification_type)}`}>
                            {notif.notification_type === 'DIRECT' ? 'Direct' :
                             notif.notification_type === 'DEPARTMENT' ? notif.target_dept || 'Dept' :
                             'Global'}
                          </span>
                          {notif.priority === 'URGENT' && (
                            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border bg-rose-50 text-rose-600 border-rose-200 animate-pulse">
                              Urgent
                            </span>
                          )}
                          <span className="text-[9px] text-zinc-400 font-mono">
                            {timeAgo(notif.created_at)}
                          </span>
                        </div>

                        {/* Message */}
                        <p className={`text-xs leading-relaxed ${notif.is_read ? 'text-zinc-500 font-medium' : 'text-zinc-800 font-bold'}`}>
                          {notif.message}
                        </p>

                        {/* Sender */}
                        <p className="text-[9px] text-zinc-400 mt-1.5 font-medium">
                          From: <span className="font-semibold text-zinc-500">{notif.sender_name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Hover hint to mark as read */}
                    {!notif.is_read && (
                      <div className="absolute bottom-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider">Click to mark read</span>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-3 border-t border-zinc-200/60 bg-white/50">
              <p className="text-[9px] text-zinc-400 text-center font-medium">
                Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
