import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Trash2,
  CheckCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  ThumbsUp
} from 'lucide-react';
import { idbGet, idbSet } from '../data/idbStorage';
import { AdminApiService } from '../services/adminApi';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export interface AdminReviewItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  author: string;
  email: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
  status?: 'Approved' | 'Pending' | 'Rejected';
  createdAt?: string;
}

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Approved' | 'Pending'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load reviews from Server API, LocalStorage & IndexedDB
  const loadReviews = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live reviews directly from backend server API
      const remote = await AdminApiService.getReviews();
      if (Array.isArray(remote) && remote.length > 0) {
        setReviews(remote);
        localStorage.setItem('awesome_admin_reviews', JSON.stringify(remote));
        await idbSet('awesome_admin_reviews', remote);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      // API fallback
    }

    // 2. Fallback to LocalStorage and IndexedDB
    try {
      const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('awesome_deleted_reviews') || '[]'));
      const stored = localStorage.getItem('awesome_admin_reviews') || localStorage.getItem('aaramly_admin_reviews');
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReviews(parsed.filter((r) => !deletedIds.has(String(r.id))));
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {}

    idbGet<AdminReviewItem[]>('awesome_admin_reviews')
      .then((stored) => {
        const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('awesome_deleted_reviews') || '[]'));
        if (Array.isArray(stored)) {
          setReviews(stored.filter((r) => !deletedIds.has(String(r.id))));
        } else {
          setReviews([]);
        }
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadReviews();

    const handleSync = () => {
      loadReviews();
    };

    window.addEventListener('awesome_review_sync', handleSync);
    window.addEventListener('aaramly_review_sync', handleSync);
    window.addEventListener('awesome_product_sync', handleSync);

    return () => {
      window.removeEventListener('awesome_review_sync', handleSync);
      window.removeEventListener('aaramly_review_sync', handleSync);
      window.removeEventListener('awesome_product_sync', handleSync);
    };
  }, []);

  const saveReviews = async (newList: AdminReviewItem[]) => {
    setReviews(newList);
    try {
      localStorage.setItem('awesome_admin_reviews', JSON.stringify(newList));
      await idbSet('awesome_admin_reviews', newList);
      window.dispatchEvent(new Event('awesome_review_sync'));
      window.dispatchEvent(new Event('aaramly_review_sync'));
    } catch (e) {}
  };

  const handleDeleteReview = async (id: string) => {
    const updated = reviews.filter((r) => String(r.id) !== String(id));
    setReviews(updated);
    try {
      const deletedIds = JSON.parse(localStorage.getItem('awesome_deleted_reviews') || '[]');
      if (!deletedIds.includes(String(id))) {
        deletedIds.push(String(id));
        localStorage.setItem('awesome_deleted_reviews', JSON.stringify(deletedIds));
        await idbSet('awesome_deleted_reviews', deletedIds);
      }
    } catch (e) {}

    await saveReviews(updated);
    try {
      await AdminApiService.deleteReview(id);
    } catch (e) {}
    setDeletingId(null);
  };

  const handleToggleStatus = async (id: string) => {
    let nextStatus: 'Approved' | 'Pending' = 'Approved';
    const updated = reviews.map((r) => {
      if (r.id === id) {
        nextStatus = r.status === 'Approved' ? 'Pending' : 'Approved';
        return { ...r, status: nextStatus as any };
      }
      return r;
    });
    await saveReviews(updated);
    try {
      await AdminApiService.updateReviewStatus(id, nextStatus);
    } catch (e) {}
  };


  // Filtered reviews list
  const filteredReviews = reviews.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      r.author.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.comment.toLowerCase().includes(q);

    const matchRating = ratingFilter === 'ALL' || r.rating === ratingFilter;
    const matchStatus = statusFilter === 'ALL' || (r.status || 'Approved') === statusFilter;

    return matchSearch && matchRating && matchStatus;
  });

  // Calculate review metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;

  return (
    <div className="space-y-6 font-sans selection:bg-black selection:text-white pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Customer Reviews &amp; Feedback</span>
            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-900 border-amber-200 font-bold">
              {totalReviews} Real-Time
            </Badge>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Live customer ratings, feedback, and product reviews submitted from the storefront in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadReviews}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-neutral-800' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Live'}</span>
          </Button>

        </div>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-black">{totalReviews}</span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <CheckCircle className="w-3 h-3" /> Live
            </span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Average Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-black">{avgRating}</span>
            <span className="text-[11px] text-neutral-400">/ 5.0</span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">5-Star Ratings</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-black">{fiveStarCount}</span>
            <span className="text-[11px] text-neutral-500">
              ({totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100}%)
            </span>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Verified Buyers</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-black">100%</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Storefront</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-full lg:max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, product or review text..."
            className="w-full bg-neutral-50 text-xs text-black pl-9 pr-4 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-black focus:bg-white transition-colors font-sans"
          />
        </div>

        {/* Rating Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none whitespace-nowrap">
          <button
            type="button"
            onClick={() => setRatingFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              ratingFilter === 'ALL'
                ? 'bg-black text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRatingFilter(star)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                ratingFilter === star
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <span>{star}</span>
              <Star className={`w-3 h-3 ${ratingFilter === star ? 'fill-white' : 'fill-amber-400 text-amber-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* REVIEWS LIST */}
      {filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => (
            <motion.div
              key={rev.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4 relative group"
            >
              {/* Top Header: Customer Info & Product */}
              <div className="space-y-3">
                <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2.5">
                  {/* Author Avatar & Details */}
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-black truncate">{rev.author}</span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{rev.email || 'No email provided'}</p>
                    </div>
                  </div>

                  {/* Rating Stars & Date */}
                  <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 pt-0.5">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-neutral-400">{rev.date}</span>
                  </div>
                </div>

                {/* Review Comment Text */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line bg-[#fdfdfd] p-3 rounded-lg border border-neutral-100 font-sans">
                  "{rev.comment}"
                </p>
              </div>

              {/* Bottom Footer Actions */}
              <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(rev.id)}
                    className={`px-2.5 py-1 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                      rev.status === 'Approved' || !rev.status
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {rev.status || 'Approved'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {deletingId === rev.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-[11px] hover:bg-neutral-300 cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(rev.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl p-8 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
            <Star size={28} className="fill-amber-400" />
          </div>
          <h3 className="text-base font-bold text-black">No Customer Reviews Found</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            {searchQuery
              ? `No reviews matching "${searchQuery}". Try a different keyword.`
              : 'When customers submit reviews and ratings on the Product Details page, they will appear here in real-time.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
