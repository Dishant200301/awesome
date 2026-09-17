import { useEffect, useState } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import HeroSection from "../components/HeroSection";
import FeaturedCategoriesSection from "../components/FeaturedCategoriesSection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import PromoBannerSection from "../components/PromoBannerSection";
import BestSellingSection from "../components/BestSellingSection";
import BentoGridSection from "../components/BentoGridSection";
import WatchShopSection from "../components/WatchShopSection";
import WhyChooseUsSection from "../components/WhyChooseUsSection";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    lenis.on("scroll", ScrollTrigger.update);

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
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="bg-white text-black">
      <Navbar />
      <HeroSection />
      <FeaturedCategoriesSection onSelectCategory={(cat) => setActiveTab(cat)} />
      <BentoGridSection />
      <FeaturedProductsSection activeTab={activeTab} setActiveTab={setActiveTab} />
      <PromoBannerSection />
      <BestSellingSection />
      <WatchShopSection />
      <WhyChooseUsSection />
      <Footer />
    </main>
  );
}
