import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { subscribeToProductStore, getLiveProductsList } from "@/modules/core/lib/apiStore";
import { Sparkles } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

export default function BestSellingSection() {
  const [liveList, setLiveList] = useState(getLiveProductsList);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => setLiveList([...getLiveProductsList()]);
    const unsub = subscribeToProductStore(update);
    return () => unsub();
  }, []);

  const extractUrl = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val.trim();
    if (typeof val === "object") {
      if (typeof val.url === "string") return val.url.trim();
      if (typeof val.src === "string") return val.src.trim();
      if (typeof val.image === "string") return val.image.trim();
    }
    return "";
  };

  const productsList = liveList.map((p) => {
    const primaryImg =
      extractUrl(p.image) ||
      extractUrl(p.mainImage) ||
      extractUrl(p.img) ||
      (Array.isArray(p.images) && extractUrl(p.images[0])) ||
      (Array.isArray(p.colors) && (extractUrl(p.colors[0]?.mainImage) || extractUrl(p.colors[0]?.displayImage))) ||
      "/images/category/Latkan.webp";

    return {
      ...p,
      id: p.id,
      name: p.name,
      img: primaryImg,
      tags: p.idealForPills || [p.category || "Handcrafted", "Surat Artisan Craft", "Festive Wear"],
    };
  });

  if (productsList.length === 0) {
    return null;
  }

  const current = productsList[active % productsList.length] || productsList[0];

  return (
    <section className="py-8 sm:py-12 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 md:mb-10 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-5xl text-brand-maroon tracking-tight font-bold uppercase">
            TRENDING HANDMADE CREATIONS
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-brand-ink/70 max-w-lg mx-auto font-light">
            Loved by thousands of brides and festival celebrants across India
          </p>
        </div>

        <div className="relative group/carousel">
          <Swiper
            modules={[Autoplay, Navigation]}
            grabCursor
            centeredSlides={true}
            loop={productsList.length > 1}
            speed={700}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            slidesPerView={1.15}
            spaceBetween={16}
            breakpoints={{
              0: { slidesPerView: 1.15, spaceBetween: 16, centeredSlides: true },
              480: { slidesPerView: 1.3, spaceBetween: 20, centeredSlides: true },
              768: { slidesPerView: 2, spaceBetween: 24, centeredSlides: true },
              1024: { slidesPerView: Math.min(3, productsList.length), spaceBetween: 36, centeredSlides: true },
            }}
            navigation={{ prevEl: ".bs-prev", nextEl: ".bs-next" }}
            onSlideChange={(sw) => setActive(sw.realIndex)}
            className="buzz-swiper py-8! max-lg:overflow-hidden lg:overflow-visible"
          >
            {productsList.map((p) => (
              <SwiperSlide key={p.id}>
                {({ isActive }) => (
                  <Link
                    to={p.id ? `/product/${p.id}` : "/shop"}
                    className="block cursor-pointer group focus:outline-none"
                    aria-label={`View ${p.name}`}
                  >
                    <div className={`relative aspect-square max-w-[340px] sm:max-w-[380px] lg:max-w-[420px] mx-auto overflow-hidden rounded-[24px] md:rounded-[32px] bg-[#EDE5DA] shadow-md transition-all duration-500 origin-center ${
                      isActive ? "scale-100 opacity-100 shadow-2xl group-hover:shadow-3xl" : "scale-[0.88] opacity-[0.45]"
                    }`}>
                      <img
                        src={p.img}
                        alt={p.name}
                        className="h-full w-full object-cover object-center select-none group-hover:scale-104 transition-transform duration-700 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes("Latkan.webp")) {
                            target.src = "/images/category/Latkan.webp";
                          }
                        }}
                      />
                    </div>
                  </Link>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation buttons */}
          <button
            aria-label="Previous"
            className="bs-prev absolute left-1.5 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 z-30 grid h-10 w-10 place-items-center rounded-full border border-brand-gold/30 bg-white text-brand-maroon shadow-md hover:bg-brand-maroon hover:text-white transition-all duration-300 cursor-pointer"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            aria-label="Next"
            className="bs-next absolute right-1.5 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 z-30 grid h-10 w-10 place-items-center rounded-full border border-brand-gold/30 bg-white text-brand-maroon shadow-md hover:bg-brand-maroon hover:text-white transition-all duration-300 cursor-pointer"
          >
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* Dynamic product info below Swiper */}
        {current && (
          <div className="mt-8 text-center mx-auto px-0">
            <Link
              to={current.id ? `/product/${current.id}` : "/shop"}
              className="group block cursor-pointer"
            >
              <h3 className="max-w-xl mx-auto px-8 font-heading text-base sm:text-lg md:text-xl font-bold text-brand-ink group-hover:text-brand-maroon transition-colors leading-snug sm:leading-normal line-clamp-2">
                {current.name}
              </h3>
            </Link>
            <div className="mt-3.5 flex flex-nowrap justify-center items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {(current.tags || []).map((tag: string, idx: number) => (
                <Link
                  key={idx}
                  to="/shop"
                  className="whitespace-nowrap shrink-0 rounded-full bg-[#F7E7B4] text-brand-maroon px-3.5 sm:px-4 py-1 text-[11px] font-bold tracking-wide hover:bg-brand-maroon hover:text-white transition-colors cursor-pointer"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
