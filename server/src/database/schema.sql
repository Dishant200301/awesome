-- =========================================================
-- AWESOME HANDMADE ENTERPRISE E-COMMERCE PLATFORM - MYSQL DDL SCHEMA
-- Engine: InnoDB | Character Set: utf8mb4_unicode_ci
-- =========================================================

-- 1. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. SUB CATEGORIES
CREATE TABLE IF NOT EXISTS sub_categories (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. BRANDS
CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    logo_url VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. COLLECTIONS
CREATE TABLE IF NOT EXISTS collections (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. TAGS
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 6. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    brand_id VARCHAR(36),
    category_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    product_type VARCHAR(50) NOT NULL DEFAULT 'variable', -- simple, variable
    short_description TEXT,
    full_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    discount_percentage INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 4.80,
    review_count INT DEFAULT 0,
    stock INT DEFAULT 50,
    default_sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    image_url VARCHAR(512) NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE, -- CHECKBOX RULE: Visible on client website when TRUE, Admin only when FALSE
    status VARCHAR(50) DEFAULT 'Published', -- Draft, Published, Hidden
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. ATTRIBUTES MASTER (Product & Variant Attribute Templates)
CREATE TABLE IF NOT EXISTS attributes (
    id VARCHAR(36) PRIMARY KEY,
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
    id VARCHAR(36) PRIMARY KEY,
    attribute_id VARCHAR(36) NOT NULL,
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
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    attribute_id VARCHAR(36) NOT NULL,
    value TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
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
    thumbnail_url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(36),
    image_url VARCHAR(512) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. INVENTORY WAREHOUSE LOGS
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(36) PRIMARY KEY,
    variant_id VARCHAR(36) NOT NULL UNIQUE,
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
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'New', -- New, Read, Replied
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 12b. PRODUCT REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(255),
    product_image VARCHAR(512),
    author VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    rating INT NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    date VARCHAR(50),
    verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Approved', -- Approved, Pending, Rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 13. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
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
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'Razorpay',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 15. ADMINS
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Super Admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 16. PRODUCT COLORS
CREATE TABLE IF NOT EXISTS product_colors (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(10) NOT NULL,
    display_image VARCHAR(512),
    main_image VARCHAR(512),
    display_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 17. PRODUCT COLOR GALLERY IMAGES
CREATE TABLE IF NOT EXISTS product_color_images (
    id VARCHAR(36) PRIMARY KEY,
    color_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (color_id) REFERENCES product_colors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. PRODUCT DESCRIPTION CARDS
CREATE TABLE IF NOT EXISTS product_description_cards (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(512),
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. PRODUCT HIGHLIGHTS
CREATE TABLE IF NOT EXISTS product_highlights (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL,
    icon_name VARCHAR(100) DEFAULT 'Sparkles',
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 20. PRODUCT WASHING INSTRUCTIONS
CREATE TABLE IF NOT EXISTS product_washing_instructions (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    icon_name VARCHAR(100) DEFAULT 'Droplets',
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 21. PRODUCT MANUFACTURING DETAILS
CREATE TABLE IF NOT EXISTS product_manufacturing_details (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL UNIQUE,
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
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 23. SIZE GUIDE CATEGORY MAPPINGS
CREATE TABLE IF NOT EXISTS size_guide_mappings (
    id VARCHAR(36) PRIMARY KEY,
    size_guide_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36),
    sub_category_id VARCHAR(36),
    FOREIGN KEY (size_guide_id) REFERENCES size_guides(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 24. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
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
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- INITIAL SEED DATA
-- =========================================================

INSERT IGNORE INTO categories (id, name, slug, description) VALUES
('cat-1', 'Bralettes', 'bralettes', 'Seamless wirefree padded bralettes'),
('cat-2', 'Everyday Bras', 'everyday-bras', 'Contour everyday wirefree bras'),
('cat-3', 'Accessories', 'accessories', 'Silicone nipple covers & bra extenders');

INSERT IGNORE INTO products (id, name, subtitle, slug, product_type, price, original_price, discount_percentage, default_sku, image_url, category_id, is_published, status) VALUES
('prod-1', "Women's Seamless Padded Bralette", 'Ultra-soft 4-way stretch wire-free contour bra', 'womens-seamless-padded-bralette', 'variable', 799.00, 1299.00, 38, 'AAR-BR-BLK-S', 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=600', 'cat-1', TRUE, 'Published'),
('prod-2', "Women's Seamless Bra", 'Zero-wire contour support with breathable side wings', 'womens-seamless-bra', 'variable', 899.00, 1499.00, 40, 'AAR-BRA-DNM-34B', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=600', 'cat-2', TRUE, 'Published'),
('prod-3', 'Silicone Nipple Covers', 'Hypoallergenic reusable medical-grade silicone covers', 'silicone-nipple-covers', 'simple', 299.00, 499.00, 40, 'AAR-NC-SIL-FREE', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600', 'cat-3', TRUE, 'Published');
