import React, { useState, useEffect } from 'react';
import { getLivePromoBanner, subscribeToPromoBanner, fetchLivePromoBanner, LivePromoBanner } from '@/modules/core/lib/apiStore';

export default function PromoBannerSection() {
  const [banner, setBanner] = useState<LivePromoBanner>(() => getLivePromoBanner());

  useEffect(() => {
    fetchLivePromoBanner().then((live) => {
      if (live) setBanner(live);
    });

    const unsubscribe = subscribeToPromoBanner(() => {
      setBanner(getLivePromoBanner());
    });

    return () => unsubscribe();
  }, []);

  if (banner.status === 'Inactive' || (!banner.image && !banner.mobileImage && !banner.title)) {
    return null;
  }

  const desktopBannerImage = banner.image || banner.mobileImage || '';
  const mobileBannerImage = banner.mobileImage || banner.image || '';
  const bannerLink = banner.link || '/shop';
  const title = banner.title || '';
  const subtitle = banner.subtitle || '';
  const buttonText = banner.buttonText || 'Shop Now';
  const showOverlay = banner.showTextOverlay !== false;

  return (
    <section aria-label="Promotional Showcase Banner" className="w-full relative overflow-hidden bg-[#FAF8F5]">
      <div className="relative w-full overflow-hidden group">
        
        {/* ========================================================================= */}
        {/* 1. MOBILE VIEW (< 768px): Full Edge-to-Edge Dynamic Banner */}
        {/* ========================================================================= */}
        <div className="md:hidden relative w-full aspect-[9/14] xs:aspect-[9/13.5] min-h-[460px] max-h-[640px] overflow-hidden">
          {mobileBannerImage && (
            <img
              src={mobileBannerImage}
              alt={title || 'Promotional Banner'}
              className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-700 pointer-events-none"
              loading="lazy"
            />
          )}

          {/* Mobile Bottom Content Overlay (Dynamic from Admin) */}
          {showOverlay && (title || subtitle || buttonText) && (
            <div className="absolute inset-x-0 bottom-[6%] xs:bottom-[7%] sm:bottom-[9%] flex flex-col items-center text-center px-4 z-20 pointer-events-none">
              {/* Heading (Bodoni Moda Regular) */}
              {title && (
                <h3 className="font-bodoni font-normal text-[#4A0E18] text-[34px] xs:text-[40px] sm:text-[46px] leading-[1.05] tracking-[-0.02em] drop-shadow-xs max-w-[320px] whitespace-pre-line">
                  {title}
                </h3>
              )}

              {/* Golden Floral Filigree Divider */}
              {title && subtitle && (
                <div className="flex items-center justify-center gap-2 my-2.5 opacity-90">
                  <span className="h-[1px] w-12 xs:w-16 bg-[#D1A858]" />
                  <span className="text-[#C89B3C] text-[13px] leading-none">❖</span>
                  <span className="h-[1px] w-12 xs:w-16 bg-[#D1A858]" />
                </div>
              )}

              {/* Paragraph / Subtitle (Montserrat Regular 400) */}
              {subtitle && (
                <p className="font-montserrat text-[#3D2B24] text-[13px] xs:text-[14px] font-normal leading-relaxed max-w-[280px] mb-3.5 drop-shadow-xs whitespace-pre-line">
                  {subtitle}
                </p>
              )}

              {/* Action Button (Consistent Hero Gradient Button) */}
              {buttonText && (
                <a
                  href={bannerLink}
                  className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] tracking-wider rounded-[10px] shadow-md pointer-events-auto hover:brightness-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  {buttonText}
                </a>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. TABLET, LAPTOP & DESKTOP VIEW (>= 768px): Right-Positioned Left-Aligned Card */}
        {/* ========================================================================= */}
        <div className="hidden md:block relative w-full aspect-[2.4/1] lg:aspect-[2.8/1] max-h-[540px] overflow-hidden">
          {desktopBannerImage && (
            <img
              src={desktopBannerImage}
              alt={title || 'Promotional Banner'}
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 pointer-events-none"
              loading="lazy"
            />
          )}

          {/* Desktop Right-Positioned Content Overlay (Left-aligned text inside) */}
          {showOverlay && (title || subtitle || buttonText) && (
            <div className="absolute right-[5%] md:right-[6%] lg:right-[8%] xl:right-[10%] top-1/2 -translate-y-1/2 max-w-[460px] lg:max-w-[560px] flex flex-col items-start text-left z-20 pointer-events-none">
              {/* Heading (Bodoni Moda Regular - Two lines with enhanced laptop/desktop font size) */}
              {title && (
                <h3 className="font-bodoni font-normal text-[#4A0E18] text-[38px] md:text-[50px] lg:text-[68px] xl:text-[80px] leading-[0.96] tracking-[-0.02em] drop-shadow-xs max-w-[460px] lg:max-w-[580px]">
                  {title.includes(' ') && !title.includes('\n') ? (
                    <>
                      {title.split(' ')[0]}
                      <br />
                      {title.split(' ').slice(1).join(' ')}
                    </>
                  ) : (
                    title
                  )}
                </h3>
              )}

              {/* Golden Floral Filigree Divider */}
              {title && subtitle && (
                <div className="flex items-center justify-start gap-2.5 my-2.5 lg:my-3.5 opacity-90">
                  <span className="h-[1px] w-14 md:w-18 lg:w-22 bg-[#D1A858]" />
                  <span className="text-[#C89B3C] text-[14px] lg:text-[16px] leading-none">❖</span>
                  <span className="h-[1px] w-14 md:w-18 lg:w-22 bg-[#D1A858]" />
                </div>
              )}

              {/* Paragraph / Subtitle (Montserrat Regular 400) */}
              {subtitle && (
                <p className="font-montserrat text-[#3D2B24] text-[13.5px] md:text-[15px] lg:text-[17px] font-normal leading-relaxed max-w-[360px] lg:max-w-[440px] mb-4 lg:mb-5 drop-shadow-xs whitespace-pre-line">
                  {subtitle}
                </p>
              )}

              {/* Action Button (Consistent Hero Gradient Button) */}
              {buttonText && (
                <a
                  href={bannerLink}
                  className="font-cormorant inline-flex items-center justify-center px-7 py-3 md:px-8 md:py-3.5 lg:px-10 lg:py-4 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] md:text-[17px] lg:text-[19px] xl:text-[21px] tracking-wider rounded-[10px] shadow-lg pointer-events-auto hover:brightness-105 active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  {buttonText}
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
