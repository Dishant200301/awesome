import React from "react";
import { motion } from "framer-motion";
import {
  FiAward,
  FiZap,
  FiShield,
  FiHeart,
  FiStar,
  FiHeadphones,
} from "react-icons/fi";

const BENEFITS = [
  {
    id: "b1",
    title: "100%",
    subtitle: "Handmade Art",
    icon: FiHeart,
  },
  {
    id: "b2",
    title: "Premium",
    subtitle: "Quality Assured",
    icon: FiAward,
  },
  {
    id: "b3",
    title: "Fast",
    subtitle: "Dispatch",
    icon: FiZap,
  },
  {
    id: "b4",
    title: "100% Safe",
    subtitle: "Secure Payment",
    icon: FiShield,
  },
  {
    id: "b5",
    title: "Surat Artisan",
    subtitle: "Direct From Craftsman",
    icon: FiStar,
  },
  {
    id: "b6",
    title: "24/7 Friendly",
    subtitle: "Customer Support",
    icon: FiHeadphones,
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="w-full py-6 md:py-8 my-2 md:my-4 font-sans overflow-hidden bg-transparent border-none">
      {/* Mobile & Tablet View (< 1024px): Smooth Right-to-Left Infinite Auto-Scroll Marquee */}
      <div className="block lg:hidden w-full overflow-hidden relative border-none">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 20,
            repeat: Infinity,
          }}
          className="flex items-center gap-4 md:gap-8 w-max"
        >
          {[...BENEFITS, ...BENEFITS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.id}-${idx}`}
                className="w-[34vw] sm:w-[28vw] max-w-[160px] shrink-0 flex flex-col items-center text-center p-2 bg-transparent border-none shadow-none"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-black mb-2 transition-transform">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs font-semibold text-zinc-600 leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Laptop & Desktop Grid View (>= 1024px): 6 cols Grid without borders */}
      <div className="hidden lg:block max-w-[1400px] mx-auto px-4 md:px-8 border-none">
        <div className="grid grid-cols-6 gap-6 md:gap-8 border-none">
          {BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                className="flex flex-col items-center text-center bg-transparent border-none shadow-none"
              >
                {/* Clean Transparent Icon Container (No Background, Black Icon) */}
                <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-black transition-all duration-300 mb-2">
                  <Icon className="w-8 h-8 md:w-9 md:h-9 stroke-[1.5] transition-transform duration-300" />
                </div>

                {/* Labels */}
                <h4 className="text-xs md:text-sm font-bold text-zinc-900 tracking-tight leading-tight">
                  {item.title}
                </h4>
                <p className="text-xs md:text-sm font-semibold text-zinc-600 leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

