import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  ExternalLink,
  LogOut,
  User,
  ChevronDown,
  PanelLeft,
  Plus,
  ShoppingCart,
  MessageSquare,
  AlertTriangle,
  X,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DropdownMenu } from './ui/DropdownMenu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminApiService } from '../services/adminApi';
import { ContactMessage } from '../types/admin';

interface HeaderProps {
  title: string;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  onOpenMobileDrawer?: () => void;
  onNavigate?: (tab: string, productId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  isCollapsed = false,
  setIsCollapsed,
  onOpenMobileDrawer,
  onNavigate
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<ContactMessage[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  useEffect(() => {
    const fetchUnread = async () => {
      const msgs = await AdminApiService.getContactMessages({ status: 'NEW' });
      setUnreadMessages(msgs || []);
    };
    fetchUnread();

    // The storefront and admin run in different browser origins, so storage
    // events cannot be relied on for new customer inquiries. Poll the API.
    const refreshInterval = window.setInterval(fetchUnread, 15000);

    const handleSync = () => fetchUnread();
    window.addEventListener("awesome_contact_sync", handleSync);
    window.addEventListener("aaramly_contact_sync", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("awesome_contact_sync", handleSync);
      window.removeEventListener("aaramly_contact_sync", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
      window.clearInterval(refreshInterval);
    };
  }, []);

  const userInitials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD';

  const dropdownItems = [
    {
      label: user?.name || 'Admin User',
      icon: User,
      badge: user?.role || 'Super Admin',
      disabled: true,
    },
    {
      label: 'View Storefront',
      icon: ExternalLink,
      onClick: () => window.open('http://localhost:5173', '_blank'),
    },
    {
      label: 'Sign Out',
      icon: LogOut,
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-neutral-200 bg-white/90 px-3 sm:px-6 backdrop-blur-md font-sans">
      {/* LEFT SECTION: Toggle Sidebar button & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Single Unified Sidebar Toggle Button for ALL devices */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => {
            if (window.innerWidth < 768) {
              if (onOpenMobileDrawer) onOpenMobileDrawer();
            } else {
              if (setIsCollapsed) setIsCollapsed((prev) => !prev);
            }
          }}
          className="text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft className="w-4 h-4" />
        </Button>

        <h1 className="text-sm sm:text-base font-semibold tracking-tight text-black truncate max-w-[150px] sm:max-w-none">
          {title}
        </h1>
      </div>

      {/* RIGHT SECTION: Quick Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
       

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-neutral-600 hover:text-black rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600 absolute top-1 right-1 ring-2 ring-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Mobile Backdrop Overlay */}
                <div
                  className="fixed inset-0 z-40 backdrop-blur-2xs sm:hidden"
                  onClick={() => setShowNotifications(false)}
                />

                {/* Notification Dropdown Container - Responsive for ALL Devices */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="fixed left-3 right-3 top-14 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-88 sm:max-w-md bg-white border border-neutral-200 rounded-xl shadow-2xl z-50 overflow-hidden text-xs font-sans"
                >
                  {/* Notification Header */}
                  <div className="p-3 sm:px-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/90">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-950 text-xs sm:text-sm">Notifications</span>
                      <Badge variant={unreadMessages.length > 0 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0.5">
                        {unreadMessages.length} New
                      </Badge>
                    </div>

                    {/* Mobile Close Button */}
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-200/60 transition-colors cursor-pointer sm:hidden"
                      aria-label="Close notifications"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="p-2 sm:p-3 space-y-1.5 max-h-[60vh] sm:max-h-72 overflow-y-auto scrollbar-thin">
                    {unreadMessages.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-2 text-neutral-400">
                          <Inbox className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-neutral-800 text-xs">No new notifications</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Customer inquiries and store alerts will appear here.</p>
                      </div>
                    ) : (
                      unreadMessages.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => {
                            setShowNotifications(false);
                            if (onNavigate) onNavigate('contact-messages');
                          }}
                          className="p-2.5 rounded-lg bg-neutral-50/70 hover:bg-neutral-100/90 border border-neutral-200/80 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-neutral-950 flex items-center gap-1.5 min-w-0">
                              <MessageSquare className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                              <span className="truncate">{msg.subject || 'Customer Inquiry'}</span>
                            </p>
                            {msg.date && (
                              <span className="text-[10px] text-neutral-400 shrink-0 whitespace-nowrap">{msg.date}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 truncate mt-1">
                            From: <span className="text-neutral-700 font-medium">{msg.name}</span> ({msg.email})
                          </p>
                          {msg.message && (
                            <p className="text-[11px] text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
                              {msg.message}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Notification Footer Link */}
                  <div className="p-2.5 sm:px-4 border-t border-neutral-100 bg-neutral-50/60">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        if (onNavigate) onNavigate('contact-messages');
                      }}
                      className="w-full text-center py-1 text-xs font-semibold text-neutral-800 hover:text-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>View all customer inquiries</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile & Dropdown Menu */}
        <div className="pl-2 border-l border-neutral-200">
          <DropdownMenu
            align="right"
            items={dropdownItems}
            trigger={
              <button className="flex items-center gap-2 hover:bg-neutral-100 p-1.5 rounded-md transition-colors cursor-pointer group">
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white font-semibold text-[10px] flex items-center justify-center border border-neutral-800 shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-medium text-black leading-none">{user?.name || 'Admin User'}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-black transition-colors" />
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
};
