import React from "react";
import { motion } from "framer-motion";
import { DescriptionCard } from "../types/product";

interface ProductDescriptionSectionProps {
  cards: DescriptionCard[];
  selectedColor?: string;
  idealForPills?: string[];
  fullDescription?: string;
  shortDescription?: string;
}

export const ProductDescriptionSection: React.FC<ProductDescriptionSectionProps> = ({
  cards,
  selectedColor,
  fullDescription,
  shortDescription,
}) => {
  const descriptionText =
    fullDescription ||
    shortDescription ||
    "Handcrafted with artisanal precision by master craftswomen in Surat, Gujarat. Made using premium quality materials, intricate embellishments, and traditional craftsmanship.";

  const displayCards = (cards || []).filter((card) => {
    if (
      !card.colorName ||
      card.colorName === "All" ||
      card.colorName.toLowerCase() === "all" ||
      card.colorName.toLowerCase() === "general"
    ) {
      return true;
    }
    if (!selectedColor) return true;
    return card.colorName.toLowerCase() === selectedColor.toLowerCase();
  });

  return (
    <section
      id="product-description"
      className="w-full py-8 md:py-14 px-4 sm:px-6 md:px-8 max-w-[1500px] mx-auto space-y-6 md:space-y-8 scroll-mt-24 font-sans"
    >
      {/* Section Heading */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-maroon uppercase tracking-tight">
          Product Description
        </h2>
        <div className="w-12 h-0.5 bg-brand-maroon rounded-full" />
      </div>

      {/* 4 Feature Image Cards: Horizontal Scroll on Mobile, Grid on Tablet & Laptop */}
      {displayCards.length > 0 && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {displayCards.map((card, idx) => (
            <motion.div
              key={card.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-[#FAF8F5] shadow-sm hover:shadow-md transition-all duration-300 border border-[#EDE5DA] flex flex-col justify-end p-4 sm:p-5 text-white shrink-0 w-[78vw] min-w-[250px] max-w-[300px] sm:w-auto sm:max-w-none"
            >
              {/* Background Image - 1:1 Aspect Square for zero crop */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                loading="lazy"
              />

              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

              {/* Text Content */}
              <div className="relative z-10 space-y-1">
                <h3 className="text-sm sm:text-base font-bold tracking-tight leading-snug drop-shadow-xs">
                  {card.title}
                </h3>
                {card.subtitle && (
                  <p className="text-[11px] sm:text-xs font-normal text-zinc-200 tracking-wide drop-shadow-xs leading-normal line-clamp-2">
                    {card.subtitle}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      
    </section>
  );
};
