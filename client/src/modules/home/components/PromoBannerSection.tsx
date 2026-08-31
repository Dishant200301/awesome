import React, { useState, useEffect } from 'react';
import { getLivePromoBanner, subscribeToPromoBanner, fetchLivePromoBanner, LivePromoBanner } from '@/modules/core/lib/apiStore';

export default function PromoBannerSection() {
  const [banner, setBanner] = useState<LivePromoBanner>(() => getLivePromoBanner());

  useEffect(() => {
    fetchLivePromoBanner().then((live) => {
      if (live && live.image) setBanner(live);
    });

    const unsubscribe = subscribeToPromoBanner(() => {
      setBanner(getLivePromoBanner());
    });

    return () => unsubscribe();
  }, []);

  if (banner.status === 'Inactive') {
    return null;
  }

  const desktopBannerImage = banner.image || '/images/banner/banner.webp';
  const mobileBannerImage = banner.mobileImage || '/images/banner/mobile-banner.webp';
  const bannerLink = banner.link || '/shop?category=Necklace';
  const title = banner.title || 'Handmade Necklace';
  const subtitle = banner.subtitle || 'Crafted with colour, culture & love.';
  const buttonText = banner.buttonText || 'SHOP NOW';

  return (
    <section aria-label="Festive Handmade Necklace Banner" className="w-full py-6 sm:py-10 md:py-14 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#EDE5DA] bg-[#FAF3EA] group">
          
          {/* ========================================================================= */}
          {/* 1. MOBILE VIEW (< 768px): Exact Reference Mobile Card Design */}
          {/* ========================================================================= */}
          <div className="md:hidden relative w-full aspect-[9/14] xs:aspect-[9/13.5] min-h-[500px] max-h-[640px] overflow-hidden">
            <img
              src={mobileBannerImage}
              alt={title}
              className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-700 pointer-events-none"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('mobile-banner.webp')) {
                  target.src = '/images/banner/mobile-banner.webp';
                }
              }}
            />

            {/* Mobile Bottom Content Overlay (Always Visible) */}
            <div className="absolute inset-x-0 bottom-[5%] xs:bottom-[6%] sm:bottom-[8%] flex flex-col items-center text-center px-4 z-20">
              {/* Heading (Bodoni Moda Regular) */}
              <h3 className="font-bodoni font-normal text-[#4A0E18] text-[38px] xs:text-[44px] sm:text-[48px] leading-[1.0] tracking-[-0.02em] drop-shadow-sm">
                {title.includes(' ') ? (
                  <>
                    {title.split(' ')[0]}
                    <br />
                    {title.split(' ').slice(1).join(' ')}
                  </>
                ) : (
                  title
                )}
              </h3>

              {/* Golden Floral Filigree Divider */}
              <div className="flex items-center justify-center gap-2 my-2 opacity-90">
                <span className="h-[1px] w-12 xs:w-16 bg-[#D1A858]" />
                <span className="text-[#C89B3C] text-[13px] leading-none">❖</span>
                <span className="h-[1px] w-12 xs:w-16 bg-[#D1A858]" />
              </div>

              {/* Paragraph / Subtitle (Montserrat Regular 400) */}
              {subtitle && (
                <p className="font-montserrat text-[#3D2B24] text-[13px] xs:text-[14px] font-normal leading-relaxed max-w-[280px] mb-3.5 drop-shadow-sm">
                  {subtitle}
                </p>
              )}

              {/* Action Button (Hero Section Consistent Component) */}
              <a
                href={bannerLink}
                className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto active:scale-95 transition-transform cursor-pointer"
              >
                {buttonText}
              </a>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. TABLET, LAPTOP & DESKTOP VIEW (>= 768px): Right-Side Content Card */}
          {/* ========================================================================= */}
          <div className="hidden md:block relative w-full aspect-[2.4/1] lg:aspect-[2.8/1] max-h-[500px] overflow-hidden">
            <img
              src={desktopBannerImage}
              alt={title}
              className="w-full h-full object-cover object-left lg:object-center group-hover:scale-103 transition-transform duration-700 pointer-events-none"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('banner.webp')) {
                  target.src = '/images/banner/banner.webp';
                }
              }}
            />

            {/* Desktop Right-Side Content Overlay (Always Visible) */}
            <div className="absolute right-[5%] md:right-[7%] lg:right-[10%] xl:right-[12%] top-1/2 -translate-y-1/2 max-w-[420px] lg:max-w-[480px] flex flex-col items-center text-center z-20">
              {/* Heading (Bodoni Moda Regular) */}
              <h3 className="font-bodoni font-normal text-[#4A0E18] text-[40px] md:text-[46px] lg:text-[56px] xl:text-[64px] leading-[1.02] tracking-[-0.02em] drop-shadow-sm">
                {title.includes(' ') ? (
                  <>
                    {title.split(' ')[0]}
                    <br />
                    {title.split(' ').slice(1).join(' ')}
                  </>
                ) : (
                  title
                )}
              </h3>

              {/* Golden Floral Filigree Divider */}
              <div className="flex items-center justify-center gap-2.5 my-2.5 lg:my-3 opacity-90">
                <span className="h-[1px] w-14 md:w-18 lg:w-22 bg-[#D1A858]" />
                <span className="text-[#C89B3C] text-[14px] lg:text-[16px] leading-none">❖</span>
                <span className="h-[1px] w-14 md:w-18 lg:w-22 bg-[#D1A858]" />
              </div>

              {/* Paragraph / Subtitle (Montserrat Regular 400) */}
              {subtitle && (
                <p className="font-montserrat text-[#3D2B24] text-[13.5px] md:text-[14.5px] lg:text-[16.5px] font-normal leading-relaxed max-w-[340px] lg:max-w-[380px] mb-4 lg:mb-5 drop-shadow-sm">
                  {subtitle}
                </p>
              )}

              {/* Action Button (Hero Section Consistent Component) */}
              <a
                href={bannerLink}
                className="font-cormorant inline-flex items-center justify-center px-7 py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] md:text-[17px] lg:text-[19px] xl:text-[21px] capitalize tracking-wide rounded-[10px] shadow-lg pointer-events-auto hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                {buttonText}
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
