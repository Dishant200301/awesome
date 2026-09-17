import React, { useState, useMemo, useEffect } from "react";

interface ProductHoverSliderProps {
  product: any;
  alt: string;
  activeImage?: string;
  activeColor?: string;
  activeImages?: string[];
  className?: string;
  imageClassName?: string;
  children?: React.ReactNode;
}

export const ProductHoverSlider: React.FC<ProductHoverSliderProps> = ({
  product,
  alt,
  activeImage,
  activeColor,
  activeImages,
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

    const extractUrl = (val: any): string => {
      if (!val) return "";
      if (typeof val === "string") return val.trim();
      if (typeof val === "object") {
        if (typeof val.url === "string") return val.url.trim();
        if (typeof val.src === "string") return val.src.trim();
        if (typeof val.image === "string") return val.image.trim();
        if (typeof val.mainImage === "string") return val.mainImage.trim();
        if (typeof val.thumbnail === "string") return val.thumbnail.trim();
      }
      return "";
    };

    const explicitActive = extractUrl(activeImage);

    // 1. If explicit activeImages provided for this color variant, strictly use only them
    if (Array.isArray(activeImages) && activeImages.length > 0) {
      const validImages = activeImages.map(extractUrl).filter(Boolean);
      if (validImages.length > 0) {
        const primary = explicitActive || validImages[0];
        const secondary = validImages.find((u) => u && u !== primary) || validImages[1] || primary;
        return {
          firstImage: primary || DEFAULT_FALLBACK,
          secondImage: secondary || primary || DEFAULT_FALLBACK,
        };
      }
    }

    // 2. If activeColor is specified, search across all variant structures strictly for this color
    const normColor = (activeColor || "").trim().toLowerCase();
    if (normColor) {
      const variantImages: string[] = [];
      const addVUrl = (val: any) => {
        const u = extractUrl(val);
        if (u && !variantImages.includes(u)) variantImages.push(u);
      };

      const allVariantLists = [
        ...(Array.isArray(p.variations) ? p.variations : []),
        ...(Array.isArray(p.variantDetails) ? p.variantDetails : []),
        ...(Array.isArray(p.variants) ? p.variants : [])
      ];

      const matchedVar = allVariantLists.find((v: any) =>
        ((v?.colorName || v?.color || v?.title || v?.optionValue || v?.name || "")).trim().toLowerCase() === normColor
      );

      if (matchedVar) {
        addVUrl(matchedVar.thumbnail);
        addVUrl(matchedVar.mainImage);
        addVUrl(matchedVar.image);
        if (Array.isArray(matchedVar.images)) matchedVar.images.forEach(addVUrl);
        if (Array.isArray(matchedVar.galleryImages)) matchedVar.galleryImages.forEach(addVUrl);
      }

      const colorLists = [
        ...(Array.isArray(p.colors) ? p.colors : []),
        ...(Array.isArray(p.colorMediaConfigs) ? p.colorMediaConfigs : [])
      ];
      const matchedCol = colorLists.find((c: any) =>
        ((c?.colorName || c?.name || c?.color || "")).trim().toLowerCase() === normColor
      );
      if (matchedCol) {
        addVUrl(matchedCol.displayImage);
        addVUrl(matchedCol.mainImage);
        addVUrl(matchedCol.image);
        addVUrl(matchedCol.thumbnail);
        if (Array.isArray(matchedCol.galleryImages)) matchedCol.galleryImages.forEach(addVUrl);
        if (Array.isArray(matchedCol.images)) matchedCol.images.forEach(addVUrl);
      }

      if (variantImages.length > 0) {
        const primary = explicitActive || variantImages[0];
        const secondary = variantImages.find((u) => u && u !== primary) || variantImages[1] || primary;
        return {
          firstImage: primary || DEFAULT_FALLBACK,
          secondImage: secondary || primary || DEFAULT_FALLBACK,
        };
      }

      // If activeColor was specified, NEVER fall back to base images (prevents showing other variant images)
      const fallback = explicitActive || DEFAULT_FALLBACK;
      return {
        firstImage: fallback,
        secondImage: fallback,
      };
    }

    // 3. For simple products without variants, use product's own images
    const primary =
      explicitActive ||
      extractUrl(p.image) ||
      extractUrl(p.mainImage) ||
      extractUrl(p.img) ||
      (Array.isArray(p.images) && extractUrl(p.images[0])) ||
      (Array.isArray(p.galleryImages) && extractUrl(p.galleryImages[0])) ||
      "";

    const candidateUrls: string[] = [];
    const addUrl = (val: any) => {
      const u = extractUrl(val);
      if (u && !candidateUrls.includes(u)) {
        candidateUrls.push(u);
      }
    };

    if (Array.isArray(p.galleryImages)) p.galleryImages.forEach(addUrl);
    if (Array.isArray(p.images)) p.images.forEach(addUrl);
    if (p.hoverImage) addUrl(p.hoverImage);
    if (p.hoverImg) addUrl(p.hoverImg);

    const secondary = candidateUrls.find((u) => u && u !== primary) || primary;

    return {
      firstImage: primary || DEFAULT_FALLBACK,
      secondImage: secondary || primary || DEFAULT_FALLBACK,
    };
  }, [product, activeImage, activeColor, activeImages]);

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
