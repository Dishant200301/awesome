import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import { VerticalGallery } from "../components/VerticalGallery";
import { ProductInfo } from "../components/ProductInfo";
import { SizeChartModal } from "../components/SizeChartModal";
import { FloatingStickyCart } from "../components/FloatingStickyCart";
import { MobileStickyBottomBar } from "../components/MobileStickyBottomBar";
import { BenefitsSection } from "../components/BenefitsSection";
import { ProductDescriptionSection } from "../components/ProductDescriptionSection";
import { WashingInstructionsSection } from "../components/WashingInstructionsSection";
import { ManufacturingDetailsSection } from "../components/ManufacturingDetailsSection";
import { CustomerReviewsSection } from "../components/CustomerReviewsSection";
import { RelatedProductsSection } from "../components/RelatedProductsSection";
import { ProductColorVariation } from "../types/product";
import { getLiveProductById, fetchLiveProducts, subscribeToProductStore } from "@/modules/core/lib/apiStore";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [product, setProduct] = useState(() => getLiveProductById(id));
  const { addRecentlyViewed } = useRecentlyViewed();


  const prodAny = product as any;

  const [selectedColor, setSelectedColor] = useState<string>(
    () => product.colors?.[0]?.colorName || (product as any).colorMediaConfigs?.[0]?.colorName || product.variations?.[0]?.colorName || "Standard"
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    () => product.colors?.[0]?.sizes?.[0] || product.variations?.[0]?.size || product.availableSizes?.[0] || "Standard Pair"
  );

  // Dynamic computation of active variation based on Color AND Size selection
  const activeVariation: ProductColorVariation = React.useMemo(() => {
    // Gather all root product images
    const rootGallery: string[] = [];
    if (prodAny.mainImage && typeof prodAny.mainImage === "string") rootGallery.push(prodAny.mainImage);
    if (prodAny.image && typeof prodAny.image === "string" && !rootGallery.includes(prodAny.image)) rootGallery.push(prodAny.image);
    if (Array.isArray(prodAny.galleryImages)) {
      prodAny.galleryImages.forEach((img: any) => {
        const u = typeof img === "string" ? img : img?.url;
        if (u && typeof u === "string" && u.trim() && !rootGallery.includes(u.trim())) rootGallery.push(u.trim());
      });
    }
    if (Array.isArray(prodAny.images)) {
      prodAny.images.forEach((img: any) => {
        const u = typeof img === "string" ? img : img?.url;
        if (u && typeof u === "string" && u.trim() && !rootGallery.includes(u.trim())) rootGallery.push(u.trim());
      });
    }

    // Find matching color configuration object
    const colorObj = (product.colors || []).find(
      (c) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === (selectedColor || "").toLowerCase()
    );
    const colorMedia = ((product as any).colorMediaConfigs || []).find(
      (cm: any) => cm && (cm.colorName || cm.name || "").toLowerCase() === (selectedColor || "").toLowerCase()
    );

    // Build color images (Main Image + Gallery Images for selected color)
    const colorMain = colorMedia?.mainImage || colorObj?.mainImage || colorObj?.displayImage || colorObj?.galleryImages?.[0] || rootGallery[0] || "";
    const colorGallery = (colorMedia?.gallery && colorMedia.gallery.length > 0)
      ? colorMedia.gallery
      : (colorObj?.galleryImages && colorObj.galleryImages.length > 0) ? colorObj.galleryImages : rootGallery;
    const allUrls = Array.from(new Set([colorMain, ...colorGallery, ...rootGallery].filter(Boolean)));
    const colorImages = allUrls.map((gUrl, idx) => ({
      id: `img-gal-${idx}`,
      url: gUrl,
      alt: `${product.name} - ${selectedColor} View ${idx + 1}`
    }));

    if (!product.variations || product.variations.length === 0) {
      return {
        id: "v-default",
        colorName: selectedColor || "Standard",
        colorHex: colorObj?.colorHex || colorMedia?.colorCode || "#C89B3C",
        size: selectedSize,
        thumbnail: colorMain || "/images/category/Latkan.webp",
        price: prodAny.price || 799,
        originalPrice: prodAny.originalPrice || 1299,
        discountPercentage: 38,
        sku: product.defaultSku || "AWH-SKU-100",
        stock: 50,
        images: colorImages.length > 0 ? colorImages : [{ id: "img-0", url: "/images/category/Latkan.webp", alt: product.name }]
      };
    }

    // 1. Try exact match for both Color AND Size
    const exactMatch = (product.variations || []).find(
      (v) =>
        v &&
        (v.colorName || (v as any).color || "").trim().toLowerCase() === (selectedColor || "").trim().toLowerCase() &&
        (((v.size || "").trim().toLowerCase() === (selectedSize || "").trim().toLowerCase()) ||
          ((v.sizeName || "").trim().toLowerCase() === (selectedSize || "").trim().toLowerCase()))
    );

    if (exactMatch) {
      const finalImages = (exactMatch.images && exactMatch.images.length > 1)
        ? exactMatch.images
        : (colorImages.length > 0 ? colorImages : (exactMatch.images || []));

      return {
        ...exactMatch,
        colorName: selectedColor || exactMatch.colorName,
        size: selectedSize,
        images: finalImages
      };
    }

    // 2. Fallback to Color match
    const colorMatch = (product.variations || []).find(
      (v) => v && (v.colorName || (v as any).color || "").trim().toLowerCase() === (selectedColor || "").trim().toLowerCase()
    );

    if (colorMatch) {
      const finalImages = (colorMatch.images && colorMatch.images.length > 1)
        ? colorMatch.images
        : (colorImages.length > 0 ? colorImages : (colorMatch.images || []));

      return {
        ...colorMatch,
        colorName: selectedColor || colorMatch.colorName,
        size: selectedSize,
        images: finalImages
      };
    }

    // 3. Synthesize variation matching selectedColor from colorObj/colorMedia/firstVar
    const firstVar = product.variations[0] || {};
    return {
      id: `v-${(selectedColor || "std").toLowerCase()}`,
      colorName: selectedColor || "Standard",
      colorHex: colorObj?.colorHex || colorMedia?.colorCode || (firstVar as any).colorHex || "#C89B3C",
      size: selectedSize || (firstVar as any).size || "Standard Pair",
      thumbnail: colorMain || (firstVar as any).thumbnail || "/images/category/Latkan.webp",
      price: (firstVar as any).price || prodAny.price || 799,
      originalPrice: (firstVar as any).originalPrice || prodAny.originalPrice || 1299,
      discountPercentage: (firstVar as any).discountPercentage || 38,
      sku: (firstVar as any).sku || product.defaultSku || `AH-${(selectedColor || "STD").toUpperCase()}`,
      stock: (firstVar as any).stock !== undefined ? (firstVar as any).stock : 50,
      images: colorImages.length > 0 ? colorImages : ((firstVar as any).images || [{ id: "img-0", url: "/images/category/Latkan.webp", alt: product.name }])
    };
  }, [product.colors, (product as any).colorMediaConfigs, product.variations, selectedColor, selectedSize, prodAny]);

  const [hoverVariation, setHoverVariation] = useState<ProductColorVariation | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Subscribe to live API product store updates from Admin
  useEffect(() => {
    let isMounted = true;

    const loadLiveProduct = async () => {
      // 1. Initial synchronous lookup
      const local = getLiveProductById(id);
      if (isMounted) setProduct(local);

      // 2. Fresh fetch from backend API
      try {
        await fetchLiveProducts();
        if (isMounted) {
          const fresh = getLiveProductById(id);
          setProduct(fresh);
          if (fresh && fresh.id) {
            addRecentlyViewed(fresh);
          }
        }
      } catch (e) {
        console.error("Failed to load fresh product:", e);
      }
    };

    loadLiveProduct();

    const unsubscribe = subscribeToProductStore(() => {
      if (isMounted) {
        const live = getLiveProductById(id);
        setProduct(live);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [id]);

  // Sync selectedColor and selectedSize only when product loads or product ID changes
  useEffect(() => {
    if (!product) return;
    const validColors = [
      ...(product.colors || []).map(c => c?.colorName || (c as any)?.name || (c as any)?.color),
      ...((product as any).colorMediaConfigs || []).map((cm: any) => cm?.colorName || cm?.name),
      ...(product.variations || []).map(v => v?.colorName || (v as any)?.color)
    ].map(c => (c || "").trim()).filter(Boolean);

    if (validColors.length > 0) {
      const colorExists = validColors.some(
        (cName) => cName.toLowerCase() === (selectedColor || "").trim().toLowerCase()
      );
      if (!colorExists) {
        const firstColor = validColors[0] || "Standard";
        setSelectedColor(firstColor);
        const colorObj = (product.colors || []).find(
          (c) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === (firstColor || "").toLowerCase()
        );
        if (colorObj?.sizes && colorObj.sizes.length > 0) {
          setSelectedSize(colorObj.sizes[0]);
        }
      }
    }

    if (!selectedSize || (product.availableSizes && !product.availableSizes.includes(selectedSize))) {
      const fallbackSize = (product.colors?.[0]?.sizes?.[0]) || (product.availableSizes?.[0]) || "Standard Pair";
      setSelectedSize(fallbackSize);
    }
  }, [product?.id]);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    lenis.on("scroll", ScrollTrigger.update);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const displayedVariation = hoverVariation || activeVariation;

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-black selection:text-white pb-16 md:pb-0 overflow-x-clip">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <div className="pt-10 md:pt-12">
        {/* Breadcrumb */}

        {/* TOP PRODUCT HERO SECTION */}
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-4 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column: Image Gallery (Sticky on Laptop & Desktop) */}
            <div className="w-full lg:sticky lg:top-24 h-fit">
              <VerticalGallery
                images={displayedVariation.images && displayedVariation.images.length > 0 ? displayedVariation.images : [
                  { id: "img-1", url: prodAny.image || "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=800", alt: product.name }
                ]}
                sku={displayedVariation.sku}
              />
            </div>

            {/* Right Column: Product Information (50% Width on Tablet & Laptop) */}
            <div className="w-full">
              <ProductInfo
                product={product}
                activeVariation={activeVariation}
                selectedColor={selectedColor}
                onSelectVariation={(v) => {
                  const targetCol = v.colorName || (v as any).color || "Standard";
                  setSelectedColor(targetCol);
                  setHoverVariation(null);
                  const colorObj = (product.colors || []).find(
                    (c) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === targetCol.toLowerCase()
                  );
                  const colorSizes = (colorObj?.sizes && colorObj.sizes.length > 0)
                    ? colorObj.sizes
                    : (product.variations || [])
                      .filter((varItem) => varItem && (varItem.colorName || (varItem as any).color || "").toLowerCase() === targetCol.toLowerCase())
                      .map((varItem) => varItem.size || varItem.sizeName)
                      .filter((s): s is string => Boolean(s));
                  if (colorSizes.length > 0 && !colorSizes.includes(selectedSize)) {
                    setSelectedSize(colorSizes[0]);
                  }
                }}
                onHoverVariation={setHoverVariation}
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                onOpenSizeChart={() => setIsSizeChartOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* BENEFITS SECTION */}
        <BenefitsSection />

        {/* PRODUCT DESCRIPTION & FEATURE CARDS */}
        <ProductDescriptionSection
          cards={product.descriptionCards}
          selectedColor={selectedColor}
          idealForPills={product.idealForPills}
          fullDescription={product.fullDescription}
          shortDescription={product.shortDescription}
        />

        {/* WASHING INSTRUCTIONS */}
        <WashingInstructionsSection instructions={product.washingInstructions} />

        
        {/* CUSTOMER REVIEWS */}
        <div id="customer-reviews">
          <CustomerReviewsSection />
        </div>

        {/* RELATED PRODUCTS / LOVED TOGETHER */}
        <RelatedProductsSection currentProduct={product} />
      </div>

      {/* FLOATING STICKY CART */}
      <FloatingStickyCart />

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <MobileStickyBottomBar
        productId={product.id}
        productName={product.name}
        brand={product.brand}
        activeVariation={activeVariation}
        selectedSize={selectedSize}
      />

      {/* SIZE CHART MODAL */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        sizeChart={product.sizeChart}
        sizeChartConfig={(product as any).sizeChart || product.sizeChartConfig}
        sizeGuide={product.sizeGuide}
        selectedSize={selectedSize}
        onSelectSize={setSelectedSize}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;
