import React, { useState, useEffect } from "react";
import {
  FiStar,
  FiThumbsUp,
  FiChevronDown,
  FiCheck,
  FiX,
  FiEdit3,
} from "react-icons/fi";
import { API_BASE_URL } from "@/modules/core/lib/apiStore";

export interface Review {
  id: string;
  author: string;
  email?: string;
  rating: number;
  date: string;
  verified: boolean;
  title?: string;
  comment: string;
  likes: number;
  sizeBought?: string;
}

/* Custom Shadcn UI Style Select Dropdown Component */
interface ShadcnSelectOption {
  value: string;
  label: string;
}

interface ShadcnSelectProps {
  labelPrefix?: string;
  value: string;
  onChange: (val: string) => void;
  options: ShadcnSelectOption[];
  className?: string;
}

const ShadcnSelect: React.FC<ShadcnSelectProps> = ({
  labelPrefix,
  value,
  onChange,
  options,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 180)}
        className="flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-md bg-white border border-zinc-200 hover:border-zinc-300 text-xs font-semibold text-zinc-900 shadow-2xs hover:bg-zinc-50/80 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-950/10 active:scale-[0.99] w-full min-w-[155px] sm:min-w-[180px]"
      >
        <span className="truncate">
          {labelPrefix ? <span className="text-zinc-500 font-medium">{labelPrefix}: </span> : ""}
          <span className="font-bold text-zinc-900">{selectedOption.label}</span>
        </span>
        <FiChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-zinc-900" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-full w-max bg-white border border-zinc-200/90 rounded-md shadow-lg p-1 font-sans">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-colors text-left cursor-pointer ${
                  isSelected
                    ? "bg-zinc-100 text-zinc-900 font-bold"
                    : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <FiCheck size={14} className="text-zinc-900 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export interface CustomerReviewsSectionProps {
  productId?: string | number;
  productName?: string;
  productRating?: number;
  productReviewCount?: number;
  onReviewsUpdated?: (newRating: number, newCount: number) => void;
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  productId,
  productName,
  productRating = 0,
  productReviewCount = 0,
  onReviewsUpdated,
}) => {
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);
  const [likesState, setLikesState] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterRating, setFilterRating] = useState<string>("all");

  // Write Review Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch real reviews from database API
  useEffect(() => {
    if (!productId) return;
    fetch(`${API_BASE_URL}/reviews?productId=${productId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          const mapped: Review[] = json.data.map((r: any) => ({
            id: String(r.id),
            author: r.author || "Customer",
            email: r.email || "",
            rating: Number(r.rating) || 5,
            date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })),
            verified: r.verified !== undefined ? Boolean(r.verified) : true,
            title: r.title || "",
            comment: r.comment || "",
            likes: Number(r.likes) || 0,
            sizeBought: r.sizeBought || "",
          }));
          setLiveReviews(mapped);
          const liveCount = mapped.length;
          const liveAvg = liveCount > 0 ? Number((mapped.reduce((acc, r) => acc + r.rating, 0) / liveCount).toFixed(1)) : 0;
          onReviewsUpdated?.(liveAvg, liveCount);
        }
      })
      .catch(() => {});
  }, [productId]);

  const allReviews = liveReviews;

  const handleLike = (id: string) => {
    if (likedMap[id]) return;
    setLikedMap((prev) => ({ ...prev, [id]: true }));
    setLikesState((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    const newRevObj: Review = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      email: newEmail.trim(),
      rating: newRating,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      verified: true,
      title: newTitle.trim(),
      comment: newComment.trim(),
      likes: 0,
    };

    try {
      await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: String(productId || "prod-1"),
          productName: productName || "Awesome Handmade Product",
          author: newAuthor.trim(),
          email: newEmail.trim(),
          rating: newRating,
          title: newTitle.trim(),
          comment: newComment.trim(),
          status: "Approved",
        }),
      });

      const updated = [newRevObj, ...liveReviews];
      setLiveReviews(updated);
      const newCount = updated.length;
      const newAvg = Number((updated.reduce((acc, r) => acc + r.rating, 0) / newCount).toFixed(1));
      onReviewsUpdated?.(newAvg, newCount);

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsWriteModalOpen(false);
        setNewAuthor("");
        setNewEmail("");
        setNewTitle("");
        setNewComment("");
        setNewRating(5);
      }, 1500);
    } catch {
      const updated = [newRevObj, ...liveReviews];
      setLiveReviews(updated);
      const newCount = updated.length;
      const newAvg = Number((updated.reduce((acc, r) => acc + r.rating, 0) / newCount).toFixed(1));
      onReviewsUpdated?.(newAvg, newCount);
      setIsWriteModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "rating", label: "Highest Rated" },
  ];

  const filterOptions = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" },
  ];

  // Filter and sort reviews according to user selection
  const filteredAndSortedReviews = allReviews.filter((review) => {
    if (filterRating === "all") return true;
    return review.rating === parseInt(filterRating, 10);
  }).sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const currentCount = liveReviews.length;
  const currentAvg = currentCount > 0
    ? Number((liveReviews.reduce((acc, r) => acc + r.rating, 0) / currentCount).toFixed(1))
    : Number(productRating || 0);
  const displayRating = currentAvg > 0 ? currentAvg.toFixed(1) : "0.0";
  const displayReviewCount = currentCount > 0 ? currentCount : (productReviewCount || 0);

  return (
    <section className="w-full py-10 md:py-12 px-4 md:px-8 max-w-[1500px] mx-auto space-y-6 md:space-y-8 font-sans">
      {/* Section Title matching Home Page */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Customer Reviews & Ratings
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#F7E7B4] via-[#D8B458] to-[#B38728] rounded-full" />
        </div>

        {/* Write a Review CTA Button */}
        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#520618] hover:bg-[#3d0411] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
        >
          <FiEdit3 size={14} />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Overall Rating Box & Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-4">
        {/* Left Side: Overall Rating Card */}
        <div className="flex items-center justify-between sm:justify-start gap-3 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 bg-[#f5f2ee]/60 w-full md:w-fit shrink-0">
          <span className="text-3xl sm:text-4xl font-black text-zinc-900">{displayRating}</span>
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={18}
                  className={i < Math.floor(Number(displayRating)) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-300"}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#520618] ml-1">
              ({displayReviewCount} {displayReviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>

        {/* Right Side: Sort & Filter Dropdowns (Only if reviews exist) */}
        {allReviews.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start md:justify-end gap-3 w-full md:w-auto">
            <ShadcnSelect
              labelPrefix="Sort by"
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              options={sortOptions}
              className="w-full sm:w-auto"
            />

            <ShadcnSelect
              labelPrefix="Filter"
              value={filterRating}
              onChange={(val) => setFilterRating(val)}
              options={filterOptions}
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-xl font-bold text-zinc-900">Write a Review</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Share your experience with {productName || "this handcrafted creation"}
            </p>

            {submitSuccess ? (
              <div className="mt-6 p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-sm font-semibold border border-emerald-200">
                🎉 Thank you! Your review has been submitted successfully.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Rating *</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-2xl transition-transform hover:scale-110 cursor-pointer"
                      >
                        <FiStar
                          size={24}
                          className={star <= newRating ? "fill-amber-400 text-amber-400" : "text-zinc-300 fill-zinc-100"}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-zinc-600 ml-2">{newRating} of 5 Stars</span>
                  </div>
                </div>

                {/* Author Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Radhika Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#520618]/20 focus:border-[#520618]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Email (optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. radhika@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#520618]/20 focus:border-[#520618]"
                  />
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Review Headline</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Exquisite mirror work and fine quality!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#520618]/20 focus:border-[#520618]"
                  />
                </div>

                {/* Review Comment */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Your Review *</label>
                  <textarea
                    required
                    rows={4}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your honest feedback about the craft, quality, and finish..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#520618]/20 focus:border-[#520618] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-xl bg-[#520618] hover:bg-[#3d0411] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6 divide-y divide-zinc-200/80">
        {allReviews.length === 0 ? (
          <div className="py-12 px-4 text-center bg-zinc-50/60 rounded-2xl border border-dashed border-zinc-200 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <FiStar size={24} />
            </div>
            <h3 className="text-base font-bold text-zinc-800">No reviews yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Be the first to share your experience with this handcrafted creation!
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#520618] hover:bg-[#3d0411] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <FiEdit3 size={13} />
                <span>Write the First Review</span>
              </button>
            </div>
          </div>
        ) : filteredAndSortedReviews.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 font-medium text-xs md:text-sm bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            No reviews found matching the selected filter ({filterRating} Stars).
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div key={review.id} className="pt-6 first:pt-0 space-y-2">
              {/* First Line: Author • Verified Buyer • Email (if present) • Stars • Date */}
              <div className="flex items-center gap-2 text-xs text-zinc-600 flex-wrap">
                <span className="font-bold text-zinc-900">{review.author}</span>
                {review.verified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded">
                    Verified Buyer
                  </span>
                )}
                {review.email && (
                  <span className="text-zinc-400 text-[11px]">({review.email})</span>
                )}
                <span className="text-zinc-300">•</span>
                <div className="flex text-amber-400 items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={13}
                      className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-300 fill-zinc-100"}
                    />
                  ))}
                </div>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500">{review.date}</span>
              </div>

              {/* Below Top Line: Heading Title */}
              {review.title && (
                <h4 className="font-bold text-sm text-zinc-900 leading-snug">
                  {review.title}
                </h4>
              )}

              {/* Below Heading: Paragraph Comment */}
              <p className="text-xs md:text-sm text-zinc-700 leading-relaxed max-w-4xl whitespace-pre-line">
                {review.comment}
              </p>

              {/* Helpful Like Button */}
              <div className="py-2">
                <button
                  type="button"
                  onClick={() => handleLike(review.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    likedMap[review.id]
                      ? "bg-[#1c1c1e] text-white border-[#1c1c1e]"
                      : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900"
                  }`}
                >
                  <FiThumbsUp size={13} />
                  <span>Helpful ({likesState[review.id] || review.likes || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CustomerReviewsSection;
