-- =========================================================
-- AWESOME HANDMADE ENTERPRISE E-COMMERCE PLATFORM - MYSQL DDL SCHEMA
-- Engine: InnoDB | Character Set: utf8mb4_unicode_ci
-- =========================================================

-- Note: Select your database (e.g. u382338879_awesome_hand) in phpMyAdmin before running
-- CREATE DATABASE IF NOT EXISTS awesome CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE awesome;

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url LONGTEXT,
    banner_image LONGTEXT,
    meta_title VARCHAR(500),
    meta_description TEXT,
    meta_keywords TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. SUB CATEGORIES
CREATE TABLE IF NOT EXISTS sub_categories (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url LONGTEXT,
    banner_image LONGTEXT,
    meta_title VARCHAR(500),
    meta_description TEXT,
    meta_keywords TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url LONGTEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. TAGS
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    brand_id VARCHAR(64),
    category_id VARCHAR(64),
    subcategory_id VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    subtitle TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    product_type VARCHAR(50) NOT NULL DEFAULT 'variable',
    short_description TEXT,
    full_description LONGTEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    discount_percentage INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 4.80,
    review_count INT DEFAULT 0,
    stock INT DEFAULT 50,
    default_sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    image_url LONGTEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (subcategory_id) REFERENCES sub_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. ATTRIBUTES MASTER (Product & Variant Attribute Templates)
CREATE TABLE IF NOT EXISTS attributes (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'text',
    `usage` VARCHAR(20) NOT NULL DEFAULT 'PRODUCT',
    show_in_highlights BOOLEAN DEFAULT TRUE,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. ATTRIBUTE OPTIONS (Values for Select / Multi Select / Swatch)
CREATE TABLE IF NOT EXISTS attribute_options (
    id VARCHAR(64) PRIMARY KEY,
    attribute_id VARCHAR(64) NOT NULL,
    label VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    hex_code VARCHAR(10),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8b. PRODUCT ATTRIBUTE VALUES (Product Specific Assigned Attributes)
CREATE TABLE IF NOT EXISTS product_attribute_values (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    attribute_id VARCHAR(64) NOT NULL,
    value TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    color_name VARCHAR(100),
    color_hex VARCHAR(10),
    size_name VARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    stock INT NOT NULL DEFAULT 0,
    weight DECIMAL(8, 2),
    thumbnail_url LONGTEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    variant_id VARCHAR(64),
    image_url LONGTEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. INVENTORY WAREHOUSE LOGS
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(64) PRIMARY KEY,
    variant_id VARCHAR(64) NOT NULL UNIQUE,
    warehouse_code VARCHAR(50) DEFAULT 'MAIN-WH-01',
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 20,
    allow_backorders BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12b. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255),
    product_image LONGTEXT,
    author VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INT NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    date VARCHAR(50),
    verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 14. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(64),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'Razorpay',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 15. ADMINS
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Super Admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 16. PRODUCT COLORS
CREATE TABLE IF NOT EXISTS product_colors (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(10) NOT NULL,
    display_image LONGTEXT,
    main_image LONGTEXT,
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 17. PRODUCT COLOR GALLERY IMAGES
CREATE TABLE IF NOT EXISTS product_color_images (
    id VARCHAR(64) PRIMARY KEY,
    color_id VARCHAR(64) NOT NULL,
    image_url LONGTEXT NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. PRODUCT DESCRIPTION CARDS
CREATE TABLE IF NOT EXISTS product_description_cards (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url LONGTEXT,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. PRODUCT HIGHLIGHTS
CREATE TABLE IF NOT EXISTS product_highlights (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    icon_name VARCHAR(100) DEFAULT 'Sparkles',
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 20. PRODUCT WASHING INSTRUCTIONS
CREATE TABLE IF NOT EXISTS product_washing_instructions (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    icon_name VARCHAR(100) DEFAULT 'Droplets',
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 21. PRODUCT MANUFACTURING DETAILS
CREATE TABLE IF NOT EXISTS product_manufacturing_details (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL UNIQUE,
    manufacturer VARCHAR(255),
    address VARCHAR(512),
    packed_by VARCHAR(255),
    imported_by VARCHAR(255),
    country_of_origin VARCHAR(100) DEFAULT 'India',
    material_composition TEXT,
    care_email VARCHAR(255),
    care_phone VARCHAR(50),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 22. SIZE GUIDES
CREATE TABLE IF NOT EXISTS size_guides (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 23. SIZE GUIDE CATEGORY MAPPINGS
CREATE TABLE IF NOT EXISTS size_guide_mappings (
    id VARCHAR(64) PRIMARY KEY,
    size_guide_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64),
    sub_category_id VARCHAR(64),
    FOREIGN KEY (size_guide_id) REFERENCES size_guides(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 24. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    color_name VARCHAR(100),
    size VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 25. WISHLIST ITEMS
CREATE TABLE IF NOT EXISTS wishlist_items (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 26. HERO SLIDES
CREATE TABLE IF NOT EXISTS hero_slides (
    id VARCHAR(64) PRIMARY KEY,
    tag VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image LONGTEXT NOT NULL,
    mobile_image LONGTEXT,
    button_text VARCHAR(100),
    link VARCHAR(500),
    theme VARCHAR(50) DEFAULT 'gold',
    align VARCHAR(50) DEFAULT 'left',
    status VARCHAR(50) DEFAULT 'Active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 27. PROMO BANNERS
CREATE TABLE IF NOT EXISTS promo_banners (
    id VARCHAR(64) PRIMARY KEY,
    tagline VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    badge_text VARCHAR(100),
    button_text VARCHAR(100),
    button_link VARCHAR(500),
    image_url LONGTEXT,
    mobile_image_url LONGTEXT,
    bg_color VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- INITIAL SEED DATA (Awesome Handmade Categories)
-- =========================================================

INSERT IGNORE INTO categories (id, name, slug, image_url, description, is_active) VALUES
('cat-1', 'Gift Hamper', 'gift-hamper', '/images/category/Gift Hamper.webp', 'Handmade customized gift hampers for every occasion', TRUE),
('cat-2', 'Choli', 'choli', '/images/category/Choli.webp', 'Traditional handcrafted cholis and festive attire', TRUE),
('cat-3', 'Krishna Outfit', 'krishna-outfit', '/images/category/Krishna outfit.webp', 'Divine poshak and accessories for Bal Gopal / Krishna', TRUE),
('cat-4', 'Necklace', 'necklace', '/images/category/Necklace.webp', 'Artisan mirror and thread work necklace sets', TRUE),
('cat-5', 'Latkan', 'latkan', '/images/category/Latkan.webp', 'Bridal, blouse, mirror & fabric latkans', TRUE),
('cat-6', 'Tassel', 'tassel', '/images/category/Tassel.webp', 'Handcrafted tassels for dresses and dupattas', TRUE),
('cat-7', 'Hair Accessories', 'hair-accessories', '/images/category/Hair_Accessories.webp', 'Handmade hair bows, clips, and bands', TRUE),
('cat-8', 'Watch', 'watch', '/images/category/Watch.webp', 'Artistic traditional and kids watches', TRUE),
('cat-9', 'Bracelet', 'bracelet', '/images/category/Bracelet.webp', 'Handwoven threads and charming beaded bracelets', TRUE),
('cat-10', 'Waist Belt', 'waist-belt', '/images/category/Waist Belt.webp', 'Embroidered & mirror work waist belts (kamarbandh)', TRUE),
('cat-11', 'Earrings', 'earrings', '/images/category/Earrings.webp', 'Mirror work, hoop and traditional festive earrings', TRUE),
('cat-12', 'Anklet', 'anklet', '/images/category/Anklet.webp', 'Handmade thread, bead and ghungroo payals', TRUE);

INSERT IGNORE INTO sub_categories (id, category_id, name, slug, description, is_active) VALUES
('sub-1', 'cat-1', 'Keychain', 'keychain', 'Handcrafted resin, macrame and mirror keychains', TRUE),
('sub-2', 'cat-2', 'Kids Choli', 'kids-choli', 'Festive Chaniya Choli for kids', TRUE),
('sub-3', 'cat-2', 'Adult Choli', 'adult-choli', 'Designer Chaniya Choli for adults', TRUE),
('sub-4', 'cat-4', 'Mirror Necklace', 'mirror-necklace', 'Folk mirror work necklace sets', TRUE),
('sub-5', 'cat-5', 'Mirror Latkan', 'mirror-latkan', 'Handmade mirror latkans for lehengas and blouses', TRUE),
('sub-6', 'cat-5', 'Blouse Latkan', 'blouse-latkan', 'Intricate handcrafted latkans for designer blouses', TRUE),
('sub-7', 'cat-5', 'Mirror Wall Decor', 'mirror-wall-decor', 'Festive wall hangings and door torans', TRUE),
('sub-8', 'cat-5', 'Fabric Latkan', 'fabric-latkan', 'Cotton & silk fabric tassels and latkans', TRUE),
('sub-9', 'cat-5', 'Golden Latkan', 'golden-latkan', 'Gota patti and golden zari latkans', TRUE),
('sub-10', 'cat-5', 'Crochet Latkan', 'crochet-latkan', 'Hand-knitted crochet latkans', TRUE),
('sub-11', 'cat-6', 'Long Tassels', 'long-tassels', 'Long decorative handcrafted tassels', TRUE),
('sub-12', 'cat-7', 'Hair Bow', 'hair-bow', 'Satin and fabric hair bows', TRUE),
('sub-13', 'cat-7', 'Hair Clip', 'hair-clip', 'Beaded and floral hair clips', TRUE),
('sub-14', 'cat-7', 'Hair Band', 'hair-band', 'Embroidered festive hair bands', TRUE),
('sub-15', 'cat-8', 'Kids Watch', 'kids-watch', 'Colorful printed kids watches', TRUE),
('sub-16', 'cat-8', 'Traditional Watch', 'traditional-watch', 'Ethnic bracelet style watches', TRUE),
('sub-17', 'cat-10', 'Mirror Waist Belt', 'mirror-waist-belt', 'Traditional Kutchi mirror kamarbandh', TRUE),
('sub-18', 'cat-11', 'Mirror Earrings', 'mirror-earrings', 'Lightweight mirror work earrings', TRUE),
('sub-19', 'cat-11', 'Hoop Earrings', 'hoop-earrings', 'Thread wrapped hoop earrings', TRUE);
