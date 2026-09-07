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
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  likes: number;
  sizeBought: string;
}

const REVIEWS_DATA: Review[] = [
  {
    id: "r1",
    author: "Priya S.",
    rating: 5,
    date: "July 18, 2026",
    verified: true,
    title: "Absolute game changer for bridal & festive outfits!",
    comment:
      "I ordered mirror latkans and necklace set from Awesome Handmade. The finish, real mirror shine, and resham thread work are exceptional! Made my bridal lehenga look so royal.",
    likes: 42,
    sizeBought: "Standard Pair",
  },
  {
    id: "r2",
    author: "Ananya R.",
    rating: 5,
    date: "July 12, 2026",
    verified: true,
    title: "Stunning Gujarati craftsmanship & fast dispatch",
    comment:
      "The Navratri Choli and matching earrings received so many compliments! Authentic traditional mirror embroidery made with love in Surat. Highly recommend!",
    likes: 28,
    sizeBought: "Free Size",
  },
  {
    id: "r3",
    author: "Meera K.",
    rating: 5,
    date: "June 29, 2026",
    verified: true,
    title: "Perfect festive gift hampers for family!",
    comment:
      "Ordered macrame keychain gift hampers for our wedding favor gifts. Beautiful packaging, handmade quality and pristine detailing.",
    likes: 19,
    sizeBought: "Gift Box",
  },
  {
    id: "r4",
    author: "Sneha M.",
    rating: 5,
    date: "June 15, 2026",
    verified: true,
    title: "Best handmade accessories in Surat",
    comment:
      "Intricate thread work and anti-tarnish beads. Very lightweight to wear with lehengas. Fast 2-day delivery by Awesome Handmade!",
    likes: 15,
    sizeBought: "Standard",
  },
  {
    id: "r5",
    author: "Kavita P.",
    rating: 5,
    date: "June 02, 2026",
    verified: true,
    title: "Beautiful mirror work and fine finish",
    comment:
      "The craftsmanship is authentic and artistic. The golden tassels and mirror shine are exactly as pictured on the site.",
    likes: 11,
    sizeBought: "Free Size",
  },
  {
    id: "r6",
    author: "Ritu D.",
    rating: 4,
    date: "May 20, 2026",
    verified: true,
    title: "Lovely handcrafted details and packing",
    comment:
      "Carefully packaged with a personal artisan note. Perfect gift for the festive season.",
    likes: 8,
    sizeBought: "Standard",
  },
];

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
      {/* Shadcn UI Trigger Button */}
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

      {/* Shadcn UI Popover Menu */}
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
}

export const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  productId,
  productName,
  productRating = 4.9,
  productReviewCount = 12,
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

  // Fetch live reviews from database API
  useEffect(() => {
    if (!productId) return;
    fetch(`${API_BASE_URL}/reviews?productId=${productId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: Review[] = json.data.map((r: any) => ({
            id: String(r.id),
            author: r.author || "Artisan Lover",
            rating: Number(r.rating) || 5,
            date: r.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            verified: r.verified !== undefined ? Boolean(r.verified) : true,
            title: r.title || r.comment?.slice(0, 45) || "Handcrafted Quality",
            comment: r.comment || "",
            likes: Number(r.likes) || 12,
            sizeBought: r.sizeBought || "Standard Pair",
          }));
          setLiveReviews(mapped);
        }
      })
      .catch(() => {});
  }, [productId]);

  const allReviews = liveReviews.length > 0 ? liveReviews : REVIEWS_DATA;

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
      rating: newRating,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      verified: true,
      title: newTitle.trim() || "Exquisite Handmade Quality",
      comment: newComment.trim(),
      likes: 1,
      sizeBought: "Standard Pair",
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
      setLiveReviews((prev) => [newRevObj, ...prev]);
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
      setLiveReviews((prev) => [newRevObj, ...prev]);
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

  const displayRating = Number(productRating || 4.9).toFixed(1);
  const displayReviewCount = liveReviews.length > 0 ? liveReviews.length : (productReviewCount || allReviews.length);

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

      {/* Overall Rating Box & Filters Row (Full width & stacked filters on mobile, Left-Right on Laptop/Tablet) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-4">
        {/* Left Side: Overall Rating Card (Full width on mobile w-full, w-fit on tablet/desktop) */}
        <div className="flex items-center justify-between sm:justify-start gap-3 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 bg-[#f5f2ee]/60 w-full md:w-fit shrink-0">
          <span className="text-3xl sm:text-4xl font-black text-zinc-900">{displayRating}</span>
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={18}
                  className={i < Math.floor(Number(displayRating)) ? "fill-amber-500 text-amber-500" : "fill-amber-200 text-amber-300"}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#520618] ml-1">({displayReviewCount} reviews)</span>
          </div>
        </div>

        {/* Right Side: Sort & Filter Dropdowns (Stacked vertically on mobile, side-by-side on tablet/desktop) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start md:justify-end gap-3 w-full md:w-auto">
          {/* Sort By Dropdown (Shadcn UI Style) */}
          <ShadcnSelect
            labelPrefix="Sort by"
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={sortOptions}
            className="w-full sm:w-auto"
          />

          {/* Filter Dropdown (Placed below Sort by on mobile view) */}
          <ShadcnSelect
            labelPrefix="Filter"
            value={filterRating}
            onChange={(val) => setFilterRating(val)}
            options={filterOptions}
            className="w-full sm:w-auto"
          />
        </div>
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
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Rating</label>
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
                          className={star <= newRating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
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
                    placeholder="e.g. Exquisite mirror work and fast delivery!"
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
        {filteredAndSortedReviews.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 font-medium text-xs md:text-sm bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            No reviews found matching the selected filter rating ({filterRating} Stars).
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div key={review.id} className="pt-6 first:pt-0 space-y-2">
              {/* First Line: Author • Stars • Date */}
              <div className="flex items-center gap-2 text-xs text-zinc-600 flex-wrap">
                <span className="font-bold text-zinc-900">{review.author}</span>
                <span className="text-zinc-300">•</span>
                <div className="flex text-amber-500 items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={12}
                      className={i < review.rating ? "fill-amber-500 text-amber-500" : "text-zinc-300"}
                    />
                  ))}
                </div>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-500">{review.date}</span>
              </div>

              {/* Below Top Line: Heading Title */}
              <h4 className="font-bold text-sm text-zinc-900 leading-snug">
                {review.title}
              </h4>

              {/* Below Heading: Paragraph Comment (2 lines max on mobile) */}
              <p className="text-xs md:text-sm text-zinc-700 leading-relaxed max-w-4xl line-clamp-2 sm:line-clamp-none">
                {review.comment}
              </p>

              {/* Helpful Like Button */}
              <div className="py-4">
                <button
                  onClick={() => handleLike(review.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    likedMap[review.id]
                      ? "bg-[#1c1c1e] text-white border-[#1c1c1e]"
                      : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900"
                  }`}
                >
                  <FiThumbsUp size={13} />
                  <span>Helpful ({likesState[review.id]})</span>
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
