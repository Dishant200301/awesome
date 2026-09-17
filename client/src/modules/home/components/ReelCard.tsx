import { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from "react-icons/fi";

export interface RelatedProduct {
  name: string;
  price: string;
  img: string;
  link: string;
}

export interface ReelItem {
  id?: number | string;
  title: string;
  description?: string;
  views: string;
  likes: number;
  img: string;
  video: string;
  brand?: string;
  relatedProduct?: RelatedProduct;
}

export default function ReelCard({ r }: { r: ReelItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Helper to extract YouTube ID if a YouTube link is provided
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const ytId = getYouTubeId(r.video);
  const hasValidVideo = Boolean(r.video && r.video.trim() !== "");

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsPlaying(true);

    if (hasValidVideo && !ytId && videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current
        .play()
        .catch(() => {
          // If browser blocks unmuted autoplay, retry with muted
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);

    if (hasValidVideo && !ytId && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      setIsPlaying(false);
      if (videoRef.current) videoRef.current.pause();
    } else {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="reel-card group relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-950 shadow-md select-none cursor-pointer transition-all duration-500 hover:shadow-2xl"
    >
      {/* Background Poster Image */}
      <img
        src={r.img}
        alt={r.title}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out ${
          isHovered ? "scale-108" : "scale-100"
        }`}
        loading="lazy"
      />

      {/* Video Overlay (HTML5 Video or YouTube IFrame) */}
      {hasValidVideo && (
        <>
          {ytId && isPlaying ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden z-10 pointer-events-none">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${
                  isMuted ? 1 : 0
                }&controls=0&loop=1&playlist=${ytId}&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[316%] h-[116%] pointer-events-none border-0"
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : !ytId ? (
            <video
              ref={videoRef}
              src={r.video}
              loop
              playsInline
              aria-label={r.title || "Handmade craft demonstration reel"}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 z-10 ${
                isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <track kind="captions" src="data:text/vtt;charset=utf-8,WEBVTT" label="English" default />
            </video>
          ) : null}
        </>
      )}

      {/* Gradient Vignette Overlay for crisp text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 z-15 pointer-events-none transition-opacity duration-300" />

      {/* Top Controls (Audio Toggle on hover) */}
      {hasValidVideo && !ytId && isHovered && (
        <div className="absolute top-3.5 right-3.5 z-25">
          <button
            onClick={toggleMute}
            className="rounded-full bg-black/50 backdrop-blur-md border border-white/20 p-2 text-white hover:bg-brand-maroon transition-all shadow-md cursor-pointer"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
          </button>
        </div>
      )}

      {/* Center Action Button (Hover State: Play / Pause Button) */}
      <div
        className={`absolute inset-0 flex items-center justify-center z-25 transition-all duration-300 pointer-events-none ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <button
          onClick={togglePlayPause}
          className="pointer-events-auto w-13 h-13 rounded-full bg-black/55 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 hover:bg-brand-maroon transition-all duration-200 cursor-pointer"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? (
            <FiPause className="text-white fill-white ml-0" size={20} />
          ) : (
            <FiPlay className="text-white fill-white ml-0.5" size={20} />
          )}
        </button>
      </div>



      {/* HOVER STATE: Related Product Floating Card (if available) */}
      {r.relatedProduct && (
        <div
          className={`absolute bottom-3.5 left-3.5 right-3.5 z-25 bg-white/95 backdrop-blur-md border border-white/30 rounded-xl p-2.5 flex items-center justify-between shadow-xl transition-all duration-500 ease-out ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <img
              src={r.relatedProduct.img}
              alt={r.relatedProduct.name}
              className="w-10 h-10 object-cover rounded-lg border border-zinc-200 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-zinc-900 truncate leading-tight">
                {r.relatedProduct.name}
              </span>
              <span className="text-[11px] text-brand-maroon font-bold mt-0.5">
                {r.relatedProduct.price}
              </span>
            </div>
          </div>
          <a
            href={r.relatedProduct.link}
            className="bg-brand-maroon hover:bg-brand-maroon/90 text-white text-[10px] font-bold tracking-wider px-3.5 py-2 rounded-lg uppercase shadow-sm transition-all duration-300 shrink-0"
          >
            Shop
          </a>
        </div>
      )}
    </div>
  );
}
