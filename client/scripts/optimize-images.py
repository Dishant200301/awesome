import os
import shutil
from PIL import Image

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "images"))

def optimize_image(rel_path, max_w=None, max_h=None, quality=80):
    full_path = os.path.join(BASE_DIR, rel_path)
    if not os.path.exists(full_path):
        print(f"Skipping missing: {rel_path}")
        return

    orig_size = os.path.getsize(full_path)
    try:
        with Image.open(full_path) as im:
            w, h = im.size
            new_w, new_h = w, h
            if max_w and w > max_w:
                ratio = max_w / float(w)
                new_w = max_w
                new_h = int(h * ratio)
            if max_h and new_h > max_h:
                ratio = max_h / float(new_h)
                new_h = max_h
                new_w = int(new_w * ratio)

            # Convert to RGB if needed (or keep RGBA)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA")

            if (new_w, new_h) != (w, h):
                im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)

            temp_path = full_path + ".opt.webp"
            im.save(temp_path, "WEBP", quality=quality, method=6)

            new_size = os.path.getsize(temp_path)
            if new_size < orig_size:
                shutil.move(temp_path, full_path)
                saved = orig_size - new_size
                print(f"Optimized {rel_path}: {orig_size//1024}KB -> {new_size//1024}KB (saved {saved//1024}KB, {w}x{h} -> {new_w}x{new_h})")
            else:
                os.remove(temp_path)
                print(f"Kept original {rel_path} (new size was not smaller)")
    except Exception as e:
        print(f"Error optimizing {rel_path}: {e}")

def main():
    print("Optimizing Bento Grid Mobile images...")
    optimize_image("home/Bento Grid/mobile/Choli.webp", max_w=480, quality=82)
    optimize_image("home/Bento Grid/mobile/Tassel.webp", max_w=300, quality=80)
    optimize_image("home/Bento Grid/mobile/Latkan.webp", max_w=300, quality=80)
    optimize_image("home/Bento Grid/mobile/Watch.webp", max_w=300, quality=80)
    optimize_image("home/Bento Grid/mobile/Jewellery.webp", max_w=480, quality=80)
    optimize_image("home/Bento Grid/mobile/Hair Accessories.webp", max_w=600, quality=80)

    print("\nOptimizing Bento Grid Desktop images...")
    optimize_image("home/Bento Grid/Choli.webp", max_w=750, quality=82)
    optimize_image("home/Bento Grid/Tassel.webp", max_w=550, quality=82)
    optimize_image("home/Bento Grid/Latkan.webp", max_w=550, quality=82)
    optimize_image("home/Bento Grid/Watch.webp", max_w=550, quality=82)
    optimize_image("home/Bento Grid/Jewellery.webp", max_w=1000, quality=82)
    optimize_image("home/Bento Grid/Hair Accessories.webp", max_w=1200, quality=82)

    print("\nOptimizing Category Circle images...")
    cat_dir = os.path.join(BASE_DIR, "category")
    if os.path.exists(cat_dir):
        for f in os.listdir(cat_dir):
            if f.endswith(".webp"):
                optimize_image(f"category/{f}", max_w=240, max_h=240, quality=80)

    print("\nOptimizing Hero images...")
    optimize_image("home/hero/mobile-1.webp", max_w=640, quality=80)
    optimize_image("home/hero/hero-1.webp", max_w=1600, quality=82)
    optimize_image("home/hero/hero-3.webp", max_w=1600, quality=82)

if __name__ == "__main__":
    main()
