import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { ProductImage } from "../types/product";
import { PaginationDots } from "@/modules/core/components/PaginationDots";

interface VerticalGalleryProps {
  images: ProductImage[];
  sku: string;
}

export const VerticalGallery: React.FC<VerticalGalleryProps> = ({ images, sku }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = slide right to left
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const thumbScrollRef = useRef<HTMLDivElement>(null);

  const seenUrls = new Set<string>();
  const validImages: ProductImage[] = [];
  if (Array.isArray(images)) {
    images.forEach((img, i) => {
      if (img && typeof img.url === "string" && img.url.trim().length > 0) {
        const cleanUrl = img.url.trim();
        if (!seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          validImages.push({
            id: img.id || `img-${i}`,
            url: cleanUrl,
            alt: img.alt || `Product Image ${validImages.length + 1}`,
          });
        }
      }
    });
  }

  const safeImages: ProductImage[] = validImages;

  const firstImageUrl = safeImages[0]?.url || "";
  // Always reset to first image (0) when product images or SKU changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [firstImageUrl, sku]);

  // Handle keyboard navigation for main preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, safeImages]);

  const handleSelectImage = (index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  };

  const handleNext = () => {
    setDirection(1);
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  // Image Zoom on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const currentImage = safeImages[selectedIndex] || safeImages[0];

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 select-none">
      {/* DESKTOP VERTICAL THUMBNAIL GALLERY */}
      <div
        className="hidden lg:flex flex-col items-center gap-1.5 relative w-20 shrink-0 select-none max-h-[660px]"
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => setIsHoverPaused(false)}
      >
        {/* Top Scroll Arrow Button */}
        {safeImages.length > 4 && (
          <button
            onClick={() => {
              if (thumbScrollRef.current) {
                thumbScrollRef.current.scrollBy({ top: -120, behavior: "smooth" });
              }
            }}
            className="w-16 h-7 rounded-md bg-zinc-200/80 hover:bg-zinc-800 hover:text-white flex items-center justify-center text-zinc-700 transition-colors shadow-2xs z-10 cursor-pointer shrink-0"
            aria-label="Scroll thumbnails up"
          >
            <FiChevronUp size={18} />
          </button>
        )}

        {/* Thumbnails Vertical Column */}
        <div
          ref={thumbScrollRef}
          className="w-full flex-1 max-h-[660px] overflow-y-auto scrollbar-none flex flex-col gap-2.5 py-0.5 px-0.5 transition-all"
          style={{ scrollBehavior: "smooth" }}
        >
          {safeImages.map((img, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => handleSelectImage(idx)}
                onMouseEnter={() => handleSelectImage(idx)}
                className={`relative w-18 h-18 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 group cursor-pointer ${
                  isActive
                    ? "border-brand-maroon shadow-md ring-2 ring-brand-maroon/20 scale-105"
                    : "border-zinc-300 opacity-80 hover:opacity-100 hover:border-zinc-500"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>

        {/* Bottom Scroll Arrow Button */}
        {safeImages.length > 4 && (
          <button
            onClick={() => {
              if (thumbScrollRef.current) {
                thumbScrollRef.current.scrollBy({ top: 100, behavior: "smooth" });
              }
            }}
            className="w-16 h-7 rounded-md bg-zinc-200/80 hover:bg-zinc-800 hover:text-white flex items-center justify-center text-zinc-700 transition-colors shadow-2xs z-10 cursor-pointer"
            aria-label="Scroll thumbnails down"
          >
            <FiChevronDown size={18} />
          </button>
        )}
      </div>

      {/* LARGE PRODUCT PREVIEW */}
      <div className="relative flex-1 bg-[#FAF8F5] rounded-2xl overflow-hidden aspect-square max-h-[660px] group border border-[#EDE5DA]">
        {/* Animated Image Container */}
        <div
          className="w-full h-full relative overflow-hidden flex items-center justify-center"
          onMouseEnter={() => setIsZoomActive(true)}
          onMouseLeave={() => setIsZoomActive(false)}
          onMouseMove={handleMouseMove}
        >
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            {currentImage?.url ? (
              <motion.img
                key={currentImage?.url}
                src={currentImage?.url}
                alt={currentImage?.alt}
                custom={direction}
                initial={{
                  x: direction > 0 ? 60 : -60,
                  opacity: 0,
                }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: direction > 0 ? -60 : 60,
                  opacity: 0,
                }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                className={`w-full h-full object-cover object-center ${
                  isZoomActive ? "opacity-0" : "opacity-100"
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                <svg className="w-16 h-16 stroke-current opacity-40" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-zinc-400 mt-2">No preview image</span>
              </div>
            )}
          </AnimatePresence>

          {/* Zoom Lens Overlay when hovering */}
          {isZoomActive && (
            <div
              className="absolute inset-0 bg-no-repeat pointer-events-none transition-opacity duration-200"
              style={{
                backgroundImage: `url(${currentImage?.url})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: "220%",
              }}
            />
          )}
        </div>

        {/* Previous / Next Arrows on Preview */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-brand-maroon hover:text-white transition-all opacity-90 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-brand-maroon hover:text-white transition-all opacity-90 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
              aria-label="Next image"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}

        {/* Pagination indicators on mobile */}
        <PaginationDots
          total={safeImages.length}
          current={selectedIndex}
          onChange={(idx) => handleSelectImage(idx)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 lg:hidden bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full z-10 pointer-events-auto"
        />
      </div>

      {/* MOBILE HORIZONTAL THUMBNAILS SLIDER (< 1024px) */}
      <div className="flex lg:hidden overflow-x-auto gap-3 py-2 scrollbar-none">
        {safeImages.map((img, idx) => (
          <button
            key={img.id || idx}
            type="button"
            onClick={() => handleSelectImage(idx)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
              idx === selectedIndex
                ? "border-brand-maroon scale-105 shadow-sm"
                : "border-neutral-200 opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
