import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  ExternalLink,
  LogOut,
  User,
  ChevronDown,
  Menu,
  PanelLeft,
  Plus,
  ShoppingCart,
  MessageSquare,
  AlertTriangle
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

  useEffect(() => {
    const fetchUnread = async () => {
      const msgs = await AdminApiService.getContactMessages({ status: 'NEW' });
      setUnreadMessages(msgs || []);
    };
    fetchUnread();

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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-neutral-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md font-sans">
      {/* LEFT SECTION: Toggle Sidebar button & Title */}
      <div className="flex items-center gap-3">
        

        {/* Desktop Sidebar Collapse Toggle Button */}
        {setIsCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="hidden lg:flex text-neutral-500 hover:text-black transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        )}

        <h1 className="text-base font-semibold tracking-tight text-black flex items-center gap-2">
          {title}
        </h1>
      </div>

      {/* RIGHT SECTION: Quick Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
       

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-neutral-600 hover:text-black rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600 absolute top-1 right-1 ring-2 ring-white"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs"
              >
                <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                  <span className="font-semibold text-black">Notifications</span>
                  <Badge variant={unreadMessages.length > 0 ? "default" : "secondary"} className="text-[10px]">
                    {unreadMessages.length} New Unread
                  </Badge>
                </div>
                <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                  {unreadMessages.length === 0 ? (
                    <div className="p-4 text-center text-neutral-400 text-xs">
                      No new unread inquiries
                    </div>
                  ) : (
                    unreadMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (onNavigate) onNavigate('contact-messages');
                        }}
                        className="p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 cursor-pointer transition-colors"
                      >
                        <p className="font-semibold text-black flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-black shrink-0" />
                          <span className="truncate">{msg.subject}</span>
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          From: {msg.name} ({msg.email})
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
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
