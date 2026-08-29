import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import { LOGO, categories } from "@/data/catalog";
import { useWishlist } from "@/modules/product/context/WishlistContext";
import { useCart } from "@/modules/product/context/CartContext";
import { useQuickView } from "@/modules/product/context/QuickViewContext";
import { useAuth } from "@/modules/core/context/AuthContext";
import { getLiveProductsList } from "@/modules/core/lib/apiStore";

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const WhatsAppIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const YouTubeIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const navLinks = [
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Categories", mega: true, key: "categories", href: "/collections" },
  { label: "Collections", mega: true, key: "collections", href: "/collections" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "/contact" },
];

const announcements = [
  "✨ Free Delivery on pre-paid orders above ₹999",
  "🪡 100% Handcrafted Indian Heritage Craft | Surat, Gujarat",
  "🎁 Use Code FESTIVE10 for 10% OFF on all handmade latkans",
  "🌸 Special Navratri & Wedding Collection Live!",
];

export function AwesomeLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <Link
      to="/"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex items-center gap-2.5 cursor-pointer group"
    >
      <img
        src={LOGO}
        alt="Awesome Handmade"
        className={`${className} rounded-full object-cover shadow-sm border border-brand-gold/30 group-hover:scale-105 transition-transform shrink-0`}
      />
      <div className="leading-none text-left">
        <span className="block font-heading text-base sm:text-lg font-bold tracking-tight text-brand-ink">
          Awesome <span className="text-brand-maroon">Handmade</span>
        </span>
      </div>
    </Link>
  );
}

export const AaramlyLogo = AwesomeLogo;

export default function Navbar() {
  const navigate = useNavigate();
  const { wishlistCount } = useWishlist();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { openQuickView } = useQuickView();
  const { isLoggedIn, openAuthModal } = useAuth();

  const [open, setOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileCatExpanded, setMobileCatExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allProducts = getLiveProductsList();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
        setIsFading(false);
      }, 300);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 35) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMegaEnter = (key: string) => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setOpenMega(key);
  };

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => {
      setOpenMega(null);
    }, 150);
  };

  // Smooth Scroll & Navigation Helper
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (!href) return;
    if (href.startsWith("#")) {
      e.preventDefault();
      setOpen(false);
      setOpenMega(null);

      if (href === "#home" || href === "#") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const targetId = href.replace("#", "");
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(`/${href}`);
      }
    } else {
      e.preventDefault();
      setOpen(false);
      setOpenMega(null);
      navigate(href);
    }
  };

  const searchResults = searchQuery.trim() === ""
    ? []
    : allProducts.filter(p =>
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (String(p.id) || "").toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);

  return (
    <>
      {/* 1. Announcement bar with smooth infinite right-to-left marquee loop */}
      <div className="w-full bg-[#1A1A1A] text-white select-none overflow-hidden py-2 border-b border-white/5">
        <div className="animate-announcement-marquee flex items-center gap-10 whitespace-nowrap">
          {[...announcements, ...announcements, ...announcements, ...announcements].map((text, idx) => (
            <div key={idx} className="flex items-center gap-10 text-[11px] sm:text-xs font-medium tracking-wider uppercase text-white/90">
              <span>{text}</span>
              <span className="text-brand-gold text-xs">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Sticky Navbar */}
      <header className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        isScrolled ? "shadow-md border-b border-[#EDE5DA]" : "shadow-sm border-b border-gray-100"
      }`}>
        <div className="bg-white relative">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 py-3">
            
            {/* LEFT: Brand Logo & Text (ALL DEVICES) */}
            <div className="flex shrink-0 items-center xl:flex-1 xl:justify-start">
              <Link
                to="/"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2.5 group cursor-pointer"
              >
                <img
                  src={LOGO}
                  alt="Awesome Handmade"
                  className="h-9 w-9 sm:h-10 sm:w-10 min-[1024px]:h-11 min-[1024px]:w-11 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform border border-brand-gold/30 shrink-0"
                />
                <div className="leading-none text-left">
                  <span className="block font-heading text-base sm:text-lg min-[1024px]:text-xl font-bold tracking-tight text-brand-ink whitespace-nowrap">
                    Awesome <span className="text-brand-maroon">Handmade</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* NAV LINKS: Right-aligned on Laptop (1024px-1279px), Centered on Desktop (>= 1280px) */}
            <nav className="hidden min-[1024px]:flex flex-1 items-center justify-end xl:flex-initial xl:justify-center">
              <ul
                className="flex items-center justify-end xl:justify-center gap-5 xl:gap-8 text-sm font-medium text-brand-ink"
                onMouseLeave={handleMegaLeave}
              >
                {navLinks.map((link) => (
                  <li
                    key={link.label}
                    className="relative py-1"
                    onMouseEnter={() => link.mega ? handleMegaEnter(link.key) : handleMegaLeave()}
                  >
                    <a
                      href={link.href || "#"}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={`relative inline-flex items-center gap-1.5 py-1 text-sm font-medium transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out ${
                        openMega === link.key
                          ? "text-brand-maroon font-semibold after:scale-x-100 after:origin-left"
                          : "text-brand-ink hover:text-brand-maroon after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left"
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.mega && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            openMega === link.key ? "rotate-180 text-brand-maroon" : "text-brand-gold"
                          }`}
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* RIGHT: Mobile Menu / Desktop Balance Spacer */}
            <div className="flex items-center justify-end min-[1024px]:hidden xl:flex xl:flex-1">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-full text-brand-ink transition hover:bg-brand-cream min-[1024px]:hidden cursor-pointer"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mega Menu Dropdown: Categories (Laptop & Desktop) */}
          {openMega === "categories" && (
            <div
              className="hidden min-[1024px]:block absolute left-0 right-0 top-full w-full bg-white border-t border-b border-[#EDE5DA] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.16)] animate-fade-slide-down z-50"
              onMouseEnter={() => handleMegaEnter("categories")}
              onMouseLeave={handleMegaLeave}
            >
              <div className="mx-auto max-w-[1500px] px-8 py-8 bg-white">
                  <div className="grid grid-cols-12 gap-8 items-start">
                    
                    {/* Left: 3 Columns of Categories (Col Span 7) */}
                    <div className="col-span-7 grid grid-cols-3 gap-8">
                      {/* Col 1: Jewellery */}
                      <div className="space-y-2.5">
                        <h4 className="font-bold text-sm text-brand-maroon tracking-tight">
                          Jewellery
                        </h4>
                        <ul className="space-y-2 text-xs text-brand-ink/80">
                          <li>
                            <Link to="/shop?category=earrings" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Earrings & Jhumkas
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=jewellery-set" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Bridal Jewellery Set
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=necklace" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Mirror Necklaces
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=bracelet" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Handmade Bracelets
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=anklet" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Anklets & Payal
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Col 2: Festive & Latkans */}
                      <div className="space-y-2.5">
                        <h4 className="font-bold text-sm text-brand-maroon tracking-tight">
                          Festive & Latkans
                        </h4>
                        <ul className="space-y-2 text-xs text-brand-ink/80">
                          <li>
                            <Link to="/shop?category=choli" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Navratri Choli Set
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=latkan" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Bridal Mirror Latkans
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=latkan" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Blouse & Lehenga Latkans
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=tassel" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Colourful Long Tassels
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=krishna-outfit" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Krishna Outfits
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Col 3: Gifts & Accessories */}
                      <div className="space-y-2.5">
                        <h4 className="font-bold text-sm text-brand-maroon tracking-tight">
                          Gifts & More
                        </h4>
                        <ul className="space-y-2 text-xs text-brand-ink/80">
                          <li>
                            <Link to="/shop?category=gift-hamper" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Gift Hampers & Boxes
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=gift-hamper" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Macrame Keychains
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=hair-accessories" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Hair Bows & Clips
                            </Link>
                          </li>
                          <li>
                            <Link to="/shop?category=waist-belt" onClick={() => setOpenMega(null)} className="relative inline-block hover:text-brand-maroon transition-colors py-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-brand-maroon after:rounded-full after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-right hover:after:scale-x-100 hover:after:origin-left">
                              Mirror Waist Belts
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Right: 3 Visual Highlight Cards (Col Span 5) - Full Aspect Square (No Cropping) */}
                    <div className="col-span-5 grid grid-cols-3 gap-3.5 items-center">
                      <Link
                        to="/shop?category=earrings"
                        onClick={() => setOpenMega(null)}
                        className="group relative overflow-hidden rounded-2xl aspect-square block shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-[#EDE5DA]"
                      >
                        <img
                          src="/images/category/Earrings.webp"
                          alt="Earrings"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="w-full py-1.5 px-1 bg-white/95 backdrop-blur-xs text-[#1A1A1A] font-bold text-[11px] leading-tight text-center rounded-lg shadow-sm border border-gray-100 group-hover:bg-brand-maroon group-hover:text-white transition-colors">
                            Earrings
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/shop?category=choli"
                        onClick={() => setOpenMega(null)}
                        className="group relative overflow-hidden rounded-2xl aspect-square block shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-[#EDE5DA]"
                      >
                        <img
                          src="/images/category/Choli.webp"
                          alt="Navratri Choli"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="w-full py-1.5 px-1 bg-white/95 backdrop-blur-xs text-[#1A1A1A] font-bold text-[11px] leading-tight text-center rounded-lg shadow-sm border border-gray-100 group-hover:bg-brand-maroon group-hover:text-white transition-colors">
                            Choli Set
                          </div>
                        </div>
                      </Link>

                      <Link
                        to="/shop?category=latkan"
                        onClick={() => setOpenMega(null)}
                        className="group relative overflow-hidden rounded-2xl aspect-square block shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-[#EDE5DA]"
                      >
                        <img
                          src="/images/category/Latkan.webp"
                          alt="Latkan"
                          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="w-full py-1.5 px-1 bg-white/95 backdrop-blur-xs text-[#1A1A1A] font-bold text-[11px] leading-tight text-center rounded-lg shadow-sm border border-gray-100 group-hover:bg-brand-maroon group-hover:text-white transition-colors">
                            Latkans
                          </div>
                        </div>
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Mega Menu Dropdown: Collections */}
            {openMega === "collections" && (
              <div
                className="hidden min-[1024px]:block absolute left-0 right-0 top-full w-full bg-white border-t border-b border-[#EDE5DA] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.16)] animate-fade-slide-down z-50"
                onMouseEnter={() => handleMegaEnter("collections")}
                onMouseLeave={handleMegaLeave}
              >
                <div className="mx-auto max-w-[1500px] px-8 py-8 bg-white">
                  <div className="grid grid-cols-4 gap-6">
                    <Link
                      to="/collections/jewellery-set"
                      onClick={() => setOpenMega(null)}
                      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <img src="/images/hero_twirl_tradition.jpg" alt="Bridal & Festive" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="font-heading font-bold text-sm block">Festive & Bridal Collection</span>
                        <p className="text-[11px] text-white/80">Handcrafted grandeur</p>
                      </div>
                    </Link>
                    <Link
                      to="/collections/latkan"
                      onClick={() => setOpenMega(null)}
                      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <img src="/images/category/Latkan.webp" alt="Latkan Collection" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="font-heading font-bold text-sm block">Mirror Latkan Studio</span>
                        <p className="text-[11px] text-white/80">Intricate royal tasseling</p>
                      </div>
                    </Link>
                    <Link
                      to="/collections/choli"
                      onClick={() => setOpenMega(null)}
                      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <img src="/images/category/Choli.webp" alt="Choli Collection" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="font-heading font-bold text-sm block">Navratri Choli & Attire</span>
                        <p className="text-[11px] text-white/80">Vibrant Gujarati craft</p>
                      </div>
                    </Link>
                    <Link
                      to="/collections/macrame-hanging"
                      onClick={() => setOpenMega(null)}
                      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block shadow-md hover:shadow-xl transition-all duration-300"
                    >
                      <img src="/images/grace_every_thread.jpg" alt="Macrame & Crafts" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <span className="font-heading font-bold text-sm block">Mother & Daughter Edit</span>
                        <p className="text-[11px] text-white/80">Matching festive wear</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
        </div>
      </header>

      {/* Mobile & Tablet Slide-in Drawer */}
      <div className={`min-[1130px]:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          className={`fixed left-0 top-0 z-50 h-full w-[86%] max-w-sm overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 bg-[#FAF8F4]">
            <Link
              to="/"
              onClick={() => {
                setOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src={LOGO} alt="Awesome Handmade" className="h-9 w-9 rounded-full object-cover shadow-sm border border-brand-gold/30" />
              <span className="font-heading text-base font-bold text-brand-ink">Awesome <span className="text-brand-maroon">Handmade</span></span>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-200 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Search Bar inside Drawer */}
          <div className="p-3 border-b border-black/5 bg-[#FAF8F4]">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-brand-ink">
              <Search className="h-3.5 w-3.5 text-brand-ink/40 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery, latkans, cholis..."
                className="w-full bg-transparent outline-none placeholder:text-brand-ink/40 text-brand-ink text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3 text-brand-ink/40 hover:text-brand-maroon" />
                </button>
              )}
            </div>
            {/* Drawer Search Results */}
            {searchQuery.trim() !== "" && (
              <div className="mt-2 max-h-52 overflow-y-auto space-y-1.5 bg-white p-2 rounded-xl border border-gray-100 shadow-inner">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-gray-500 py-1 text-center">No products found</p>
                ) : (
                  searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-brand-cream cursor-pointer"
                      onClick={() => {
                        openQuickView(prod.id);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <img src={prod.image || (prod.images && prod.images[0]) || "/images/category/Gift Hamper.webp"} alt={prod.name} className="h-8 w-8 rounded object-cover" />
                        <div>
                          <p className="text-xs font-medium text-brand-ink truncate max-w-[140px]">{prod.name}</p>
                          <p className="text-[10px] font-bold text-brand-maroon">₹{prod.price}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-brand-maroon">+ View</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Navigation Links Accordion */}
          <ul className="px-2 py-2 text-sm font-medium text-brand-ink bg-white">
            {navLinks.map((link) =>
              link.mega ? (
                <li key={link.label} className="border-b border-black/5">
                  <button
                    type="button"
                    onClick={() => setMobileExpanded((v) => (v === link.key ? null : link.key))}
                    className="flex w-full items-center justify-between px-3 py-3 hover:text-brand-maroon"
                  >
                    <span>{link.label}</span>
                    <ChevronDown className={`h-4 w-4 text-brand-gold transition-transform ${mobileExpanded === link.key ? "rotate-180" : ""}`} />
                  </button>
                  {mobileExpanded === link.key && (
                    <div className="pb-2 pl-3 animate-fade-slide-down border-l-2 border-brand-gold/30 ml-3 mb-2">
                      {categories.map((cat) => (
                        <div key={cat.slug} className="border-b border-black/5 last:border-0">
                          <div className="flex items-center justify-between">
                            <Link
                              to={`/shop?category=${cat.slug}`}
                              onClick={() => setOpen(false)}
                              className="flex-1 py-2.5 text-left text-xs font-semibold text-brand-ink hover:text-brand-maroon transition-colors"
                            >
                              {cat.name}
                            </Link>
                            {cat.subs.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setMobileCatExpanded((v) => (v === cat.slug ? null : cat.slug))}
                                className="p-2 text-gray-400 hover:text-brand-maroon"
                                aria-label={`Expand ${cat.name}`}
                              >
                                <ChevronRight className={`h-3.5 w-3.5 transition-transform ${mobileCatExpanded === cat.slug ? "rotate-90 text-brand-maroon" : ""}`} />
                              </button>
                            )}
                          </div>
                          {cat.subs.length > 0 && mobileCatExpanded === cat.slug && (
                            <ul className="pl-4 pb-2 space-y-1 animate-fade-slide-down">
                              <li key="all">
                                <Link
                                  to={`/shop?category=${cat.slug}`}
                                  onClick={() => setOpen(false)}
                                  className="block px-2 py-1 text-xs font-semibold text-brand-maroon hover:underline"
                                >
                                  • View All {cat.name}
                                </Link>
                              </li>
                              {cat.subs.map((s) => (
                                <li key={s.slug}>
                                  <Link
                                    to={`/shop?category=${cat.slug}&sub=${s.slug}`}
                                    onClick={() => setOpen(false)}
                                    className="block px-2 py-1 text-xs text-brand-ink/70 hover:text-brand-maroon"
                                  >
                                    • {s.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
                <li key={link.label} className="border-b border-black/5">
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block px-3 py-3 hover:text-brand-maroon"
                  >
                    {link.label}
                  </a>
                </li>
              )
            )}
            
            {/* Wishlist Link in Mobile */}
            <li className="border-b border-black/5">
              <a
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-between px-3 py-3 hover:text-brand-maroon text-left"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-[#D84A6B]" /> Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="rounded-full bg-[#D84A6B] px-2 py-0.5 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </a>
            </li>

            {/* Cart Link in Mobile */}
            <li className="border-b border-black/5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex w-full items-center justify-between px-3 py-3 hover:text-brand-maroon text-left"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-brand-maroon" /> Shopping Bag
                </span>
                {totalItemsCount > 0 && (
                  <span className="rounded-full bg-brand-maroon px-2 py-0.5 text-[10px] font-bold text-white">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </li>

            {/* Contact / Help in Mobile */}
            <li>
              <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")} className="flex items-center gap-2 px-3 py-3 hover:text-brand-maroon">
                <User className="h-4 w-4 text-gray-500" /> Contact & Support
              </a>
            </li>
          </ul>

          {/* Drawer Footer with Store Info */}
          <div className="p-4 mt-6 bg-[#FAF8F4] border-t border-black/5 text-xs text-brand-ink/70 space-y-2">
            <p className="font-semibold text-brand-ink">Awesome Handmade</p>
            <p>Shop-5, Soham Arcade, Pal Gam, Surat, Gujarat</p>
            <p className="font-medium text-brand-maroon">+91 98243 02072</p>
          </div>
        </aside>
      </div>
    </>
  );
}
