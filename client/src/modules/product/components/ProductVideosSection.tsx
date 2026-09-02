import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Film, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  videoUrl: string;
  poster: string;
  tag: string;
}

const DEMO_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    title: "Master Artisan Bead & Mirror Crafting",
    subtitle: "Precision glass mirror setting & authentic golden zari thread work by skilled artisans.",
    duration: "0:24",
    videoUrl: "/images/home/reels/latkan-bead-craft.mp4",
    poster: "/images/category/Latkan.webp",
    tag: "Artisan Craft",
  },
  {
    id: "vid-2",
    title: "Silk Resham Tasseling & Knotting",
    subtitle: "Hand-twisted resham tassels and heritage multi-strand floral finishing.",
    duration: "0:18",
    videoUrl: "/images/home/reels/woolen-latkan-craft.mp4",
    poster: "/images/category/Tassel.webp",
    tag: "Handmade Process",
  },
  {
    id: "vid-3",
    title: "Bridal Dori Braiding & Final Inspection",
    subtitle: "Anti-tarnish golden bead inspection, durability testing, and bridal packaging.",
    duration: "0:22",
    videoUrl: "/images/home/reels/tricolor-tassel-latkan.mp4",
    poster: "/images/category/Necklace.webp",
    tag: "Quality & Details",
  },
];

export const ProductVideosSection: React.FC<{ productName?: string }> = ({ productName }) => {
  const [activeModalVideo, setActiveModalVideo] = useState<VideoItem | null>(null);

  return (
    <section className="w-full py-8 md:py-12 px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto font-sans">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-zinc-200 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-900 tracking-wider uppercase mb-1.5">
            <Sparkles size={12} className="text-amber-600" />
            <span>Behind The Craft</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-maroon" />
            <span>Product Making &amp; Demo Videos (3)</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Watch how our master artisans handcraft each intricate detail with precision and heritage techniques.
          </p>
        </div>
      </div>

      {/* 3 VIDEO CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEMO_VIDEOS.map((item, idx) => (
          <VideoCard
            key={item.id}
            item={item}
            index={idx}
            onOpenModal={() => setActiveModalVideo(item)}
          />
        ))}
      </div>

      {/* FULLSCREEN POPUP VIDEO MODAL */}
      <AnimatePresence>
        {activeModalVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden max-w-xl w-full relative shadow-2xl"
            >
              {/* Modal Close */}
              <button
                type="button"
                onClick={() => setActiveModalVideo(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

              {/* Video Player */}
              <div className="relative aspect-[9/16] max-h-[70vh] mx-auto bg-black flex items-center justify-center">
                <video
                  src={activeModalVideo.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Video Info */}
              <div className="p-4 bg-zinc-950 text-white space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  {activeModalVideo.tag}
                </span>
                <h3 className="text-base font-bold text-white">{activeModalVideo.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{activeModalVideo.subtitle}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const VideoCard: React.FC<{
  item: VideoItem;
  index: number;
  onOpenModal: () => void;
}> = ({ item, index, onOpenModal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      onClick={onOpenModal}
      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
    >
      {/* Video Viewport */}
      <div className="relative aspect-[4/5] sm:aspect-square bg-zinc-950 overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={item.videoUrl}
          poster={item.poster}
          playsInline
          muted={isMuted}
          loop
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Video Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* Tag Pill Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold text-white uppercase tracking-wider border border-white/20">
            {item.tag}
          </span>
        </div>

        {/* Duration Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono text-white/90">
            {item.duration}
          </span>
        </div>

        {/* Center Play / Pause Icon Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-xl hover:scale-110 hover:bg-brand-maroon hover:text-white transition-all duration-300 cursor-pointer z-10"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="fill-current ml-0.5" />}
        </button>

        {/* Bottom Bar Controls */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
          {/* Mute / Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Fullscreen Expand Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 hover:bg-black/90 transition-colors cursor-pointer"
          >
            <Maximize2 size={12} />
            <span>Full View</span>
          </button>
        </div>
      </div>

      {/* Card Text Info */}
      <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-zinc-900 group-hover:text-brand-maroon transition-colors line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 font-sans">
            {item.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductVideosSection;
