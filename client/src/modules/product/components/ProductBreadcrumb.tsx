import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";

interface BreadcrumbProps {
  category?: string;
  subCategory?: string;
  productName: string;
}

export const ProductBreadcrumb: React.FC<BreadcrumbProps> = ({
  category = "Handmade",
  subCategory,
  productName,
}) => {
  const shopLink = category && category !== "Handmade"
    ? `/shop?category=${encodeURIComponent(category)}`
    : "/shop";

  return (
    <nav
      aria-label="Breadcrumb"
      className="py-3 px-4 md:px-8 max-w-[1500px] mx-auto text-xs text-zinc-500 font-sans flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5 whitespace-nowrap">
        {/* Back Button with Left Arrow directing to Shop */}
        <Link
          to={shopLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-900 hover:text-white text-zinc-800 font-semibold text-xs transition-all shadow-2xs cursor-pointer shrink-0 group"
          title="Back to Shop"
        >
          <FiArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          <span>Back</span>
        </Link>
      
      </div>
    </nav>
  );
};

