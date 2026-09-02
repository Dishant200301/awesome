import React, { useState } from 'react';
import { ProductAttributeAssignment, ColorMediaConfig } from '../types/attribute.types';
import { Card } from './ui/card';
import { Palette, Plus, X, UploadCloud, Star, MoveLeft, MoveRight } from 'lucide-react';
import { Badge } from './ui/badge';

interface ColorGallerySectionProps {
  productAttributes: ProductAttributeAssignment[];
  colorMediaConfigs: ColorMediaConfig[];
  onChangeColorMediaConfigs: (configs: ColorMediaConfig[]) => void;
  colors?: any[];
  onSyncRootMedia?: (mainImage: string, galleryImages: string[]) => void;
  isSimpleProduct?: boolean;
}

export const ColorGallerySection: React.FC<ColorGallerySectionProps> = ({
  productAttributes = [],
  colorMediaConfigs = [],
  onChangeColorMediaConfigs,
  colors = [],
  onSyncRootMedia,
  isSimpleProduct = false
}) => {
  // Find attribute representing Color
  const colorAttr = productAttributes.find(
    (pa) =>
      pa.attributeName.toLowerCase() === 'color' ||
      pa.attributeSlug.toLowerCase() === 'color' ||
      pa.type === 'SWATCH'
  );

  const selectedColors = (colorAttr && colorAttr.selectedValues && colorAttr.selectedValues.length > 0)
    ? colorAttr.selectedValues
    : (colors.length > 0 ? colors.map((c) => c.colorName || c.name) : ['Standard']);

  // If simple product, ensure at least 1 color swatch exists
  const effectiveColors = isSimpleProduct && selectedColors.length > 1
    ? [selectedColors[0]]
    : selectedColors;

  // Sync / Ensure each selected color has a ColorMediaConfig object
  const activeMediaConfigs: ColorMediaConfig[] = effectiveColors.map((colorName) => {
    const existing = colorMediaConfigs.find(
      (c) => (c.colorName || '').toLowerCase() === (colorName || '').toLowerCase()
    );
    if (existing) return existing;
    const matchingColor = colors.find((c) => (c.colorName || c.name || '').toLowerCase() === (colorName || '').toLowerCase());
    return {
      colorValueId: `col-${colorName.toLowerCase().replace(/\s+/g, '-')}`,
      colorName,
      colorCode: matchingColor?.colorHex || matchingColor?.colorCode || '#888888',
      mainImage: matchingColor?.mainImage || matchingColor?.displayImage || '',
      gallery: matchingColor?.galleryImages || []
    };
  });

  const handleUpdateField = (colorName: string, field: keyof ColorMediaConfig, value: any) => {
    const updated = activeMediaConfigs.map((c) =>
      c.colorName.toLowerCase() === colorName.toLowerCase() ? { ...c, [field]: value } : c
    );
    onChangeColorMediaConfigs(updated);

    if (onSyncRootMedia && updated.length > 0) {
      const firstMain = updated[0]?.mainImage || '';
      const allGalleries = updated.flatMap((c) => c.gallery || []);
      onSyncRootMedia(firstMain, allGalleries);
    }
  };

  const handleUpdateMainImage = (colorName: string, mainImage: string) => {
    handleUpdateField(colorName, 'mainImage', mainImage);
  };

  const handleAddMultipleGalleryImages = (colorName: string, imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return;
    const updated = activeMediaConfigs.map((c) => {
      if (c.colorName.toLowerCase() === colorName.toLowerCase()) {
        const nextGallery = [...(c.gallery || []), ...imageUrls];
        return { ...c, gallery: nextGallery };
      }
      return c;
    });
    onChangeColorMediaConfigs(updated);

    if (onSyncRootMedia && updated.length > 0) {
      const firstMain = updated[0]?.mainImage || '';
      const allGalleries = updated.flatMap((c) => c.gallery || []);
      onSyncRootMedia(firstMain, allGalleries);
    }
  };

  const handleRemoveGalleryImage = (colorName: string, index: number) => {
    const updated = activeMediaConfigs.map((c) => {
      if (c.colorName.toLowerCase() === colorName.toLowerCase()) {
        const nextGallery = (c.gallery || []).filter((_, i) => i !== index);
        return { ...c, gallery: nextGallery };
      }
      return c;
    });
    onChangeColorMediaConfigs(updated);

    if (onSyncRootMedia && updated.length > 0) {
      const firstMain = updated[0]?.mainImage || '';
      const allGalleries = updated.flatMap((c) => c.gallery || []);
      onSyncRootMedia(firstMain, allGalleries);
    }
  };

  const handleSetGalleryAsMainForColor = (colorName: string, galleryIndex: number) => {
    const target = activeMediaConfigs.find((c) => c.colorName.toLowerCase() === colorName.toLowerCase());
    if (!target || !target.gallery || !target.gallery[galleryIndex]) return;

    const chosen = target.gallery[galleryIndex];
    const oldMain = target.mainImage;
    const nextGallery = target.gallery.filter((_, idx) => idx !== galleryIndex);
    if (oldMain && oldMain.trim() && !nextGallery.includes(oldMain)) {
      nextGallery.unshift(oldMain);
    }

    const updated = activeMediaConfigs.map((c) => {
      if (c.colorName.toLowerCase() === colorName.toLowerCase()) {
        return { ...c, mainImage: chosen, gallery: nextGallery };
      }
      return c;
    });

    onChangeColorMediaConfigs(updated);
    if (onSyncRootMedia && updated.length > 0) {
      const firstMain = updated[0]?.mainImage || '';
      const allGalleries = updated.flatMap((c) => c.gallery || []);
      onSyncRootMedia(firstMain, allGalleries);
    }
  };

  return (
    <Card className="p-6 sm:p-8 bg-white border border-neutral-200 shadow-2xs rounded-xl space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-black shrink-0" />
            <h2 className="text-sm font-bold text-black tracking-tight uppercase">
              {isSimpleProduct ? 'Product Color & Media Configuration' : 'Color Variant Media Management'}
            </h2>
            <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200 text-[10px] font-bold px-2 py-0.5">
              {activeMediaConfigs.length} {activeMediaConfigs.length === 1 ? 'Color' : 'Colors'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            {isSimpleProduct
              ? 'Configure the primary color shade and specific photos for this product.'
              : 'Assign dedicated Main Cover photos and Additional Gallery photos for each variant color.'}
          </p>
        </div>
      </div>

      {/* COLOR MEDIA CARDS LIST */}
      <div className="space-y-6">
        {activeMediaConfigs.map((config) => (
          <ColorMediaCard
            key={config.colorName}
            config={config}
            onUpdateTitle={(title) => handleUpdateField(config.colorName, 'title', title)}
            onUpdateProductInfo={(info) => handleUpdateField(config.colorName, 'productInfo', info)}
            onUpdateMainImage={(img) => handleUpdateMainImage(config.colorName, img)}
            onAddMultipleGalleryImages={(imgs) => handleAddMultipleGalleryImages(config.colorName, imgs)}
            onRemoveGalleryImage={(idx) => handleRemoveGalleryImage(config.colorName, idx)}
            onSetAsMain={(idx) => handleSetGalleryAsMainForColor(config.colorName, idx)}
          />
        ))}
      </div>
    </Card>
  );
};

interface ColorMediaCardProps {
  config: ColorMediaConfig;
  onUpdateTitle: (title: string) => void;
  onUpdateProductInfo: (productInfo: string) => void;
  onUpdateMainImage: (mainImage: string) => void;
  onAddMultipleGalleryImages: (imageUrls: string[]) => void;
  onRemoveGalleryImage: (index: number) => void;
  onSetAsMain: (index: number) => void;
}

const ColorMediaCard: React.FC<ColorMediaCardProps> = ({
  config,
  onUpdateMainImage,
  onAddMultipleGalleryImages,
  onRemoveGalleryImage,
  onSetAsMain
}) => {
  const gallery = config.gallery || [];
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  const handleUploadMainFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateMainImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateMainImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readPromises = Array.from(files).map((file) => {
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

    const dataUrls = await Promise.all(readPromises);
    if (dataUrls.length > 0) {
      onAddMultipleGalleryImages(dataUrls);
    }
    e.target.value = '';
  };

  const handleGalleryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

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

    const dataUrls = await Promise.all(readPromises);
    if (dataUrls.length > 0) {
      onAddMultipleGalleryImages(dataUrls);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 bg-white space-y-5 font-sans shadow-2xs">
      {/* COLOR HEADER & COUNT */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-4 h-4 rounded-full border border-neutral-300 shadow-2xs shrink-0"
            style={{
              backgroundColor:
                config.colorName.toLowerCase() === 'white'
                  ? '#FFFFFF'
                  : config.colorName.toLowerCase() === 'black'
                  ? '#000000'
                  : config.colorName.toLowerCase() === 'beige'
                  ? '#E8D3C3'
                  : config.colorName.toLowerCase() === 'red'
                  ? '#800000'
                  : config.colorName.toLowerCase() === 'gold'
                  ? '#D4AF37'
                  : config.colorName.toLowerCase() === 'blue' || config.colorName.toLowerCase() === 'royal blue'
                  ? '#1A3B8B'
                  : config.colorCode || '#888888'
            }}
          />
          <h3 className="font-bold text-black text-xs sm:text-sm uppercase tracking-wider">
            PRODUCT MEDIA — <span className="font-extrabold text-black">{config.colorName}</span>
          </h3>
        </div>
        <span className="text-[11px] font-medium text-neutral-500">
          {config.mainImage ? '1 Cover Photo' : 'No Cover Photo'} • {gallery.length} Gallery Photos
        </span>
      </div>

      {/* MEDIA GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
        {/* LEFT: MAIN COVER PHOTO */}
        <div className="sm:col-span-4 lg:col-span-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-semibold text-neutral-600">
              Color Main Cover Photo
            </span>
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
                ? 'border-amber-500 bg-amber-100 ring-4 ring-amber-400/20 scale-[1.02]'
                : 'border-neutral-200 bg-[#fbf9f6]'
            }`}
          >
            {isDraggingMain && (
              <div className="absolute inset-0 z-30 bg-amber-500/90 text-white flex flex-col items-center justify-center gap-1 pointer-events-none animate-in fade-in">
                <UploadCloud className="w-6 h-6 animate-bounce" />
                <span className="text-[10px] font-bold uppercase">Drop Cover Photo</span>
              </div>
            )}

            {config.mainImage ? (
              <>
                <img
                  src={config.mainImage}
                  alt={`${config.colorName} Cover`}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>Color Cover</span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <label className="px-3 py-1.5 bg-white text-black text-[11px] font-bold rounded-lg shadow-sm cursor-pointer hover:bg-neutral-100 transition-all flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Change / Drop Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadMainFile}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onUpdateMainImage('')}
                    className="text-[11px] text-red-300 hover:text-red-100 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-neutral-100/70 transition-colors p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mb-1 text-neutral-600 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-black">Upload / Drop Cover Photo</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">Drag &amp; drop PNG, JPG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadMainFile}
                />
              </label>
            )}
          </div>
        </div>

        {/* RIGHT: ADDITIONAL GALLERY PHOTOS */}
        <div className="sm:col-span-8 lg:col-span-8 space-y-1.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="block text-[11px] font-semibold text-neutral-600">
              Additional Gallery Photos ({gallery.length})
            </span>
            <label className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-black text-[11px] font-bold rounded-md cursor-pointer transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" />
              <span>Add Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUploadGalleryFiles}
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
            className={`relative grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 rounded-2xl border transition-all min-h-[140px] items-start ${
              isDraggingGallery
                ? 'border-black border-dashed bg-neutral-100 ring-4 ring-black/10'
                : 'border-neutral-200 bg-neutral-50/50'
            }`}
          >
            {isDraggingGallery && (
              <div className="absolute inset-0 z-30 bg-black/80 rounded-2xl text-white flex flex-col items-center justify-center gap-1 pointer-events-none animate-in fade-in">
                <UploadCloud className="w-6 h-6 text-amber-300 animate-bounce" />
                <span className="text-[10px] font-bold uppercase">Drop to Add to Color Gallery</span>
              </div>
            )}

            {gallery.map((imgUrl, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-200 group bg-white shadow-2xs">
                <img src={imgUrl} alt={`${config.colorName} Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                
                {/* SET AS MAIN OR DELETE HOVER OVERLAY */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                  <button
                    type="button"
                    onClick={() => onSetAsMain(idx)}
                    className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-bold uppercase flex items-center gap-0.5 cursor-pointer shadow-xs"
                    title="Set as Main Cover for this Color"
                  >
                    <Star className="w-2.5 h-2.5 fill-white" />
                    <span>Main</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveGalleryImage(idx)}
                    className="p-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
                    title="Delete Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* DASHED + ADD BOX */}
            <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-white flex flex-col items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors group shadow-2xs">
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 text-neutral-500">Add / Drop</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUploadGalleryFiles}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorGallerySection;
