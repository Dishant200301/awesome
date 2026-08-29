import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import { CATEGORY_TABS } from "../lib/products";
import ProductCard from "./ProductCard";
import { subscribeToProductStore, getLiveProductsList } from "@/modules/core/lib/apiStore";

interface FeaturedProps {
  activeTab?: string;
  setActiveTab?: (t: string) => void;
}

export default function FeaturedProductsSection({ activeTab, setActiveTab }: FeaturedProps) {
  const [localTab, setLocalTab] = useState("all");
  const tab = activeTab !== undefined ? activeTab : localTab;
  const setTab = setActiveTab !== undefined ? setActiveTab : setLocalTab;

  const [liveList, setLiveList] = useState(getLiveProductsList);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalDots, setTotalDots] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setLiveList([...getLiveProductsList()]);
    const unsub = subscribeToProductStore(update);
    return () => unsub();
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft: sLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(sLeft > 10);
    setCanScrollRight(sLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 5) {
      setActiveIndex(0);
      return;
    }
    const maxDotIdx = Math.max(1, totalDots - 1);
    const progress = Math.max(0, Math.min(1, sLeft / maxScroll));
    const dot = Math.min(maxDotIdx, Math.max(0, Math.round(progress * maxDotIdx)));
    setActiveIndex(dot);
  };

  const updateDotCount = () => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    if (clientWidth <= 0) return;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 10) {
      setTotalDots(0);
      return;
    }
    const pages = Math.ceil(scrollWidth / clientWidth);
    setTotalDots(Math.max(2, pages));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const scrollToDot = (dotIdx: number) => {
    if (!scrollRef.current || totalDots <= 1) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const maxDotIdx = Math.max(1, totalDots - 1);
    const target = maxScroll * (dotIdx / maxDotIdx);
    scrollRef.current.scrollTo({ left: target, behavior: "smooth" });
    setActiveIndex(dotIdx);
  };

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".prod-card", {
        y: 30, opacity: 0, stagger: 0.08, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" }
      });
    }, ref);
    return () => ctx.revert();
  }, [tab, liveList]);

  // Dynamic products from live store matching Awesome Handmade catalog
  const filteredProducts = liveList
    .filter((lp) => {
      if (!tab || tab === "all") return true;
      const catSlug = (lp.categorySlug || lp.category || "").toLowerCase();
      const name = (lp.name || "").toLowerCase();
      if (tab === "latkan") return catSlug.includes("latkan") || catSlug.includes("tassel") || name.includes("latkan");
      if (tab === "earrings") return catSlug.includes("earring") || catSlug.includes("jhumka") || name.includes("earring");
      if (tab === "choli") return catSlug.includes("choli") || name.includes("choli");
      if (tab === "gift-hamper") return catSlug.includes("gift") || catSlug.includes("hamper") || catSlug.includes("keychain");
      if (tab === "necklace") return catSlug.includes("necklace") || name.includes("necklace");
      if (tab === "bracelet") return catSlug.includes("bracelet") || catSlug.includes("anklet") || catSlug.includes("payal");
      return catSlug.includes(tab);
    })
    .map((lp) => {
      const extractUrl = (val: any): string => {
        if (!val) return "";
        if (typeof val === "string") return val.trim();
        if (typeof val === "object") {
          if (typeof val.url === "string") return val.url.trim();
          if (typeof val.src === "string") return val.src.trim();
          if (typeof val.image === "string") return val.image.trim();
        }
        return "";
      };

      const primaryImg =
        extractUrl(lp.image) ||
        extractUrl(lp.mainImage) ||
        extractUrl(lp.img) ||
        (Array.isArray(lp.images) && extractUrl(lp.images[0])) ||
        (Array.isArray(lp.colors) && (extractUrl(lp.colors[0]?.mainImage) || extractUrl(lp.colors[0]?.displayImage))) ||
        "/images/category/Latkan.webp";

      const hoverImg =
        extractUrl(lp.hoverImage) ||
        extractUrl(lp.hoverImg) ||
        (Array.isArray(lp.galleryImages) && extractUrl(lp.galleryImages[0])) ||
        (Array.isArray(lp.images) && lp.images.length > 1 && extractUrl(lp.images[1])) ||
        primaryImg;

      return {
        ...lp,
        id: lp.id,
        code: lp.defaultSku || lp.sku || "AWH-001",
        name: lp.name,
        tagline: lp.subtitle || lp.shortDescription || "100% Handcrafted in Surat",
        price: lp.price,
        originalPrice: lp.originalPrice || Math.round(lp.price * 2),
        discountPercentage: lp.discountPercentage || 50,
        image: primaryImg,
        hoverImage: hoverImg,
        rating: lp.rating || 4.9,
        category: lp.category || "latkan",
      };
    });

  useEffect(() => {
    updateDotCount();
    checkScroll();
    window.addEventListener("resize", updateDotCount);
    return () => window.removeEventListener("resize", updateDotCount);
  }, [filteredProducts.length]);

  return (
    <section id="new-arrivals" ref={ref} className="scroll-mt-20 md:scroll-mt-24 mx-auto max-w-[1500px] py-8 sm:py-12 md:py-16 overflow-hidden">
      {/* Top Categories Heading & Category Filter Tabs */}
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col items-center text-center px-4 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-brand-maroon uppercase">
          FEATURED HANDMADE PRODUCTS
        </h2>

        {/* Scrollable Category Filter Tabs */}
        <div className="w-full max-w-6xl mt-5 md:mt-8 px-0 overflow-x-auto no-scrollbar">
          <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 min-w-max mx-auto px-4 border-b border-[#EDE5DA]">
            {CATEGORY_TABS.map((t) => {
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setActiveIndex(0);
                    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
                  }}
                  className={`relative pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors duration-300 cursor-pointer after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out ${
                    isActive
                      ? "text-brand-maroon font-bold after:scale-x-100 after:origin-left"
                      : "text-brand-ink/60 hover:text-brand-maroon after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1-Row Smooth Horizontal Scroll Container (All Devices) */}
      <div className="relative w-full max-w-[1500px] mx-auto group/carousel">
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`overflow-x-auto no-scrollbar scroll-smooth pb-4 select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-4 sm:gap-5 md:gap-6 flex-nowrap w-max px-4 sm:px-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="prod-card shrink-0 w-[82vw] min-w-[280px] max-w-[330px] sm:w-[280px] lg:w-[310px] xl:w-[335px]"
              >
                <ProductCard p={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrow Buttons - Centered to Product Image */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            aria-label="Scroll left"
            className="hidden sm:flex absolute left-2 sm:left-3 md:left-4 top-[140px] lg:top-[155px] xl:top-[168px] -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/95 text-brand-ink shadow-md hover:bg-brand-maroon hover:text-white transition-all cursor-pointer border border-[#EDE5DA]"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
        )}

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label="Scroll right"
            className="hidden sm:flex absolute right-2 sm:right-3 md:right-4 top-[140px] lg:top-[155px] xl:top-[168px] -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/95 text-brand-ink shadow-md hover:bg-brand-maroon hover:text-white transition-all cursor-pointer border border-[#EDE5DA]"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Center "View More" CTA Button (All Devices) */}
      <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center items-center px-4">
        <Link
          to={tab && tab !== "all" ? `/shop?category=${tab}` : "/shop"}
          className="group inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full border border-brand-maroon text-brand-maroon bg-white hover:bg-brand-maroon hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
        >
          <span>View More</span>
          <FiArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

