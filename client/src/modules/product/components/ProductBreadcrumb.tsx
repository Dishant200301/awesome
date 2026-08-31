import React from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

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
  return (
    <nav
      aria-label="Breadcrumb"
      className="py-3 px-4 md:px-8 max-w-[1400px] mx-auto text-xs text-zinc-500 font-sans"
    >
      <ol className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 whitespace-nowrap">
        <li className="hover:text-brand-maroon transition-colors flex items-center gap-1">
          <Link to="/" className="flex items-center gap-1">
            <FiHome className="inline-block mb-0.5" /> Home
          </Link>
        </li>
        <li className="text-zinc-400">›</li>
        <li className="hover:text-brand-maroon transition-colors">
          <Link to={`/shop?category=${encodeURIComponent(category)}`}>{category}</Link>
        </li>
        {subCategory && (
          <>
            <li className="text-zinc-400">›</li>
            <li className="hover:text-brand-maroon transition-colors">
              <Link to={`/shop?category=${encodeURIComponent(category)}&sub=${encodeURIComponent(subCategory)}`}>
                {subCategory}
              </Link>
            </li>
          </>
        )}
        <li className="text-zinc-400">›</li>
        <li
          className="text-zinc-800 font-medium truncate max-w-[200px] sm:max-w-[320px] md:max-w-[450px]"
          title={productName}
        >
          {productName}
        </li>
      </ol>
    </nav>
  );
};
