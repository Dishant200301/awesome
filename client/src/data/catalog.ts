// Awesome Handmade - Complete Catalog Data & 18 Categories

export const LOGO = "/images/common/logo.png";

// Image placeholders & local assets
export const IMG = {
  hero1: "/images/home/hero/hero-1.webp",
  hero2: "/images/home/hero/hero-2.webp",
  hero3: "/images/home/hero/hero-3.webp",
  hero4: "/images/home/hero/hero-4.webp",
  hero5: "/images/home/hero/hero-5.webp",
  banner: "/images/banner/banner.webp",
  colLatkan: "/images/category/Latkan.webp",
  colJewellery: "/images/category/Necklace.webp",
  colCholi: "/images/category/Choli.webp",
  colHair: "/images/category/Gift Hamper.webp",
  colGift: "/images/category/Gift Hamper.webp",
  colTraditional: "/images/hero_twirl_tradition.jpg",
  colEarrings: "/images/category/Earrings.webp",
  colMacrame: "/images/grace_every_thread.jpg",
  pKeychain: "/images/category/Gift Hamper.webp",
  pLatkan: "/images/category/Latkan.webp",
  pEarrings: "/images/category/Earrings.webp",
  pNecklace: "/images/category/Necklace.webp",
  pHairBow: "/images/category/Gift Hamper.webp",
  pCholi: "/images/category/Choli.webp",
  pBracelet: "/images/category/Bracelet.webp",
  pJewellerySet: "/images/category/Necklace.webp",
  pAnklet: "/images/category/Anklet.webp",
  pMacrame: "/images/grace_every_thread.jpg",
  t1: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  t2: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  t3: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  r1: "/images/category/Latkan.webp",
  r2: "/images/category/Gift Hamper.webp",
  r3: "/images/category/Earrings.webp",
  r4: "/images/category/Choli.webp",
  r5: "/images/category/Necklace.webp",
};

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  image: string;
  subs: SubCategory[];
  count?: number;
}

// Exactly 12 Master Categories with full subcategory hierarchy
export const categories: Category[] = [
  {
    name: "Gift Hamper",
    slug: "gift-hamper",
    image: "/images/category/Gift Hamper.webp",
    subs: [
      { name: "Keychain", slug: "keychain" },
    ],
  },
  {
    name: "Choli",
    slug: "choli",
    image: "/images/category/Choli.webp",
    subs: [
      { name: "Kids Choli", slug: "kids-choli" },
      { name: "Adult Choli", slug: "adult-choli" },
    ],
  },
  {
    name: "Krishna Outfit",
    slug: "krishna-outfit",
    image: "/images/category/Krishna outfit.webp",
    subs: [],
  },
  {
    name: "Necklace",
    slug: "necklace",
    image: "/images/category/Necklace.webp",
    subs: [
      { name: "Mirror Necklace", slug: "mirror-necklace" },
    ],
  },
  {
    name: "Latkan",
    slug: "latkan",
    image: "/images/category/Latkan.webp",
    subs: [
      { name: "Mirror Latkan", slug: "mirror-latkan" },
      { name: "Blouse Latkan", slug: "blouse-latkan" },
      { name: "Mirror Wall Decor", slug: "mirror-wall-decor" },
      { name: "Fabric Latkan", slug: "fabric-latkan" },
      { name: "Golden Latkan", slug: "golden-latkan" },
      { name: "Crochet Latkan", slug: "crochet-latkan" },
    ],
  },
  {
    name: "Tassel",
    slug: "tassel",
    image: "/images/category/Tassel.webp",
    subs: [
      { name: "Long Tassels", slug: "long-tassels" },
    ],
  },
  {
    name: "Hair Accessories",
    slug: "hair-accessories",
    image: "/images/category/Hair_Accessories.webp",
    subs: [
      { name: "Hair Bow", slug: "hair-bow" },
      { name: "Hair Clip", slug: "hair-clip" },
      { name: "Hair Band", slug: "hair-band" },
    ],
  },
  {
    name: "Watch",
    slug: "watch",
    image: "/images/category/Watch.webp",
    subs: [
      { name: "Kids Watch", slug: "kids-watch" },
      { name: "Traditional Watch", slug: "traditional-watch" },
    ],
  },
  {
    name: "Bracelet",
    slug: "bracelet",
    image: "/images/category/Bracelet.webp",
    subs: [],
  },
  {
    name: "Waist Belt",
    slug: "waist-belt",
    image: "/images/category/Waist Belt.webp",
    subs: [
      { name: "Mirror Waist Belt", slug: "mirror-waist-belt" },
    ],
  },
  {
    name: "Earrings",
    slug: "earrings",
    image: "/images/category/Earrings.webp",
    subs: [
      { name: "Mirror Earrings", slug: "mirror-earrings" },
      { name: "Hoop Earrings", slug: "hoop-earrings" },
    ],
  },
  {
    name: "Anklet",
    slug: "anklet",
    image: "/images/category/Anklet.webp",
    subs: [],
  },
];

export const heroSlides = [IMG.hero1, IMG.hero2, IMG.hero3, IMG.hero4, IMG.hero5];

export const collections = [
  { name: "Bridal & Festive Edit", slug: "jewellery-set", image: "/images/hero_twirl_tradition.jpg", description: "Royal mirror & Kundan sets" },
  { name: "Mirror Latkan Studio", slug: "latkan", image: "/images/category/Latkan.webp", description: "Handcrafted in Surat" },
  { name: "Navratri Choli Collection", slug: "choli", image: "/images/category/Choli.webp", description: "Vibrant Gujarati mirror embroidery" },
  { name: "Artisan Gifts & Hampers", slug: "gift-hamper", image: "/images/category/Gift Hamper.webp", description: "Personalized macrame & festive boxes" },
  { name: "Traditional Earrings", slug: "earrings", image: "/images/category/Earrings.webp", description: "Jhumkas, studs & chandeliers" },
  { name: "Macrame & Wall Hangings", slug: "macrame-hanging", image: "/images/grace_every_thread.jpg", description: "Hand-knotted pure cotton craft" },
];

export const FEATURED_CURATED_CATEGORIES = [
  {
    key: 'choli',
    title: 'NAVRATRI CHOLI',
    subtitle: 'Vibrant mirror embroidery & traditional craftsmanship',
    tag: 'EXPLORE CHOLIS',
    img: '/images/category/Choli.webp',
    badge: 'Trending'
  },
  {
    key: 'latkan',
    title: 'MIRROR LATKANS',
    subtitle: 'Signature bridal & blouse latkans handcrafted in Surat',
    tag: 'SHOP LATKANS',
    img: '/images/category/Latkan.webp',
    badge: 'Artisan Special'
  },
  {
    key: 'earrings',
    title: 'KUNDAN EARRINGS',
    subtitle: 'Lightweight festive jhumkas & traditional studs',
    tag: 'VIEW EARRINGS',
    img: '/images/category/Earrings.webp',
    badge: 'Best Seller'
  },
  {
    key: 'gift-hamper',
    title: 'FESTIVE HAMPERS',
    subtitle: 'Personalized macrame keychains & festive boxes',
    tag: 'EXPLORE GIFTS',
    img: '/images/category/Gift Hamper.webp',
    badge: 'Customizable'
  },
  {
    key: 'necklace',
    title: 'ROYAL NECKLACES',
    subtitle: 'Multi-strand beaded & mirror bridal necklaces',
    tag: 'SHOP NECKLACES',
    img: '/images/category/Necklace.webp',
    badge: 'Heirloom'
  },
  {
    key: 'tassel',
    title: 'LONG TASSELS',
    subtitle: 'Colourful handmade tassels for dupattas & dresses',
    tag: 'SHOP TASSELS',
    img: '/images/category/Tassel.webp',
    badge: 'Festive Must'
  },
];

export interface CatalogProduct {
  id: string;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  category: string;
  categoryName: string;
  subCategory?: string;
  image: string;
  images: string[];
  isNew: boolean;
  isBest: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  fullDescription?: string;
  material?: string;
  inStock: boolean;
  stock?: number;
  brand: string;
  availableSizes?: string[];
  colors?: { name: string; hex: string; image?: string }[];
}

export const products: CatalogProduct[] = [
  {
    id: "ah-prod-1",
    sku: "AWH-LTK-001",
    name: "Royal Mirror Latkan Pair with Golden Beads",
    price: 499,
    originalPrice: 999,
    discountPercentage: 50,
    category: "latkan",
    categoryName: "Latkan",
    subCategory: "mirror-latkan",
    image: "/images/category/Latkan.webp",
    images: ["/images/category/Latkan.webp", "/images/hero_twirl_tradition.jpg", "/images/category/Tassel.webp"],
    isNew: true,
    isBest: true,
    rating: 4.9,
    reviewsCount: 128,
    description: "Handcrafted mirror work bridal latkan pair crafted with golden zari thread, beads and artisanal embellishments in Surat, Gujarat.",
    fullDescription: "Elevate your lehengas, dupattas, and designer blouses with our signature Royal Mirror Latkan Pair. Each latkan is delicately hand-strung by master artisans using authentic glass mirrors, resham thread, and anti-tarnish golden beads.",
    material: "Glass Mirrors, Silk Resham Thread, Golden Beads",
    inStock: true,
    stock: 45,
    brand: "Awesome Handmade",
    availableSizes: ["Standard Pair"],
    colors: [
      { name: "Gold & Maroon", hex: "#520618", image: "/images/category/Latkan.webp", displayImage: "/images/category/Latkan.webp", mainImage: "/images/category/Latkan.webp" },
      { name: "Royal Gold", hex: "#C89B3C", image: "/images/category/Latkan.webp", displayImage: "/images/category/Latkan.webp", mainImage: "/images/category/Latkan.webp" },
      { name: "Emerald Green", hex: "#1A5235", image: "/images/category/Latkan.webp", displayImage: "/images/category/Latkan.webp", mainImage: "/images/category/Latkan.webp" },
    ]
  },
  {
    id: "ah-prod-2",
    sku: "AWH-EAR-002",
    name: "Handmade Mirror Jhumka Earrings",
    price: 349,
    originalPrice: 699,
    discountPercentage: 50,
    category: "earrings",
    categoryName: "Earrings",
    subCategory: "mirror-earrings",
    image: "/images/category/Earrings.webp",
    images: ["/images/category/Earrings.webp", "/images/category/Necklace.webp"],
    isNew: true,
    isBest: true,
    rating: 4.8,
    reviewsCount: 94,
    description: "Lightweight handcrafted mirror jhumkas featuring delicate ghungroos and traditional Indian beadwork.",
    material: "Real Mirrors, Brass Alloy, Lightweight Beads",
    inStock: true,
    stock: 60,
    brand: "Awesome Handmade",
    availableSizes: ["Standard"],
    colors: [
      { name: "Multicolor", hex: "#E1306C", image: "/images/category/Earrings.webp" },
      { name: "Gold", hex: "#C89B3C", image: "/images/category/Earrings.webp" },
    ]
  },
  {
    id: "ah-prod-3",
    sku: "AWH-CHL-003",
    name: "Navratri Gujarati Mirror Work Kids Choli",
    price: 899,
    originalPrice: 1799,
    discountPercentage: 50,
    category: "choli",
    categoryName: "Choli",
    subCategory: "kids-choli",
    image: "/images/category/Choli.webp",
    images: ["/images/category/Choli.webp", "/images/hero_twirl_tradition.jpg"],
    isNew: true,
    isBest: true,
    rating: 5.0,
    reviewsCount: 76,
    description: "Authentic Gujarati handmade Chaniya Choli with intricate Kutchi mirror embroidery and vibrant border latkans.",
    material: "100% Pure Cotton with Real Mirror Embroidery",
    inStock: true,
    stock: 25,
    brand: "Awesome Handmade",
    availableSizes: ["2-3 Y", "4-5 Y", "6-7 Y", "8-9 Y", "10-12 Y"],
    colors: [
      { name: "Festive Red & Yellow", hex: "#D62246", image: "/images/category/Choli.webp" },
      { name: "Royal Peacock Blue", hex: "#004F7A", image: "/images/category/Choli.webp" },
    ]
  },
  {
    id: "ah-prod-4",
    sku: "AWH-NEC-004",
    name: "Artisan Bridal Mirror Necklace Set",
    price: 799,
    originalPrice: 1599,
    discountPercentage: 50,
    category: "necklace",
    categoryName: "Necklace",
    subCategory: "mirror-necklace",
    image: "/images/category/Necklace.webp",
    images: ["/images/category/Necklace.webp", "/images/category/Earrings.webp"],
    isNew: false,
    isBest: true,
    rating: 4.9,
    reviewsCount: 112,
    description: "Statement multi-layer handmade choker necklace crafted with circular mirrors and hand-woven dori cord.",
    material: "Mirror Craft, Resham Thread, Adjustable Dori",
    inStock: true,
    stock: 30,
    brand: "Awesome Handmade",
    availableSizes: ["Free Size Adjustable"],
  },
  {
    id: "ah-prod-5",
    sku: "AWH-GFT-005",
    name: "Handcrafted Macrame Keychain Gift Hamper",
    price: 599,
    originalPrice: 1199,
    discountPercentage: 50,
    category: "gift-hamper",
    categoryName: "Gift Hamper",
    subCategory: "keychain",
    image: "/images/category/Gift Hamper.webp",
    images: ["/images/category/Gift Hamper.webp", "/images/grace_every_thread.jpg"],
    isNew: true,
    isBest: false,
    rating: 4.9,
    reviewsCount: 65,
    description: "Curated gift box featuring handmade macrame charm keychains, festive note and luxury artisan packaging.",
    material: "Eco-friendly Cotton Cord, Brass Ring, Kraft Box",
    inStock: true,
    stock: 50,
    brand: "Awesome Handmade",
    availableSizes: ["Hamper Box (Set of 3)"],
  },
  {
    id: "ah-prod-6",
    sku: "AWH-BRC-006",
    name: "Handmade Mirror Beaded Bracelet",
    price: 249,
    originalPrice: 499,
    discountPercentage: 50,
    category: "bracelet",
    categoryName: "Bracelet",
    image: "/images/category/Bracelet.webp",
    images: ["/images/category/Bracelet.webp"],
    isNew: false,
    isBest: true,
    rating: 4.7,
    reviewsCount: 48,
    description: "Bohemian handcrafted wristband bracelet with colorful pom-poms, mirror charms and tassel ties.",
    material: "Pom-Poms, Mirrors, Braided Thread",
    inStock: true,
    stock: 75,
    brand: "Awesome Handmade",
    availableSizes: ["Adjustable Free Size"],
  },
  {
    id: "ah-prod-7",
    sku: "AWH-ANK-007",
    name: "Traditional Ghungroo Payal Anklet Pair",
    price: 299,
    originalPrice: 599,
    discountPercentage: 50,
    category: "anklet",
    categoryName: "Anklet",
    image: "/images/category/Anklet.webp",
    images: ["/images/category/Anklet.webp"],
    isNew: true,
    isBest: false,
    rating: 4.8,
    reviewsCount: 38,
    description: "Hand-beaded festive anklet payal with melodious sounding ghungroo bells and vibrant threaded motifs.",
    material: "Brass Ghungroo, Cotton Thread",
    inStock: true,
    stock: 40,
    brand: "Awesome Handmade",
    availableSizes: ["Standard Pair (10 inch)"],
  },
  {
    id: "ah-prod-8",
    sku: "AWH-WST-008",
    name: "Kamarbandh Mirror Waist Belt",
    price: 649,
    originalPrice: 1299,
    discountPercentage: 50,
    category: "waist-belt",
    categoryName: "Waist Belt",
    subCategory: "mirror-waist-belt",
    image: "/images/category/Waist Belt.webp",
    images: ["/images/category/Waist Belt.webp", "/images/category/Choli.webp"],
    isNew: true,
    isBest: true,
    rating: 4.9,
    reviewsCount: 52,
    description: "Royal handcrafted waist belt featuring embroidered mirror medallions and hanging side latkan tassels.",
    material: "Velvet Base, Real Mirrors, Zari Thread",
    inStock: true,
    stock: 35,
    brand: "Awesome Handmade",
    availableSizes: ["Free Size (26-38 inch)"],
  },
  {
    id: "ah-prod-9",
    sku: "AWH-KRI-009",
    name: "Handmade Bal Gopal Krishna Outfit Set",
    price: 499,
    originalPrice: 999,
    discountPercentage: 50,
    category: "krishna-outfit",
    categoryName: "Krishna Outfit",
    image: "/images/category/Krishna outfit.webp",
    images: ["/images/category/Krishna outfit.webp"],
    isNew: true,
    isBest: true,
    rating: 5.0,
    reviewsCount: 81,
    description: "Delicately embroidered Kanha dress set with Mukut, Morpankh latkan, and matching handmade patka.",
    material: "Silk Brocade, Zari Borders, Stone Work",
    inStock: true,
    stock: 40,
    brand: "Awesome Handmade",
    availableSizes: ["No. 0-1", "No. 2-3", "No. 4-5", "No. 6"],
  },
  {
    id: "ah-prod-10",
    sku: "AWH-WTC-010",
    name: "Handcrafted Traditional Watch Strap",
    price: 399,
    originalPrice: 799,
    discountPercentage: 50,
    category: "watch",
    categoryName: "Watch",
    subCategory: "traditional-watch",
    image: "/images/category/Watch.webp",
    images: ["/images/category/Watch.webp"],
    isNew: false,
    isBest: false,
    rating: 4.6,
    reviewsCount: 29,
    description: "Ethnic watch accessory with embroidered fabric band and decorative mirror accents.",
    material: "Embroidered Fabric & Dial",
    inStock: true,
    stock: 30,
    brand: "Awesome Handmade",
    availableSizes: ["Universal Fit"],
  },
  {
    id: "ah-prod-11",
    sku: "AWH-TAS-011",
    name: "Pair of Long Multicolour Silk Tassels",
    price: 299,
    originalPrice: 599,
    discountPercentage: 50,
    category: "tassel",
    categoryName: "Tassel",
    subCategory: "long-tassels",
    image: "/images/category/Tassel.webp",
    images: ["/images/category/Tassel.webp"],
    isNew: false,
    isBest: true,
    rating: 4.9,
    reviewsCount: 67,
    description: "Flowing silk fringe long tassels designed for heavy bridal dupattas, blouses, and curtains.",
    material: "Pure Art Silk Thread",
    inStock: true,
    stock: 80,
    brand: "Awesome Handmade",
    availableSizes: ["12 Inch Long Pair"],
  },
  {
    id: "ah-prod-12",
    sku: "AWH-MAC-012",
    name: "Boho Cotton Macrame Wall Hanging",
    price: 849,
    originalPrice: 1699,
    discountPercentage: 50,
    category: "macrame-hanging",
    categoryName: "Macrame Hanging",
    image: "/images/grace_every_thread.jpg",
    images: ["/images/grace_every_thread.jpg", "/images/category/Gift Hamper.webp"],
    isNew: true,
    isBest: true,
    rating: 5.0,
    reviewsCount: 44,
    description: "100% natural cotton hand-knotted Bohemian tapestry with wooden dowel rod for home and studio decor.",
    material: "100% Natural Cotton Rope & Solid Wood",
    inStock: true,
    stock: 20,
    brand: "Awesome Handmade",
    availableSizes: ["18 x 32 inch"],
  },
];
