import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
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
    () => initialColorFromQuery || product?.colors?.[0]?.colorName || (product as any)?.colorMediaConfigs?.[0]?.colorName || product?.variations?.[0]?.colorName || "Standard"
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    () => product?.colors?.[0]?.sizes?.[0] || product?.variations?.[0]?.size || product?.availableSizes?.[0] || "Standard Pair"
  );

  const [currentRating, setCurrentRating] = useState<number>(() => Number(product?.rating || 0));
  const [currentReviewCount, setCurrentReviewCount] = useState<number>(() => Number(product?.reviewCount || 0));

  useEffect(() => {
    if (product) {
      setCurrentRating(Number(product.rating || 0));
      setCurrentReviewCount(Number(product.reviewCount || 0));
    }
  }, [product?.id, product?.rating, product?.reviewCount]);

  const productWithDynamicReviews = React.useMemo(() => {
    if (!product) return product;
    return {
      ...product,
      rating: currentRating,
      reviewCount: currentReviewCount,
    };
  }, [product, currentRating, currentReviewCount]);

  useEffect(() => {
    const qColor = searchParams.get("color");
    if (qColor) {
      setSelectedColor(qColor);
    }
  }, [searchParams]);

  // Dynamic computation of active variation based on Color AND Size selection
  const activeVariation: ProductColorVariation = React.useMemo(() => {
    if (!product) {
      return {
        id: "v-default",
        colorName: selectedColor || "Standard",
        colorHex: "#C89B3C",
        size: selectedSize || "Standard Pair",
        thumbnail: "",
        price: 799,
        originalPrice: 1299,
        discountPercentage: 38,
        sku: "AH-STD",
        stock: 50,
        images: []
      };
    }

    // Root product fallback images (used only when a variant has no images or for Simple products)
    const rootGallery: string[] = [];
    if (prodAny.mainImage && typeof prodAny.mainImage === "string") rootGallery.push(prodAny.mainImage);
    if (prodAny.image && typeof prodAny.image === "string" && !rootGallery.includes(prodAny.image)) rootGallery.push(prodAny.image);
    if (Array.isArray(prodAny.galleryImages)) {
      prodAny.galleryImages.forEach((img: any) => {
        const u = typeof img === "string" ? img : img?.url;
        if (u && typeof u === "string" && u.trim() && !rootGallery.includes(u.trim())) rootGallery.push(u.trim());
      });
    }

    // Find matching color configuration object
    const colorObj = (product.colors || []).find(
      (c: any) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === (selectedColor || "").toLowerCase()
    );
    const colorMedia = ((product as any).colorMediaConfigs || []).find(
      (cm: any) => cm && (cm.colorName || cm.name || "").toLowerCase() === (selectedColor || "").toLowerCase()
    );

    // Helper: Build strictly variant-specific images without polluting with other variants' images
    const buildVariantImages = (vItem?: any): ProductImage[] => {
      const urls: string[] = [];
      const addUrl = (u: any) => {
        const str = typeof u === "string" ? u : u?.url;
        if (str && typeof str === "string" && str.trim() && !urls.includes(str.trim())) {
          urls.push(str.trim());
        }
      };

      // 1. Variant primary thumbnail / image
      if (vItem) {
        if (vItem.thumbnail) addUrl(vItem.thumbnail);
        if (vItem.mainImage) addUrl(vItem.mainImage);
        if (vItem.image) addUrl(vItem.image);
      }
      if (colorMedia?.mainImage) addUrl(colorMedia.mainImage);
      if (colorObj?.displayImage) addUrl(colorObj.displayImage);
      if (colorObj?.mainImage) addUrl(colorObj.mainImage);

      // 2. Variant specific gallery
      if (vItem && Array.isArray(vItem.images)) {
        vItem.images.forEach(addUrl);
      }
      if (vItem && Array.isArray(vItem.galleryImages)) {
        vItem.galleryImages.forEach(addUrl);
      }
      if (colorMedia && Array.isArray(colorMedia.gallery)) {
        colorMedia.gallery.forEach(addUrl);
      }
      if (colorObj && Array.isArray(colorObj.galleryImages)) {
        colorObj.galleryImages.forEach(addUrl);
      }

      // If variant has its own images, return ONLY them!
      if (urls.length > 0) {
        return urls.map((u, idx) => ({
          id: `img-var-${idx}`,
          url: u,
          alt: `${product.name} - ${selectedColor || "View"} ${idx + 1}`
        }));
      }

      // Fallback only if this variant has 0 images
      if (rootGallery.length > 0) {
        return rootGallery.map((u, idx) => ({
          id: `img-fallback-${idx}`,
          url: u,
          alt: `${product.name} View ${idx + 1}`
        }));
      }

      return [];
    };

    if (!product.variations || product.variations.length === 0) {
      const simpleImgs = buildVariantImages();
      return {
        id: "v-default",
        colorName: selectedColor || "Standard",
        colorHex: colorObj?.colorHex || colorMedia?.colorCode || "#C89B3C",
        size: selectedSize,
        thumbnail: simpleImgs[0]?.url || rootGallery[0] || "",
        price: prodAny.price || 799,
        originalPrice: prodAny.originalPrice || 1299,
        discountPercentage: 38,
        sku: product.defaultSku || "AWH-SKU-100",
        stock: 50,
        images: simpleImgs
      };
    }

    // 1. Try exact match for both Color AND Size
    const exactMatch = (product.variations || []).find(
      (v: any) =>
        v &&
        (v.colorName || (v as any).color || "").trim().toLowerCase() === (selectedColor || "").trim().toLowerCase() &&
        (((v.size || "").trim().toLowerCase() === (selectedSize || "").trim().toLowerCase()) ||
          ((v.sizeName || "").trim().toLowerCase() === (selectedSize || "").trim().toLowerCase()))
    );

    if (exactMatch) {
      const varImages = buildVariantImages(exactMatch);
      return {
        ...exactMatch,
        colorName: selectedColor || exactMatch.colorName,
        size: selectedSize,
        thumbnail: varImages[0]?.url || exactMatch.thumbnail || "",
        images: varImages
      };
    }

    // 2. Fallback to Color match
    const colorMatch = (product.variations || []).find(
      (v: any) => v && (v.colorName || (v as any).color || "").trim().toLowerCase() === (selectedColor || "").trim().toLowerCase()
    );

    if (colorMatch) {
      const varImages = buildVariantImages(colorMatch);
      return {
        ...colorMatch,
        colorName: selectedColor || colorMatch.colorName,
        size: selectedSize,
        thumbnail: varImages[0]?.url || colorMatch.thumbnail || "",
        images: varImages
      };
    }

    // 3. Synthesize variation matching selectedColor from colorObj/colorMedia/firstVar
    const firstVar = product.variations[0] || {};
    const synthImages = buildVariantImages(firstVar);
    return {
      id: `v-${(selectedColor || "std").toLowerCase()}`,
      colorName: selectedColor || "Standard",
      colorHex: colorObj?.colorHex || colorMedia?.colorCode || (firstVar as any).colorHex || "#C89B3C",
      size: selectedSize || (firstVar as any).size || "Standard Pair",
      thumbnail: synthImages[0]?.url || (firstVar as any).thumbnail || rootGallery[0] || "",
      price: (firstVar as any).price || prodAny.price || 799,
      originalPrice: (firstVar as any).originalPrice || prodAny.originalPrice || 1299,
      discountPercentage: (firstVar as any).discountPercentage || 38,
      sku: (firstVar as any).sku || product.defaultSku || `AH-${(selectedColor || "STD").toUpperCase()}`,
      stock: (firstVar as any).stock !== undefined ? (firstVar as any).stock : 50,
      images: synthImages
    };
  }, [product?.colors, (product as any)?.colorMediaConfigs, product?.variations, selectedColor, selectedSize, prodAny]);

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
      ...(product.colors || []).map((c: any) => c?.colorName || (c as any)?.name || (c as any)?.color),
      ...((product as any).colorMediaConfigs || []).map((cm: any) => cm?.colorName || cm?.name),
      ...(product.variations || []).map((v: any) => v?.colorName || (v as any)?.color)
    ].map((c: any) => (c || "").trim()).filter(Boolean);

    if (validColors.length > 0) {
      const colorExists = validColors.some(
        (cName) => cName.toLowerCase() === (selectedColor || "").trim().toLowerCase()
      );
      if (!colorExists) {
        const firstColor = validColors[0] || "Standard";
        setSelectedColor(firstColor);
        const colorObj = (product.colors || []).find(
          (c: any) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === (firstColor || "").toLowerCase()
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

  if (!product || !product.id) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
          <div className="w-16 h-16 bg-amber-50 text-brand-maroon rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-amber-200">
            !
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Product Not Found</h2>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            The requested product is currently unavailable, out of stock, or has been updated by the artisan.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-maroon text-white font-semibold text-sm shadow-md hover:bg-brand-maroon/90 transition-all cursor-pointer"
            >
              Explore All Handcrafted Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                  { id: "img-1", url: prodAny.mainImage || prodAny.image || "", alt: product.name }
                ]}
                sku={activeVariation.sku}
              />
            </div>

            {/* Right Column: Product Information (50% Width on Tablet & Laptop) */}
            <div className="w-full">
              <ProductInfo
                product={productWithDynamicReviews}
                activeVariation={activeVariation}
                selectedColor={selectedColor}
                onSelectVariation={(v) => {
                  const targetCol = v.colorName || (v as any).color || "Standard";
                  setSelectedColor(targetCol);
                  const colorObj = (product.colors || []).find(
                    (c: any) => c && (c.colorName || (c as any).name || (c as any).color || "").toLowerCase() === targetCol.toLowerCase()
                  );
                  const colorSizes = (colorObj?.sizes && colorObj.sizes.length > 0)
                    ? colorObj.sizes
                    : (product.variations || [])
                      .filter((varItem: any) => varItem && (varItem.colorName || (varItem as any).color || "").toLowerCase() === targetCol.toLowerCase())
                      .map((varItem: any) => varItem.size || varItem.sizeName)
                      .filter((s: any): s is string => Boolean(s));
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
          product={productWithDynamicReviews}
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
          reviewCount={currentReviewCount}
        />
        {/* BENEFITS SECTION */}
        {/* <BenefitsSection /> */}

       
        {/* RELATED PRODUCTS SECTION (Strictly matching current product's category/subcategory) */}
        <RelatedProductsSection currentProduct={product} />

        {/* CUSTOMER REVIEWS */}
        <div id="customer-reviews">
          <CustomerReviewsSection
            productId={product.id}
            productName={product.name}
            productRating={currentRating}
            productReviewCount={currentReviewCount}
            onReviewsUpdated={(newAvg, newCount) => {
              setCurrentRating(newAvg);
              setCurrentReviewCount(newCount);
            }}
          />
        </div>
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
