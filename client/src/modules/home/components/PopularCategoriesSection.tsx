import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { FiChevronRight } from "react-icons/fi";
import { getLiveCategories, subscribeToCategoriesStore } from "@/modules/core/lib/apiStore";

export default function PopularCategoriesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [liveCategories, setLiveCategories] = useState(() => getLiveCategories());

  useEffect(() => {
    const unsub = subscribeToCategoriesStore(() => {
      setLiveCategories(getLiveCategories());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".pop-card", {
        scale: 0.92, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 80%" }
      });
    }, ref);
    return () => ctx.revert();
  }, [liveCategories]);

  // Display top 3 active categories dynamically
  const popularCats = liveCategories.slice(0, 3).map((c) => ({
    key: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: c.name.toUpperCase(),
    img: c.image || "",
  }));

  if (popularCats.length === 0) return null;

  return (
    <section ref={ref} className="mx-auto max-w-[1400px] px-5 md:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4">
        {popularCats.map((c) => (
          <Link
            key={c.key}
            to={`/shop?category=${encodeURIComponent(c.key)}`}
            className="pop-card group relative overflow-hidden rounded-[18px] md:rounded-[20px] aspect-10/14 bg-[#f5f2ee] shadow-sm select-none cursor-pointer block"
          >
            {/* Image zoom on hover */}
            {c.img ? (
              <img
                src={c.img}
                alt={c.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1200 ease-out group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-[#4A1525] to-[#1A0A10]" />
            )}
            {/* Soft left-to-right shadow overlay to ensure typography legibility */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-black/45 via-black/15 to-transparent pointer-events-none z-10" />

            {/* Centered rotated label on the left margin */}
            <div className="absolute left-6 sm:left-8 md:left-10 top-0 bottom-0 flex items-center justify-center w-0 z-20 pointer-events-none">
              <span className="font-serif text-2xl sm:text-3xl md:text-[40px] font-light tracking-[0.25em] uppercase text-white whitespace-nowrap -rotate-90 origin-center drop-shadow-md">
                {c.title}
              </span>
            </div>

            {/* Micro chevron arrow bottom right */}
            <div className="absolute right-6 bottom-6 p-2 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <FiChevronRight className="text-white" size={18} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

