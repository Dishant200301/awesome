import React, { useState, useMemo } from "react";

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

  const DEFAULT_FALLBACK = "/images/category/Latkan.webp";

  const { firstImage, secondImage } = useMemo(() => {
    const p = product || {};
    
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
    let primary = 
      extractUrl(p.mainImage) || 
      extractUrl(p.image) || 
      extractUrl(p.img) || 
      (Array.isArray(p.images) && extractUrl(p.images[0])) || 
      (Array.isArray(p.colors) && (extractUrl(p.colors[0]?.mainImage) || extractUrl(p.colors[0]?.displayImage) || (Array.isArray(p.colors[0]?.galleryImages) && extractUrl(p.colors[0]?.galleryImages[0])))) ||
      DEFAULT_FALLBACK;

    // 2. Secondary hover image (First gallery image added in Admin, or images[1], or variation gallery)
    let secondary: string | null = null;

    if (Array.isArray(p.galleryImages) && p.galleryImages.length > 0) {
      for (const item of p.galleryImages) {
        const u = extractUrl(item);
        if (u && u !== primary) {
          secondary = u;
          break;
        }
      }
    }

    if (!secondary && Array.isArray(p.images) && p.images.length > 1) {
      for (let i = 1; i < p.images.length; i++) {
        const u = extractUrl(p.images[i]);
        if (u && u !== primary) {
          secondary = u;
          break;
        }
      }
    }

    if (!secondary && Array.isArray(p.colors) && p.colors.length > 0) {
      const c0 = p.colors[0];
      if (Array.isArray(c0?.galleryImages) && c0.galleryImages.length > 0) {
        for (const item of c0.galleryImages) {
          const u = extractUrl(item);
          if (u && u !== primary) {
            secondary = u;
            break;
          }
        }
      }
      if (!secondary && p.colors.length > 1) {
        const c1 = p.colors[1];
        const c1Img = extractUrl(c1?.mainImage) || extractUrl(c1?.displayImage) || (Array.isArray(c1?.galleryImages) && extractUrl(c1.galleryImages[0]));
        if (c1Img && c1Img !== primary) {
          secondary = c1Img;
        }
      }
    }

    if (!secondary && (p.hoverImage || p.hoverImg)) {
      const h = extractUrl(p.hoverImage) || extractUrl(p.hoverImg);
      if (h && h !== primary) {
        secondary = h;
      }
    }

    return {
      firstImage: primary || DEFAULT_FALLBACK,
      secondImage: secondary || primary || DEFAULT_FALLBACK,
    };
  }, [product]);

  const hasSecondImage = Boolean(secondImage && secondImage !== firstImage);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {/* Primary Image (First image from Admin / Product Catalog) */}
      <img
        src={imgSrc || firstImage}
        alt={alt}
        loading="eager"
        onError={() => {
          if (imgSrc !== DEFAULT_FALLBACK) setImgSrc(DEFAULT_FALLBACK);
        }}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out ${
          isHovered && hasSecondImage ? "opacity-0 scale-105" : isHovered ? "scale-105" : "opacity-100 scale-100"
        } ${imageClassName}`}
      />

      {/* Secondary Gallery Image (Smooth Fade-in on Hover) */}
      {hasSecondImage && (
        <img
          src={hoverSrc || secondImage}
          alt={`${alt} hover view`}
          loading="lazy"
          onError={() => {
            if (hoverSrc !== DEFAULT_FALLBACK) setHoverSrc(DEFAULT_FALLBACK);
          }}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-out ${
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
