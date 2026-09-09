import React, { useState, useMemo, useEffect } from "react";

interface ProductHoverSliderProps {
  product: any;
  alt: string;
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}

export const ProductHoverSlider: React.FC<ProductHoverSliderProps> = ({
  product,
  alt,
  className = "relative aspect-square w-full overflow-hidden rounded-[18px] bg-[#f5f2ee]",
  imageClassName = "w-full h-full object-cover object-center shrink-0",
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [hoverSrc, setHoverSrc] = useState<string>("");

  const DEFAULT_FALLBACK = "";

  const { firstImage, secondImage } = useMemo(() => {
    const p = product || {};
    const parent = p.parentProduct || {};

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

    // 1. Primary main image (Admin main image, image, or first available image)
    const primary =
      extractUrl(p.image) ||
      extractUrl(p.mainImage) ||
      extractUrl(p.img) ||
      (Array.isArray(p.images) && extractUrl(p.images[0])) ||
      (Array.isArray(p.galleryImages) && extractUrl(p.galleryImages[0])) ||
      (Array.isArray(p.variants) && (extractUrl(p.variants[0]?.mainImage) || extractUrl(p.variants[0]?.image) || extractUrl(p.variants[0]?.thumbnail))) ||
      (Array.isArray(p.colors) && (extractUrl(p.colors[0]?.mainImage) || extractUrl(p.colors[0]?.displayImage))) ||
      (Array.isArray(parent.images) && extractUrl(parent.images[0])) ||
      (Array.isArray(parent.galleryImages) && extractUrl(parent.galleryImages[0])) ||
      "";

    // Collect all candidate gallery images in order
    const allUrls: string[] = [];
    const addUrl = (val: any) => {
      const u = extractUrl(val);
      if (u && !allUrls.includes(u)) {
        allUrls.push(u);
      }
    };

    if (Array.isArray(p.galleryImages)) p.galleryImages.forEach(addUrl);
    if (Array.isArray(p.images)) p.images.forEach(addUrl);
    if (p.hoverImage) addUrl(p.hoverImage);
    if (p.hoverImg) addUrl(p.hoverImg);

    if (Array.isArray(p.variants)) {
      p.variants.forEach((v: any) => {
        addUrl(v?.mainImage);
        addUrl(v?.image);
        if (Array.isArray(v?.galleryImages)) v.galleryImages.forEach(addUrl);
        if (Array.isArray(v?.images)) v.images.forEach(addUrl);
      });
    }

    if (Array.isArray(p.colors)) {
      p.colors.forEach((c: any) => {
        addUrl(c?.mainImage);
        addUrl(c?.displayImage);
        if (Array.isArray(c?.galleryImages)) c.galleryImages.forEach(addUrl);
      });
    }

    // Also check parentProduct (for exploded ShopPage variants)
    if (parent && typeof parent === "object") {
      if (Array.isArray(parent.galleryImages)) parent.galleryImages.forEach(addUrl);
      if (Array.isArray(parent.images)) parent.images.forEach(addUrl);
      if (parent.hoverImage) addUrl(parent.hoverImage);
      if (Array.isArray(parent.variants)) {
        parent.variants.forEach((v: any) => {
          addUrl(v?.mainImage);
          addUrl(v?.image);
        });
      }
    }

    // Secondary is the first gallery image distinct from primary
    const secondary = allUrls.find((u) => u && u !== primary) || null;

    return {
      firstImage: primary || DEFAULT_FALLBACK,
      secondImage: secondary || primary || DEFAULT_FALLBACK,
    };
  }, [product]);

  // Reset local state when product changes
  useEffect(() => {
    setImgSrc("");
    setHoverSrc("");
  }, [firstImage, secondImage]);

  const hasSecondImage = Boolean(secondImage && secondImage !== firstImage);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {/* Primary Image (Base image, smoothly zooms subtly on hover) */}
      {(imgSrc || firstImage) ? (
        <img
          src={imgSrc || firstImage}
          alt={alt}
          loading="eager"
          onError={() => {
            setImgSrc("");
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out ${
            isHovered ? "scale-105" : "scale-100"
          } ${imageClassName}`}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-[#FAF8F5] flex items-center justify-center text-neutral-300">
          <svg className="w-10 h-10 stroke-current opacity-60" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Secondary Gallery Image (Smoothly fades in over primary image on hover) */}
      {hasSecondImage && (hoverSrc || secondImage) && (
        <img
          src={hoverSrc || secondImage}
          alt={`${alt} hover view`}
          loading="lazy"
          onError={() => {
            setHoverSrc("");
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-all duration-500 ease-in-out ${
            isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
          } ${imageClassName}`}
        />
      )}

      {/* Badges / Wishlist Button / Overlay Children */}
      {children}
    </div>
  );
};

export default ProductHoverSlider;
