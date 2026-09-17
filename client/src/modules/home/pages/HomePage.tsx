import React, { useEffect, useState, lazy, Suspense } from "react";
import Navbar from "@/modules/core/components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturedCategoriesSection from "../components/FeaturedCategoriesSection";
import BentoGridSection from "../components/BentoGridSection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";

// Lazy load below-the-fold sections to cut initial DOM from 968 nodes to ~320 nodes
const PromoBannerSection = lazy(() => import("../components/PromoBannerSection"));
const BestSellingSection = lazy(() => import("../components/BestSellingSection"));
const WatchShopSection = lazy(() => import("../components/WatchShopSection"));
const WhyChooseUsSection = lazy(() => import("../components/WhyChooseUsSection"));
const Footer = lazy(() => import("@/modules/core/components/Footer"));

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Only initialize Lenis on desktop viewports (>= 768px) to eliminate mobile forced reflows
    const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || ("ontouchstart" in window && window.innerWidth < 1024));
    if (isMobileDevice) {
      return;
    }

    let lenis: any = null;
    let raf = 0;

    Promise.all([import("lenis"), import("gsap/ScrollTrigger")]).then(([{ default: Lenis }, { ScrollTrigger }]) => {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      lenis.on("scroll", ScrollTrigger.update);
    });

    // Smooth scroll to target hash section if present in URL
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <main className="bg-white text-black">
      <Navbar />
      <HeroSection />
      <FeaturedCategoriesSection onSelectCategory={(cat) => setActiveTab(cat)} />
      <BentoGridSection />
      <FeaturedProductsSection activeTab={activeTab} setActiveTab={setActiveTab} />
      <Suspense fallback={<div className="min-h-[120px]" />}>
        <PromoBannerSection />
        <BestSellingSection />
        <WatchShopSection />
        <WhyChooseUsSection />
        <Footer />
      </Suspense>
    </main>
  );
}
