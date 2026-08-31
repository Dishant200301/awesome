import React, { useState, useEffect, useRef } from 'react';
import { 
  SlidersHorizontal, 
  Image as ImageIcon, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Check, 
  ExternalLink,
  Search,
  Sparkles,
  UploadCloud,
  X,
  CheckCircle2,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Edit3,
  Link as LinkIcon,
  Palette
} from 'lucide-react';
import { HeroSlide, HomepageBanner, ContentPageItem, BlogPost, FaqItem } from '../types/admin';
import { MOCK_HERO_SLIDES, MOCK_PROMO_BANNER } from '../data/mockAdminData';
import { AdminApiService } from '../services/adminApi';
import { idbGet, idbSet } from '../data/idbStorage';

interface ContentPagesProps {
  initialSubTab?: 'hero-slider' | 'homepage-banners' | 'content-pages' | 'content-blog' | 'content-faq';
}

// Client-side automatic image compressor for high-resolution uploads
const compressImage = (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.85): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData && webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch (err) {}

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData || (e.target?.result as string));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const ContentPages: React.FC<ContentPagesProps> = ({ initialSubTab = 'hero-slider' }) => {
  const [subTab, setSubTab] = useState(initialSubTab);

  // 1. Hero Sliders State
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    try {
      const saved = localStorage.getItem('awesome_hero_slides') || localStorage.getItem('aocind_hero_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return MOCK_HERO_SLIDES;
  });

  // 2. Banners State (Promo Banner & Side Banners)
  const [promoBanner, setPromoBanner] = useState<HomepageBanner>(() => {
    try {
      const saved = localStorage.getItem('awesome_promo_banner') || localStorage.getItem('aocind_promo_banner');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.image || parsed.title)) return parsed;
      }
    } catch (e) {}
    return MOCK_PROMO_BANNER;
  });

  // 3. Static Pages State
  const [pages, setPages] = useState<ContentPageItem[]>([
    {
      id: "page-1",
      title: "About Awesome Handmade",
      slug: "about-us",
      content: "Awesome Handmade is India's premier artisanal handcrafted fashion and accessories brand crafted with love and authentic craftsmanship in Surat, Gujarat.",
      metaTitle: "About Us - Awesome Handmade",
      metaDescription: "Learn about Awesome Handmade's story, artisan roots, and authentic handcrafting.",
      status: "Published",
      updatedAt: "2026-08-01"
    },
    {
      id: "page-2",
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: "We protect your personal data with SSL encryption.",
      metaTitle: "Privacy Policy - Awesome Handmade",
      metaDescription: "Read Awesome Handmade's privacy and data protection terms.",
      status: "Published",
      updatedAt: "2026-08-01"
    }
  ]);

  // Search filter
  const [search, setSearch] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Slide Edit Modal State
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const promoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Promo Banner Edit Modal State
  const [editingPromoBanner, setEditingPromoBanner] = useState<HomepageBanner | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const promoModalDesktopRef = useRef<HTMLInputElement | null>(null);
  const promoModalMobileRef = useRef<HTMLInputElement | null>(null);

  // Fetch initial data from API and sync with state
  const loadContentData = async () => {
    // 1. Try loading from IndexedDB first (supports high-res base64 images without 5MB quota limit)
    try {
      const idbSlides = await idbGet<HeroSlide[]>('awesome_hero_slides');
      if (Array.isArray(idbSlides) && idbSlides.length > 0) {
        setSlides(idbSlides);
      }
    } catch (e) {}

    try {
      const idbBanner = await idbGet<HomepageBanner>('awesome_promo_banner');
      if (idbBanner && (idbBanner.image || idbBanner.title)) {
        setPromoBanner(idbBanner);
      }
    } catch (e) {}

    // 2. Fetch from backend API
    try {
      const liveSlides = await AdminApiService.getHeroSlides();
      if (Array.isArray(liveSlides) && liveSlides.length > 0) {
        setSlides(liveSlides);
        await idbSet('awesome_hero_slides', liveSlides);
        try {
          localStorage.setItem('awesome_hero_slides', JSON.stringify(liveSlides));
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error fetching hero slides:', e);
    }

    try {
      const liveBanner = await AdminApiService.getPromoBanner();
      if (liveBanner && (liveBanner.image || liveBanner.title)) {
        setPromoBanner(liveBanner);
        await idbSet('awesome_promo_banner', liveBanner);
        try {
          localStorage.setItem('awesome_promo_banner', JSON.stringify(liveBanner));
        } catch (e) {}
      }
    } catch (e) {
      console.error('Error fetching promo banner:', e);
    }
  };

  useEffect(() => {
    loadContentData();
    window.addEventListener('focus', loadContentData);
    return () => window.removeEventListener('focus', loadContentData);
  }, [subTab]);

  // Broadcast & Sync Hero Slides
  const syncSlidesToBackend = async (newSlides: HeroSlide[]) => {
    setSlides(newSlides);

    // 1. Save to IndexedDB (Unlimited quota)
    await idbSet('awesome_hero_slides', newSlides);

    // 2. Save to localStorage safely (catch quota exceeded)
    try {
      localStorage.setItem('awesome_hero_slides', JSON.stringify(newSlides));
    } catch (e) {
      console.warn("localStorage quota exceeded, successfully persisted to IndexedDB & server API.");
    }

    // 3. Sync to backend API
    try {
      await AdminApiService.syncHeroSlides(newSlides);
    } catch (e) {
      console.error('Error syncing hero slides to backend:', e);
    }

    // 4. Notify BroadcastChannel
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('awesome_content_sync');
        bc.postMessage({ type: 'HERO_UPDATED', slides: newSlides });
      } catch (e) {}
    }

    showSaveToast();
  };

  // Broadcast & Sync Promo Banner
  const syncPromoBannerToBackend = async (newBanner: HomepageBanner) => {
    setPromoBanner(newBanner);

    // 1. Save to IndexedDB
    await idbSet('awesome_promo_banner', newBanner);

    // 2. Save to localStorage safely
    try {
      localStorage.setItem('awesome_promo_banner', JSON.stringify(newBanner));
    } catch (e) {}

    // 3. Sync to backend API
    try {
      await AdminApiService.updatePromoBanner(newBanner);
    } catch (e) {
      console.error('Error syncing promo banner to backend:', e);
    }

    // 4. Notify BroadcastChannel
    if ('BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('awesome_content_sync');
        bc.postMessage({ type: 'BANNER_UPDATED', banner: newBanner });
      } catch (e) {}
    }

    showSaveToast();
  };

  const showSaveToast = () => {
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Handle Image Upload for Hero Slide (with automatic WebP compression)
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    const compressed = await compressImage(file, isMobile ? 1080 : 1920, isMobile ? 1920 : 1080, 0.85);
    if (!compressed) return;

    if (isMobile) {
      setEditingSlide((prev) => prev ? { ...prev, mobileImage: compressed } : null);
    } else {
      setEditingSlide((prev) => prev ? { ...prev, image: compressed, mobileImage: prev.mobileImage || compressed } : null);
    }
  };

  // Handle Promo Banner Image Upload
  const handlePromoBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file, 1920, 1080, 0.85);
    if (!compressed) return;

    const updated = { ...promoBanner, image: compressed };
    syncPromoBannerToBackend(updated);
  };

  // Handle Image Upload inside Promo Banner Edit Modal
  const handlePromoModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file || !editingPromoBanner) return;

    const compressed = await compressImage(file, isMobile ? 1080 : 1920, isMobile ? 1920 : 1080, 0.85);
    if (!compressed) return;

    if (isMobile) {
      setEditingPromoBanner((prev) => prev ? { ...prev, mobileImage: compressed } : null);
    } else {
      setEditingPromoBanner((prev) => prev ? { ...prev, image: compressed } : null);
    }
  };

  // Toggle Promo Banner Active/Inactive status directly from card
  const togglePromoBannerStatus = () => {
    const updated: HomepageBanner = {
      ...promoBanner,
      status: promoBanner.status === 'Active' ? 'Inactive' : 'Active'
    };
    syncPromoBannerToBackend(updated);
  };

  // Save Promo Banner Edit Modal
  const saveEditingPromoBanner = () => {
    if (!editingPromoBanner) return;
    syncPromoBannerToBackend(editingPromoBanner);
    setIsPromoModalOpen(false);
    setEditingPromoBanner(null);
  };

  // Reorder Slide Up
  const moveSlideUp = (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    const temp = newSlides[index - 1];
    newSlides[index - 1] = newSlides[index];
    newSlides[index] = temp;
    syncSlidesToBackend(newSlides);
  };

  // Reorder Slide Down
  const moveSlideDown = (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    const temp = newSlides[index + 1];
    newSlides[index + 1] = newSlides[index];
    newSlides[index] = temp;
    syncSlidesToBackend(newSlides);
  };

  // Toggle Slide Status
  const toggleSlideStatus = (id: string) => {
    const newSlides = slides.map((s) =>
      s.id === id ? { ...s, status: s.status === 'Active' ? ('Inactive' as const) : ('Active' as const) } : s
    );
    syncSlidesToBackend(newSlides);
  };

  // Delete Slide
  const deleteSlide = (id: string) => {
    if (confirm('Are you sure you want to delete this hero slide?')) {
      const newSlides = slides.filter((s) => s.id !== id);
      syncSlidesToBackend(newSlides);
    }
  };

  // Save Modal
  const saveEditingSlide = () => {
    if (!editingSlide) return;

    const exists = slides.some((s) => s.id === editingSlide.id);
    let newSlides: HeroSlide[];
    if (exists) {
      newSlides = slides.map((s) => (s.id === editingSlide.id ? editingSlide : s));
    } else {
      newSlides = [...slides, editingSlide];
    }
    syncSlidesToBackend(newSlides);
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const filteredSlides = slides.filter((s) =>
    (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.tag || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.subtitle || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 max-w-[1400px] mx-auto pb-24 font-sans">
      {/* TOAST NOTIFICATION */}
      {isSavedNotice && (
        <div className="fixed top-6 right-6 z-50 bg-black text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Content updated & synced to storefront live!</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>Store Content & Banners Management</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Manage homepage hero slides, festive promo banners, static pages, and FAQs live across all devices.
          </p>
        </div>

        {/* SUBTAB SWITCHER */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('hero-slider')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'hero-slider' ? 'bg-zinc-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Hero Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('homepage-banners')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'homepage-banners' ? 'bg-zinc-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Promo Banner</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('content-pages')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'content-pages' ? 'bg-zinc-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pages</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search slides, banners, content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-xs font-bold text-slate-900 outline-none"
        />
      </div>

      {/* SUBMODULE 1: HERO SLIDERS (100% DYNAMIC FULL CRUD) */}
      {subTab === 'hero-slider' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Hero Carousel Slides ({slides.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Drag, reorder, edit headlines, button links, and replace desktop/mobile hero background images.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingSlide({
                  id: `slide-${Date.now()}`,
                  tag: 'Grace in Every',
                  title: 'New Festive Collection',
                  subtitle: 'Timeless handcrafted designs made in Surat.',
                  image: '/images/home/hero/hero-1.webp',
                  mobileImage: '/images/home/hero/mobile-1.webp',
                  buttonText: 'Shop Collection',
                  link: '#categories',
                  theme: 'gold',
                  align: 'left',
                  status: 'Active',
                  sortOrder: slides.length + 1
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Hero Slide</span>
            </button>
          </div>

          {/* SLIDES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSlides.map((s, index) => (
              <div
                key={s.id}
                className={`p-5 rounded-3xl bg-white border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs ${
                  s.status === 'Inactive' ? 'opacity-60 border-dashed border-slate-300' : 'border-slate-200 hover:border-black'
                }`}
              >
                {/* PREVIEW BANNER */}
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/home/hero/hero-1.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                    {s.tag && (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300 mb-0.5">
                        {s.tag}
                      </span>
                    )}
                    <h4 className="font-bold text-base leading-snug line-clamp-1">{s.title}</h4>
                    {s.subtitle && (
                      <p className="text-[11px] text-white/80 font-light line-clamp-1 mt-0.5">
                        {s.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                        s.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Slide Order Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* DETAILS & ACTIONS */}
                <div className="space-y-3 pt-1 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">Button:</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {s.buttonText} &rarr; {s.link}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold">Theme:</span>
                      <span className="capitalize font-semibold text-slate-700">{s.theme || 'Gold'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    {/* Move Up/Down Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSlideUp(index)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlideDown(index)}
                        disabled={index === slides.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-slate-700"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit, Status, Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleSlideStatus(s.id)}
                        title={s.status === 'Active' ? 'Hide Slide' : 'Show Slide'}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-700"
                      >
                        {s.status === 'Active' ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlide({ ...s });
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSlide(s.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMODULE 2: PROMO BANNER (HERO-STYLE CARD WITH EDIT POPUP MODAL) */}
      {subTab === 'homepage-banners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Festive Promotional Banner
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Configure the full-width promotional banner displayed below the category section.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPromoBanner({ ...promoBanner });
                setIsPromoModalOpen(true);
              }}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Promo Banner</span>
            </button>
          </div>

          {/* PROMO BANNER CARD LISTING */}
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Index / Tag */}
                <div className="flex flex-col items-center justify-center gap-1 text-slate-400 select-none">
                  <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    #1
                  </span>
                </div>

                {/* Thumbnails (Desktop + Mobile) */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative w-28 sm:w-36 aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group">
                    <img
                      src={promoBanner.image || '/images/banner/banner.webp'}
                      alt={promoBanner.title || 'Desktop Banner'}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                      Desktop
                    </span>
                  </div>

                  <div className="relative w-12 sm:w-14 aspect-[9/16] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 hidden sm:block">
                    <img
                      src={promoBanner.mobileImage || '/images/banner/mobile-banner.webp'}
                      alt={promoBanner.title || 'Mobile Banner'}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/70 text-white px-1 py-0.2 rounded backdrop-blur-xs">
                      Mob
                    </span>
                  </div>
                </div>

                {/* Banner Content Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {promoBanner.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                        {promoBanner.badge}
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {promoBanner.title || 'Handmade Necklace'}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        promoBanner.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {promoBanner.status || 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {promoBanner.subtitle || 'Crafted with colour, culture & love.'}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span className="text-slate-600 font-medium font-mono">
                      Btn: {promoBanner.buttonText || 'SHOP NOW'}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-500 truncate max-w-[200px]">
                      {promoBanner.link || '/shop?category=Necklace'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Eye Toggle, Edit */}
              <div className="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={togglePromoBannerStatus}
                  title={promoBanner.status === 'Active' ? 'Hide Banner' : 'Show Banner'}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-700 transition"
                >
                  {promoBanner.status === 'Active' ? (
                    <Eye className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingPromoBanner({ ...promoBanner });
                    setIsPromoModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMODULE 3: STATIC PAGES */}
      {subTab === 'content-pages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Custom Static Pages ({pages.length})</h3>
            <button
              type="button"
              onClick={() => {
                const newPage: ContentPageItem = {
                  id: `page-${Date.now()}`,
                  title: 'New Store Page',
                  slug: `page-${Date.now()}`,
                  content: 'Page content description here...',
                  status: 'Published',
                  updatedAt: new Date().toISOString().split('T')[0]
                };
                setPages([...pages, newPage]);
                showSaveToast();
              }}
              className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Page</span>
            </button>
          </div>

          <div className="space-y-4">
            {pages.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">/{p.slug}</span>
                    <span>• Updated {p.updatedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                    {p.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPages(pages.filter((item) => item.id !== p.id));
                      showSaveToast();
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HERO SLIDE ADD / EDIT MODAL */}
      {isModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-black" />
                <h3 className="text-sm font-black text-slate-900">
                  {editingSlide.id.startsWith('slide-') && slides.some(s => s.id === editingSlide.id) ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSlide(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* DESKTOP & MOBILE IMAGES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desktop Image */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Desktop Image (Landscape) *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSlideImageUpload(e, false)}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-black cursor-pointer bg-slate-50 flex flex-col items-center justify-center group"
                  >
                    {editingSlide.image ? (
                      <img src={editingSlide.image} alt="Desktop Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-600">Click to Upload Desktop Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="or /images/home/hero/hero-1.webp"
                    value={editingSlide.image}
                    onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-black"
                  />
                </div>

                {/* Mobile Image */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Image (Portrait)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="mobile-slide-upload"
                    onChange={(e) => handleSlideImageUpload(e, true)}
                    className="hidden"
                  />
                  <div
                    onClick={() => document.getElementById('mobile-slide-upload')?.click()}
                    className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-black cursor-pointer bg-slate-50 flex flex-col items-center justify-center group"
                  >
                    {editingSlide.mobileImage ? (
                      <img src={editingSlide.mobileImage} alt="Mobile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-600">Click to Upload Mobile Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="or /images/home/hero/mobile-1.webp"
                    value={editingSlide.mobileImage || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, mobileImage: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* TITLE & TAG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kicker / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grace in Every or HANDCRAFTED JEWELLERY"
                    value={editingSlide.tag || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, tag: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Main Headline Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Thread or Twirl Into Tradition"
                    value={editingSlide.title}
                    onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* SUBTITLE */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Timeless ethnic wear crafted with love, precision and elegance."
                  value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                />
              </div>

              {/* BUTTON TEXT & LINK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Collection"
                    value={editingSlide.buttonText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, buttonText: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    CTA Button Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. #categories or /shop?category=Latkan"
                    value={editingSlide.link}
                    onChange={(e) => setEditingSlide({ ...editingSlide, link: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* THEME & ALIGNMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Text Theme Styling
                  </label>
                  <select
                    value={editingSlide.theme || 'gold'}
                    onChange={(e) => setEditingSlide({ ...editingSlide, theme: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black bg-white"
                  >
                    <option value="gold">Gold Luxury Gradient</option>
                    <option value="maroon">Deep Maroon Velvet</option>
                    <option value="purple">Royal Purple Elegance</option>
                    <option value="dark">Classic Dark Ink</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Text Alignment
                  </label>
                  <select
                    value={editingSlide.align || 'left'}
                    onChange={(e) => setEditingSlide({ ...editingSlide, align: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black bg-white"
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>
              </div>

              {/* STATUS TOGGLE */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Slide Status</span>
                  <span className="text-[11px] text-slate-500">Enable or temporarily hide this slide from the live storefront</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingSlide({
                      ...editingSlide,
                      status: editingSlide.status === 'Active' ? 'Inactive' : 'Active'
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    editingSlide.status === 'Active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {editingSlide.status}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSlide(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditingSlide}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md active:scale-95"
              >
                Save Slide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMO BANNER ADD / EDIT MODAL */}
      {isPromoModalOpen && editingPromoBanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-black" />
                <h3 className="text-sm font-black text-slate-900">Edit Promotional Banner</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPromoModalOpen(false);
                  setEditingPromoBanner(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* DESKTOP & MOBILE IMAGES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Desktop Image */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Desktop Banner Image (Landscape) *
                  </label>
                  <input
                    ref={promoModalDesktopRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePromoModalImageUpload(e, false)}
                    className="hidden"
                  />
                  <div
                    onClick={() => promoModalDesktopRef.current?.click()}
                    className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-black cursor-pointer bg-slate-50 flex flex-col items-center justify-center group"
                  >
                    {editingPromoBanner.image ? (
                      <img
                        src={editingPromoBanner.image}
                        alt="Desktop Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-600">Click to Upload Desktop Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="or /images/banner/banner.webp"
                    value={editingPromoBanner.image}
                    onChange={(e) =>
                      setEditingPromoBanner({ ...editingPromoBanner, image: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-black"
                  />
                </div>

                {/* Mobile Image */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Banner Image (Portrait)
                  </label>
                  <input
                    ref={promoModalMobileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePromoModalImageUpload(e, true)}
                    className="hidden"
                  />
                  <div
                    onClick={() => promoModalMobileRef.current?.click()}
                    className="relative aspect-[16/9] rounded-xl overflow-hidden border-2 border-dashed border-slate-300 hover:border-black cursor-pointer bg-slate-50 flex flex-col items-center justify-center group"
                  >
                    {editingPromoBanner.mobileImage ? (
                      <img
                        src={editingPromoBanner.mobileImage}
                        alt="Mobile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold text-slate-600">Click to Upload Mobile Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="or /images/banner/mobile-banner.webp"
                    value={editingPromoBanner.mobileImage || ''}
                    onChange={(e) =>
                      setEditingPromoBanner({ ...editingPromoBanner, mobileImage: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* TAGLINE / BADGE & TITLE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Badge / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Festive Collection"
                    value={editingPromoBanner.badge || ''}
                    onChange={(e) =>
                      setEditingPromoBanner({ ...editingPromoBanner, badge: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Main Headline Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Handmade Necklace"
                    value={editingPromoBanner.title || ''}
                    onChange={(e) =>
                      setEditingPromoBanner({ ...editingPromoBanner, title: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* SUBTITLE */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Crafted with colour, culture & love."
                  value={editingPromoBanner.subtitle || ''}
                  onChange={(e) =>
                    setEditingPromoBanner({ ...editingPromoBanner, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                />
              </div>

              {/* BUTTON TEXT & LINK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SHOP NOW"
                    value={editingPromoBanner.buttonText || ''}
                    onChange={(e) =>
                      setEditingPromoBanner({ ...editingPromoBanner, buttonText: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    CTA Button Link
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /shop?category=Necklace"
                    value={editingPromoBanner.link || ''}
                    onChange={(e) =>
                      setEditingPromoBanner({ ...editingPromoBanner, link: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* STATUS TOGGLE */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Banner Status</span>
                  <span className="text-[11px] text-slate-500">
                    Enable or temporarily hide this banner from the live storefront
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPromoBanner({
                      ...editingPromoBanner,
                      status: editingPromoBanner.status === 'Active' ? 'Inactive' : 'Active'
                    })
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    editingPromoBanner.status === 'Active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {editingPromoBanner.status || 'Active'}
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsPromoModalOpen(false);
                  setEditingPromoBanner(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditingPromoBanner}
                className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md active:scale-95"
              >
                Save Promo Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPages;
