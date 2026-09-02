import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "@/modules/core/components/Navbar";
import Footer from "@/modules/core/components/Footer";
import { VerticalGallery } from "../components/VerticalGallery";
import { ProductInfo } from "../components/ProductInfo";
import { ProductBreadcrumb } from "../components/ProductBreadcrumb";
import { SizeChartModal } from "../components/SizeChartModal";
import { MobileStickyBottomBar } from "../components/MobileStickyBottomBar";
import { BenefitsSection } from "../components/BenefitsSection";
import { ProductDescriptionSection } from "../components/ProductDescriptionSection";
import { ProductVideosSection } from "../components/ProductVideosSection";
import { CustomerReviewsSection } from "../components/CustomerReviewsSection";
import { RelatedProductsSection } from "../components/RelatedProductsSection";
import { ProductColorVariation } from "../types/product";
import { getLiveProductById, fetchLiveProducts, subscribeToProductStore } from "@/modules/core/lib/apiStore";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(() => getLiveProductById(id));
  const { addRecentlyViewed } = useRecentlyViewed();

  const prodAny = product as any;

  const initialColorFromQuery = searchParams.get("color");
  const [selectedColor, setSelectedColor] = useState<string>(
    () => initialColorFromQuery || product.colors?.[0]?.colorName || (product as any).colorMediaConfigs?.[0]?.colorName || product.variations?.[0]?.colorName || "Standard"
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    () => product.colors?.[0]?.sizes?.[0] || product.variations?.[0]?.size || product.availableSizes?.[0] || "Standard Pair"
  );

  useEffect(() => {
    const qColor = searchParams.get("color");
    if (qColor) {
      setSelectedColor(qColor);
    }
  }, [searchParams]);

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
    const colorMain = colorMedia?.mainImage || colorObj?.mainImage || colorObj?.displayImage || colorObj?.galleryImages?.[0] || "";
    const colorGallery = (colorMedia?.gallery && colorMedia.gallery.length > 0)
      ? colorMedia.gallery
      : (colorObj?.galleryImages && colorObj.galleryImages.length > 0) ? colorObj.galleryImages : [];
    const colorSpecificUrls = Array.from(new Set([colorMain, ...colorGallery].filter(Boolean)));
    const allUrls = colorSpecificUrls.length > 0 ? colorSpecificUrls : rootGallery;
    const colorImages = allUrls.map((gUrl, idx) => ({
      id: `img-gal-${idx}`,
      url: gUrl,
      alt: `${product.name} - ${selectedColor} View ${idx + 1}`
    }));

    const dedupeImages = (imgs: any[]): any[] => {
      const seen = new Set<string>();
      const res: any[] = [];
      (imgs || []).forEach((img, idx) => {
        const urlStr = typeof img === "string" ? img : img?.url;
        if (urlStr && typeof urlStr === "string" && urlStr.trim() && !seen.has(urlStr.trim())) {
          seen.add(urlStr.trim());
          res.push(typeof img === "string" ? { id: `img-${idx}`, url: urlStr.trim(), alt: `${product.name} ${idx + 1}` } : { ...img, url: urlStr.trim() });
        }
      });
      return res.length > 0 ? res : colorImages;
    };

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
      const finalImages = dedupeImages(exactMatch.images && exactMatch.images.length > 0 ? exactMatch.images : colorImages);

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
      const finalImages = dedupeImages(colorMatch.images && colorMatch.images.length > 0 ? colorMatch.images : colorImages);

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

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-black selection:text-white pb-16 md:pb-0 overflow-x-clip">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Container */}
      <div className="pt-6 md:pt-6">
        {/* Dynamic Breadcrumb */}
        <ProductBreadcrumb
          category={product.category || product.categories?.[0] || "Handmade"}
          subCategory={product.subcategory || (product as any).subCategory}
          productName={
            activeVariation?.colorName && !["standard", "default", "none"].includes(activeVariation.colorName.toLowerCase()) && !product.name.toLowerCase().includes(activeVariation.colorName.toLowerCase())
              ? `${product.name} - ${activeVariation.colorName}`
              : product.name
          }
        />

        {/* TOP PRODUCT HERO SECTION */}
        <div className="max-w-[1500px] mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column: Image Gallery (Sticky on Laptop & Desktop) */}
            <div className="w-full lg:sticky lg:top-24 h-fit">
              <VerticalGallery
                images={activeVariation.images && activeVariation.images.length > 0 ? activeVariation.images : [
                  { id: "img-1", url: prodAny.image || "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=800", alt: product.name }
                ]}
                sku={activeVariation.sku}
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
                selectedSize={selectedSize}
                onSelectSize={setSelectedSize}
                onOpenSizeChart={() => setIsSizeChartOpen(true)}
              />
            </div>
          </div>
        </div>



        {/* PRODUCT DESCRIPTION & FEATURE CARDS */}
        <ProductDescriptionSection
          product={product}
          cards={product.descriptionCards}
          selectedColor={selectedColor}
          idealForPills={product.idealForPills}
          fullDescription={product.fullDescription}
          shortDescription={product.shortDescription}
          specifications={(product as any).specifications}
          features={(product as any).features}
          customAttributes={(product as any).customAttributes}
          dimensions={(product as any).dimensions}
          weight={(product as any).weight}
          material={(product as any).material || (product as any).extendedDetails?.materialDetails}
          color={(product as any).color}
          brand={product.brand}
          highlights={product.highlights}
          productAttributes={product.productAttributes}
          careInstructions={product.extendedDetails?.careInstructions || (product as any).careInstructions}
          reviewCount={product.reviewCount}
        />
        {/* BENEFITS SECTION */}
        {/* <BenefitsSection /> */}

       
        {/* RELATED PRODUCTS SECTION (Strictly matching current product's category/subcategory) */}
        <RelatedProductsSection currentProduct={product} />

        {/* CUSTOMER REVIEWS */}
        {/* <div id="customer-reviews">
          <CustomerReviewsSection />
        </div> */}
      </div>

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
