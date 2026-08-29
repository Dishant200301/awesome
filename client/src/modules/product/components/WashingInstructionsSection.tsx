import React from "react";
import { motion } from "framer-motion";
import { WashingInstruction } from "../types/product";
import { DynamicLucideIcon } from "../../core/components/DynamicLucideIcon";

interface WashingInstructionsSectionProps {
  instructions: WashingInstruction[];
}

export const WashingInstructionsSection: React.FC<WashingInstructionsSectionProps> = ({
  instructions,
}) => {
  if (!instructions || instructions.length === 0) return null;

  return (
    <section className="w-full py-8 px-4 md:px-8 max-w-[1400px] mx-auto space-y-6 font-sans">
      {/* Section Title */}
      <div className="space-y-2">
        <h2 className="text-2xl md:text-4xl font-800 text-zinc-900 tracking-tight">
          Washing Instructions
        </h2>
        <div className="w-16 h-1 bg-[#520618] rounded-full" />
      </div>

      {/* Mobile & Tablet View (< 1024px): Marquee */}
      <div className="block lg:hidden w-full overflow-hidden relative">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 18,
            repeat: Infinity,
          }}
          className="flex items-center gap-3.5 w-max py-1"
        >
          {[...instructions, ...instructions].map((item, idx) => {
            const titleText = item.title || item.label || "Care Rule";
            return (
              <div
                key={`${item.id}-${idx}`}
                className="w-[45vw] sm:w-[30vw] max-w-[180px] shrink-0 flex flex-col items-center justify-center space-y-2 p-3.5 rounded-2xl bg-white border border-zinc-200/60 shadow-2xs text-center"
              >
                <div className="text-zinc-900 p-2.5 rounded-full bg-[#f5f2ee]">
                  <DynamicLucideIcon name={item.iconName || "Droplets"} className="w-6 h-6 text-zinc-900" />
                </div>
                <span className="text-xs font-bold text-zinc-800 tracking-wider leading-tight">
                  {titleText}
                </span>
                {item.description && (
                  <span className="text-[10px] text-zinc-500 font-medium line-clamp-1">{item.description}</span>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Laptop & Desktop Grid View (>= 1024px) */}
      <div className="hidden lg:block rounded-[20px] border border-zinc-200/80 bg-[#f5f2ee]/50 p-6 md:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-center gap-6 text-center">
          {instructions.map((item, idx) => {
            const titleText = item.title || item.label || "Care Rule";
            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center justify-center space-y-2.5 p-4 rounded-2xl bg-white border border-zinc-200/50 hover:border-zinc-900 shadow-2xs transition-all cursor-pointer min-w-[150px] max-w-[200px] flex-1"
              >
                <div className="text-zinc-900 p-3 rounded-full bg-[#f5f2ee]">
                  <DynamicLucideIcon name={item.iconName || "Droplets"} className="w-7 h-7 text-zinc-900" />
                </div>
                <span className="text-xs font-bold text-zinc-800 tracking-wider leading-tight">
                  {titleText}
                </span>
                {item.description && (
                  <span className="text-[11px] text-zinc-500 font-medium leading-tight">{item.description}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

