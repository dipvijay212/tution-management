'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Info, AlertTriangle, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulation of real-time notifications
  useEffect(() => {
    // Initial mock data
    const mockNotifications = [
      { id: 1, type: 'attendance', title: 'Attendance Marked', message: 'Maths Batch A attendance has been marked.', time: new Date(), read: false },
      { id: 2, type: 'fee', title: 'Fee Reminder', message: 'Fees for Rahul Sharma are pending for May.', time: new Date(Date.now() - 3600000), read: false },
      { id: 3, type: 'assignment', title: 'New Assignment', message: 'Physics Lab Report assignment has been uploaded.', time: new Date(Date.now() - 7200000), read: true },
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);

    // Supabase Realtime Subscription setup (Conceptual)
    /*
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          toast.success(`New Notification: ${newNotif.title}`);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
    */
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'attendance': return <Check size={16} className="text-emerald-500" />;
      case 'fee': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-indigo-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative rounded-full p-2.5 text-gray-400 hover:bg-gray-100 transition-all",
          isOpen && "bg-gray-100 text-indigo-600"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">
                  {unreadCount} UNREAD MESSAGES
                </p>
              </div>
              <button 
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-indigo-50 transition-all"
              >
                Mark all as read
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-4 flex gap-4 transition-colors hover:bg-gray-50/50 cursor-pointer",
                        !notif.read && "bg-indigo-50/30"
                      )}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                        !notif.read ? "bg-white shadow-sm" : "bg-gray-50"
                      )}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-gray-900 truncate">{notif.title}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                            <Clock size={10} />
                            <span>Just now</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                      </div>
                      {!notif.read && (
                        <div className="flex-shrink-0 self-center">
                          <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Bell className="mx-auto h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">All caught up!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <button className="w-full p-4 text-xs font-bold text-gray-500 hover:text-indigo-600 border-t border-gray-50 transition-colors bg-gray-50/20">
              View All Activity
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
