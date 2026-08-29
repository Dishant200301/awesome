import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FiTruck, FiShield, FiAward, FiHeart, FiPhoneCall } from "react-icons/fi";

const WHY = [
  { icon: FiTruck, title: "Free Delivery", desc: "Free shipping across India on prepaid orders above ₹999" },
  { icon: FiHeart, title: "100% Handcrafted", desc: "Authentic Gujarati heritage crafted with love in Surat" },
  { icon: FiAward, title: "Artisan Quality", desc: "Premium glass mirrors, zari embroidery & anti-tarnish beads" },
  { icon: FiShield, title: "Secure Checkout", desc: "100% safe & verified payments across all cards & UPI" },
  { icon: FiPhoneCall, title: "Custom Orders", desc: "Direct WhatsApp support & bespoke bridal customization" },
];

export default function WhyChooseUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isInteracting = useRef(false);
  const resumeTimeout = useRef<NodeJS.Timeout | null>(null);

  // GSAP Entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".why-card", {
        y: 25,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Smooth Auto-Scroll with Infinite Wrap-around & Manual Drag/Touch Support
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Set initial scroll position to the middle duplicate set
    const singleSetWidth = el.scrollWidth / 3;
    if (singleSetWidth > 0) {
      el.scrollLeft = singleSetWidth;
    }

    let animId: number;
    const speed = 0.75; // px per frame

    const step = () => {
      if (el && !isInteracting.current) {
        el.scrollLeft += speed;

        const currentSingleWidth = el.scrollWidth / 3;
        if (currentSingleWidth > 0) {
          if (el.scrollLeft >= currentSingleWidth * 2) {
            el.scrollLeft -= currentSingleWidth;
          } else if (el.scrollLeft <= 5) {
            el.scrollLeft += currentSingleWidth;
          }
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, []);

  const pauseAutoScroll = () => {
    isInteracting.current = true;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  };

  const resumeAutoScroll = (delay = 1500) => {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      isInteracting.current = false;
    }, delay);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    pauseAutoScroll();
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      resumeAutoScroll(1500);
    }
  };

  return (
    <section id="about" ref={sectionRef} className="scroll-mt-20 md:scroll-mt-24 py-14 md:py-16 bg-transparent">
      <div className="mx-auto max-w-[1400px] px-0 lg:px-8">
        {/* MOBILE & TABLET VIEW: Auto-Scroll + Manual Horizontal Swipe/Drag */}
        <div className="lg:hidden w-full overflow-hidden relative">
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={() => pauseAutoScroll()}
            onTouchEnd={() => resumeAutoScroll(2000)}
            className="flex items-center gap-6 md:gap-8 overflow-x-auto scrollbar-none select-none cursor-grab active:cursor-grabbing py-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[...WHY, ...WHY, ...WHY].map((w, i) => (
              <div
                key={i}
                className="why-card flex flex-col items-center text-center select-none flex-shrink-0 w-[50vw] sm:w-[32vw] md:w-[26vw] max-w-[220px]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold text-brand-maroon mb-3 bg-white shadow-sm transition-transform duration-300 hover:scale-105">
                  <w.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-ink font-heading mb-1 leading-tight whitespace-nowrap">
                  {w.title}
                </h3>
                <p className="text-xs font-normal text-brand-ink/70 max-w-[190px] leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP/LAPTOP GRID VIEW */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-y-12 gap-x-6">
          {WHY.map((w, i) => (
            <div key={i} className="why-card flex flex-col items-center text-center select-none group">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/60 text-brand-maroon mb-3 bg-white shadow-sm group-hover:bg-brand-maroon group-hover:text-white group-hover:border-brand-maroon transition-all duration-300">
                <w.icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-brand-ink font-heading mb-1 leading-tight whitespace-nowrap">
                {w.title}
              </h3>
              <p className="text-xs md:text-sm font-normal text-brand-ink/70 max-w-[210px] leading-relaxed">
                {w.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

