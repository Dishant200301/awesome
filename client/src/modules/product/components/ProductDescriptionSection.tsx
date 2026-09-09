import React, { useState, useMemo, useEffect } from "react";
import { FiUser, FiStar, FiCheckCircle, FiMessageSquare } from "react-icons/fi";
import { addCustomerReview, getLiveReviews, fetchLiveReviews, subscribeToReviewStore } from "@/modules/core/lib/apiStore";

interface ReviewItem {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
  email?: string;
  productId?: string;
  productName?: string;
}

interface ProductDescriptionSectionProps {
  product?: any;
  cards?: any[];
  selectedColor?: string;
  idealForPills?: string[];
  fullDescription?: string;
  shortDescription?: string;
  specifications?: Array<{ key: string; value: string }>;
  features?: string[];
  customAttributes?: Array<{ name: string; values: string[] }>;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  weight?: { value?: number; unit?: string };
  material?: string;
  color?: string;
  brand?: string;
  highlights?: any[];
  productAttributes?: any[];
  careInstructions?: string[];
  reviewCount?: number;
  reviews?: ReviewItem[];
}

export const ProductDescriptionSection: React.FC<ProductDescriptionSectionProps> = ({
  product,
  selectedColor,
  fullDescription,
  shortDescription,
  specifications = [],
  features = [],
  customAttributes = [],
  dimensions,
  weight,
  material,
  color,
  brand,
  highlights = [],
  productAttributes = [],
  careInstructions = [],
  cards = [],
  reviewCount,
  reviews = [],
}) => {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  // Reviews State - 100% Dynamic from live customer review store & admin
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(() => {
    return getLiveReviews(product?.id ? String(product.id) : undefined);
  });

  // Sync reviews dynamically whenever reviews are added, modified, or deleted
  useEffect(() => {
    const update = () => {
      const live = getLiveReviews(product?.id ? String(product.id) : undefined);
      setReviewsList(live);
    };

    update();
    fetchLiveReviews(product?.id ? String(product.id) : undefined).then(() => {
      update();
    });

    const unsub = subscribeToReviewStore(update);
    return () => {
      unsub();
    };
  }, [product?.id]);


  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewEmail.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const newReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: String(product?.id || "prod-live"),
        productName: product?.name || "Awesome Handmade Product",
        productImage: product?.mainImage || (product?.images && (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)) || (product?.variations && product.variations[0]?.thumbnail) || "",
        author: reviewName.trim().toUpperCase(),
        email: reviewEmail.trim().toLowerCase(),
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        rating: reviewRating,
        comment: reviewText.trim(),
      };

      await addCustomerReview(newReview);
      setReviewsList((prev) => [newReview, ...prev.filter((r) => r.id !== newReview.id)]);
      setReviewSubmitted(true);
      setTimeout(() => {
        setReviewName("");
        setReviewEmail("");
        setReviewText("");
        setReviewSubmitted(false);
      }, 3500);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  // 1. Dynamic Description Text from Admin / Product
  const rawDescription = useMemo(() => {
    return (
      fullDescription ||
      shortDescription ||
      product?.fullDescription ||
      product?.longDescription ||
      product?.shortDescription ||
      product?.description ||
      product?.extendedDetails?.description ||
      ""
    );
  }, [fullDescription, shortDescription, product]);

  const isHTML = useMemo(() => /<[a-z][\s\S]*>/i.test(rawDescription), [rawDescription]);

  // 2. Dynamic Product Highlights strictly from Admin
  const activeHighlights = useMemo(() => {
    const list: string[] = [];

    // From direct features prop or product.features
    const allFeatures = [...(features || []), ...(product?.features || [])];
    allFeatures.forEach((f) => {
      if (typeof f === "string" && f.trim() && !list.includes(f.trim())) {
        list.push(f.trim());
      }
    });

    // From direct highlights prop or product.highlights
    const allHighlights = [...(highlights || []), ...(product?.highlights || [])];
    allHighlights.forEach((h) => {
      let str = "";
      if (typeof h === "string") str = h.trim();
      else if (h && typeof h === "object") {
        str = (h.value || h.text || h.desc || h.title || h.label || "").trim();
      }
      if (str && !list.includes(str)) {
        list.push(str);
      }
    });

    // From productAttributes where showInHighlights is true
    const allAttributes = [...(productAttributes || []), ...(product?.productAttributes || [])];
    allAttributes.forEach((attr) => {
      if (attr && (attr.showInHighlights || attr.inHighlights)) {
        const val = Array.isArray(attr.value) ? attr.value.join(", ") : String(attr.value || "");
        const label = attr.attributeName || attr.name || "";
        const combined = label ? `${label}: ${val}` : val;
        if (combined && !list.includes(combined)) {
          list.push(combined);
        }
      }
    });

    return list;
  }, [features, highlights, productAttributes, product]);

  // 3. Dynamic Material & Craft Details strictly from Admin
  const craftDetails = useMemo(() => {
    const allCustomAttrs = [...(customAttributes || []), ...(product?.customAttributes || [])];
    const allSpecs = [...(specifications || []), ...(product?.specifications || [])];

    const findAttrOrSpec = (regex: RegExp) => {
      const foundAttr = allCustomAttrs.find((a) => a && regex.test(a.name || ""));
      if (foundAttr && foundAttr.values?.length) return foundAttr.values.join(", ");
      const foundSpec = allSpecs.find((s) => s && regex.test(s.key || ""));
      if (foundSpec && foundSpec.value) return String(foundSpec.value);
      return "";
    };

    const primaryMaterial =
      material ||
      product?.material ||
      product?.extendedDetails?.materialDetails ||
      findAttrOrSpec(/material|fabric|cloth/i);

    const embellishments =
      findAttrOrSpec(/embellish|work|mirror|bead|zari|sequin|ghungroo|tassel/i) ||
      product?.embellishments;

    const craftTechnique =
      findAttrOrSpec(/technique|craft|stitch|weave|art/i) ||
      product?.craftType ||
      product?.technique;

    const artisanMade =
      findAttrOrSpec(/artisan|handmade/i) ||
      (product?.isArtisanMade !== undefined ? (product.isArtisanMade ? "Yes" : "No") : undefined);

    const hasAnyCraftDetail = Boolean(primaryMaterial || embellishments || craftTechnique || artisanMade);

    return {
      primaryMaterial,
      embellishments,
      craftTechnique,
      artisanMade,
      hasAnyCraftDetail,
    };
  }, [material, customAttributes, specifications, product]);

  // 4. Dynamic Care Instructions strictly from Admin
  const activeCare = useMemo(() => {
    const directCare = careInstructions?.length ? careInstructions : product?.extendedDetails?.careInstructions;
    const prodCare = product?.careInstructions;
    if (directCare && directCare.length > 0) return directCare.filter(Boolean);
    if (prodCare && prodCare.length > 0) return prodCare.filter(Boolean);
    return [];
  }, [careInstructions, product]);

  // 5. Dynamic Description Cards from Admin
  const activeCards = useMemo(() => {
    const directCards = cards?.length ? cards : product?.descriptionCards;
    return directCards && directCards.length > 0 ? directCards : [];
  }, [cards, product]);

  // 6. Dynamic Specifications Table strictly from Admin
  const specTable = useMemo(() => {
    const table: Array<{ key: string; value: string }> = [];

    const brandName = brand || product?.brand;
    if (brandName) {
      table.push({ key: "Brand", value: brandName });
    }

    const category = product?.category || product?.categories?.[0];
    if (category) {
      table.push({ key: "Category", value: String(category) });
    }

    const subCategory = product?.subcategory || product?.subCategory;
    if (subCategory) {
      table.push({ key: "Sub-Category", value: String(subCategory) });
    }

    if (product?.productType) {
      table.push({ key: "Product Type", value: String(product.productType) });
    }

    if (craftDetails.primaryMaterial) {
      table.push({ key: "Material", value: craftDetails.primaryMaterial });
    }

    const activeColor = color || selectedColor || product?.color;
    if (activeColor) {
      table.push({ key: "Color", value: String(activeColor) });
    }

    if (craftDetails.craftTechnique) {
      table.push({ key: "Craft Technique", value: craftDetails.craftTechnique });
    }

    if (craftDetails.embellishments) {
      table.push({ key: "Embellishments", value: craftDetails.embellishments });
    }

    if (craftDetails.artisanMade) {
      table.push({ key: "Artisan Made", value: craftDetails.artisanMade });
    }

    // Dynamic Dimensions
    const dims = dimensions || product?.dimensions;
    if (dims && (dims.length || dims.width || dims.height)) {
      table.push({
        key: "Dimensions",
        value: `${dims.length || 0} × ${dims.width || 0} × ${dims.height || 0} ${dims.unit || "cm"}`,
      });
    }

    // Dynamic Weight
    const wt = weight || product?.weight;
    if (wt && (wt.value || typeof wt === "number")) {
      const val = typeof wt === "number" ? wt : wt.value;
      const unit = typeof wt === "object" ? wt.unit || "g" : "g";
      table.push({ key: "Weight", value: `${val} ${unit}` });
    }

    // Custom Specs from Admin
    const allSpecs = [...(specifications || []), ...(product?.specifications || [])];
    allSpecs.forEach((s) => {
      if (s && s.key && s.value && !table.some((r) => r.key.toLowerCase() === s.key.toLowerCase())) {
        table.push({ key: s.key, value: String(s.value) });
      }
    });

    // Custom Attributes from Admin
    const allCustomAttrs = [...(customAttributes || []), ...(product?.customAttributes || [])];
    allCustomAttrs.forEach((ca) => {
      if (
        ca &&
        ca.name &&
        ca.values &&
        ca.values.length > 0 &&
        !table.some((r) => r.key.toLowerCase() === ca.name.toLowerCase())
      ) {
        table.push({ key: ca.name, value: ca.values.join(", ") });
      }
    });

    // Product Attributes from Admin
    const allProdAttrs = [...(productAttributes || []), ...(product?.productAttributes || [])];
    allProdAttrs.forEach((pa) => {
      const name = pa?.attributeName || pa?.name;
      if (name && pa?.value && !table.some((r) => r.key.toLowerCase() === name.toLowerCase())) {
        const valStr = Array.isArray(pa.value) ? pa.value.join(", ") : String(pa.value);
        table.push({ key: name, value: valStr });
      }
    });

    // Extended Details Specifications
    if (product?.extendedDetails?.specifications) {
      Object.entries(product.extendedDetails.specifications).forEach(([k, v]) => {
        if (k && v && !table.some((r) => r.key.toLowerCase() === k.toLowerCase())) {
          table.push({ key: k, value: String(v) });
        }
      });
    }

    return table;
  }, [brand, color, selectedColor, dimensions, weight, specifications, customAttributes, productAttributes, craftDetails, product]);

  const totalReviewsCount = reviewsList.length;
  const hasDescriptionContent = Boolean(
    rawDescription || activeHighlights.length > 0 || craftDetails.hasAnyCraftDetail || activeCare.length > 0 || activeCards.length > 0
  );

  return (
    <section
      id="product-description"
      className="w-full py-8 md:py-12 px-4 sm:px-6 md:px-8 max-w-[1250px] mx-auto font-sans text-neutral-900 scroll-mt-24"
    >
      {/* Tabs Navigation - 100% Responsive for Mobile, Tablet, and Desktop */}
      <div className="border-b border-zinc-200">
        <div className="flex items-center justify-start gap-4 sm:gap-8 md:gap-12 overflow-x-auto scrollbar-none whitespace-nowrap pb-0.5">
          {/* 1. Description Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-xs sm:text-sm md:text-base lg:text-lg transition-all cursor-pointer relative font-bold uppercase tracking-wider shrink-0 ${
              activeTab === "description"
                ? "text-brand-maroon font-bold"
                : "text-zinc-400 hover:text-brand-maroon font-medium"
            }`}
          >
            Description
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-maroon rounded-full" />
            )}
          </button>

          {/* 2. Reviews Tab */}
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-xs sm:text-sm md:text-base lg:text-lg transition-all cursor-pointer relative font-bold uppercase tracking-wider shrink-0 ${
              activeTab === "reviews"
                ? "text-brand-maroon font-bold"
                : "text-zinc-400 hover:text-brand-maroon font-medium"
            }`}
          >
            Reviews ({totalReviewsCount})
            {activeTab === "reviews" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-maroon rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT PANELS - Left-aligned on Laptop/Desktop */}
      <div className="pt-8 md:pt-10 max-w-full lg:max-w-4xl lg:mx-0 mx-auto text-left">
        {/* ========================================================================= */}
        {/* TAB 1: DESCRIPTION */}
        {/* ========================================================================= */}
        {activeTab === "description" && (
          <div className="space-y-8 text-zinc-700 text-sm sm:text-base leading-relaxed font-sans">
            {/* Dynamic Full / Short Description Text from Admin */}
            {rawDescription ? (
              <div className="space-y-4 pt-2">
                {!rawDescription.toLowerCase().includes("product overview") && (
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 tracking-wider uppercase">
                    Product Overview
                  </h3>
                )}
                {isHTML ? (
                  <div
                    className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed text-sm sm:text-base font-sans [&_h1]:text-lg sm:[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-zinc-900 [&_h1]:mt-6 [&_h1]:mb-3 [&_h1:first-child]:mt-0 [&_h2]:text-base sm:[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-zinc-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2:first-child]:mt-0 [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-bold [&_h3]:text-zinc-900 [&_h3]:tracking-wider [&_h3]:uppercase [&_h3]:mt-6 [&_h3]:mb-3 [&_h3:first-child]:mt-0 [&_p]:mb-3.5 [&_p]:leading-relaxed [&_p]:text-zinc-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_ol]:space-y-2 [&_li]:leading-relaxed [&_li]:text-zinc-700 [&_strong]:text-zinc-900 [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{ __html: rawDescription }}
                  />
                ) : (
                  <p className="text-zinc-700 leading-relaxed text-sm sm:text-base whitespace-pre-line font-sans">
                    {rawDescription}
                  </p>
                )}
              </div>
            ) : null}

            {/* Dynamic Product Highlights from Admin */}
            {activeHighlights.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 tracking-wider uppercase ">
                  Product Highlights
                </h3>
                <ul className="space-y-2.5 text-zinc-800 list-none font-sans">
                  {activeHighlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-brand-maroon font-bold select-none text-base leading-snug shrink-0">•</span>
                      <span className="text-sm sm:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dynamic Material & Craft Details from Admin */}
            {craftDetails.hasAnyCraftDetail && (
              <div className="space-y-3 pt-2">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 tracking-wider uppercase ">
                  Material &amp; Craft Details
                </h3>
                <ul className="space-y-2.5 text-zinc-800 list-none text-sm sm:text-base font-sans">
                  {craftDetails.primaryMaterial && (
                    <li className="flex items-start gap-2.5">
                      <span className="text-brand-maroon font-bold select-none text-base leading-snug shrink-0">•</span>
                      <span>
                        <strong className="text-zinc-900 font-semibold">Primary Material:</strong>{" "}
                        {craftDetails.primaryMaterial}
                      </span>
                    </li>
                  )}
                  {craftDetails.embellishments && (
                    <li className="flex items-start gap-2.5">
                      <span className="text-brand-maroon font-bold select-none text-base leading-snug shrink-0">•</span>
                      <span>
                        <strong className="text-zinc-900 font-semibold">Embellishments &amp; Detailing:</strong>{" "}
                        {craftDetails.embellishments}
                      </span>
                    </li>
                  )}
                  {craftDetails.craftTechnique && (
                    <li className="flex items-start gap-2.5">
                      <span className="text-brand-maroon font-bold select-none text-base leading-snug shrink-0">•</span>
                      <span>
                        <strong className="text-zinc-900 font-semibold">Craft Technique:</strong>{" "}
                        {craftDetails.craftTechnique}
                      </span>
                    </li>
                  )}
                  {craftDetails.artisanMade && (
                    <li className="flex items-start gap-2.5">
                      <span className="text-brand-maroon font-bold select-none text-base leading-snug shrink-0">•</span>
                      <span>
                        <strong className="text-zinc-900 font-semibold">Artisan Made:</strong>{" "}
                        {craftDetails.artisanMade}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Dynamic Care Instructions from Admin */}
            {activeCare.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 tracking-wider uppercase ">
                  Care &amp; Maintenance
                </h3>
                <ul className="space-y-2 text-zinc-800 list-none text-sm sm:text-base font-sans">
                  {activeCare.map((instruction: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-brand-maroon font-bold select-none text-base leading-snug shrink-0">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>

              </div>
            )}

            {/* Empty State if Admin hasn't added description yet */}
            {!hasDescriptionContent && (
              <div className="text-center py-12 text-zinc-500 text-sm font-sans">
                No description has been added for this product yet.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REVIEWS */}
        {/* ========================================================================= */}
        {activeTab === "reviews" && (
          <div className="space-y-10 font-sans">
            {/* Reviews List */}
            {reviewsList.length > 0 ? (
              <div className="space-y-6 divide-y divide-zinc-100">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="pt-6 first:pt-0 flex items-start gap-4">
                    {/* Avatar Icon */}
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                      <FiUser size={20} />
                    </div>

                    {/* Review Content */}
                    <div className="space-y-1 flex-1">
                      {/* Stars Rating in Amber/Gold */}
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={13}
                            className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}
                          />
                        ))}
                      </div>

                      {/* Author & Date */}
                      <div className="text-xs text-zinc-500 font-sans">
                        <strong className="text-zinc-900 uppercase font-bold tracking-wider mr-2 ">
                          {rev.author}
                        </strong>
                        <span>{rev.date}</span>
                      </div>

                      {/* Comment Text */}
                      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pt-1 font-sans">
                        {rev.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50/70 border border-dashed border-zinc-200 rounded-xl space-y-2 font-sans">
                <FiMessageSquare className="mx-auto text-zinc-400" size={28} />
                <p className="text-sm font-semibold text-zinc-800">There are no reviews yet.</p>
                <p className="text-xs text-zinc-500">Be the first to write a review for this product!</p>
              </div>
            )}

            <hr className="border-zinc-200" />

            {/* ADD A REVIEW FORM */}
            <div className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-wider text-brand-maroon uppercase ">
                  Add a Review
                </h3>
                <p className="text-xs text-zinc-500 font-normal font-sans">
                  Your email address will not be published. Required fields are marked *
                </p>
              </div>

              {reviewSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-sm font-medium flex items-center gap-2 font-sans">
                  <FiCheckCircle className="text-emerald-600 shrink-0" size={18} />
                  <span>Thank you! Your review has been submitted successfully and added.</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs sm:text-sm font-sans">
                  {/* Name and Email 2-column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Name *"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon/20 text-zinc-900 bg-white placeholder:text-zinc-400 font-sans"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email *"
                        value={reviewEmail}
                        onChange={(e) => setReviewEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-zinc-300 rounded focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon/20 text-zinc-900 bg-white placeholder:text-zinc-400 font-sans"
                      />
                    </div>
                  </div>

                  {/* Star Rating Selector */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-zinc-700 font-medium">Your Rating *</span>
                    <div className="flex text-amber-400 gap-1 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none cursor-pointer"
                        >
                          <FiStar
                            size={16}
                            className={star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Textarea */}
                  <div>
                    <textarea
                      required
                      rows={5}
                      placeholder="Your review *"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-zinc-300 rounded focus:outline-none focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon/20 text-zinc-900 bg-white placeholder:text-zinc-400 resize-y font-sans"
                    />
                  </div>

                  {/* Save info Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="save-review-info"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="rounded border-zinc-300 text-brand-maroon focus:ring-brand-maroon accent-brand-maroon cursor-pointer"
                    />
                    <label htmlFor="save-review-info" className="text-xs text-zinc-600 cursor-pointer select-none">
                      Save my name, email, and website in this browser for the next time I comment.
                    </label>
                  </div>

                  {/* Submit Button in Brand Maroon */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2.5 bg-brand-maroon hover:bg-[#3d0412] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDescriptionSection;
