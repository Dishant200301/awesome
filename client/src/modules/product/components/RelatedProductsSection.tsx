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

  // Filter products specifically matching the current product
  const productsList = useMemo(() => {
    if (!currentProduct) return [];

    const currentId = String(currentProduct.id || "");
    const currentCat = (currentProduct.category || currentProduct.categories?.[0] || "").toLowerCase().trim();
    const currentSubcat = (currentProduct.subcategory || "").toLowerCase().trim();

    // 1. Explicitly assigned Loved Together / Related Products
    if (currentProduct.lovedTogether && Array.isArray(currentProduct.lovedTogether) && currentProduct.lovedTogether.length > 0) {
      return currentProduct.lovedTogether;
    }

    if (currentProduct.relatedProducts && Array.isArray(currentProduct.relatedProducts) && currentProduct.relatedProducts.length > 0) {
      return currentProduct.relatedProducts;
    }

    if (currentProduct.relatedProductIds && Array.isArray(currentProduct.relatedProductIds) && currentProduct.relatedProductIds.length > 0) {
      const ids = currentProduct.relatedProductIds.map(String);
      return catalog.filter((p) => ids.includes(String(p.id)));
    }

    // 2. Strict product-specific matching by subcategory or category (excluding current product)
    const matchingProducts = catalog.filter((p) => {
      if (String(p.id) === currentId) return false;
      const pCat = (p.category || p.categories?.[0] || "").toLowerCase().trim();
      const pSubcat = (p.subcategory || "").toLowerCase().trim();

      if (currentSubcat && pSubcat && pSubcat === currentSubcat) return true;
      if (currentCat && pCat && pCat === currentCat) return true;
      return false;
    });

    return matchingProducts.slice(0, 5);
  }, [currentProduct, catalog]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  // If no product-specific matching items exist, do NOT render section!
  if (productsList.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 px-4 md:px-8 max-w-[1400px] mx-auto space-y-6 font-sans">
      {/* Section Heading matching Home Page */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-800 text-zinc-900 tracking-tight">
            Loved Together
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-[#F7E7B4] via-[#D8B458] to-[#B38728] rounded-full" />
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-zinc-200 bg-white hover:bg-black hover:text-white flex items-center justify-center text-zinc-700 shadow-xs transition-colors cursor-pointer"
            aria-label="Previous products"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-zinc-200 bg-white hover:bg-black hover:text-white flex items-center justify-center text-zinc-700 shadow-xs transition-colors cursor-pointer"
            aria-label="Next products"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Product Cards Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-3 lg:pb-0 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible"
      >
        {productsList.map((p: any) => (
          <div
            key={p.id}
            className="w-[72vw] sm:w-[260px] max-w-[280px] shrink-0 lg:w-full lg:max-w-none"
          >
            <ProductCard p={p} />
          </div>
        ))}
      </div>
    </section>
  );
};
