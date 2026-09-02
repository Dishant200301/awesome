import React, { useState } from 'react';
import {
  UploadCloud,
  Star,
  Trash2,
  Plus,
  Eye,
  X,
  Sparkles,
  ArrowLeftRight,
  MoveLeft,
  MoveRight
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface MultiImageMediaManagerProps {
  mainImage: string;
  galleryImages: string[];
  onChangeMainImage: (img: string) => void;
  onChangeGalleryImages: (imgs: string[]) => void;
  onSelectForAi?: (img: string) => void;
  title?: string;
  subtitle?: string;
}

export const MultiImageMediaManager: React.FC<MultiImageMediaManagerProps> = ({
  mainImage,
  galleryImages = [],
  onChangeMainImage,
  onChangeGalleryImages,
  onSelectForAi,
  title = 'Product Media & Image Gallery',
  subtitle = 'Upload multiple photos, designate 1 as the Main Cover Image, and arrange your gallery.'
}) => {
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  // Helper to read File list to Base64 strings
  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return [];

    const readPromises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    return Promise.all(readPromises);
  };

  // Read multiple files as Base64/DataURL from file input
  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUploaded = await processFiles(files);
    if (newUploaded.length > 0) {
      if (!mainImage) {
        onChangeMainImage(newUploaded[0]);
        const remaining = newUploaded.slice(1);
        if (remaining.length > 0) {
          onChangeGalleryImages([...galleryImages, ...remaining]);
        }
      } else {
        onChangeGalleryImages([...galleryImages, ...newUploaded]);
      }
    }
    e.target.value = '';
  };

  // Drag & Drop Handlers for Main Cover Image
  const handleMainDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const images = await processFiles(e.dataTransfer.files);
      if (images.length > 0) {
        onChangeMainImage(images[0]);
        const extra = images.slice(1);
        if (extra.length > 0) {
          onChangeGalleryImages([...galleryImages, ...extra]);
        }
      }
    }
  };

  // Drag & Drop Handlers for Gallery Area
  const handleGalleryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const images = await processFiles(e.dataTransfer.files);
      if (images.length > 0) {
        if (!mainImage) {
          onChangeMainImage(images[0]);
          const remaining = images.slice(1);
          if (remaining.length > 0) {
            onChangeGalleryImages([...galleryImages, ...remaining]);
          }
        } else {
          onChangeGalleryImages([...galleryImages, ...images]);
        }
      }
    }
  };

  // Switch an image to Main Image
  const handleSetAsMain = (chosenImg: string, galleryIndex?: number) => {
    if (chosenImg === mainImage) return;

    const oldMain = mainImage;
    let nextGallery = [...galleryImages];

    if (typeof galleryIndex === 'number') {
      nextGallery.splice(galleryIndex, 1);
    } else {
      nextGallery = nextGallery.filter((img) => img !== chosenImg);
    }

    if (oldMain && oldMain.trim() && !nextGallery.includes(oldMain)) {
      nextGallery.unshift(oldMain);
    }

    onChangeMainImage(chosenImg);
    onChangeGalleryImages(nextGallery);
  };

  // Remove Main Image
  const handleRemoveMainImage = () => {
    if (galleryImages.length > 0) {
      const nextMain = galleryImages[0];
      const nextGal = galleryImages.slice(1);
      onChangeMainImage(nextMain);
      onChangeGalleryImages(nextGal);
    } else {
      onChangeMainImage('');
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const nextGal = galleryImages.filter((_, idx) => idx !== indexToRemove);
    onChangeGalleryImages(nextGal);
  };

  // Move gallery position left/right
  const handleMoveGallery = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;

    const nextGal = [...galleryImages];
    const temp = nextGal[index];
    nextGal[index] = nextGal[targetIndex];
    nextGal[targetIndex] = temp;
    onChangeGalleryImages(nextGal);
  };

  const totalPhotosCount = (mainImage ? 1 : 0) + galleryImages.length;

  return (
    <Card className="p-6 sm:p-7 bg-white border border-neutral-200 shadow-2xs rounded-xl space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-black uppercase tracking-tight">{title}</h2>
            <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200 text-[10px] font-bold px-2 py-0.5">
              {totalPhotosCount} {totalPhotosCount === 1 ? 'Photo' : 'Photos'} Total
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">{subtitle}</p>
        </div>

        {/* UPLOAD BUTTON */}
        <label className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg shadow-2xs cursor-pointer transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <UploadCloud className="w-4 h-4 text-neutral-200" />
          <span>Upload Multiple Photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleMultipleFilesUpload}
          />
        </label>
      </div>

      {/* MEDIA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ========================================================================= */}
        {/* LEFT / HERO: MAIN COVER PHOTO (FEATURED)                                  */}
        {/* ========================================================================= */}
        <div className="md:col-span-5 lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Main Cover Photo</span>
            </span>
            {mainImage && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Cover
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingMain(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingMain(false);
            }}
            onDrop={handleMainDrop}
            className={`relative aspect-square w-full rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center group shadow-xs ${
              isDraggingMain
                ? 'border-amber-500 bg-amber-100/70 scale-[1.02] ring-4 ring-amber-400/20'
                : 'border-amber-300 bg-[#FAF7F2]'
            }`}
          >
            {isDraggingMain && (
              <div className="absolute inset-0 z-30 bg-amber-500/90 text-white flex flex-col items-center justify-center gap-2 pointer-events-none animate-in fade-in">
                <UploadCloud className="w-10 h-10 animate-bounce" />
                <span className="text-xs font-black uppercase tracking-wider">Drop to Set Main Cover</span>
              </div>
            )}

            {mainImage ? (
              <>
                <img
                  src={mainImage}
                  alt="Main Product Cover"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Main Image</span>
                </div>

                {/* HOVER OVERLAY CONTROLS */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(mainImage)}
                      className="p-2 bg-white text-black rounded-lg shadow hover:bg-neutral-100 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Preview Full Size"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {onSelectForAi && (
                      <button
                        type="button"
                        onClick={() => onSelectForAi(mainImage)}
                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Use in AI Vision Generator"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Fill</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <label className="text-[11px] text-white hover:text-amber-200 underline cursor-pointer">
                      Replace / Drag File Here
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const r = new FileReader();
                            r.onload = () => {
                              if (typeof r.result === 'string') onChangeMainImage(r.result);
                            };
                            r.readAsDataURL(file);
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveMainImage}
                      className="text-[11px] text-rose-300 hover:text-rose-100 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-amber-100/50 transition-colors p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-neutral-800">Select Main Cover Photo</span>
                <span className="text-[10px] text-neutral-500 mt-1">
                  Drag &amp; drop or click to upload
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = () => {
                        if (typeof r.result === 'string') onChangeMainImage(r.result);
                      };
                      r.readAsDataURL(file);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: ADDITIONAL GALLERY PHOTOS WITH "SET AS MAIN"                       */}
        {/* ========================================================================= */}
        <div className="md:col-span-7 lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Additional Gallery Photos ({galleryImages.length})
            </span>
            <label className="text-[11px] font-bold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-md cursor-pointer transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" />
              <span>Add to Gallery</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMultipleFilesUpload}
              />
            </label>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingGallery(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingGallery(false);
            }}
            onDrop={handleGalleryDrop}
            className={`relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 p-4 rounded-2xl border transition-all min-h-[190px] items-start ${
              isDraggingGallery
                ? 'border-black border-dashed bg-neutral-100 ring-4 ring-black/10'
                : 'border-neutral-200 bg-neutral-50/60'
            }`}
          >
            {isDraggingGallery && (
              <div className="absolute inset-0 z-30 bg-black/80 rounded-2xl text-white flex flex-col items-center justify-center gap-2 pointer-events-none animate-in fade-in">
                <UploadCloud className="w-8 h-8 text-amber-300 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider">Drop to Add to Gallery</span>
              </div>
            )}

            {galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 bg-white group shadow-2xs transition-all hover:shadow-md"
              >
                <img
                  src={imgUrl}
                  alt={`Gallery Photo ${idx + 1}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />

                {/* BADGE INDEX */}
                <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                  #{idx + 1}
                </div>

                {/* HOVER ACTION BUTTONS */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-between p-2">
                  <div className="w-full flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(imgUrl)}
                      className="p-1 bg-white/90 text-black hover:bg-white rounded transition text-[10px] cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="p-1 bg-rose-600/90 text-white hover:bg-rose-700 rounded transition text-[10px] cursor-pointer"
                      title="Delete from Gallery"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 1-CLICK SET AS MAIN COVER BUTTON */}
                  <div className="w-full flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetAsMain(imgUrl, idx)}
                      className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[10px] font-extrabold rounded-md shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                      title="Make this photo the primary Main Cover Image"
                    >
                      <Star className="w-3 h-3 fill-white text-white" />
                      <span>Set as Main</span>
                    </button>
                  </div>

                  {/* REORDER BUTTONS */}
                  <div className="w-full flex items-center justify-between text-white text-[10px] pt-1 border-t border-white/20">
                    <button
                      type="button"
                      onClick={() => handleMoveGallery(idx, 'left')}
                      disabled={idx === 0}
                      className="p-1 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 text-[9px]"
                      title="Move Left"
                    >
                      <MoveLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[8px] opacity-75">Order</span>
                    <button
                      type="button"
                      onClick={() => handleMoveGallery(idx, 'right')}
                      disabled={idx === galleryImages.length - 1}
                      className="p-1 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 text-[9px]"
                      title="Move Right"
                    >
                      <MoveRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* EMPTY UPLOAD TILE (ADD PHOTO / DROP ZONE) */}
            <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 transition-all flex flex-col items-center justify-center cursor-pointer p-3 text-center group shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-neutral-800">Add Photo</span>
              <span className="text-[9px] text-neutral-500">Drag &amp; Drop</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleMultipleFilesUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* FULL-SIZE PREVIEW MODAL */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-neutral-700">
            <div className="flex items-center justify-between p-3.5 bg-neutral-900 text-white border-b border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Full Image Preview</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-neutral-950 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewModalImg}
                alt="Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-900 text-xs border-t border-neutral-800">
              {previewModalImg !== mainImage && (
                <Button
                  type="button"
                  onClick={() => {
                    handleSetAsMain(previewModalImg);
                    setPreviewModalImg(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Set as Main Cover Photo</span>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewModalImg(null)}
                className="ml-auto text-xs text-neutral-300 border-neutral-700 hover:bg-neutral-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MultiImageMediaManager;
