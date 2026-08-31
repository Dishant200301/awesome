import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Leaf, Sparkles, Heart } from 'lucide-react';
import { PaginationDots } from '@/modules/core/components/PaginationDots';
import { getLiveHeroSlides, subscribeToHeroSlides, fetchLiveHeroSlides, LiveHeroSlide } from '@/modules/core/lib/apiStore';

export const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<LiveHeroSlide[]>(() => getLiveHeroSlides());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const isDragging = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);

  // Subscribe to real-time live slides updates from Admin & API
  useEffect(() => {
    fetchLiveHeroSlides().then((live) => {
      if (live && live.length > 0) setSlides(live);
    });

    const unsubscribe = subscribeToHeroSlides(() => {
      setSlides(getLiveHeroSlides());
    });

    return () => unsubscribe();
  }, []);

  const totalSlides = slides.length;

  // Auto-play timer (paused while hovering or dragging)
  useEffect(() => {
    if (isPaused || isDraggingState || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, isDraggingState, totalSlides]);

  if (totalSlides === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setDragOffset(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setDragOffset(0);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setDragOffset(0);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    dragStartX.current = e.touches[0].clientX;
    setIsDraggingState(true);
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const diff = e.touches[0].clientX - dragStartX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingState(false);
    setIsPaused(false);

    if (dragOffset < -50) {
      nextSlide();
    } else if (dragOffset > 50) {
      prevSlide();
    } else {
      setDragOffset(0);
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    setIsDraggingState(true);
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - dragStartX.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingState(false);
    setIsPaused(false);

    if (dragOffset < -50) {
      nextSlide();
    } else if (dragOffset > 50) {
      prevSlide();
    } else {
      setDragOffset(0);
    }
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  // Render Exact Original Font & Styling For Each Slide with Dynamic Admin Content
  const renderSlideOverlay = (slide: LiveHeroSlide, index: number, isMobile: boolean) => {
    const slideIdx = index % 5;
    const tag = slide.tag || '';
    const title = slide.title || '';
    const subtitle = slide.subtitle || '';
    const buttonText = slide.buttonText || 'Shop Collection';
    const link = slide.link || '#categories';

    // =========================================================================
    // SLIDE 1: Grace in Every Thread (Royal Gold Cormorant)
    // =========================================================================
    if (slideIdx === 0) {
      if (isMobile) {
        return (
          <div className="absolute top-[17%] left-[7.5%] max-w-[62%] flex flex-col items-start text-left pointer-events-none z-20">
            {tag && (
              <span className="font-cormorant text-[#EADBC8] text-[20px] xs:text-[22px] sm:text-[26px] tracking-wide font-medium mb-0.5 leading-tight drop-shadow-xs">
                {tag}
              </span>
            )}
            {title && (
              <h1 className="font-cormorant font-bold text-[42px] xs:text-[48px] sm:text-[56px] leading-[0.92] bg-gradient-to-r from-[#F7E7B4] via-[#D8B458] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm mb-2">
                {title}
              </h1>
            )}
            <div className="flex items-center gap-1.5 mb-2.5 opacity-90">
              <span className="h-[1px] w-6 sm:w-8 bg-[#C89B3C]" />
              <span className="text-[#D8B458] text-[10px]">❖</span>
              <span className="h-[1px] w-6 sm:w-8 bg-[#C89B3C]" />
            </div>
            {subtitle && (
              <p className="font-cormorant text-[#F5EBE1] text-[13.5px] xs:text-[14.5px] sm:text-[16px] leading-relaxed max-w-[210px] drop-shadow-xs mb-3.5 font-normal">
                {subtitle}
              </p>
            )}
            <a
              href={link}
              className="font-cormorant inline-flex items-center justify-center px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto active:scale-95 transition-transform cursor-pointer"
            >
              {buttonText}
            </a>
          </div>
        );
      }

      // Desktop
      return (
        <div className="absolute top-1/2 -translate-y-1/2 left-[10%] md:left-[8.5%] lg:left-[9%] xl:left-[11%] max-w-[50%] lg:max-w-[44%] xl:max-w-[48%] flex flex-col items-start text-left pointer-events-none z-20">
          {tag && (
            <span className="font-cormorant text-[#F0E6D6] text-[28px] md:text-[30px] lg:text-[36px] xl:text-[50px] tracking-wide font-medium mb-0 leading-tight drop-shadow-xs">
              {tag}
            </span>
          )}
          {title && (
            <h1 className="font-cormorant font-bold text-[60px] md:text-[68px] lg:text-[84px] xl:text-[116px] leading-[0.90] bg-gradient-to-r from-[#FFF0D0] via-[#E4C374] to-[#B38728] bg-clip-text text-transparent drop-shadow-md mb-2 md:mb-2.5 lg:mb-3">
              {title}
            </h1>
          )}
          <div className="flex items-center gap-2 mb-2.5 md:mb-3 lg:mb-4 opacity-90">
            <span className="h-[1px] w-12 md:w-14 lg:w-18 xl:w-22 bg-[#C89B3C]" />
            <span className="text-[#D8B458] text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px]">❖</span>
            <span className="h-[1px] w-12 md:w-14 lg:w-18 xl:w-22 bg-[#C89B3C]" />
          </div>
          {subtitle && (
            <p className="font-cormorant text-[#F5EBE1] text-[16px] md:text-[17px] lg:text-[19px] xl:text-[26px] leading-relaxed max-w-[360px] lg:max-w-[420px] xl:max-w-[480px] drop-shadow-xs mb-4 md:mb-5 lg:mb-6 xl:mb-7 font-normal">
              {subtitle}
            </p>
          )}
          <a
            href={link}
            className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 md:px-7 md:py-3 lg:px-9 lg:py-3.5 xl:px-11 xl:py-4.5 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[15px] md:text-[16px] lg:text-[18px] xl:text-[21px] capitalize tracking-wide rounded-[10px] shadow-lg pointer-events-auto hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            {buttonText}
          </a>
        </div>
      );
    }

    // =========================================================================
    // SLIDE 2: Handcrafted Jewellery (Cormorant Gold Luxury)
    // =========================================================================
    if (slideIdx === 1) {
      if (isMobile) {
        return (
          <div className="absolute top-[17%] left-[7.5%] max-w-[62%] flex flex-col items-start text-left pointer-events-none z-20">
            {tag && (
              <span className="font-cormorant text-[#EADBC8] text-[20px] xs:text-[22px] sm:text-[26px] tracking-wide font-medium mb-0.5 leading-tight drop-shadow-xs">
                {tag}
              </span>
            )}
            {title && (
              <h1 className="font-cormorant font-bold text-[40px] xs:text-[46px] sm:text-[54px] leading-[0.95] bg-gradient-to-r from-[#F7E7B4] via-[#D8B458] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm mb-2">
                {title}
              </h1>
            )}
            <div className="flex items-center gap-1.5 mb-2.5 opacity-90">
              <span className="h-[1px] w-6 sm:w-8 bg-[#C89B3C]" />
              <span className="text-[#D8B458] text-[10px]">❖</span>
              <span className="h-[1px] w-6 sm:w-8 bg-[#C89B3C]" />
            </div>
            {subtitle && (
              <p className="font-cormorant text-[#F5EBE1] text-[13.5px] xs:text-[14.5px] sm:text-[16px] leading-relaxed max-w-[210px] drop-shadow-xs mb-3.5 font-normal">
                {subtitle}
              </p>
            )}
            <a
              href={link}
              className="font-cormorant inline-flex items-center justify-center px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto active:scale-95 transition-transform cursor-pointer"
            >
              {buttonText}
            </a>
          </div>
        );
      }

      // Desktop
      return (
        <div className="absolute top-1/2 -translate-y-1/2 left-[10%] md:left-[8.5%] lg:left-[9%] xl:left-[11%] max-w-[50%] lg:max-w-[44%] xl:max-w-[48%] flex flex-col items-start text-left pointer-events-none z-20">
          {tag && (
            <span className="font-cormorant text-[#F0E6D6] text-[26px] md:text-[28px] lg:text-[34px] xl:text-[48px] tracking-wide font-medium mb-0 leading-tight drop-shadow-xs">
              {tag}
            </span>
          )}
          {title && (
            <h1 className="font-cormorant font-bold text-[56px] md:text-[64px] lg:text-[80px] xl:text-[110px] leading-[0.92] bg-gradient-to-r from-[#FFF0D0] via-[#E4C374] to-[#B38728] bg-clip-text text-transparent drop-shadow-md mb-2 md:mb-2.5 lg:mb-3">
              {title}
            </h1>
          )}
          <div className="flex items-center gap-2 mb-2.5 md:mb-3 lg:mb-4 opacity-90">
            <span className="h-[1px] w-12 md:w-14 lg:w-18 xl:w-22 bg-[#C89B3C]" />
            <span className="text-[#D8B458] text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px]">❖</span>
            <span className="h-[1px] w-12 md:w-14 lg:w-18 xl:w-22 bg-[#C89B3C]" />
          </div>
          {subtitle && (
            <p className="font-cormorant text-[#F5EBE1] text-[15px] md:text-[16px] lg:text-[18px] xl:text-[24px] leading-relaxed max-w-[360px] lg:max-w-[420px] xl:max-w-[480px] drop-shadow-xs mb-4 md:mb-5 lg:mb-6 xl:mb-7 font-normal">
              {subtitle}
            </p>
          )}
          <a
            href={link}
            className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 md:px-7 md:py-3 lg:px-9 lg:py-3.5 xl:px-11 xl:py-4.5 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[15px] md:text-[16px] lg:text-[18px] xl:text-[21px] capitalize tracking-wide rounded-[10px] shadow-lg pointer-events-auto hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            {buttonText}
          </a>
        </div>
      );
    }

    // =========================================================================
    // SLIDE 3: Threads of Tradition (DM Serif + Montserrat Maroon Theme)
    // =========================================================================
    if (slideIdx === 2) {
      if (isMobile) {
        return (
          <div className="absolute top-[22%] left-[7.5%] max-w-[60%] flex flex-col items-start text-left pointer-events-none z-20">
            {tag && (
              <span className="font-montserrat text-[#4A0E18] text-[10px] xs:text-[11px] sm:text-[12px] font-medium uppercase tracking-[0.24em] mb-1 leading-none">
                {tag}
              </span>
            )}
            {title && (
              <h1 className="font-dm-serif text-[36px] xs:text-[42px] sm:text-[50px] leading-[1.05] text-[#4A0E18] drop-shadow-xs mb-2 font-normal">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="font-poppins text-[#2C1E18] text-[12px] xs:text-[13px] sm:text-[14.5px] leading-relaxed max-w-[200px] mb-3.5 font-normal">
                {subtitle}
              </p>
            )}
            <a
              href={link}
              className="font-cormorant inline-flex items-center justify-center px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto active:scale-95 transition-transform cursor-pointer"
            >
              {buttonText}
            </a>
          </div>
        );
      }

      // Desktop (With Requested Top Margin)
      return (
        <div className="absolute top-1/2 -translate-y-1/2 mt-6 md:mt-8 lg:mt-12 xl:mt-10 left-[10%] md:left-[8.5%] lg:left-[9%] xl:left-[11%] max-w-[50%] lg:max-w-[44%] xl:max-w-[48%] flex flex-col items-start text-left pointer-events-none z-20">
          {tag && (
            <span className="font-montserrat text-[#4A0E18] text-[11px] md:text-[12px] lg:text-[13.5px] xl:text-[17px] font-medium tracking-[0.3em] mb-2 md:mb-2.5 lg:mb-3 leading-none">
              {tag}
            </span>
          )}
          {title && (
            <h1 className="font-dm-serif text-[48px] md:text-[54px] lg:text-[70px] xl:text-[102px] leading-[1.02] text-[#4A0E18] drop-shadow-xs mb-2 md:mb-2.5 lg:mb-3 font-normal">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="font-poppins text-[#2B2320] text-[14px] md:text-[15px] lg:text-[17px] xl:text-[22px] leading-relaxed max-w-[340px] lg:max-w-[400px] xl:max-w-[450px] mb-4 md:mb-5 lg:mb-6 xl:mb-7 font-normal">
              {subtitle}
            </p>
          )}
          <a
            href={link}
            className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 md:px-7 md:py-3 lg:px-9 lg:py-3.5 xl:px-11 xl:py-4.5 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[15px] md:text-[16px] lg:text-[18px] xl:text-[21px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            {buttonText}
          </a>
        </div>
      );
    }

    // =========================================================================
    // SLIDE 4: Kids Choli (Allura Script + Purple Elegance)
    // =========================================================================
    if (slideIdx === 3) {
      if (isMobile) {
        return (
          <div className="absolute top-[9.5%] left-[7.5%] max-w-[62%] flex flex-col items-start text-left pointer-events-none z-20">
            <div className="flex items-center gap-1.5 mb-1 opacity-90">
              <span className="h-[1px] w-5 sm:w-7 bg-[#B3701E]/60" />
              <span className="text-[#B3701E] text-[12px]">🪷</span>
              <span className="h-[1px] w-5 sm:w-7 bg-[#B3701E]/60" />
            </div>
            <div className="leading-[0.95] mb-1 text-[#2C1B63]">
              <span className="font-allura text-[36px] xs:text-[42px] sm:text-[48px] font-normal block leading-none">Kids</span>
              <span className="font-cormorant font-semibold text-[38px] xs:text-[44px] sm:text-[52px] uppercase tracking-wider block leading-none mt-1">
                {title ? (title.toLowerCase().startsWith('kids') ? title.slice(4).trim() || 'CHOLI' : title) : 'CHOLI'}
              </span>
            </div>
            {tag && (
              <div className="font-montserrat text-[9.5px] xs:text-[10.5px] sm:text-[11.5px] font-semibold text-[#2C1B63] uppercase tracking-[0.22em] mb-2.5">
                {tag}
              </div>
            )}
            <div className="flex flex-col gap-1.5 mb-3 font-poppins">
              <div className="flex items-center gap-1.5">
                <span className="w-5.5 h-5.5 rounded-full border border-[#B3701E]/60 flex items-center justify-center bg-white/80 shadow-2xs">
                  <Leaf className="w-3 h-3 text-[#B3701E]" />
                </span>
                <span className="text-[11px] xs:text-[12px] font-medium text-[#2C1B63]">Soft Fabric</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5.5 h-5.5 rounded-full border border-[#B3701E]/60 flex items-center justify-center bg-white/80 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-[#B3701E]" />
                </span>
                <span className="text-[11px] xs:text-[12px] font-medium text-[#2C1B63]">Elegant Design</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-5.5 h-5.5 rounded-full border border-[#B3701E]/60 flex items-center justify-center bg-white/80 shadow-2xs">
                  <Heart className="w-3 h-3 text-[#B3701E] fill-[#B3701E]/40" />
                </span>
                <span className="text-[11px] xs:text-[12px] font-medium text-[#2C1B63]">Made with Love</span>
              </div>
            </div>
            <a
              href={link}
              className="font-cormorant inline-flex items-center justify-center px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto active:scale-95 transition-transform cursor-pointer"
            >
              {buttonText}
            </a>
          </div>
        );
      }

      // Desktop
      return (
        <div className="absolute top-1/2 -translate-y-1/2 left-[10%] md:left-[8.5%] lg:left-[9%] xl:left-[11%] max-w-[50%] lg:max-w-[44%] xl:max-w-[48%] flex flex-col items-start text-left pointer-events-none z-20">
          <div className="flex items-center gap-2 mb-2 lg:mb-2.5 opacity-90">
            <span className="h-[1px] w-9 md:w-11 lg:w-14 xl:w-16 bg-[#B3701E]/60" />
            <span className="text-[#B3701E] text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px]">🪷</span>
            <span className="h-[1px] w-9 md:w-11 lg:w-14 xl:w-16 bg-[#B3701E]/60" />
          </div>
          <div className="leading-[0.92] mb-2 md:mb-2.5 lg:mb-3 text-[#2C1B63]">
            <span className="font-allura text-[46px] md:text-[50px] lg:text-[64px] xl:text-[92px] font-normal inline-block mr-2.5 leading-none">Kids</span>
            <span className="text-amber-700 text-xl md:text-2xl lg:text-2.5xl xl:text-3xl inline-block mr-2.5">🤎</span>
            <span className="font-cormorant font-semibold text-[52px] md:text-[58px] lg:text-[76px] xl:text-[112px] uppercase tracking-wider block leading-none mt-1">
              {title ? (title.toLowerCase().startsWith('kids') ? title.slice(4).trim() || 'CHOLI' : title) : 'CHOLI'}
            </span>
          </div>
          {tag && (
            <div className="font-montserrat text-[11px] md:text-[12px] lg:text-[13px] xl:text-[17px] font-semibold text-[#2C1B63] uppercase tracking-[0.26em] mb-3.5 md:mb-4 lg:mb-4.5">
              {tag}
            </div>
          )}
          <div className="flex items-center gap-3 md:gap-3.5 lg:gap-4 xl:gap-5 mb-4 md:mb-5 lg:mb-6 flex-wrap font-poppins">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="w-6.5 h-6.5 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-full border border-[#B3701E]/70 flex items-center justify-center bg-white/80 shadow-2xs">
                <Leaf className="w-3 md:w-3.5 lg:w-4 xl:w-4.5 text-[#B3701E]" />
              </span>
              <span className="text-[12px] md:text-[12.5px] lg:text-[13.5px] xl:text-[15px] font-medium text-[#2C1B63]">Soft Fabric</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="w-6.5 h-6.5 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-full border border-[#B3701E]/70 flex items-center justify-center bg-white/80 shadow-2xs">
                <Sparkles className="w-3 md:w-3.5 lg:w-4 xl:w-4.5 text-[#B3701E]" />
              </span>
              <span className="text-[12px] md:text-[12.5px] lg:text-[13.5px] xl:text-[15px] font-medium text-[#2C1B63]">Elegant Design</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="w-6.5 h-6.5 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-full border border-[#B3701E]/70 flex items-center justify-center bg-white/80 shadow-2xs">
                <Heart className="w-3 md:w-3.5 lg:w-4 xl:w-4.5 text-[#B3701E] fill-[#B3701E]/30" />
              </span>
              <span className="text-[12px] md:text-[12.5px] lg:text-[13.5px] xl:text-[15px] font-medium text-[#2C1B63]">Made with Love</span>
            </div>
          </div>
          <a
            href={link}
            className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 md:px-7 md:py-3 lg:px-9 lg:py-3.5 xl:px-11 xl:py-4.5 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[15px] md:text-[16px] lg:text-[18px] xl:text-[21px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            {buttonText}
          </a>
        </div>
      );
    }

    // =========================================================================
    // SLIDE 5: Twirl In Tradition (Classic Cormorant + Gold Ornament)
    // =========================================================================
    if (slideIdx === 4) {
      if (isMobile) {
        return (
          <div className="absolute top-[17%] left-[6%] max-w-[60%] flex flex-col items-start text-left pointer-events-none z-20">
            {title && (
              <h1 className="font-cormorant font-medium text-[35px] xs:text-[41px] sm:text-[49px] leading-[0.98] tracking-[0.06em] text-[#32194D] uppercase mb-1.5 drop-shadow-xs">
                {title}
              </h1>
            )}
            <div className="flex items-center gap-1.5 my-1.5 opacity-95">
              <span className="text-[#C5A059] text-[12px] leading-none">❧</span>
              <span className="h-[1px] w-16 sm:w-22 bg-gradient-to-r from-[#C5A059] via-[#E8D19B] to-[#C5A059]" />
              <span className="text-[#C5A059] text-[12px] leading-none rotate-180 inline-block">❧</span>
            </div>
            {tag && (
              <div className="flex items-center gap-1.5 text-[#32194D] my-1 tracking-wide">
                <span className="text-[12px] not-italic text-[#32194D]/90">❀</span>
                <span className="font-allura text-[25px] xs:text-[29px] sm:text-[33px] font-normal leading-none">
                  {tag}
                </span>
                <span className="text-[12px] not-italic text-[#32194D]/90">❀</span>
              </div>
            )}
            {subtitle && (
              <p className="font-poppins text-[#55453E] text-[12px] xs:text-[13px] sm:text-[14.5px] leading-snug max-w-[210px] my-2.5 font-normal">
                {subtitle}
              </p>
            )}
            <a
              href={link}
              className="font-cormorant inline-flex items-center justify-center px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] capitalize tracking-wide rounded-[10px] shadow-sm pointer-events-auto active:scale-95 transition-all duration-200 mt-1 cursor-pointer"
            >
              {buttonText}
            </a>
          </div>
        );
      }

      // Desktop
      return (
        <div className="absolute top-1/2 -translate-y-1/2 left-[10%] md:left-[8.5%] lg:left-[9%] xl:left-[11%] max-w-[50%] lg:max-w-[44%] xl:max-w-[48%] flex flex-col items-start text-left pointer-events-none z-20">
          {title && (
            <h1 className="font-cormorant font-medium text-[48px] md:text-[54px] lg:text-[66px] xl:text-[98px] leading-[0.98] tracking-[0.06em] text-[#32194D] uppercase mb-2 md:mb-2.5 lg:mb-3 drop-shadow-xs">
              {title}
            </h1>
          )}
          <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3 my-2 md:my-2.5 lg:my-3 opacity-95">
            <span className="text-[#C5A059] text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] leading-none">❧</span>
            <span className="h-[1px] w-18 md:w-22 lg:w-28 xl:w-34 bg-gradient-to-r from-[#C5A059] via-[#E8D19B] to-[#C5A059]" />
            <span className="text-[#C5A059] text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] leading-none rotate-180 inline-block">❧</span>
          </div>
          {tag && (
            <div className="flex items-center gap-2 md:gap-2.5 text-[#32194D] my-1.5 md:my-2 tracking-wide">
              <span className="text-[13px] md:text-[14px] lg:text-[14.5px] xl:text-[15px] not-italic text-[#32194D]/90">❀</span>
              <span className="font-allura text-[30px] md:text-[34px] lg:text-[42px] xl:text-[62px] font-normal leading-none">
                {tag}
              </span>
              <span className="text-[13px] md:text-[14px] lg:text-[14.5px] xl:text-[15px] not-italic text-[#32194D]/90">❀</span>
            </div>
          )}
          {subtitle && (
            <p className="font-poppins text-[#55453E] text-[14px] md:text-[15px] lg:text-[16.5px] xl:text-[22px] leading-snug max-w-[320px] lg:max-w-[360px] xl:max-w-[420px] my-3 md:my-3.5 lg:my-4 font-normal">
              {subtitle}
            </p>
          )}
          <a
            href={link}
            className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 md:px-7 md:py-3 lg:px-9 lg:py-3.5 xl:px-11 xl:py-4.5 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[15px] md:text-[16px] lg:text-[18px] xl:text-[21px] capitalize tracking-wide rounded-[10px] shadow-sm pointer-events-auto hover:brightness-105 active:scale-95 transition-all duration-200 mt-1 cursor-pointer"
          >
            {buttonText}
          </a>
        </div>
      );
    }

    // =========================================================================
    // Universal Dynamic Fallback for Any Additional Custom Slides Added in Admin
    // =========================================================================
    const alignClass = slide.align === 'center' ? 'items-center text-center left-1/2 -translate-x-1/2' : (slide.align === 'right' ? 'items-end text-right right-[10%] md:right-[9%]' : 'items-start text-left left-[10%] md:left-[8.5%] lg:left-[9%] xl:left-[11%]');
    const alignMobileClass = slide.align === 'center' ? 'items-center text-center left-1/2 -translate-x-1/2' : (slide.align === 'right' ? 'items-end text-right right-[7.5%]' : 'items-start text-left left-[7.5%]');

    if (isMobile) {
      return (
        <div className={`absolute top-[17%] ${alignMobileClass} max-w-[62%] flex flex-col pointer-events-none z-20`}>
          {tag && (
            <span className="font-cormorant text-[#EADBC8] text-[20px] xs:text-[22px] sm:text-[26px] tracking-wide font-medium mb-0.5 leading-tight drop-shadow-xs">
              {tag}
            </span>
          )}
          {title && (
            <h1 className="font-cormorant font-bold text-[40px] xs:text-[46px] sm:text-[54px] leading-[0.95] bg-gradient-to-r from-[#F7E7B4] via-[#D8B458] to-[#B38728] bg-clip-text text-transparent drop-shadow-sm mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="font-cormorant text-[#F5EBE1] text-[13.5px] xs:text-[14.5px] sm:text-[16px] leading-relaxed max-w-[210px] drop-shadow-xs mb-3.5 font-normal">
              {subtitle}
            </p>
          )}
          <a
            href={link}
            className="font-cormorant inline-flex items-center justify-center px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[16px] sm:text-[17.5px] capitalize tracking-wide rounded-[10px] shadow-md pointer-events-auto active:scale-95 transition-transform cursor-pointer"
          >
            {buttonText}
          </a>
        </div>
      );
    }

    return (
      <div className={`absolute top-1/2 -translate-y-1/2 ${alignClass} max-w-[50%] lg:max-w-[44%] xl:max-w-[48%] flex flex-col pointer-events-none z-20`}>
        {tag && (
          <span className="font-cormorant text-[#F0E6D6] text-[26px] md:text-[28px] lg:text-[34px] xl:text-[48px] tracking-wide font-medium mb-0 leading-tight drop-shadow-xs">
            {tag}
          </span>
        )}
        {title && (
          <h1 className="font-cormorant font-bold text-[56px] md:text-[64px] lg:text-[80px] xl:text-[110px] leading-[0.92] bg-gradient-to-r from-[#FFF0D0] via-[#E4C374] to-[#B38728] bg-clip-text text-transparent drop-shadow-md mb-2 md:mb-2.5 lg:mb-3">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="font-cormorant text-[#F5EBE1] text-[15px] md:text-[16px] lg:text-[18px] xl:text-[24px] leading-relaxed max-w-[360px] lg:max-w-[420px] xl:max-w-[480px] drop-shadow-xs mb-4 md:mb-5 lg:mb-6 xl:mb-7 font-normal">
            {subtitle}
          </p>
        )}
        <a
          href={link}
          className="font-cormorant inline-flex items-center justify-center px-6 py-2.5 md:px-7 md:py-3 lg:px-9 lg:py-3.5 xl:px-11 xl:py-4.5 bg-gradient-to-r from-[#E859B1] to-[#F7D85E] text-[#410815] font-bold text-[15px] md:text-[16px] lg:text-[18px] xl:text-[21px] capitalize tracking-wide rounded-[10px] shadow-lg pointer-events-auto hover:brightness-105 active:scale-95 transition-all cursor-pointer"
        >
          {buttonText}
        </a>
      </div>
    );
  };

  return (
    <section
      id="home"
      aria-label="Promotional Hero Showcase"
      className="relative w-full overflow-hidden bg-[#FAF8F4]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Carousel Track Container */}
      <div
        className={`relative w-full aspect-[9/16] sm:aspect-[9/13] md:aspect-auto md:h-[48vh] md:min-h-[420px] md:max-h-[500px] lg:h-[90vh] lg:min-h-0 lg:max-h-none overflow-hidden bg-brand-cream/20 ${
          isDraggingState ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sliding Track */}
        <div
          className="flex w-full h-full"
          style={{
            transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
            transition: isDraggingState ? 'none' : 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {slides.map((slide, index) => {
            const mobileBg = slide.mobileImage || slide.image || '/images/home/hero/mobile-1.webp';
            const desktopBg = slide.image || '/images/home/hero/hero-1.webp';

            return (
              <div key={slide.id || index} className="w-full h-full shrink-0 relative">
                <div className="w-full h-full relative">
                  {/* Mobile View (< 768px) */}
                  <div className="md:hidden relative w-full h-full overflow-hidden">
                    <img
                      src={mobileBg}
                      alt={slide.title || `Hero Slide ${index + 1}`}
                      className="w-full h-full object-cover object-center pointer-events-none"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                    {renderSlideOverlay(slide, index, true)}
                  </div>

                  {/* Desktop, Laptop & Tablet View (>= 768px) */}
                  <div className="hidden md:block relative w-full h-full overflow-hidden">
                    <img
                      src={desktopBg}
                      alt={slide.title || `Hero Slide ${index + 1}`}
                      className="w-full h-full object-cover md:object-right lg:object-center pointer-events-none"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                    {renderSlideOverlay(slide, index, false)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Left Navigation Arrow */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-1.5 sm:left-4 md:left-6 lg:left-8 xl:left-10 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-brand-maroon text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Right Navigation Arrow */}
        {totalSlides > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-1.5 sm:right-4 md:right-6 lg:right-8 xl:right-10 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-brand-maroon text-white flex items-center justify-center backdrop-blur-xs transition-all duration-200 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Bottom Pagination Dots */}
        {totalSlides > 1 && (
          <PaginationDots
            total={totalSlides}
            current={currentSlide}
            onChange={goToSlide}
            className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
          />
        )}
      </div>
    </section>
  );
};

export default HeroSection;
