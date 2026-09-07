import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Globe,
  FileText,
  Layers,
  FolderTree,
  MessageSquare,
  Mail,
  AlertTriangle,
  ArrowUpRight,
  Eye,
  Plus,
  Tag,
  Award,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Star
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { AdminApiService } from '../services/adminApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { MOCK_ORDERS, MOCK_CONTACT_MESSAGES } from '../data/mockAdminData';
import { Order } from '../types/admin';

interface DashboardPageProps {
  onNavigate: (tab: string, productId?: string) => void;
}

const SALES_DATA_WEEKLY = [
  { day: 'Mon', revenue: 12400 },
  { day: 'Tue', revenue: 15800 },
  { day: 'Wed', revenue: 14200 },
  { day: 'Thu', revenue: 19500 },
  { day: 'Fri', revenue: 24800 },
  { day: 'Sat', revenue: 29100 },
  { day: 'Sun', revenue: 22600 },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadStats = React.useCallback(async () => {
    setLoading(true);
    const res = await AdminApiService.getDashboardStats();
    setStats(res);
    try {
      const revs = await AdminApiService.getReviews();
      if (Array.isArray(revs)) {
        setReviewsCount(revs.length);
      }
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();

    // Listen to real-time events across the admin panel
    const handleRealtimeSync = () => {
      loadStats();
    };

    window.addEventListener('awesome_category_sync', handleRealtimeSync);
    window.addEventListener('awesome_product_sync', handleRealtimeSync);
    window.addEventListener('awesome_review_sync', handleRealtimeSync);
    window.addEventListener('aaramly_review_sync', handleRealtimeSync);
    window.addEventListener('awesome_inventory_sync', handleRealtimeSync);
    window.addEventListener('awesome_attribute_sync', handleRealtimeSync);
    window.addEventListener('aaramly_attribute_sync', handleRealtimeSync);
    window.addEventListener('storage', handleRealtimeSync);
    window.addEventListener('focus', handleRealtimeSync);

    return () => {
      window.removeEventListener('awesome_category_sync', handleRealtimeSync);
      window.removeEventListener('awesome_product_sync', handleRealtimeSync);
      window.removeEventListener('awesome_review_sync', handleRealtimeSync);
      window.removeEventListener('aaramly_review_sync', handleRealtimeSync);
      window.removeEventListener('awesome_inventory_sync', handleRealtimeSync);
      window.removeEventListener('awesome_attribute_sync', handleRealtimeSync);
      window.removeEventListener('aaramly_attribute_sync', handleRealtimeSync);
      window.removeEventListener('storage', handleRealtimeSync);
      window.removeEventListener('focus', handleRealtimeSync);
    };
  }, [loadStats]);

  const totalProducts = stats?.totalProducts ?? 0;
  const publishedProducts = stats?.publishedProducts ?? 0;
  const draftProducts = stats?.draftProducts ?? 0;
  const totalVariants = stats?.totalVariants ?? 0;
  const totalAttributes = stats?.totalAttributes ?? 0;
  const totalCategories = stats?.totalCategories ?? 0;
  const totalMessages = stats?.totalMessages ?? 0;
  const lowStockCount = stats?.lowStockCount ?? 0;

  const recentProducts = stats?.recentProducts || [
    {
      id: 'prod-1',
      name: 'Wirefree Padded Soft touch Microfibe',
      sku: '',
      price: 799,
      stock: 100,
      status: 'Published',
      isPublished: true,
      image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=200'
    }
  ];

  const recentMessages = stats?.recentMessages || [];

  return (
    <div className="space-y-6 font-sans selection:bg-black selection:text-white pb-12">
      {/* PAGE HEADER */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => onNavigate('add-product')} variant="default" size="sm" className="bg-black hover:bg-neutral-800 text-white font-medium text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Button>
          <Button onClick={() => onNavigate('categories')} variant="outline" size="sm" className="text-xs border-neutral-200 text-black">
            <FolderTree className="w-3.5 h-3.5 text-rose-500" />
            <span>Add Category</span>
          </Button>
          <Button onClick={() => onNavigate('brands')} variant="outline" size="sm" className="text-xs border-neutral-200 text-black">
            <Tag className="w-3.5 h-3.5 text-purple-600" />
            <span>Add Brand</span>
          </Button>
          <Button onClick={() => onNavigate('orders')} variant="outline" size="sm" className="text-xs border-neutral-200 text-black">
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create Order</span>
          </Button>
        </div>
      </div> */}

      {/* 8 SUMMARY METRIC CARDS GRID WITH SHADCN/UI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Products */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('all-products')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Total Products</span>
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 group-hover:scale-105 transition-transform">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{totalProducts}</CardTitle>
              <CardDescription className="text-[11px] text-neutral-400">Catalog items</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 2. Total Published Live */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('all-products')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700">Published Live</span>
                <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{publishedProducts}</CardTitle>
              <CardDescription className="text-[11px] text-emerald-600 font-medium">Live on Client Shop</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 3. Total Draft Products */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('all-products')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Draft Products</span>
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-neutral-600 flex items-center justify-center border border-neutral-200 group-hover:scale-105 transition-transform">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{draftProducts}</CardTitle>
              <CardDescription className="text-[11px] text-neutral-400">Saved in Admin only</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 4. Total Product Variants */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('attributes')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Product Variants</span>
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 group-hover:scale-105 transition-transform">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{totalVariants}</CardTitle>
              <CardDescription className="text-[11px] text-neutral-500 font-medium">Color / Size SKUs</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 5. Total Product Attributes */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('attributes')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Product Attributes</span>
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 group-hover:scale-105 transition-transform">
                  <Tag className="w-3.5 h-3.5" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{totalAttributes}</CardTitle>
              <CardDescription className="text-[11px] text-neutral-500 font-medium">Color, Size, Material...</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 6. Total Categories */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('categories')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Categories</span>
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-neutral-700 flex items-center justify-center border border-neutral-200 group-hover:scale-105 transition-transform">
                  <FolderTree className="w-3.5 h-3.5" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{totalCategories}</CardTitle>
              <CardDescription className="text-[11px] text-neutral-400">Active taxonomy groups</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 7. Total Contact Messages */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('contact-messages')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Contact Messages</span>
                <div className="w-7 h-7 rounded-md bg-neutral-100 text-black flex items-center justify-center border border-neutral-200 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{totalMessages}</CardTitle>
              <CardDescription className="text-[11px] text-neutral-500 font-medium">Client form inquiries</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* 8. Customer Reviews */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <Card
            onClick={() => onNavigate('reviews')}
            className="hover:border-neutral-300 transition-all cursor-pointer group rounded-xl bg-white border border-neutral-200 shadow-2xs"
          >
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-700">Customer Reviews</span>
                <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold mt-1">{reviewsCount}</CardTitle>
              <CardDescription className="text-[11px] text-amber-700 font-medium">Live customer ratings</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* INTERACTIVE SALES REVENUE TREND GRAPH */}
      {/* <Card className="p-5 bg-white border border-neutral-200 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-black" />
              <span>Weekly Revenue Trend</span>
            </h3>
            <p className="text-xs text-neutral-500">Live store sales analytics &amp; order velocity</p>
          </div>
          <Button onClick={() => onNavigate('orders')} variant="outline" size="sm" className="text-xs">
            View Sales Reports
          </Button>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SALES_DATA_WEEKLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                formatter={(val: any) => [`₹${val}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card> */}

      {/* 2 OVERVIEW TABLES GRID (Recent Products Catalog + Recent Inquiries) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table 1: Recent Products (2 Cols) */}
        <Card className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-5">
            <div>
              <CardTitle className="text-sm flex items-center gap-2 font-bold text-black">
                <Package className="w-4 h-4 text-black" />
                <span>Recent Products Catalog</span>
              </CardTitle>
              <CardDescription className="text-xs text-neutral-500">Latest added inventory items</CardDescription>
            </div>
            <Button
              onClick={() => onNavigate('all-products')}
              variant="link"
              size="sm"
              className="p-0 h-auto font-semibold text-xs text-black flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View All Products</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/70 border-b border-neutral-200">
                  <TableHead className="text-xs font-semibold text-black">PRODUCT TITLE</TableHead>
                  <TableHead className="text-xs font-semibold text-black">SKU</TableHead>
                  <TableHead className="text-xs font-semibold text-black">PRICE</TableHead>
                  <TableHead className="text-xs font-semibold text-black">STOCK</TableHead>
                  <TableHead className="text-xs font-semibold text-black">STATUS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProducts.map((p: any) => (
                  <TableRow
                    key={p.id}
                    onClick={() => onNavigate('all-products')}
                    className="hover:bg-neutral-50 transition-colors cursor-pointer text-xs"
                  >
                    <TableCell className="font-semibold text-black flex items-center gap-2.5">
                      <img src={p.image || p.images?.[0]} alt={p.name} className="w-8 h-8 rounded-md object-cover bg-neutral-100 border border-neutral-200 shrink-0" />
                      <span className="line-clamp-1">{p.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-neutral-500">{p.sku || '-'}</TableCell>
                    <TableCell className="font-bold text-black">₹{p.price}</TableCell>
                    <TableCell className="font-medium text-neutral-700">{p.stock} units</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'Published' || p.isPublished ? "success" : "secondary"} className="text-[10px]">
                        {p.status === 'Published' || p.isPublished ? 'Live' : 'Draft'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Table 2: Recent Contact Messages (1 Col) */}
        <Card className="flex flex-col justify-between bg-white border border-neutral-200 rounded-xl shadow-2xs p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <CardTitle className="text-sm flex items-center gap-2 font-bold text-black">
                  <Mail className="w-4 h-4 text-black" />
                  <span>Recent Inquiries</span>
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">Form submissions from storefront</CardDescription>
              </div>
              <Button
                onClick={() => onNavigate('contact-messages')}
                variant="link"
                size="sm"
                className="p-0 h-auto font-semibold text-xs text-black flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Inbox</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-2.5 mt-3">
              {recentMessages.map((msg: any) => (
                <div
                  key={msg.id}
                  onClick={() => onNavigate('contact-messages')}
                  className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200 space-y-1 text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">{msg.name}</span>
                    <Badge
                      variant={msg.status === 'New' ? "default" : "secondary"}
                      className="text-[9px] px-2"
                    >
                      {msg.status || 'New'}
                    </Badge>
                  </div>
                  <p className="font-medium text-neutral-800 line-clamp-1">{msg.subject || msg.message}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{msg.date}</p>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => onNavigate('contact-messages')}
            variant="outline"
            size="sm"
            className="w-full text-xs font-semibold border-neutral-200 text-black hover:bg-neutral-100"
          >
            Open Contact Us Page
          </Button>
        </Card>
      </div>
    </div>
  );
};
