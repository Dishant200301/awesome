/**
 * Client-side high-performance image compressor for admin uploads.
 * Shrinks raw multi-megabyte photos down to optimized web sizes (~100-250KB)
 * to prevent payload timeouts, connection aborts, and database packet overflow.
 */

export const compressImage = (
  fileOrDataUrl: File | string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve) => {
    // If it's already an external or static URL, skip compression
    if (typeof fileOrDataUrl === 'string') {
      if (!fileOrDataUrl.startsWith('data:image/')) {
        resolve(fileOrDataUrl);
        return;
      }
    }

    const processDataUrl = (src: string) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale down if dimensions exceed maximum
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
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for high compression & fidelity
        try {
          const webp = canvas.toDataURL('image/webp', quality);
          if (webp && webp.startsWith('data:image/webp') && webp.length < src.length) {
            resolve(webp);
            return;
          }
        } catch {
          // fallback to jpeg
        }

        try {
          const jpeg = canvas.toDataURL('image/jpeg', quality);
          if (jpeg && jpeg.startsWith('data:image/jpeg') && jpeg.length < src.length) {
            resolve(jpeg);
            return;
          }
        } catch {
          // fallback to original
        }

        resolve(src);
      };

      img.onerror = () => resolve(src);
      img.src = src;
    };

    if (typeof fileOrDataUrl === 'string') {
      processDataUrl(fileOrDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          processDataUrl(reader.result);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
};

/**
 * Compress an array of files in parallel
 */
export const compressImages = async (
  files: File[] | FileList,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string[]> => {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
  const promises = fileArray.map((file) => compressImage(file, maxWidth, maxHeight, quality));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
};
