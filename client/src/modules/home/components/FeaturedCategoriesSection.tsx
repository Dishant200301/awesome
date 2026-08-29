import React, { useRef, useState } from 'react';
import { categories } from '@/data/catalog';
import { Link } from 'react-router-dom';

interface FeaturedCategoriesProps {
  onSelectCategory?: (key: string) => void;
}

export const FeaturedCategoriesSection: React.FC<FeaturedCategoriesProps> = ({ onSelectCategory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number>(0);
  const scrollLeftStart = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

  // Exactly 12 categories: 6 in Row 1, 6 in Row 2
  const topRowCategories = categories.slice(0, 6);
  const bottomRowCategories = categories.slice(6, 12);

  // Mouse Drag Scroll for Desktop
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
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent, catSlug: string) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onSelectCategory) {
      onSelectCategory(catSlug);
    }
  };

  const renderCategoryCard = (cat: typeof categories[0], index: number) => (
    <div
      key={cat.slug || index}
      className="shrink-0 w-[calc((100vw-32px)/3.5)] sm:w-[calc((100vw-48px)/4.5)] lg:w-[calc((min(1500px,100vw)-48px)/5.5)]"
    >
      <Link
        to={`/shop?category=${encodeURIComponent(cat.slug)}`}
        onClick={(e) => handleCategoryClick(e, cat.slug)}
        className="group flex flex-col items-center text-center cursor-pointer block"
        draggable={false}
      >
        {/* Square Image Box */}
        <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xs border border-[#EDE5DA] group-hover:shadow-md transition-all duration-300">
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 pointer-events-none"
            loading="lazy"
            draggable={false}
          />
        </div>

        {/* Clean Category Title below the square image */}
        <h3 className="mt-2 sm:mt-2.5 text-[11px] sm:text-xs md:text-sm font-heading font-bold text-brand-ink group-hover:text-brand-maroon transition-colors text-center leading-tight line-clamp-1 uppercase tracking-wide">
          {cat.name}
        </h3>
      </Link>
    </div>
  );

  return (
    <section id="categories" className="scroll-mt-20 md:scroll-mt-24 py-8 sm:py-12 md:py-16 overflow-hidden pr-0 mr-0">
      {/* Section Heading aligned with Navbar */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 text-center mb-6 sm:mb-8 md:mb-10">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.12em] text-brand-maroon uppercase">
          SHOP BY CATEGORY
        </h2>
      </div>

      {/* 2-Row Manual Horizontal Scroll Container (Outer wrapper full bleed with inner row track padding) */}
      <div className="w-full max-w-[1500px] mx-auto">
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`overflow-x-auto no-scrollbar scroll-smooth space-y-3.5 sm:space-y-5 md:space-y-6 pb-2 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
        >
          {/* Row 1 (6 categories) */}
          <div className="flex gap-2.5 sm:gap-4 md:gap-5 flex-nowrap w-max px-4 sm:px-6">
            {topRowCategories.map((cat, idx) => renderCategoryCard(cat, idx))}
          </div>

          {/* Row 2 (6 categories) */}
          <div className="flex gap-2.5 sm:gap-4 md:gap-5 flex-nowrap w-max px-4 sm:px-6">
            {bottomRowCategories.map((cat, idx) => renderCategoryCard(cat, idx + 6))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategoriesSection;
