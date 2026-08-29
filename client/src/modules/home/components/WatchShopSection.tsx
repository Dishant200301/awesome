import { useState, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ReelCard, { ReelItem } from "./ReelCard";
import { PaginationDots } from "@/modules/core/components/PaginationDots";

const REELS: ReelItem[] = [
  {
    id: 1,
    title: "Bead Craft & Latkan Making",
    description: "Handmade Saree Kuchu & Mirror Latkan Craft ✨🪡 #shorts",
    views: "18.4K",
    likes: 420,
    img: "/images/home/reels/latkan-bead-craft.webp",
    video: "/images/home/reels/latkan-bead-craft.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Handmade Mirror Latkan Pair",
      price: "₹499",
      img: "/images/home/reels/latkan-bead-craft.webp",
      link: "/shop?category=latkan",
    },
  },
  {
    id: 2,
    title: "Woolen Latkan & Saree Kuchu Craft",
    description: "Artisan Woolen Latkan & Sewing Hacks 🌸🪡 #shorts",
    views: "24.1K",
    likes: 580,
    img: "/images/home/reels/woolen-latkan-craft.webp",
    video: "/images/home/reels/woolen-latkan-craft.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Woolen Designer Latkan Pair",
      price: "₹399",
      img: "/images/home/reels/woolen-latkan-craft.webp",
      link: "/shop?category=latkan",
    },
  },
  {
    id: 3,
    title: "Tricolor Tassel Latkan Making",
    description: "Festive Tricolor Silk Tassel Latkan 🇮🇳✨ #shorts",
    views: "15.9K",
    likes: 310,
    img: "/images/home/reels/tricolor-tassel-latkan.webp",
    video: "/images/home/reels/tricolor-tassel-latkan.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Tricolor Silk Tassel Pair",
      price: "₹349",
      img: "/images/home/reels/tricolor-tassel-latkan.webp",
      link: "/shop?category=latkan",
    },
  },
  {
    id: 4,
    title: "Mirror Craft & Waist Belt Making",
    description: "Double Side Mirror Belt Craft Idea 💃✨ #shorts",
    views: "32.6K",
    likes: 890,
    img: "/images/home/reels/mirror-craft-belt.webp",
    video: "/images/home/reels/mirror-craft-belt.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Handcrafted Mirror Waist Belt",
      price: "₹549",
      img: "/images/home/reels/mirror-craft-belt.webp",
      link: "/shop?category=waist-belt",
    },
  },
  {
    id: 5,
    title: "Couple Rakhi Making at Home",
    description: "Handcrafted Couple Rakhi Making Idea 💑🎀 #shorts",
    views: "19.2K",
    likes: 440,
    img: "/images/home/reels/couple-rakhi-making.webp",
    video: "/images/home/reels/couple-rakhi-making.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Festive Couple Rakhi Set",
      price: "₹299",
      img: "/images/home/reels/couple-rakhi-making.webp",
      link: "/shop?category=bracelet",
    },
  },
  {
    id: 6,
    title: "Wool Flower & Hairband Craft",
    description: "Floral Hairband & Hair Accessories Craft 🌺🎀 #shorts",
    views: "11.7K",
    likes: 265,
    img: "/images/home/reels/flower-hairband-craft.webp",
    video: "/images/home/reels/flower-hairband-craft.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Handmade Floral Hair Band",
      price: "₹249",
      img: "/images/home/reels/flower-hairband-craft.webp",
      link: "/shop?category=hair-accessories",
    },
  },
  {
    id: 7,
    title: "Easy Dupatta Tassel & Fabric Latkan",
    description: "Easy Dupatta Tassel Idea & Fabric Latkan 🌸✨ #shorts",
    views: "14.3K",
    likes: 330,
    img: "/images/home/reels/dupatta-tassel-latkan.webp",
    video: "/images/home/reels/dupatta-tassel-latkan.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Artisan Fabric Dupatta Tassels",
      price: "₹299",
      img: "/images/home/reels/dupatta-tassel-latkan.webp",
      link: "/shop?category=latkan",
    },
  },
  {
    id: 8,
    title: "Festive Handmade Rakhi Making",
    description: "Festive Handmade Rakhi Gift Idea 🎁✨ #shorts",
    views: "21.0K",
    likes: 512,
    img: "/images/home/reels/festive-rakhi-making.webp",
    video: "/images/home/reels/festive-rakhi-making.mp4",
    brand: "Awesome Handmade",
    relatedProduct: {
      name: "Artisan Rakhi Gift Hamper",
      price: "₹599",
      img: "/images/home/reels/festive-rakhi-making.webp",
      link: "/shop?category=gift-hamper",
    },
  },
];

export default function WatchShopSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number>(0);
  const scrollLeftStart = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeDot, setActiveDot] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const totalDots = 4;
      const index = Math.round((scrollLeft / maxScroll) * (totalDots - 1));
      setActiveDot(Math.max(0, Math.min(totalDots - 1, index)));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasMoved.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasMoved.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleDotClick = (index: number) => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = (index / 3) * maxScroll;
    scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
    setActiveDot(index);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 overflow-hidden w-full pr-0 mr-0">
      {/* Section Header */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 text-center mb-6 sm:mb-8 md:mb-10">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.12em] text-brand-maroon uppercase">
          WATCH &amp; SHOP HANDMADE
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-brand-ink/75 max-w-lg mx-auto font-light leading-relaxed">
          Discover behind the scenes, craft making, and styling guides directly from our artisans
        </p>
      </div>

      {/* Manual Horizontal Scroll Container (Outer wrapper full bleed with inner track padding) */}
      <div className="relative w-full max-w-[1500px] mx-auto group/carousel">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`overflow-x-auto no-scrollbar scroll-smooth pb-2 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className="flex gap-3.5 sm:gap-4 md:gap-5 flex-nowrap w-max px-4 sm:px-6">
            {REELS.map((reel) => (
              <div
                key={reel.id}
                className="shrink-0 w-[78vw] sm:w-[280px] md:w-[310px] lg:w-[330px]"
              >
                <ReelCard r={reel} />
              </div>
            ))}
          </div>
        </div>

        {/* Left Arrow (Desktop / Tablet) */}
        <button
          onClick={() => scrollByAmount("left")}
          className={`hidden sm:flex absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-brand-gold/30 text-brand-maroon shadow-lg items-center justify-center hover:bg-brand-maroon hover:text-white transition-all duration-300 cursor-pointer ${
            !canScrollLeft
              ? "opacity-0 pointer-events-none scale-75"
              : "opacity-100 scale-100"
          }`}
          aria-label="Previous reel"
        >
          <FiChevronLeft size={20} />
        </button>

        {/* Right Arrow (Desktop / Tablet) */}
        <button
          onClick={() => scrollByAmount("right")}
          className={`hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 border border-brand-gold/30 text-brand-maroon shadow-lg items-center justify-center hover:bg-brand-maroon hover:text-white transition-all duration-300 cursor-pointer ${
            !canScrollRight
              ? "opacity-0 pointer-events-none scale-75"
              : "opacity-100 scale-100"
          }`}
          aria-label="Next reel"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Pagination Dots */}
      <PaginationDots
        total={4}
        current={activeDot}
        onChange={handleDotClick}
        className="mt-6"
      />
    </section>
  );
}
