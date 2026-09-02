/**
 * Smart Local Product Content & Context Automation Engine
 * Generates tailored, non-repeating, domain-accurate descriptions, specifications,
 * SEO metadata, and pricing based on Product Title, Category, and Subcategory.
 * Runs 100% offline without external paid APIs.
 */

export interface GeneratedProductContent {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  specifications: Array<{ id: string; key: string; value: string }>;
  suggestedCategory: string;
  suggestedSubcategory: string;
  suggestedRegularPrice: number;
  suggestedSalePrice: number;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  detectedColors: Array<{ name: string; hex: string }>;
}

interface DomainKnowledge {
  domainKey: string;
  keywords: string[];
  craftName: string;
  materials: string[][];
  techniques: string[][];
  occasions: string[][];
  highlights: string[][];
  stylingTips: string[];
  careOptions: string[][];
}

const DOMAIN_KNOWLEDGE: DomainKnowledge[] = [
  // 1. LATKAN & TASSELS
  {
    domainKey: 'latkan',
    keywords: ['latkan', 'tassel', 'blouse hanging', 'dupatta hanging', 'lehenga latkan', 'choli tassel', 'kodi latkan', 'mirror latkan', 'pom pom'],
    craftName: 'Handcrafted Designer Latkan & Tassels',
    materials: [
      ['Pure Silk Threads', 'Heritage Mirror Work', 'Golden Zari Accents', 'Gotta Patti Embellishments'],
      ['Resham Threads', 'Glass Kundan Stones', 'Metallic Bell Charms', 'Seed Beads'],
      ['Fine Velvet Fabric', 'Antique Gold Beads', 'Braided Dori Cords', 'Micro Pearl Clusters'],
      ['Raw Silk Beads', 'Hand-strung Shells (Kodi)', 'Gilded Floral Motifs', 'Loom-woven Tassels']
    ],
    techniques: [
      ['Traditional Knotting & Braiding', 'Mirror-frame Stitching', 'Hand-sequinned Craft'],
      ['Intricate Zardozi Handwork', 'Multi-strand Tassel Layering', 'Precision Bead Threading'],
      ['Gotta Flower Shaping', 'Hand-twisted Cord Assembly', 'Artisanal Needlework']
    ],
    occasions: [
      ['Bridal Lehengas', 'Festive Blouse Hangings', 'Navratri Chaniya Choli', 'Designer Dupatta Borders'],
      ['Wedding Troussseau', 'Sangeet Ceremony Wear', 'Diwali Festive Outfits', 'Custom Ethnic Ensembles'],
      ['Traditional Gowns', 'Kurti Side Slits', 'Potli Accentuation', 'Festive Bridal Styling']
    ],
    highlights: [
      ['Intricately hand-twisted resham cords ensuring high tensile strength and graceful drape.', 'Accented with shimmering heritage mirror and gotta elements for radiant festive charm.'],
      ['Lightweight construction prevents garment strain while delivering voluminous statement appeal.', 'Finished with smooth metal bell caps and non-snagging attachment loops.'],
      ['Artisanal craft created by master tassel makers in Surat, renowned for ethnic embroidery.', 'Color-fast vibrant threads that maintain luster through multiple festive seasons.']
    ],
    stylingTips: [
      'Attach securely to the back dori of designer blouses, side tie-ups of lehengas, or the four corners of heritage dupattas for an authentic regal touch.',
      'Coordinate with contrasting metallic zari embroidery or match precisely with the base color of your festive ensemble to elevate the complete ethnic look.',
      'Can also be styled as accent hangings on bridal potlis, waist keychains (chabi challa), or festive curtain drapes.'
    ],
    careOptions: [
      ['Spot clean only with a soft dry cloth', 'Store in a dry, airtight pouch away from direct moisture', 'Do not squeeze, wring, or yank delicate tassel fringes'],
      ['Wrap tassel ends in tissue paper when storing', 'Avoid contact with perfumes, hairsprays, and moisture', 'Gently comb threads with fingers to restore natural fluff']
    ]
  },

  // 2. TORAN & BANDHANWAR / DOOR HANGINGS
  {
    domainKey: 'toran',
    keywords: ['toran', 'bandhanwar', 'door hanging', 'entrance', 'shubh labh', 'kalash', 'marigold', 'mango leaf', 'bandarwal', 'wall hanging', 'pooja hanging'],
    craftName: 'Festive Door Toran & Auspicious Bandhanwar',
    materials: [
      ['Vibrant Velvet & Cotton Fabric', 'Auspicious Kalash & Shubh Labh Motifs', 'Golden Gotta Lace', 'Pearl Beadwork'],
      ['Rich Brocade Base', 'Embroidered Peacock & Floral Appliques', 'Metallic Bell Drops', 'Brass Charms'],
      ['Fine Raw Silk Backdrop', 'Artificial Marigold & Jasmine Blooms', 'Kundan Mirror Discs', 'Twisted Gold Strings'],
      ['Traditional Cotton Twill', 'Multi-color Pom Poms', 'Reflective Mirror Hangings', 'Auspicious Elephant Appliques']
    ],
    techniques: [
      ['Hand-appliqué & Precision Patchwork', 'Decorative Bead Stringing', 'Mirror Frame Quilting'],
      ['Layered Gotta Patti Work', 'Artisanal Bell Fastening', 'Hand-stitched Border Hemming'],
      ['Festive Floral Assembling', 'Auspicious Symbol Embroidery', 'High-strength Cord Weaving']
    ],
    occasions: [
      ['Main Door Entrance', 'Diwali & Navratri Home Decor', 'Housewarming (Griha Pravesh)', 'Mandir / Puja Room Backdrop'],
      ['Wedding Welcome Gateways', 'Traditional Festivities', 'Office Reception Decor', 'Spiritual Celebrations'],
      ['New Year Home Makeover', 'Festive Return Gifting', 'Pooja Mandap Bordering', 'Temple Entry Decor']
    ],
    highlights: [
      ['Designed according to Vastu traditions to invite prosperity, auspicious vibes, and positive energy into your home.', 'Reinforced top loops provide effortless hanging on any doorframe, nail, or command hook without sagging.'],
      ['Rich multi-layered ethnic craft that retains vibrant color vibrancy through years of celebrations.', 'Weather-resistant materials crafted for indoor entrances, verandahs, and temple backdrops.'],
      ['Authentic Surat festive craftsmanship featuring precision edge-binding and balanced weight distribution.', 'Easy to fold and store compactly for reuse season after season.']
    ],
    stylingTips: [
      'Hang horizontally across the main entrance doorframe or mandir arch. Pair with matching side door hangings (latkans) and floor rangoli for a grand festive entryway.',
      'Illuminate with warm fairy lights or side diyas to accentuate the golden zari embroidery and kundan mirrors at dusk.',
      'Ideal for festive gifting during Diwali, Griha Pravesh, Navratri, or wedding ceremonies as an auspicious token of goodwill.'
    ],
    careOptions: [
      ['Gently dust with a feather duster or dry microfiber cloth', 'Keep away from direct rainfall or extreme prolonged outdoor sunlight', 'Fold gently along fabric lines when packing for storage'],
      ['Spot clean fabric with a barely damp cloth if necessary', 'Store flat or rolled in breathable cotton bags', 'Do not machine wash or submerge in water']
    ]
  },

  // 3. POTLI & CLUTCHES
  {
    domainKey: 'potli',
    keywords: ['potli', 'batwa', 'clutch', 'bag', 'purse', 'pouch', 'drawstring', 'shagun pouch', 'trousseau bag'],
    craftName: 'Royal Artisanal Potli & Ethnic Clutch',
    materials: [
      ['Rich Velvet & Raw Silk Fabric', 'Zardozi Hand Embroidery', 'Lustrous Pearl Handle Strings', 'Jacquard Inner Lining'],
      ['Heritage Brocade Silk', 'Micro-sequin Work', 'Braided Drawstring Tassels', 'Reinforced Structured Base'],
      ['Soft Suede Base', 'Kundan Stone Studding', 'Metal Cutwork Frame', 'Satin Slip Pocket Lining']
    ],
    techniques: [
      ['Zari Thread Hand Embroidery', 'Hand-pleated Base Construction', 'Tassel Drawstring Construction'],
      ['Dabka Needlework', 'Hand-stitched Heavy Pearl Handle', 'Reinforced Double-seam Assembly']
    ],
    occasions: [
      ['Wedding Sangeet & Reception', 'Festive Ethnic Outfits', 'Bridal Shagun Gifting', 'Traditional Evening Soirees'],
      ['Mehendi & Haldi Functions', 'Diwali Parties', 'Cocktail Nights', 'Trousseau Box Curation']
    ],
    highlights: [
      ['Roomy interior compartment comfortably holds smartphone, car keys, compact makeup, and cards without bulging.', 'Sturdy double drawstring mechanism keeps personal valuables secure with smooth opening and closing.'],
      ['Comfortable pearl/beaded wristlet strap enables hands-free dancing during festive celebrations.', 'Exquisite 360-degree all-over embroidery ensuring striking elegance from every viewing angle.']
    ],
    stylingTips: [
      'Pair effortlessly with sarees, lehengas, Anarkalis, or Indo-western suits for weddings and grand receptions.',
      'Carry on your wrist via the pearl loop to let the decorative side tassels sway gracefully with your movement.',
      'Makes a cherished festive gift or wedding favor bag packed with dry fruits, coins, or shagun.'
    ],
    careOptions: [
      ['Wipe exterior gently with a clean dry cotton cloth', 'Store stuffed with tissue paper to preserve original shape', 'Keep away from alcohol-based perfumes, sanitizers, and moisture'],
      ['Store in the provided breathable dust cover', 'Avoid contact with sharp metallic jewelry to prevent snagging', 'Do not wash or dry clean']
    ]
  },

  // 4. JEWELLERY & ORNAMENTS
  {
    domainKey: 'jewellery',
    keywords: ['jewellery', 'jewelry', 'earring', 'jhumka', 'jhumki', 'necklace', 'choker', 'bangle', 'kada', 'ring', 'bracelet', 'maang tikka', 'payal', 'anklet', 'kundan', 'meenakari'],
    craftName: 'Handcrafted Heritage Jewellery & Accessories',
    materials: [
      ['High-Grade Brass & Copper Alloy Base', 'Hydro Emerald & Ruby Beads', 'Kundan Polki Stones', '18K Micro Gold Plating'],
      ['Silk Thread Wrapping', 'Hand-painted Meenakari Enamel', 'Freshwater Cultured Pearls', 'Feather-Light Core Base'],
      ['Antique Temple Metal Finish', 'Faceted Glass Crystals', 'Adjustable Dori Choker Tie', 'Skin-Safe Hypoallergenic Coating']
    ],
    techniques: [
      ['Handcrafted Kundan Stone Setting', 'Traditional Jadau Foil Inlay', 'Hand-strung Beaded Threading'],
      ['Artisanal Meenakari Enameling', 'Filigree Wire Shaping', 'Multi-layer Polishing']
    ],
    occasions: [
      ['Weddings & Receptions', 'Haldi & Mehendi Celebrations', 'Festive Occasions & Poojas', 'Family Gatherings'],
      ['Cultural Performances', 'Engagement Ceremonies', 'Anniversary Styling', 'Ethnic Photoshoots']
    ],
    highlights: [
      ['Feather-light engineering designed for maximum comfort during long hours of festive dancing and celebrations.', 'Coated with premium anti-tarnish protective lacquer for enduring shine and skin-friendly wear.'],
      ['Adjustable sizing fits comfortably on all wrist, neck, or ear contours with secure lock mechanisms.', 'Handcrafted by master jewel smiths carrying generations of traditional jewelry-making heritage.']
    ],
    stylingTips: [
      'Style as the centerpiece with sleek updo hairstyles and deep neckline blouses or traditional sarees.',
      'Mix and match with subtle bangles and minimal accessories to let this statement piece take center stage.',
      'Keep separately in airtight jewelry slots to preserve the lustrous gold finish for years.'
    ],
    careOptions: [
      ['Keep away from perfumes, deodorants, water, and sweat', 'Store in a dedicated zip-lock pouch or velvet jewelry box', 'Wipe gently with a soft dry lint-free cloth after each wear'],
      ['Always wear jewelry last after completing hair and makeup application', 'Do not immerse in chemical jewelry cleaners', 'Avoid impact against hard surfaces']
    ]
  },

  // 5. HOME DECOR & FESTIVE ACCENTS
  {
    domainKey: 'homedecor',
    keywords: ['decor', 'diya', 'urli', 'rangoli', 'candle', 'puja', 'thali', 'mandir', 'cushion', 'table runner', 'showpiece', 'idol', 'hanging'],
    craftName: 'Artisanal Home Decor & Festive Accents',
    materials: [
      ['Cast Metal & Brass Alloy', 'Lustrous Golden Polish', 'Hand-hammered Textures', 'Protective Anti-Rust Coating'],
      ['Eco-friendly Engineered Terracotta', 'Hand-painted Acrylic Patterns', 'Embedded Mirrors', 'Natural Wax Base'],
      ['Handloom Raw Silk & Velvet', 'Zari Border Trim', 'Quilted Foam Padding', 'Concealed Zipper Enclosures']
    ],
    techniques: [
      ['Hand-hammering & Embossing', 'Precision Metal Etching', 'Hand-painted Folk Art Motifs'],
      ['Artisanal Stone Inlay', 'Hand-quilting & Edge Piping', 'High-heat Lacquer Curing']
    ],
    occasions: [
      ['Living Room Centerpieces', 'Pooja Room & Mandir Styling', 'Diwali & Festive Home Lighting', 'Housewarming Parties'],
      ['Dining Table Center Displays', 'Balcony & Verandah Accents', 'Festive Corporate Gifting', 'Spiritual Rituals']
    ],
    highlights: [
      ['Creates an inviting, warm, and sophisticated ambiance in any interior space with authentic heritage charm.', 'Heavy, stable base prevents accidental tipping when placed on tables, consoles, or temple altars.'],
      ['Artisan-crafted in limited batches with exceptional attention to surface textures and edge finishing.', 'Timeless aesthetic that blends harmoniously with modern, contemporary, and classic traditional decors.']
    ],
    stylingTips: [
      'Place as a centerpiece on coffee tables or dining setups with fresh floating flower petals and tea-light candles.',
      'Flank entrance pathways or mandir steps for an opulent, welcoming festival aesthetic.',
      'Pairs beautifully with wooden consoles, marble floors, and warm ambient backlighting.'
    ],
    careOptions: [
      ['Dust regularly with a dry soft cloth', 'Wipe with a slightly damp cloth if needed and dry immediately', 'Avoid abrasive scrubbers and harsh chemical detergents'],
      ['Apply brass/metal polish occasionally to maintain optimal brilliance', 'Keep indoor away from stagnant water collection', 'Store wrapped in bubble wrap when not in use']
    ]
  },

  // 6. SHAGUN ENVELOPES & GIFTING
  {
    domainKey: 'gifting',
    keywords: ['envelope', 'lifafa', 'shagun', 'gift box', 'cash envelope', 'hamper', 'trousseau', 'favor', 'favor bag', 'gifting'],
    craftName: 'Handcrafted Shagun Gifting & Festive Stationery',
    materials: [
      ['Rich Velvet & Metallic Cardstock', 'Golden Brocade Ribbon', 'Kundan Brooch Accents', 'Velvet Flock Lining'],
      ['Handmade Textured Paper', 'Foil Stamped Sanskrit Mantras', 'Satin Ribbon Ties', 'Pearl Button Closures']
    ],
    techniques: [
      ['Precision Die-cutting & Creasing', 'Hand-applied Embellishment Brooches', 'Hot-foil Metallic Stamping'],
      ['Artisanal Paper Folding', 'Velvet Lamination', 'Hand-tied Ribbon Craft']
    ],
    occasions: [
      ['Wedding Shagun & Gifting', 'Diwali Cash Gifts', 'Griha Pravesh & Milni Ceremonies', 'Baby Showers & Anniversaries'],
      ['Corporate Festive Tokens', 'Rakshabandhan Gifting', 'Festive Return Favors', 'Trousseau Packing']
    ],
    highlights: [
      ['Stately presentation that turns cash gifts or gift cards into an unforgettable, thoughtful keepsake.', 'Accommodates all Indian currency notes flat without folding or creasing.'],
      ['Features a secure, elegant tuck-in closure or satin ribbon bow without requiring messy adhesives.', 'Premium rigid board construction that stays crisp and prevents bending in transit.']
    ],
    stylingTips: [
      'Present to newlyweds, elders, or guests during auspicious moments with your handwritten blessing inside.',
      'Coordinate envelope colors with the wedding invitation suite or festive party theme for cohesive elegance.'
    ],
    careOptions: [
      ['Keep in a flat dry folder away from direct moisture', 'Handle with clean dry hands to avoid finger smudges on foil surfaces'],
      ['Store in original protective wrap until ready to gift']
    ]
  },

  // 7. LACES, BORDERS & EMBROIDERY TRIMS
  {
    domainKey: 'laces',
    keywords: ['lace', 'border', 'gotta', 'zari', 'trim', 'ribbon', 'patch', 'butti', 'embroidery lace', 'saree border'],
    craftName: 'Artisanal Gotta Patti & Zari Border Trims',
    materials: [
      ['Metallic Zari Threads', 'Pure Gotta Patti Lace', 'Micro Sequin Weaves', 'Durable Organza / Silk Base'],
      ['Resham Embroidery Threads', 'Cut-work Net Fabric', 'Beaded Pearl Edging', 'Gold Wire Dabka']
    ],
    techniques: [
      ['High-density Jacquard Loom Weaving', 'Hand-stitched Cutwork Craft', 'Precision Edge Scalloping'],
      ['Gotta Flower Appliqueing', 'Multi-thread Embroidery Interlocking', 'Non-fray Heat Sealed Borders']
    ],
    occasions: [
      ['Saree & Lehenga Hemlines', 'Dupatta Border Accents', 'Designer Blouse Sleeves', 'Kurti Neckline Styling'],
      ['Festive Cushion Bordering', 'Craft & DIY Trousseau Designing', 'Temple Poshak Borders', 'Bridal Veil Trimming']
    ],
    highlights: [
      ['Flexible backing allows easy sewing along straight hemlines or curved necklines without puckering.', 'Fade-resistant metallic luster that withstands dry cleaning and festive wear.'],
      ['Premium non-fraying edge construction ensures effortless stitching for boutique designers and DIY creators.']
    ],
    stylingTips: [
      'Sew onto plain chiffon or georgette dupattas to instantly transform them into heavy festive statement pieces.',
      'Layer with contrasting thin gotta lines along lehenga borders for rich depth and regal flare.'
    ],
    careOptions: [
      ['Dry clean garments attached with this trim', 'Iron gently on reverse side using low heat and protective press cloth'],
      ['Do not apply direct high-temperature steam on metallic components']
    ]
  },

  // 8. APPAREL & ETHNIC WEAR
  {
    domainKey: 'apparel',
    keywords: ['dupatta', 'blouse', 'lehenga', 'chaniya', 'choli', 'kurti', 'saree', 'suit', 'stole', 'shawl', 'jacket', 'skirt', 'dress'],
    craftName: 'Handcrafted Ethnic Ensemble & Designer Wear',
    materials: [
      ['Pure Chanderi Silk & Organza', 'Breathable Modal Satin', 'Heritage Zari Borders', 'Soft Cotton Voile Lining'],
      ['Georgette Base with Lucknowi Chikankari', 'Gotta Patti Embellishments', 'Rich Silk Blend', 'Flowing Crepe']
    ],
    techniques: [
      ['Artisanal Hand-embroidery', 'Precision Tailored Silhouette Fitting', 'Hand-dyed Ombre Transitions'],
      ['Zari Thread Weaving', 'Hand-block Printing', 'Reinforced Interlock Stitching']
    ],
    occasions: [
      ['Wedding Sangeet & Reception', 'Navratri & Dandiya Nights', 'Diwali & Festive Gatherings', 'Cocktail & Evening Parties'],
      ['Haldi & Mehendi Ceremonies', 'Family Celebrations', 'Destination Weddings', 'Formal Ethnic Events']
    ],
    highlights: [
      ['Tailored for a flattering, comfortable drape that allows graceful movement throughout day-long celebrations.', 'Premium skin-friendly fabric with breathable softness suitable across all Indian seasons.'],
      ['Includes generous internal seam margins allowing easy custom adjustments and alterations if desired.']
    ],
    stylingTips: [
      'Pair with statement heritage jewellery, embellished potli bag, and elegant heels for a show-stopping look.',
      'Drape the dupatta in a classic pleated style over one shoulder or let it flow freely over the arms for effortless poise.'
    ],
    careOptions: [
      ['Dry clean recommended for first few washes to preserve fabric sheen and embroidery integrity', 'Iron on low to medium heat on the reverse side'],
      ['Store in a breathable cotton garment bag away from direct sunlight', 'Do not bleach or tumble dry']
    ]
  }
];

// Color palette mapping
const COLOR_MAPPINGS: Record<string, string> = {
  maroon: '#800000',
  red: '#DC2626',
  crimson: '#991B1B',
  gold: '#D4AF37',
  golden: '#D4AF37',
  yellow: '#EAB308',
  mustard: '#CA8A04',
  blue: '#2563EB',
  royal: '#1D4ED8',
  navy: '#1E3A8A',
  green: '#16A34A',
  emerald: '#059669',
  bottle: '#064E3B',
  pink: '#EC4899',
  rani: '#BE185D',
  magenta: '#D946EF',
  orange: '#F97316',
  peach: '#FDBA74',
  purple: '#9333EA',
  violet: '#7E22CE',
  black: '#171717',
  white: '#FAFAFA',
  cream: '#FEF3C7',
  beige: '#F5F5DC',
  silver: '#E5E7EB',
  teal: '#0D9488',
  copper: '#B45309'
};

/**
 * Generates tailored, non-repeating, domain-accurate content for products.
 * Every click/seed produces a fresh unique variation.
 */
export function generateSmartProductContent(params: {
  title: string;
  category?: string;
  subcategory?: string;
  imageNames?: string[];
  seed?: number;
}): GeneratedProductContent {
  const titleClean = (params.title || '').trim();
  const lowerTitle = titleClean.toLowerCase();
  const cat = (params.category || '').trim();
  const subcat = (params.subcategory || '').trim();
  const lowerCat = cat.toLowerCase();
  const lowerSubcat = subcat.toLowerCase();

  // Pseudo-random index derived from seed / timestamp / title length
  const randomSeed = params.seed !== undefined ? params.seed : Math.floor(Math.random() * 10000);
  const getIndex = (max: number, offset = 0) => Math.abs(Math.floor(randomSeed + offset)) % max;

  // 1. Detect matching craft domain strictly based on Title, Category, and Subcategory
  const combinedSearch = `${lowerTitle} ${lowerCat} ${lowerSubcat}`;

  let matchedDomain = DOMAIN_KNOWLEDGE.find((d) =>
    d.keywords.some((kw) => combinedSearch.includes(kw))
  );

  // If no keyword match, infer from category string or generate dynamic fallback
  if (!matchedDomain) {
    if (lowerCat.includes('toran') || lowerCat.includes('door') || lowerCat.includes('decor')) {
      matchedDomain = DOMAIN_KNOWLEDGE[1];
    } else if (lowerCat.includes('potli') || lowerCat.includes('bag') || lowerCat.includes('clutch')) {
      matchedDomain = DOMAIN_KNOWLEDGE[2];
    } else if (lowerCat.includes('jewel') || lowerCat.includes('ear') || lowerCat.includes('neck') || lowerCat.includes('bangle')) {
      matchedDomain = DOMAIN_KNOWLEDGE[3];
    } else if (lowerCat.includes('home') || lowerCat.includes('mandir') || lowerCat.includes('diya')) {
      matchedDomain = DOMAIN_KNOWLEDGE[4];
    } else if (lowerCat.includes('gift') || lowerCat.includes('envelope')) {
      matchedDomain = DOMAIN_KNOWLEDGE[5];
    } else if (lowerCat.includes('lace') || lowerCat.includes('border') || lowerCat.includes('trim')) {
      matchedDomain = DOMAIN_KNOWLEDGE[6];
    } else if (lowerCat.includes('wear') || lowerCat.includes('dress') || lowerCat.includes('cloth') || lowerCat.includes('saree') || lowerCat.includes('dupatta')) {
      matchedDomain = DOMAIN_KNOWLEDGE[7];
    } else {
      // Default to Category-adapted Custom Craft
      matchedDomain = {
        domainKey: 'custom',
        keywords: [],
        craftName: cat ? `${cat} Collection` : 'Handcrafted Designer Craft',
        materials: [
          ['Premium Quality Base Materials', 'Heritage Metallic Embellishments', 'Artisanal Thread Accents', 'Durable Protective Finish'],
          ['Rich Hand-selected Fabric', 'Intricate Traditional Accents', 'Fine Luster Foil Inlay', 'Reinforced Core'],
          ['Artisanal Cotton & Silk Blend', 'Gilded Decorative Elements', 'High-grade Craft Components', 'Hand-finished Edging']
        ],
        techniques: [
          ['Authentic Handcrafted Assembly', 'Precision Artisan Stitching', 'Traditional Heritage Detailing'],
          ['Multi-step Hand-finishing', 'Custom Decorative Sculpting', 'Quality-inspected Structural Binding'],
          ['Fine Detail Craftsmanship', 'Hand-polished Protective Coating', 'Artisanal Border Sealing']
        ],
        occasions: [
          ['Weddings & Festive Celebrations', 'Traditional Family Functions', 'Special Auspicious Occasions', 'Luxury Ethnic Gifting'],
          ['Cultural Events & Festivals', 'Home & Mandir Styling', 'Bridal & Party Gatherings', 'Memorable Gifting Moments'],
          ['Diwali & Festive Gatherings', 'Pooja Ceremonies', 'Grand Social Soirees', 'Custom Boutique Styling']
        ],
        highlights: [
          ['Meticulously handcrafted with premium materials ensuring lasting quality and authentic ethnic beauty.', 'Designed to seamlessly elevate your traditional aesthetic with rich artisanal detailing.'],
          ['Exclusively finished by master craftspeople in Surat, carrying generations of authentic Indian artistry.', 'Balanced lightweight construction engineered for durability, grace, and effortless styling.'],
          ['Every piece undergoes strict multi-point quality inspections to ensure pristine finishing and customer delight.', 'Timeless visual charm that complements festive ensembles and traditional decors gracefully.']
        ],
        stylingTips: [
          'Pair with matching festive accessories or complementary traditional attire to create a cohesive, elevated statement look.',
          'Ideal for special occasions, wedding celebrations, and premium festive gifting to loved ones.',
          'Store in a dedicated dry pouch or box to maintain pristine luster and durability over time.'
        ],
        careOptions: [
          ['Wipe gently with a soft dry cloth', 'Store in a clean, dry box away from direct moisture and humidity', 'Handle with care to protect intricate artisanal details'],
          ['Avoid contact with liquids, sprays, and harsh chemicals', 'Wrap in soft cotton or tissue paper for long-term storage', 'Do not apply heavy pressure or rough rubbing']
        ]
      };
    }
  }

  // 2. Detect mentioned colors from title and image file names
  const detectedColors: Array<{ name: string; hex: string }> = [];
  const searchSources = [lowerTitle, ...(params.imageNames || []).map((s) => s.toLowerCase())].join(' ');

  Object.entries(COLOR_MAPPINGS).forEach(([colName, hex]) => {
    if (searchSources.includes(colName) && !detectedColors.some((c) => c.name.toLowerCase() === colName)) {
      const formattedName = colName.charAt(0).toUpperCase() + colName.slice(1);
      detectedColors.push({ name: formattedName, hex });
    }
  });

  if (detectedColors.length === 0) {
    const defaultColorSets = [
      [{ name: 'Maroon', hex: '#800000' }, { name: 'Gold', hex: '#D4AF37' }],
      [{ name: 'Royal Blue', hex: '#1D4ED8' }, { name: 'Gold', hex: '#D4AF37' }],
      [{ name: 'Emerald Green', hex: '#059669' }, { name: 'Gold', hex: '#D4AF37' }],
      [{ name: 'Rani Pink', hex: '#BE185D' }, { name: 'Golden Zari', hex: '#D4AF37' }],
      [{ name: 'Golden Yellow', hex: '#EAB308' }, { name: 'Crimson Red', hex: '#991B1B' }],
      [{ name: 'Black', hex: '#171717' }, { name: 'Metallic Gold', hex: '#D4AF37' }]
    ];
    detectedColors.push(...defaultColorSets[getIndex(defaultColorSets.length, 1)]);
  }

  const colorPhrase = detectedColors.map((c) => c.name).join(' & ');

  // 3. Pick dynamic randomized components
  const chosenMaterials = matchedDomain.materials[getIndex(matchedDomain.materials.length, 2)];
  const chosenTechniques = matchedDomain.techniques[getIndex(matchedDomain.techniques.length, 3)];
  const chosenOccasions = matchedDomain.occasions[getIndex(matchedDomain.occasions.length, 4)];
  const chosenHighlights = matchedDomain.highlights[getIndex(matchedDomain.highlights.length, 5)];
  const chosenStylingTip = matchedDomain.stylingTips[getIndex(matchedDomain.stylingTips.length, 6)];
  const chosenCare = matchedDomain.careOptions[getIndex(matchedDomain.careOptions.length, 7)];

  const productName = titleClean || matchedDomain.craftName;

  // 4. Generate Unique, Varied Short Description
  const shortDescTemplates = [
    `Authentically handcrafted ${productName} featuring premium ${chosenMaterials[0]} and signature ${chosenTechniques[0]}, artisan-made in Surat for festive elegance.`,
    `Elevate your ethnic styling with this exclusive ${productName}, meticulously crafted with rich ${chosenMaterials[1]} in vibrant ${colorPhrase} tones.`,
    `Handmade with utmost finesse, this ${productName} blends traditional ${chosenTechniques[1]} with high-grade ${chosenMaterials[0]} for weddings and celebrations.`,
    `A captivating masterpiece of Surat heritage artistry, this ${productName} showcases opulent ${chosenMaterials[0]} tailored specifically for ${chosenOccasions[0]}.`,
    `Exquisite artisanal craftsmanship featuring durable ${chosenMaterials[1]} and radiant ${colorPhrase} accents, perfect for ${chosenOccasions.slice(0, 2).join(' and ')}.`,
    `Meticulously designed ${productName} celebrating traditional Indian motifs, made with ${chosenMaterials[0]} and delicate ${chosenTechniques[0]} for standout festive charm.`,
    `Infuse royal heritage charm into your collection with this handcrafted ${productName}, skillfully crafted with ${chosenMaterials[2] || chosenMaterials[0]} in Surat.`,
    `Stunning handmade ${productName} adorned with intricate ${chosenTechniques[0]} and radiant ${colorPhrase} palette, ideal for ${chosenOccasions[1] || 'festive occasions'}.`
  ];
  const shortDescription = shortDescTemplates[getIndex(shortDescTemplates.length, 8)];

  // 5. Generate Rich HTML Long Description with distinct headers and dynamic sections
  const introIntros = [
    `<p>Immerse yourself in timeless Indian heritage with our authentically crafted <strong>${productName}</strong>. Lovingly assembled by seasoned artisans in Surat, this piece seamlessly blends age-old traditional craftsmanship with modern quality standards and enduring durability.</p>`,
    `<p>Add an aura of opulent festive grace to your ethnic collection with the magnificent <strong>${productName}</strong>. Every detail is sculpted and finished by master artisans using premium materials and heritage-inspired techniques.</p>`,
    `<p>Discover authentic artisanal splendor with our bespoke <strong>${productName}</strong>. Designed to captivate at first glance, each piece reflects generations of ethnic needlework and metalcraft from Gujarat's master craft clusters.</p>`,
    `<p>Celebrate auspicious traditions and festive joyousness with the royal <strong>${productName}</strong>. Handcrafted with meticulous care, it delivers an enchanting blend of radiant tones, intricate textures, and flawless finishing.</p>`
  ];
  const chosenIntro = introIntros[getIndex(introIntros.length, 9)];

  const longDescription = `<h3>PRODUCT OVERVIEW</h3>
${chosenIntro}

<h3>KEY CRAFTSMANSHIP HIGHLIGHTS</h3>
<ul>
  <li><strong>Artisanal Technique:</strong> Handcrafted using authentic ${chosenTechniques.join(' & ')}.</li>
  <li><strong>Premium Materials:</strong> Meticulously constructed with ${chosenMaterials.join(', ')} for opulent depth and luster.</li>
  <li><strong>Flawless Pairing:</strong> Specially curated for ${chosenOccasions.join(', ')}.</li>
  <li><strong>Quality Guaranteed:</strong> ${chosenHighlights[0]}</li>
  <li><strong>Durable Construction:</strong> ${chosenHighlights[1]}</li>
</ul>

<h3>STYLING & OCCASION GUIDE</h3>
<p>${chosenStylingTip}</p>
<p><strong>Recommended For:</strong> ${chosenOccasions.join(' • ')}</p>

<h3>CARE & MAINTENANCE</h3>
<ul>
  ${chosenCare.map((c) => `<li>${c}</li>`).join('\n  ')}
</ul>`;

  // 6. Dynamic Specifications
  const specs = [
    { id: 'spec-1', key: 'Primary Material', value: chosenMaterials[0] },
    { id: 'spec-2', key: 'Craft Technique', value: chosenTechniques[0] },
    { id: 'spec-3', key: 'Color / Palette', value: colorPhrase },
    { id: 'spec-4', key: 'Occasion / Usage', value: chosenOccasions.slice(0, 2).join(', ') },
    { id: 'spec-5', key: 'Origin / Made In', value: 'Surat, Gujarat, India' },
    { id: 'spec-6', key: 'Care Instructions', value: chosenCare[0] },
    { id: 'spec-7', key: 'Packaging', value: 'Secure protective tamper-proof box' }
  ];

  // 7. Pricing estimation based on craft complexity
  let suggestedRegularPrice = 1299;
  let suggestedSalePrice = 799;

  if (lowerTitle.includes('bridal') || lowerTitle.includes('heavy') || lowerTitle.includes('toran') || lowerTitle.includes('lehenga') || lowerTitle.includes('necklace')) {
    suggestedRegularPrice = 1799;
    suggestedSalePrice = 1099;
  } else if (lowerTitle.includes('potli') || lowerTitle.includes('clutch') || lowerTitle.includes('jhumka') || lowerTitle.includes('bangle')) {
    suggestedRegularPrice = 1499;
    suggestedSalePrice = 899;
  } else if (lowerTitle.includes('simple') || lowerTitle.includes('mini') || lowerTitle.includes('light') || lowerTitle.includes('envelope')) {
    suggestedRegularPrice = 799;
    suggestedSalePrice = 449;
  }

  // 8. SEO Metadata
  const cleanSlug = (titleClean || 'awesome-handmade-product')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const seoTitle = `${productName} | Awesome Handmade Surat`;
  const seoDescription = `Shop exclusive ${productName} handcrafted in Surat. Made with ${chosenMaterials[0]} in ${colorPhrase}. Fast all-India delivery.`;

  const tags = [
    'Handmade',
    'Surat Craft',
    'Artisanal',
    cat || 'Ethnic Craft',
    subcat,
    matchedDomain.craftName,
    ...detectedColors.map((c) => c.name),
    'Festive Collection',
    'Bridal & Gifting'
  ].filter(Boolean);

  return {
    title: titleClean,
    slug: cleanSlug,
    shortDescription,
    longDescription,
    specifications: specs,
    suggestedCategory: cat || 'Latkan',
    suggestedSubcategory: subcat || '',
    suggestedRegularPrice,
    suggestedSalePrice,
    seoTitle,
    seoDescription,
    tags,
    detectedColors
  };
}
