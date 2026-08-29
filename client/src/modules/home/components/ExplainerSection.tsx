import React from "react";
import { Link } from "react-router-dom";

export default function ExplainerSection() {
  return (
    <section 
      id="artisan-craftsmanship" 
      aria-label="Artisan Craftsmanship & Details"
      className="w-full p-0 m-0 overflow-hidden bg-transparent"
    >
      <Link to="/shop" className="block w-full p-0 m-0 cursor-pointer">
        {/* Desktop & Tablet Banner */}
        <img
          src="/images/banner/banner.png"
          alt="Artisan Craftsmanship & Details - Handmade Necklace, Crafted with colour, culture & love"
          className="hidden md:block w-full h-auto select-none pointer-events-none hover:opacity-98 transition-opacity duration-300"
          loading="lazy"
          decoding="async"
        />

        {/* Mobile Banner - Full Bleed (0 padding, 0 margin) */}
        <img
          src="/images/banner/mobile-banner.png"
          alt="Artisan Craftsmanship & Details - Handmade Necklace, Crafted with colour, culture & love"
          className="block md:hidden w-full h-auto select-none pointer-events-none active:opacity-95 transition-opacity duration-200"
          loading="lazy"
          decoding="async"
        />
      </Link>
    </section>
  );
}

