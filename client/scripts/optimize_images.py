import os
from PIL import Image

def optimize_image(filepath, max_width=None, max_height=None, quality=80):
    if not os.path.exists(filepath):
        print(f"Skipping (not found): {filepath}")
        return
    orig_size = os.path.getsize(filepath)
    try:
        with Image.open(filepath) as img:
            w, h = img.size
            needs_resize = False
            new_w, new_h = w, h

            if max_width and w > max_width:
                new_w = max_width
                new_h = int(h * (max_width / w))
                needs_resize = True
            
            if max_height and new_h > max_height:
                new_w = int(new_w * (max_height / new_h))
                new_h = max_height
                needs_resize = True

            if needs_resize:
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # WebP format saving
            img.save(filepath, "WEBP", quality=quality, method=6)
            
        new_size = os.path.getsize(filepath)
        saved = (orig_size - new_size) / 1024
        pct = ((orig_size - new_size) / orig_size) * 100 if orig_size > 0 else 0
        print(f"Optimized: {os.path.basename(filepath)} ({w}x{h} -> {new_w}x{new_h}) | {orig_size/1024:.1f}KB -> {new_size/1024:.1f}KB (-{saved:.1f}KB, -{pct:.1f}%)")
    except Exception as e:
        print(f"Error optimizing {filepath}: {e}")

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "images"))

# 1. Mobile Hero Images (originally 2160x3838, ~500KB each)
hero_mobile_dir = os.path.join(base_dir, "home", "hero")
for i in range(1, 6):
    f = os.path.join(hero_mobile_dir, f"mobile-{i}.webp")
    optimize_image(f, max_width=720, quality=80)

# 2. Desktop Hero Images
for i in range(1, 6):
    f = os.path.join(hero_mobile_dir, f"hero-{i}.webp")
    optimize_image(f, max_width=1600, quality=82)

# 3. Mobile Bento Grid
bento_mobile_dir = os.path.join(base_dir, "home", "Bento Grid", "mobile")
if os.path.exists(bento_mobile_dir):
    for fname in os.listdir(bento_mobile_dir):
        if fname.endswith(".webp"):
            f = os.path.join(bento_mobile_dir, fname)
            optimize_image(f, max_width=500, quality=80)

# 4. Desktop Bento Grid
bento_dir = os.path.join(base_dir, "home", "Bento Grid")
if os.path.exists(bento_dir):
    for fname in os.listdir(bento_dir):
        if fname.endswith(".webp"):
            f = os.path.join(bento_dir, fname)
            optimize_image(f, max_width=1200, quality=80)

# 5. Reels thumbnails
reels_dir = os.path.join(base_dir, "home", "reels")
if os.path.exists(reels_dir):
    for fname in os.listdir(reels_dir):
        if fname.endswith(".webp"):
            f = os.path.join(reels_dir, fname)
            optimize_image(f, max_width=480, quality=80)

# 6. Category images
cat_dir = os.path.join(base_dir, "category")
if os.path.exists(cat_dir):
    for fname in os.listdir(cat_dir):
        if fname.endswith(".webp"):
            f = os.path.join(cat_dir, fname)
            optimize_image(f, max_width=360, quality=80)

# 7. Mobile banner
banner_file = os.path.join(base_dir, "banner", "mobile-banner.webp")
optimize_image(banner_file, max_width=640, quality=80)

print("\nOptimization complete!")
