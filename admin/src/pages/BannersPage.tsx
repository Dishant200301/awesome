import React, { useState, useEffect } from 'react';
import { getAdminApiBase, getAdminAuthHeaders } from '../utils/authHeaders';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  UploadCloud,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  SlidersHorizontal,
  Link as LinkIcon
} from 'lucide-react';
import { HeroSlide, HomepageBanner } from '../types/admin';
import { MOCK_HERO_SLIDES, MOCK_PROMO_BANNER } from '../data/mockAdminData';
import { idbGet, idbSet } from '../data/idbStorage';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface BannersPageProps {
  initialTab?: 'hero-slider' | 'homepage-banners';
  onNavigate?: (tab: string) => void;
}

const API_BASE = getAdminApiBase();

export const BannersPage: React.FC<BannersPageProps> = ({
  initialTab = 'hero-slider',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'hero-slider' | 'homepage-banners'>(initialTab);
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Global Grid Preview Mode (Desktop vs Mobile)
  const [gridPreviewMode, setGridPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // 1. HERO SLIDES STATE
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('awesome_hero_slides') || localStorage.getItem('aocind_hero_slides');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return MOCK_HERO_SLIDES;
  });

  // 2. PROMOTIONAL BANNERS STATE (List)
  const [promoBanners, setPromoBanners] = useState<HomepageBanner[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedList = localStorage.getItem('awesome_promo_banners') || localStorage.getItem('aocind_promo_banners');
        if (savedList) {
          const parsed = JSON.parse(savedList);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        const savedSingle = localStorage.getItem('awesome_promo_banner') || localStorage.getItem('aocind_promo_banner');
        if (savedSingle) {
          const parsed = JSON.parse(savedSingle);
          if (parsed && typeof parsed === 'object') return [parsed];
        }
      } catch (e) {}
    }
    return [MOCK_PROMO_BANNER];
  });

  // Slide Edit / Create Modal State
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Promo Banner Edit / Create Modal State
  const [editingPromoBanner, setEditingPromoBanner] = useState<HomepageBanner | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Delete Modal Candidates
  const [deleteSlideCandidate, setDeleteSlideCandidate] = useState<HeroSlide | null>(null);
  const [deletePromoCandidate, setDeletePromoCandidate] = useState<HomepageBanner | null>(null);

  // Drag states
  const [isDragOverDesktop, setIsDragOverDesktop] = useState(false);
  const [isDragOverMobile, setIsDragOverMobile] = useState(false);
  const [isDragOverPromoDesktop, setIsDragOverPromoDesktop] = useState(false);
  const [isDragOverPromoMobile, setIsDragOverPromoMobile] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync state if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load from IndexedDB / API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const idbSlides = await idbGet<HeroSlide[]>('awesome_hero_slides');
        if (idbSlides && Array.isArray(idbSlides) && idbSlides.length > 0) {
          setSlides(idbSlides);
        }

        const idbPromos = await idbGet<HomepageBanner[]>('awesome_promo_banners');
        if (idbPromos && Array.isArray(idbPromos) && idbPromos.length > 0) {
          setPromoBanners(idbPromos);
        } else {
          const idbPromo = await idbGet<HomepageBanner>('awesome_promo_banner');
          if (idbPromo && typeof idbPromo === 'object') {
            setPromoBanners([idbPromo]);
          }
        }
      } catch (e) {}

      // Fetch from Express Backend
      try {
        const res = await fetch(`${API_BASE}/content/hero-slides`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            setSlides(json.data);
            await idbSet('awesome_hero_slides', json.data);
          }
        }
      } catch (e) {}
    };

    loadData();
  }, []);

  // Broadcast Slides Changes
  const saveSlides = async (newSlides: HeroSlide[]) => {
    setSlides(newSlides);
    await idbSet('awesome_hero_slides', newSlides);

    try {
      localStorage.setItem('awesome_hero_slides', JSON.stringify(newSlides));
      localStorage.setItem('aocind_hero_slides', JSON.stringify(newSlides));
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('awesome_content_sync'));
      window.dispatchEvent(new Event('aocind_content_sync'));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('awesome_content_sync');
        bc.postMessage({ type: 'HERO_SLIDES_UPDATED', slides: newSlides });
        bc.close();
      }
    }

    // Push to backend
    fetch(`${API_BASE}/content/hero-slides/sync`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ slides: newSlides }),
    }).catch(() => {});
  };

  // Broadcast Promo Banners Changes
  const savePromoBanners = async (newBanners: HomepageBanner[]) => {
    setPromoBanners(newBanners);
    await idbSet('awesome_promo_banners', newBanners);

    const primaryBanner = newBanners.find((b) => b.status === 'Active') || newBanners[0] || MOCK_PROMO_BANNER;
    await idbSet('awesome_promo_banner', primaryBanner);

    try {
      localStorage.setItem('awesome_promo_banners', JSON.stringify(newBanners));
      localStorage.setItem('aocind_promo_banners', JSON.stringify(newBanners));
      localStorage.setItem('awesome_promo_banner', JSON.stringify(primaryBanner));
      localStorage.setItem('aocind_promo_banner', JSON.stringify(primaryBanner));
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('awesome_content_sync'));
      window.dispatchEvent(new Event('aocind_content_sync'));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('awesome_content_sync');
        bc.postMessage({ type: 'PROMO_BANNER_UPDATED', banner: primaryBanner, banners: newBanners });
        bc.close();
      }
    }

    // Push to backend
    fetch(`${API_BASE}/content/promo-banner/sync`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ banner: primaryBanner, banners: newBanners }),
    }).catch(() => {});
  };

  // Slide Actions
  const handleOpenAddSlide = () => {
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
    setIsSlideModalOpen(true);
  };

  const handleSaveEditingSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    const exists = slides.some((s) => s.id === editingSlide.id);
    let updated: HeroSlide[];

    if (exists) {
      updated = slides.map((s) => (s.id === editingSlide.id ? editingSlide : s));
      showToast(`Updated slide "${editingSlide.title}"`);
    } else {
      updated = [...slides, editingSlide];
      showToast(`Created new slide "${editingSlide.title}"`);
    }

    await saveSlides(updated);
    setIsSlideModalOpen(false);
    setEditingSlide(null);
  };

  const handleToggleSlideStatus = async (slideId: string, active: boolean) => {
    const nextStatus: 'Active' | 'Inactive' = active ? 'Active' : 'Inactive';
    const updated = slides.map((s) =>
      s.id === slideId ? { ...s, status: nextStatus } : s
    );
    await saveSlides(updated);
    showToast(`Slide marked ${nextStatus}`);
  };

  const handleDeleteSlide = (slide: HeroSlide) => {
    setDeleteSlideCandidate(slide);
  };

  const confirmDeleteSlide = async () => {
    if (!deleteSlideCandidate) return;
    const updated = slides.filter((s) => s.id !== deleteSlideCandidate.id);
    await saveSlides(updated);
    setDeleteSlideCandidate(null);
    showToast('Slide deleted successfully');
  };

  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const next = [...slides];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    // re-assign sort orders
    const updated = next.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    await saveSlides(updated);
    showToast('Slide order updated');
  };

  // Promo Banner Actions
  const handleOpenAddPromoBanner = () => {
    setEditingPromoBanner({
      id: `promo-banner-${Date.now()}`,
      badge: 'Festive Collection',
      title: 'Handmade Necklace Studio',
      subtitle: 'Crafted with colour, culture & love.',
      buttonText: 'SHOP NOW',
      link: '/shop?category=Necklace',
      image: '/images/banner/banner.webp',
      mobileImage: '/images/banner/mobile-banner.webp',
      gridPosition: 'Main Promo Banner',
      showTextOverlay: true,
      status: 'Active'
    });
    setIsPromoModalOpen(true);
  };

  const handleSaveEditingPromoBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromoBanner) return;

    const exists = promoBanners.some((b) => b.id === editingPromoBanner.id);
    let updated: HomepageBanner[];

    if (exists) {
      updated = promoBanners.map((b) => (b.id === editingPromoBanner.id ? editingPromoBanner : b));
      showToast(`Updated promo banner "${editingPromoBanner.title}"`);
    } else {
      updated = [...promoBanners, editingPromoBanner];
      showToast(`Added new promo banner "${editingPromoBanner.title}"`);
    }

    await savePromoBanners(updated);
    setIsPromoModalOpen(false);
    setEditingPromoBanner(null);
  };

  const handleTogglePromoStatus = async (bannerId: string, active: boolean) => {
    const nextStatus: 'Active' | 'Inactive' = active ? 'Active' : 'Inactive';
    const updated = promoBanners.map((b) =>
      b.id === bannerId ? { ...b, status: nextStatus } : b
    );
    await savePromoBanners(updated);
    showToast(`Promo banner marked ${nextStatus}`);
  };

  const handleDeletePromoBanner = (banner: HomepageBanner) => {
    if (promoBanners.length <= 1) {
      showToast('You must keep at least one promotional banner.');
      return;
    }
    setDeletePromoCandidate(banner);
  };

  const confirmDeletePromoBanner = async () => {
    if (!deletePromoCandidate) return;
    const updated = promoBanners.filter((b) => b.id !== deletePromoCandidate.id);
    await savePromoBanners(updated);
    setDeletePromoCandidate(null);
    showToast('Promotional banner deleted');
  };

  // Helper to read and optimize image file to base64
  const processImageFile = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/webp', 0.85);
          callback(compressed);
        } else {
          callback(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste Support (Ctrl + V)
  useEffect(() => {
    if (!isSlideModalOpen && !isPromoModalOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file, (dataUrl) => {
              if (isSlideModalOpen) {
                setEditingSlide((prev) => (prev ? { ...prev, image: dataUrl } : null));
                showToast('Hero image pasted from clipboard!');
              } else if (isPromoModalOpen) {
                setEditingPromoBanner((prev) => (prev ? { ...prev, image: dataUrl } : null));
                showToast('Promo banner image pasted from clipboard!');
              }
            });
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isSlideModalOpen, isPromoModalOpen]);

  // Filtered Slides
  const filteredSlides = slides.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
      (s.tag && s.tag.toLowerCase().includes(q))
    );
  });

  // Filtered Promo Banners
  const filteredPromoBanners = promoBanners.filter((b) => {
    const q = search.toLowerCase();
    return (
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
      (b.badge && b.badge.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-16 font-sans text-neutral-900 selection:bg-black selection:text-white">
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-950 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="px-4 sm:px-8 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div className="space-y-1">
            <h1 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-neutral-900" />
              <span>Banners &amp; Visual Showcase</span>
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Configure hero carousel slides and homepage promotional banners for Desktop and Mobile view.
            </p>
          </div>

          {/* Subtab Toggle Buttons */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('hero-slider');
                setSearch('');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hero-slider'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Hero Carousel ({slides.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('homepage-banners');
                setSearch('');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'homepage-banners'
                  ? 'bg-neutral-950 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Promo Banners ({promoBanners.length})</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: HERO CAROUSEL SLIDES */}
        {/* ========================================================================= */}
        {activeTab === 'hero-slider' && (
          <div className="space-y-6">
            {/* SEARCH, DEVICE PREVIEW TOGGLE & ACTIONS BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search slides by title or tag..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Device View Switcher for Grid */}
                <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setGridPreviewMode('desktop')}
                    title="Preview Desktop Banners"
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      gridPreviewMode === 'desktop'
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGridPreviewMode('mobile')}
                    title="Preview Mobile Banners"
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      gridPreviewMode === 'mobile'
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSlide}
                className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hero Slide</span>
              </button>
            </div>

            {/* SLIDES GRID */}
            {filteredSlides.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3 shadow-2xs">
                <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-900">No Hero Slides Found</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  No slides match your search query. Add your first carousel slide.
                </p>
                <Button
                  onClick={handleOpenAddSlide}
                  size="sm"
                  className="bg-neutral-950 text-white text-xs font-semibold mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Hero Slide</span>
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  gridPreviewMode === 'mobile'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {filteredSlides.map((slide, index) => {
                  const isActive = slide.status === 'Active';
                  const displayImg =
                    gridPreviewMode === 'mobile'
                      ? slide.mobileImage || slide.image
                      : slide.image;

                  return (
                    <div
                      key={slide.id}
                      className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md flex flex-col justify-between ${
                        isActive
                          ? 'border-neutral-200/90'
                          : 'border-dashed border-neutral-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* CARD MEDIA HEADER */}
                      <div className="relative">
                        <div
                          className={`relative overflow-hidden bg-neutral-900 ${
                            gridPreviewMode === 'mobile'
                              ? 'aspect-[9/14]'
                              : 'aspect-[16/8]'
                          }`}
                        >
                          <img
                            src={displayImg || '/images/home/hero/hero-1.webp'}
                            alt={slide.title}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/images/home/hero/hero-1.webp';
                            }}
                          />

                          {/* Gradient Vignette overlay for text legibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 flex flex-col justify-end text-white">
                            {slide.tag && (
                              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300 line-clamp-1">
                                {slide.tag}
                              </span>
                            )}
                            <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 mt-0.5">
                              {slide.title}
                            </h3>
                            {slide.subtitle && (
                              <p className="text-[11px] text-white/80 font-light line-clamp-2 mt-1">
                                {slide.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Top Badges: Order & Status */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-xs text-white">
                            Slide #{slide.sortOrder || index + 1}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                              isActive
                                ? 'bg-emerald-500 text-white'
                                : 'bg-neutral-500 text-white'
                            }`}
                          >
                            {slide.status}
                          </span>
                        </div>
                      </div>

                      {/* CARD DETAILS BODY */}
                      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5 text-xs text-neutral-600">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-medium">Button Label:</span>
                            <span className="font-semibold text-neutral-900 truncate max-w-[140px]">
                              {slide.buttonText || 'Shop Now'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-medium">Target Link:</span>
                            <span className="font-mono text-[11px] text-neutral-800 truncate max-w-[160px] flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-neutral-400" />
                              <span>{slide.link || '#'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Publish Status Toggle */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-700">
                            Carousel Visibility
                          </span>
                          <Switch
                            id={`slide-switch-${slide.id}`}
                            checked={isActive}
                            onCheckedChange={(checked) =>
                              handleToggleSlideStatus(slide.id, checked)
                            }
                            size="sm"
                          />
                        </div>

                        {/* ACTIONS FOOTER */}
                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                          {/* Move up / down */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveSlide(index, 'up')}
                              title="Move Slide Up"
                              className="p-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-neutral-600 transition-colors"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === slides.length - 1}
                              onClick={() => handleMoveSlide(index, 'down')}
                              title="Move Slide Down"
                              className="p-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-neutral-600 transition-colors"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Edit / Delete */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSlide({ ...slide });
                                setIsSlideModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(slide)}
                              className="p-1 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-600 cursor-pointer transition-colors"
                              title="Delete Hero Slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PROMOTIONAL BANNERS (LIST & CARDS WITH ADD NEW PROMO BANNER) */}
        {/* ========================================================================= */}
        {activeTab === 'homepage-banners' && (
          <div className="space-y-6">
            {/* SEARCH, DEVICE PREVIEW TOGGLE & ACTIONS BAR */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search promotional banners..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                {/* Device View Switcher */}
                <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setGridPreviewMode('desktop')}
                    title="Preview Desktop Banners"
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      gridPreviewMode === 'desktop'
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGridPreviewMode('mobile')}
                    title="Preview Mobile Banners"
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      gridPreviewMode === 'mobile'
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Add New Promo Banner Button */}
              <button
                type="button"
                onClick={handleOpenAddPromoBanner}
                className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Promo Banner</span>
              </button>
            </div>

            {/* PROMO BANNERS GRID */}
            {filteredPromoBanners.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center space-y-3 shadow-2xs">
                <ImageIcon className="w-8 h-8 text-neutral-400 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-900">No Promotional Banners Found</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  No promo banners match your search. Create your promotional banner showcase.
                </p>
                <Button
                  onClick={handleOpenAddPromoBanner}
                  size="sm"
                  className="bg-neutral-950 text-white text-xs font-semibold mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Promo Banner</span>
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  gridPreviewMode === 'mobile'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {filteredPromoBanners.map((banner, index) => {
                  const isActive = banner.status === 'Active';
                  const displayImg =
                    gridPreviewMode === 'mobile'
                      ? banner.mobileImage || banner.image
                      : banner.image;

                  return (
                    <div
                      key={banner.id}
                      className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-md flex flex-col justify-between ${
                        isActive
                          ? 'border-neutral-200/90'
                          : 'border-dashed border-neutral-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* CARD MEDIA HEADER */}
                      <div className="relative">
                        <div
                          className={`relative overflow-hidden bg-neutral-900 ${
                            gridPreviewMode === 'mobile'
                              ? 'aspect-[9/14]'
                              : 'aspect-[16/8]'
                          }`}
                        >
                          <img
                            src={displayImg || '/images/banner/banner.webp'}
                            alt={banner.title || 'Promo Banner'}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/banner/banner.webp';
                            }}
                          />

                          {/* Gradient Vignette overlay for text legibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 flex flex-col justify-end text-white">
                            {banner.badge && (
                              <span className="text-[10px] font-bold tracking-wider uppercase text-amber-300 line-clamp-1">
                                {banner.badge}
                              </span>
                            )}
                            <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 mt-0.5">
                              {banner.title || 'Promotional Banner'}
                            </h3>
                            {banner.subtitle && (
                              <p className="text-[11px] text-white/80 font-light line-clamp-2 mt-1">
                                {banner.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-xs text-white">
                            Promo #{index + 1}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                              isActive
                                ? 'bg-emerald-500 text-white'
                                : 'bg-neutral-500 text-white'
                            }`}
                          >
                            {banner.status}
                          </span>
                        </div>
                      </div>

                      {/* CARD DETAILS BODY */}
                      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5 text-xs text-neutral-600">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-medium">Button Label:</span>
                            <span className="font-semibold text-neutral-900 truncate max-w-[140px]">
                              {banner.buttonText || 'SHOP NOW'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400 font-medium">Target Link:</span>
                            <span className="font-mono text-[11px] text-neutral-800 truncate max-w-[160px] flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-neutral-400" />
                              <span>{banner.link || '#'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Publish Status Toggle */}
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-700">
                            Storefront Visibility
                          </span>
                          <Switch
                            id={`promo-switch-${banner.id}`}
                            checked={isActive}
                            onCheckedChange={(checked) =>
                              handleTogglePromoStatus(banner.id, checked)
                            }
                            size="sm"
                          />
                        </div>

                        {/* ACTIONS FOOTER */}
                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPromoBanner({ ...banner });
                              setIsPromoModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePromoBanner(banner)}
                            className="p-1 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-600 cursor-pointer transition-colors"
                            title="Delete Promo Banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EDIT / ADD HERO SLIDE MODAL */}
      {/* ========================================================================= */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-900" />
                <h3 className="text-sm font-bold text-neutral-900">
                  {editingSlide.id.startsWith('slide-') &&
                  !slides.some((s) => s.id === editingSlide.id)
                    ? 'Add New Hero Carousel Slide'
                    : `Edit Slide: ${editingSlide.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clean Form */}
            <form onSubmit={handleSaveEditingSlide} className="space-y-4 text-xs">
              {/* Tag & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Tag / Kicker</label>
                  <input
                    type="text"
                    value={editingSlide.tag || ''}
                    onChange={(e) =>
                      setEditingSlide((prev) =>
                        prev ? { ...prev, tag: e.target.value } : null
                      )
                    }
                    placeholder="e.g. Grace in Every"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Main Headline *</label>
                  <input
                    type="text"
                    required
                    value={editingSlide.title}
                    onChange={(e) =>
                      setEditingSlide((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    placeholder="e.g. Twirl Into Tradition"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Subtitle Description</label>
                <input
                  type="text"
                  value={editingSlide.subtitle || ''}
                  onChange={(e) =>
                    setEditingSlide((prev) =>
                      prev ? { ...prev, subtitle: e.target.value } : null
                    )
                  }
                  placeholder="e.g. Heritage crafted for every celebration."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Button Label & Redirect Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Button Label</label>
                  <input
                    type="text"
                    value={editingSlide.buttonText}
                    onChange={(e) =>
                      setEditingSlide((prev) =>
                        prev ? { ...prev, buttonText: e.target.value } : null
                      )
                    }
                    placeholder="e.g. Shop Collection"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Redirect Link</label>
                  <input
                    type="text"
                    value={editingSlide.link}
                    onChange={(e) =>
                      setEditingSlide((prev) =>
                        prev ? { ...prev, link: e.target.value } : null
                      )
                    }
                    placeholder="e.g. #categories or /shop?category=Choli"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Desktop Hero Image */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Desktop Hero Image (1920x800)</span>
                </label>

                {editingSlide.image ? (
                  <div className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-[16/6] bg-neutral-900 shadow-2xs">
                    <img
                      src={editingSlide.image}
                      alt="Desktop Hero"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/home/hero/hero-1.webp';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processImageFile(file, (url) => {
                              setEditingSlide((prev) => (prev ? { ...prev, image: url } : null));
                              showToast('Desktop photo updated');
                            });
                          }
                        }}
                        className="hidden"
                        id="slide-desktop-modal-file-replace"
                      />
                      <label
                        htmlFor="slide-desktop-modal-file-replace"
                        className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 text-[11px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change Photo</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlide((prev) => (prev ? { ...prev, image: '' } : null));
                          showToast('Desktop photo removed');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverDesktop(true);
                    }}
                    onDragLeave={() => setIsDragOverDesktop(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverDesktop(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        processImageFile(file, (url) => {
                          setEditingSlide((prev) => (prev ? { ...prev, image: url } : null));
                          showToast('Desktop image uploaded!');
                        });
                      }
                    }}
                    className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      isDragOverDesktop
                        ? 'border-neutral-900 bg-neutral-100'
                        : 'border-dashed border-neutral-200 bg-neutral-50/50 hover:border-neutral-400'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-neutral-400 mb-1" />
                    <p className="text-xs font-semibold text-neutral-700">
                      Drag and drop or press <span className="font-mono bg-neutral-200 px-1 rounded">Ctrl+V</span> to paste
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, (url) => {
                            setEditingSlide((prev) => (prev ? { ...prev, image: url } : null));
                            showToast('Desktop photo selected');
                          });
                        }
                      }}
                      className="hidden"
                      id="slide-desktop-modal-file"
                    />
                    <label
                      htmlFor="slide-desktop-modal-file"
                      className="mt-2 text-[10px] bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1 rounded font-semibold text-neutral-800 cursor-pointer shadow-2xs"
                    >
                      Choose Desktop Photo
                    </label>
                  </div>
                )}
              </div>

              {/* Mobile Hero Image */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Mobile Hero Image (Portrait 800x1000)</span>
                </label>

                {editingSlide.mobileImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-[16/9] max-w-[260px] bg-neutral-900 shadow-2xs">
                    <img
                      src={editingSlide.mobileImage}
                      alt="Mobile Hero"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/home/hero/hero-1.webp';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processImageFile(file, (url) => {
                              setEditingSlide((prev) =>
                                prev ? { ...prev, mobileImage: url } : null
                              );
                              showToast('Mobile photo updated');
                            });
                          }
                        }}
                        className="hidden"
                        id="slide-mobile-modal-file-replace"
                      />
                      <label
                        htmlFor="slide-mobile-modal-file-replace"
                        className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 text-[10px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlide((prev) =>
                            prev ? { ...prev, mobileImage: '' } : null
                          );
                          showToast('Mobile photo removed');
                        }}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverMobile(true);
                    }}
                    onDragLeave={() => setIsDragOverMobile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverMobile(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        processImageFile(file, (url) => {
                          setEditingSlide((prev) =>
                            prev ? { ...prev, mobileImage: url } : null
                          );
                          showToast('Mobile image uploaded!');
                        });
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      isDragOverMobile
                        ? 'border-neutral-900 bg-neutral-100'
                        : 'border-dashed border-neutral-200 bg-neutral-50/50 hover:border-neutral-400'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-neutral-400 mb-1" />
                    <p className="text-xs font-semibold text-neutral-700">
                      Drop mobile photo or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, (url) => {
                            setEditingSlide((prev) =>
                              prev ? { ...prev, mobileImage: url } : null
                            );
                            showToast('Mobile photo selected');
                          });
                        }
                      }}
                      className="hidden"
                      id="slide-mobile-modal-file"
                    />
                    <label
                      htmlFor="slide-mobile-modal-file"
                      className="mt-1.5 text-[10px] bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1 rounded font-semibold text-neutral-800 cursor-pointer shadow-2xs"
                    >
                      Choose Mobile Photo
                    </label>
                  </div>
                )}
              </div>

              {/* Status Switch */}
              <div className="pt-2">
                <Switch
                  id="slide-modal-status-toggle"
                  checked={editingSlide.status === 'Active'}
                  onCheckedChange={(checked) =>
                    setEditingSlide((prev) =>
                      prev ? { ...prev, status: checked ? 'Active' : 'Inactive' } : null
                    )
                  }
                  label="Publish this slide live in carousel"
                  description="When enabled, this slide will rotate in the homepage hero carousel."
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-5 border-t border-neutral-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="text-xs px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-6 py-2 bg-neutral-900 hover:bg-black text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT / ADD PROMO BANNER MODAL */}
      {/* ========================================================================= */}
      {isPromoModalOpen && editingPromoBanner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-neutral-900" />
                <h3 className="text-sm font-bold text-neutral-900">
                  {editingPromoBanner.id.startsWith('promo-banner-') &&
                  !promoBanners.some((b) => b.id === editingPromoBanner.id)
                    ? 'Add New Promotional Banner'
                    : `Edit Promotional Banner: ${editingPromoBanner.title || ''}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clean Form */}
            <form onSubmit={handleSaveEditingPromoBanner} className="space-y-4 text-xs">
              {/* Badge & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Badge / Tag</label>
                  <input
                    type="text"
                    value={editingPromoBanner.badge || ''}
                    onChange={(e) =>
                      setEditingPromoBanner((prev) =>
                        prev ? { ...prev, badge: e.target.value } : null
                      )
                    }
                    placeholder="e.g. Festive Collection"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Banner Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPromoBanner.title || ''}
                    onChange={(e) =>
                      setEditingPromoBanner((prev) =>
                        prev ? { ...prev, title: e.target.value } : null
                      )
                    }
                    placeholder="e.g. Handmade Necklace Studio"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Subtitle Description</label>
                <input
                  type="text"
                  value={editingPromoBanner.subtitle || ''}
                  onChange={(e) =>
                    setEditingPromoBanner((prev) =>
                      prev ? { ...prev, subtitle: e.target.value } : null
                    )
                  }
                  placeholder="e.g. Crafted with colour, culture & love."
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Button Label & Redirect Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Button Label</label>
                  <input
                    type="text"
                    value={editingPromoBanner.buttonText || ''}
                    onChange={(e) =>
                      setEditingPromoBanner((prev) =>
                        prev ? { ...prev, buttonText: e.target.value } : null
                      )
                    }
                    placeholder="e.g. SHOP NOW"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Redirect Link</label>
                  <input
                    type="text"
                    value={editingPromoBanner.link || ''}
                    onChange={(e) =>
                      setEditingPromoBanner((prev) =>
                        prev ? { ...prev, link: e.target.value } : null
                      )
                    }
                    placeholder="e.g. /shop?category=Necklace"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Desktop Promo Banner Image */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Desktop Banner Image (1920x600 recommended)</span>
                </label>

                {editingPromoBanner.image ? (
                  <div className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-[16/6] bg-neutral-900 shadow-2xs">
                    <img
                      src={editingPromoBanner.image}
                      alt="Desktop Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/banner/banner.webp';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processImageFile(file, (url) => {
                              setEditingPromoBanner((prev) => (prev ? { ...prev, image: url } : null));
                              showToast('Desktop banner photo updated');
                            });
                          }
                        }}
                        className="hidden"
                        id="promo-modal-desktop-file-replace"
                      />
                      <label
                        htmlFor="promo-modal-desktop-file-replace"
                        className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 text-[11px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change Photo</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPromoBanner((prev) => (prev ? { ...prev, image: '' } : null));
                          showToast('Desktop photo removed');
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverPromoDesktop(true);
                    }}
                    onDragLeave={() => setIsDragOverPromoDesktop(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverPromoDesktop(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        processImageFile(file, (url) => {
                          setEditingPromoBanner((prev) => (prev ? { ...prev, image: url } : null));
                          showToast('Desktop banner uploaded!');
                        });
                      }
                    }}
                    className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      isDragOverPromoDesktop
                        ? 'border-neutral-900 bg-neutral-100'
                        : 'border-dashed border-neutral-200 bg-neutral-50/50 hover:border-neutral-400'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-neutral-400 mb-1" />
                    <p className="text-xs font-semibold text-neutral-700">
                      Drop desktop photo or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, (url) => {
                            setEditingPromoBanner((prev) => (prev ? { ...prev, image: url } : null));
                            showToast('Desktop photo selected');
                          });
                        }
                      }}
                      className="hidden"
                      id="promo-modal-desktop-file"
                    />
                    <label
                      htmlFor="promo-modal-desktop-file"
                      className="mt-2 text-[10px] bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1 rounded font-semibold text-neutral-800 cursor-pointer shadow-2xs"
                    >
                      Choose Desktop Photo
                    </label>
                  </div>
                )}
              </div>

              {/* Mobile Promo Banner Image */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Mobile Banner Image (800x800 square / vertical)</span>
                </label>

                {editingPromoBanner.mobileImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-[16/9] max-w-[260px] bg-neutral-900 shadow-2xs">
                    <img
                      src={editingPromoBanner.mobileImage}
                      alt="Mobile Banner"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/banner/banner.webp';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            processImageFile(file, (url) => {
                              setEditingPromoBanner((prev) =>
                                prev ? { ...prev, mobileImage: url } : null
                              );
                              showToast('Mobile photo updated');
                            });
                          }
                        }}
                        className="hidden"
                        id="promo-modal-mobile-file-replace"
                      />
                      <label
                        htmlFor="promo-modal-mobile-file-replace"
                        className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 text-[10px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPromoBanner((prev) =>
                            prev ? { ...prev, mobileImage: '' } : null
                          );
                          showToast('Mobile photo removed');
                        }}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverPromoMobile(true);
                    }}
                    onDragLeave={() => setIsDragOverPromoMobile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverPromoMobile(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        processImageFile(file, (url) => {
                          setEditingPromoBanner((prev) =>
                            prev ? { ...prev, mobileImage: url } : null
                          );
                          showToast('Mobile image uploaded!');
                        });
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      isDragOverPromoMobile
                        ? 'border-neutral-900 bg-neutral-100'
                        : 'border-dashed border-neutral-200 bg-neutral-50/50 hover:border-neutral-400'
                    }`}
                  >
                    <UploadCloud className="w-5 h-5 text-neutral-400 mb-1" />
                    <p className="text-xs font-semibold text-neutral-700">
                      Drop mobile photo or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processImageFile(file, (url) => {
                            setEditingPromoBanner((prev) =>
                              prev ? { ...prev, mobileImage: url } : null
                            );
                            showToast('Mobile photo selected');
                          });
                        }
                      }}
                      className="hidden"
                      id="promo-modal-mobile-file"
                    />
                    <label
                      htmlFor="promo-modal-mobile-file"
                      className="mt-1.5 text-[10px] bg-white border border-neutral-200 hover:bg-neutral-50 px-3 py-1 rounded font-semibold text-neutral-800 cursor-pointer shadow-2xs"
                    >
                      Choose Mobile Photo
                    </label>
                  </div>
                )}
              </div>

              {/* Status Switch */}
              <div className="pt-2">
                <Switch
                  id="promo-modal-status-toggle"
                  checked={editingPromoBanner.status === 'Active'}
                  onCheckedChange={(checked) =>
                    setEditingPromoBanner((prev) =>
                      prev ? { ...prev, status: checked ? 'Active' : 'Inactive' } : null
                    )
                  }
                  label="Publish this promotional banner live"
                  description="When enabled, this banner will be displayed on the homepage showcase."
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-5 border-t border-neutral-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="text-xs px-4 py-2 border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-6 py-2 bg-neutral-900 hover:bg-black text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* REUSABLE DELETE CONFIRMATION MODALS */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteSlideCandidate)}
        title="Delete Hero Slide?"
        itemName={deleteSlideCandidate?.title || deleteSlideCandidate?.tag || 'Hero Slide'}
        onConfirm={confirmDeleteSlide}
        onCancel={() => setDeleteSlideCandidate(null)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletePromoCandidate)}
        title="Delete Promo Banner?"
        itemName={deletePromoCandidate?.title || deletePromoCandidate?.badge || 'Promo Banner'}
        onConfirm={confirmDeletePromoBanner}
        onCancel={() => setDeletePromoCandidate(null)}
      />
    </div>
  );
};

export default BannersPage;
