import React, { useState } from 'react';
import {
  ShoppingCart,
  Eye,
  Download,
  Printer,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  User,
  CreditCard,
  Calendar,
  FileText,
  Search
} from 'lucide-react';
import { MOCK_ORDERS } from '../data/mockAdminData';
import { Order } from '../types/admin';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Select } from '../components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

interface OrdersPageProps {
  initialStatusFilter?: string;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ initialStatusFilter = 'ALL' }) => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => initialStatusFilter);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [noteInput, setNoteInput] = useState('');

  React.useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  const updateOrderStatus = (orderId: string, newStatus: any) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleAddAdminNote = (orderId: string) => {
    if (!noteInput.trim()) return;
    setAdminNotes(prev => ({
      ...prev,
      [orderId]: noteInput.trim()
    }));
    setNoteInput('');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans selection:bg-black selection:text-white pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-black" />
            <span>Order Pipeline &amp; Fulfillment</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage live orders, order tracking timelines, status updates, invoices, returns, and refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrintInvoice} variant="outline" size="sm" className="text-xs">
            <Printer className="w-3.5 h-3.5" />
            <span>Print Batch Orders</span>
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number, customer name, email..."
            className="w-full bg-white text-xs text-black pl-9 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-black shadow-2xs font-normal"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={[
              { value: 'ALL', label: 'All Order Statuses' },
              { value: 'PENDING', label: 'PENDING' },
              { value: 'PAID', label: 'PAID' },
              { value: 'PROCESSING', label: 'PROCESSING' },
              { value: 'SHIPPED', label: 'SHIPPED' },
              { value: 'DELIVERED', label: 'DELIVERED' },
              { value: 'CANCELLED', label: 'CANCELLED' }
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* ORDERS PIPELINE TABLE */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50/70 border-b border-neutral-200">
                <TableHead className="font-semibold text-black text-xs">Order ID</TableHead>
                <TableHead className="font-semibold text-black text-xs">Customer</TableHead>
                <TableHead className="font-semibold text-black text-xs">Date</TableHead>
                <TableHead className="font-semibold text-black text-xs">Payment Gateway</TableHead>
                <TableHead className="font-semibold text-black text-xs">Total Amount</TableHead>
                <TableHead className="font-semibold text-black text-xs">Status Pipeline</TableHead>
                <TableHead className="font-semibold text-black text-xs text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((ord) => (
                <TableRow
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className="hover:bg-neutral-50 transition-colors cursor-pointer text-xs"
                >
                  <TableCell className="font-mono font-bold text-black">{ord.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {ord.customerName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-black">{ord.customerName}</p>
                        <p className="text-[10px] text-neutral-400">{ord.customerEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-500 font-mono">{ord.date}</TableCell>
                  <TableCell className="font-medium text-neutral-700">{ord.paymentGateway}</TableCell>
                  <TableCell className="font-bold text-black">₹{ord.totalAmount}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="w-32">
                      <Select
                        value={ord.status}
                        onValueChange={(val) => updateOrderStatus(ord.id, val)}
                        className="h-7 text-[11px] font-semibold bg-neutral-50"
                        options={[
                          { value: 'PENDING', label: 'PENDING' },
                          { value: 'PAID', label: 'PAID' },
                          { value: 'PROCESSING', label: 'PROCESSING' },
                          { value: 'SHIPPED', label: 'SHIPPED' },
                          { value: 'DELIVERED', label: 'DELIVERED' },
                          { value: 'CANCELLED', label: 'CANCELLED' }
                        ]}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(ord);
                      }}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                    >
                      <Eye className="w-4 h-4 text-neutral-600 hover:text-black" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* RICH ORDER DETAILS MODAL WITH TRACKING TIMELINE & INVOICE */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-neutral-200 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8 font-sans"
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-black font-mono">{selectedOrder.orderNumber}</h2>
                    <Badge variant="default" className="bg-black text-white text-xs">
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Order Date: {selectedOrder.date} &bull; Payment via {selectedOrder.paymentGateway}
                  </p>
                </div>
                <Button onClick={() => setSelectedOrder(null)} variant="outline" size="sm">
                  Close
                </Button>
              </div>

              {/* TRACKING TIMELINE UI */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Order Tracking Timeline</h4>
                <div className="grid grid-cols-6 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-black text-white font-bold">Placed</div>
                  <div className="p-2 rounded-lg bg-black text-white font-bold">Confirmed</div>
                  <div className="p-2 rounded-lg bg-neutral-900 text-white font-bold">Packed</div>
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800 font-semibold border border-neutral-200">Shipped</div>
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-400">Out for Delivery</div>
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-400">Delivered</div>
                </div>
              </div>

              {/* COURIER & ESTIMATED DELIVERY INFO */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-neutral-700">Courier Partner:</span> Bluedart Express
                  <span className="ml-3 font-semibold text-neutral-700">Tracking #:</span> <span className="font-mono font-bold text-black">BD-98214-IN</span>
                </div>
                <span className="font-semibold text-emerald-700">Est. Delivery: 2 Days</span>
              </div>

              {/* ADDRESSES & CUSTOMER METADATA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <h4 className="font-semibold text-black flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-neutral-600" />
                    Customer &amp; Billing
                  </h4>
                  <p className="font-bold text-black">{selectedOrder.customerName}</p>
                  <p className="text-neutral-500">{selectedOrder.customerEmail}</p>
                  <p className="text-neutral-500">+91 98765 43210</p>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                  <h4 className="font-semibold text-black flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                    Shipping Destination
                  </h4>
                  <p className="text-neutral-700">Flat 402, Highline Residency, Bandra West</p>
                  <p className="text-neutral-500">Mumbai, Maharashtra - 400050</p>
                </div>
              </div>

              {/* ORDERED PRODUCTS */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-black">Ordered Products ({selectedOrder.items.length})</h4>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between text-xs bg-white">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.productName} className="w-10 h-10 rounded-lg object-cover bg-neutral-100 border border-neutral-200" />
                        <div>
                          <p className="font-semibold text-black">{item.productName}</p>
                          <p className="text-[10px] font-mono text-neutral-400">SKU: {item.variantSku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-black">₹{item.price} x {item.quantity}</p>
                        <p className="text-[11px] font-bold text-emerald-700">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRICE SUMMARY */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Items Subtotal</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST Tax (18%)</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-black font-bold pt-2 border-t border-neutral-200 text-sm">
                  <span>Total Amount Paid</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* ADMIN NOTES */}
              <div className="space-y-2 text-xs">
                <label className="block font-semibold text-black">Admin Notes &amp; Dispatch Instructions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add internal note for fulfillment team..."
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-black font-medium focus:outline-none focus:border-black"
                  />
                  <Button onClick={() => handleAddAdminNote(selectedOrder.id)} variant="default" size="sm" className="bg-black text-white">
                    Save Note
                  </Button>
                </div>
                {adminNotes[selectedOrder.id] && (
                  <div className="p-2.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px]">
                    <span className="font-semibold text-black">Saved Note:</span> {adminNotes[selectedOrder.id]}
                  </div>
                )}
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200">
                <div className="flex items-center gap-2">
                  <Button onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')} variant="outline" size="sm" className="text-xs text-red-600 hover:bg-red-50 border-neutral-200">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </Button>
                  <Button onClick={() => alert('Refund initiated successfully.')} variant="outline" size="sm" className="text-xs">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refund</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handlePrintInvoice} variant="outline" size="sm" className="text-xs">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </Button>
                  <Button onClick={() => setSelectedOrder(null)} variant="default" size="sm" className="bg-black text-white text-xs">
                    Close Details
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
