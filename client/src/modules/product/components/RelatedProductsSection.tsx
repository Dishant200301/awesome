import React, { useRef, useMemo, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "@/modules/home/components/ProductCard";
import { getLiveProductsList, subscribeToProductStore } from "@/modules/core/lib/apiStore";

interface RelatedProductsSectionProps {
  currentProduct?: any;
}

export const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ currentProduct }) => {
  const [catalog, setCatalog] = useState(() => getLiveProductsList());

  useEffect(() => {
    const unsubscribe = subscribeToProductStore(() => {
      setCatalog(getLiveProductsList());
    });
    return unsubscribe;
  }, []);

  // Strict product-matching logic: only show products from the same category or subcategory
  const productsList = useMemo(() => {
    if (!currentProduct || !catalog || catalog.length === 0) return [];

    const currentId = String(currentProduct.id || "");
    const currentCat = (currentProduct.category || currentProduct.categories?.[0] || "").toLowerCase().trim();
    const currentSubcat = (currentProduct.subcategory || (currentProduct as any).subCategory || "").toLowerCase().trim();
    const currentCollection = ((currentProduct as any).collection || "").toLowerCase().trim();

    // 1. Explicitly assigned Loved Together / Related Products (if specifically assigned by admin)
    if (currentProduct.lovedTogether && Array.isArray(currentProduct.lovedTogether) && currentProduct.lovedTogether.length > 0) {
      return currentProduct.lovedTogether.filter((p: any) => String(p?.id) !== currentId);
    }

    if (currentProduct.relatedProducts && Array.isArray(currentProduct.relatedProducts) && currentProduct.relatedProducts.length > 0) {
      return currentProduct.relatedProducts.filter((p: any) => String(p?.id) !== currentId);
    }

    if (currentProduct.relatedProductIds && Array.isArray(currentProduct.relatedProductIds) && currentProduct.relatedProductIds.length > 0) {
      const ids = currentProduct.relatedProductIds.map(String);
      return catalog.filter((p) => ids.includes(String(p.id)) && String(p.id) !== currentId);
    }

    // 2. Strict category / subcategory matching (No other unrelated products allowed)
    const matchingProducts = catalog.filter((p) => {
      if (String(p.id) === currentId) return false;
      const pCat = (p.category || (p.categories && p.categories[0]) || "").toLowerCase().trim();
      const pSubcat = (p.subcategory || (p as any).subCategory || "").toLowerCase().trim();
      const pCollection = ((p as any).collection || "").toLowerCase().trim();

      // Same subcategory match
      if (currentSubcat && pSubcat && pSubcat === currentSubcat) return true;
      // Same category match
      if (currentCat && pCat && pCat === currentCat) return true;
      // Same collection match
      if (currentCollection && pCollection && pCollection === currentCollection) return true;

      return false;
    });

    return matchingProducts.slice(0, 10);
  }, [currentProduct, catalog]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  // If no matching related products exist, do NOT render the section
  if (productsList.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10 md:py-16 px-4 md:px-8 max-w-[1500px] mx-auto space-y-6 font-sans">
      {/* Section Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Curated Recommendations
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
            Related Products
          </h2>
          <div className="w-12 h-0.5 bg-zinc-900 rounded-full" />
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-9 h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-900 hover:text-white flex items-center justify-center text-zinc-700 shadow-2xs transition-colors cursor-pointer"
            aria-label="Previous products"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-9 h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-900 hover:text-white flex items-center justify-center text-zinc-700 shadow-2xs transition-colors cursor-pointer"
            aria-label="Next products"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Product Cards Grid / Scroll Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {productsList.map((p: any) => (
          <div
            key={p.id}
            className="w-[260px] sm:w-[280px] lg:w-[calc(20%-1.2rem)] shrink-0 snap-start"
          >
            <ProductCard p={p} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProductsSection;
