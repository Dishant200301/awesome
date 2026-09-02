import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  CheckCircle, 
  Mail, 
  Phone, 
  Calendar, 
  Filter, 
  Eye, 
  Reply,
  CheckCheck,
  X
} from 'lucide-react';
import { AdminApiService } from '../services/adminApi';
import { ContactMessage } from '../types/admin';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const ContactMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<ContactMessage | null>(null);

  const loadMessages = React.useCallback(async () => {
    setLoading(true);
    const data = await AdminApiService.getContactMessages({
      status: statusFilter,
      search: searchTerm
    });
    setMessages(data);
    setLoading(false);
  }, [statusFilter, searchTerm]);

  React.useEffect(() => {
    loadMessages();

    const handleSync = () => {
      loadMessages();
    };

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
  }, [loadMessages]);

  const handleMarkRead = async (id: string) => {
    await AdminApiService.updateContactMessageStatus(id, 'Read');
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, status: 'Read' } : msg))
    );
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage((prev) => (prev ? { ...prev, status: 'Read' } : null));
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    await AdminApiService.updateContactMessageStatus(selectedMessage.id, 'Replied', replyText.trim());
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === selectedMessage.id ? { ...msg, status: 'Replied', replyText: replyText.trim() } : msg
      )
    );
    setSelectedMessage((prev) => (prev ? { ...prev, status: 'Replied', replyText: replyText.trim() } : null));
    setReplySuccess(true);
    setTimeout(() => {
      setReplySuccess(false);
      setReplyText('');
    }, 2500);
  };

  const handleDeleteMessage = (msg: ContactMessage) => {
    setDeleteCandidate(msg);
  };

  const confirmDeleteMessage = async () => {
    if (!deleteCandidate) return;
    await AdminApiService.deleteContactMessage(deleteCandidate.id);
    setMessages((prev) => prev.filter((msg) => msg.id !== deleteCandidate.id));
    if (selectedMessage?.id === deleteCandidate.id) setSelectedMessage(null);
    setDeleteCandidate(null);
  };

  const unreadCount = messages.filter((m) => m.status === 'New').length;
  const readCount = messages.filter((m) => m.status === 'Read').length;
  const repliedCount = messages.filter((m) => m.status === 'Replied').length;

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'NEW', label: 'New Unread' },
    { value: 'READ', label: 'Read' },
    { value: 'REPLIED', label: 'Replied' },
  ];

  return (
    <div className="space-y-6 font-sans selection:bg-black selection:text-white">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-black" />
            <span>Contact Form Inquiries</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage customer feedback, support queries, and messages submitted via the website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs font-medium bg-white">
            Total Messages: {messages.length}
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="default" className="px-3 py-1 text-xs font-mono">
              {unreadCount} New Unread
            </Badge>
          )}
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-black">New Inquiries</p>
              <CardTitle className="text-2xl font-semibold mt-0.5">{unreadCount}</CardTitle>
            </div>
            <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-bold text-xs">
              !
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Read & Pending</p>
              <CardTitle className="text-2xl font-semibold mt-0.5">{readCount}</CardTitle>
            </div>
            <div className="w-8 h-8 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-700">Replied</p>
              <CardTitle className="text-2xl font-semibold mt-0.5">{repliedCount}</CardTitle>
            </div>
            <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <CheckCheck className="w-4 h-4" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* SEARCH AND SHADCN SELECT TOOLBAR */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by customer name, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Status Filter via shadcn Select */}
          <div className="flex items-center gap-2 w-48">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={statusOptions}
            />
          </div>
        </div>
      </Card>

      {/* MESSAGES SHADCN TABLE */}
      <Card className="overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="w-10 h-10 rounded-md bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-semibold text-black">No Messages Found</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No inquiries match your current search terms or filter selection.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Message Snippet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow
                  key={msg.id}
                  className={msg.status === 'New' ? 'bg-neutral-50/50 font-medium' : ''}
                >
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant={
                        msg.status === 'New'
                          ? 'default'
                          : msg.status === 'Replied'
                          ? 'success'
                          : 'secondary'
                      }
                    >
                      {msg.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <p className="font-semibold text-black">{msg.name}</p>
                    <p className="text-[10px] text-neutral-400">{msg.email}</p>
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-medium text-black max-w-[200px] truncate">
                    {msg.subject}
                  </TableCell>

                  <TableCell className="text-neutral-500 max-w-[300px] truncate">
                    {msg.message}
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-mono text-[11px] text-neutral-400">
                    {msg.date}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-right space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (msg.status === 'New') handleMarkRead(msg.id);
                      }}
                      className="w-7 h-7"
                      title="View Details & Reply"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMessage(msg);
                      }}
                      className="w-7 h-7 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* DETAIL VIEW & REPLY MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-lg space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="font-semibold text-black text-sm">{selectedMessage.subject}</h3>
                <p className="text-[11px] text-neutral-400">From: <strong className="text-black">{selectedMessage.name}</strong> ({selectedMessage.email})</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-md border border-neutral-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400 text-[10px] font-mono">
                <span>Phone: {selectedMessage.phone || 'N/A'}</span>
                <span>{selectedMessage.date}</span>
              </div>
              <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>

            {replySuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium text-center">
                Reply sent successfully! Message marked as Replied.
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-black block mb-1">Send Reply Email</label>
                  <textarea
                    rows={3}
                    placeholder="Type your response here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-white p-2.5 rounded-md border border-neutral-200 text-xs font-medium focus:outline-none focus:border-black"
                    required
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedMessage(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* REUSABLE DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Inquiry Message?"
        itemName={deleteCandidate ? `${deleteCandidate.subject} from ${deleteCandidate.name}` : undefined}
        onConfirm={confirmDeleteMessage}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
