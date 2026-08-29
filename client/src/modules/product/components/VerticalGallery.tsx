import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronUp,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiX,
  FiZoomIn,
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  const validImages = Array.isArray(images) && images.length > 0
    ? images.filter((img) => img && typeof img.url === "string" && img.url.trim().length > 0)
    : [];

  const safeImages: ProductImage[] = validImages.length > 0
    ? validImages
    : [{ id: "fallback-img", url: "/images/category/Latkan.webp", alt: "Product Preview" }];

  // Keep index in valid range if images array changes (e.g. variation switch)
  useEffect(() => {
    setSelectedIndex(0);
  }, [safeImages.length]);

  // Infinite vertical thumbnail auto-scroll disabled per user request

  // Handle keyboard navigation for main preview and lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowUp" && !isLightboxOpen) {
        handlePrev();
      } else if (e.key === "ArrowDown" && !isLightboxOpen) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, isLightboxOpen, safeImages]);

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
      {/* DESKTOP VERTICAL THUMBNAIL GALLERY (Left Column matching reference image) */}
      <div
        className="hidden lg:flex flex-col items-center gap-1.5 relative w-20 shrink-0 select-none max-h-[660px]"
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => setIsHoverPaused(false)}
      >
        {/* Top Scroll Arrow Button Overlay */}
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
                onClick={() => handleSelectImage(idx)}
                onMouseEnter={() => handleSelectImage(idx)}
                className={`relative w-18 h-18 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 group cursor-pointer ${
                  isActive
                    ? "border-zinc-900 shadow-sm"
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

        {/* Bottom Scroll Arrow Button Overlay */}
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
      </div>

      {/* LARGE PRODUCT PREVIEW (Right of thumbnails / Main Container matching reference image) */}
      <div className="relative flex-1 bg-[#FAF8F5] rounded-2xl overflow-hidden aspect-square max-h-[660px] group border border-[#EDE5DA]">
        {/* Animated Image Container */}
        <div
          className="w-full h-full relative cursor-zoom-in overflow-hidden"
          onMouseEnter={() => setIsZoomActive(true)}
          onMouseLeave={() => setIsZoomActive(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <AnimatePresence initial={false} mode="wait" custom={direction}>
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-all opacity-90 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
          aria-label="Previous image"
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-black hover:text-white transition-all opacity-90 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100 z-10 cursor-pointer"
          aria-label="Next image"
        >
          <FiChevronRight size={20} />
        </button>

        {/* Pagination indicators on mobile */}
        <PaginationDots
          total={images.length}
          current={selectedIndex}
          onChange={(idx) => handleSelectImage(idx)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 lg:hidden bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full z-10 pointer-events-auto"
        />
      </div>

      {/* MOBILE HORIZONTAL THUMBNAILS SLIDER (< 1024px) */}
      <div className="flex lg:hidden overflow-x-auto gap-3 py-2 scrollbar-none">
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => handleSelectImage(idx)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
              idx === selectedIndex
                ? "border-black scale-105 shadow-sm"
                : "border-neutral-200 opacity-60"
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

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 md:p-8 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Lightbox Header */}
            <div className="w-full max-w-6xl flex justify-between items-center text-white z-10">
              <span className="text-sm font-mono tracking-widest text-neutral-400">
                {selectedIndex + 1} / {images.length} • {sku}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close Lightbox"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Lightbox Main Image */}
            <div
              className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage?.url}
                  src={currentImage?.url}
                  alt={currentImage?.alt}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
                />
              </AnimatePresence>

              {/* Controls */}
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                aria-label="Previous image"
              >
                <FiChevronLeft size={28} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                aria-label="Next image"
              >
                <FiChevronRight size={28} />
              </button>
            </div>

            {/* Lightbox Thumbnails Strip */}
            <div
              className="flex items-center gap-3 overflow-x-auto p-2 max-w-full scrollbar-none z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => handleSelectImage(idx)}
                  className={`w-14 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    idx === selectedIndex
                      ? "border-white scale-110 shadow-lg"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
