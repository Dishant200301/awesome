// Comprehensive Named Color Palette with RGB distance matching

export interface ColorEntry {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

export const COLOR_DICTIONARY: { name: string; hex: string }[] = [
  // Reds & Maroons
  { name: 'Maroon', hex: '#800000' },
  { name: 'Dark Red', hex: '#8B0000' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Ruby Red', hex: '#9B111E' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Wine', hex: '#722F37' },
  { name: 'Scarlet', hex: '#FF2400' },
  { name: 'Cherry', hex: '#DE3163' },
  { name: 'Rust', hex: '#B7410E' },
  { name: 'Brick Red', hex: '#CB4154' },

  // Pinks & Magentas
  { name: 'Pink', hex: '#FF69B4' },
  { name: 'Hot Pink', hex: '#FF1493' },
  { name: 'Blush Pink', hex: '#FFB6C1' },
  { name: 'Baby Pink', hex: '#F4C2C2' },
  { name: 'Rose', hex: '#FF007F' },
  { name: 'Deep Pink', hex: '#FF1493' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Fuchsia', hex: '#C154C1' },
  { name: 'Peach', hex: '#FFE5B4' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Salmon', hex: '#FA8072' },

  // Golds, Yellows & Oranges
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Metallic Gold', hex: '#D4AF37' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Lemon Yellow', hex: '#FFF44F' },
  { name: 'Mustard', hex: '#FFDB58' },
  { name: 'Amber', hex: '#FFBF00' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Dark Orange', hex: '#FF8C00' },
  { name: 'Tangerine', hex: '#F28500' },
  { name: 'Terracotta', hex: '#E2725B' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Copper', hex: '#B87333' },

  // Greens
  { name: 'Emerald Green', hex: '#50C878' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Dark Green', hex: '#006400' },
  { name: 'Forest Green', hex: '#228B22' },
  { name: 'Bottle Green', hex: '#004B23' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Olive Green', hex: '#556B2F' },
  { name: 'Sage Green', hex: '#9DC183' },
  { name: 'Mint Green', hex: '#98FF98' },
  { name: 'Lime Green', hex: '#32CD32' },
  { name: 'Pistachio', hex: '#93C572' },
  { name: 'Sea Green', hex: '#2E8B57' },

  // Blues & Teals
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Dark Blue', hex: '#00008B' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Baby Blue', hex: '#89CFF0' },
  { name: 'Denim Blue', hex: '#3B5998' },
  { name: 'Midnight Blue', hex: '#191970' },
  { name: 'Cobalt Blue', hex: '#0047AB' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Turquoise', hex: '#06B6D4' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Aqua', hex: '#00FFFF' },
  { name: 'Peacock Blue', hex: '#005F73' },

  // Purples & Violets
  { name: 'Purple', hex: '#9333EA' },
  { name: 'Dark Purple', hex: '#4A0E4E' },
  { name: 'Violet', hex: '#8F00FF' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Lilac', hex: '#C8A2C8' },
  { name: 'Plum', hex: '#8E4585' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Mauve', hex: '#E0B0FF' },

  // Neutrals, Browns, Whites & Blacks
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off-White', hex: '#FAF9F6' },
  { name: 'Cream', hex: '#FFFDD0' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Dark Grey', hex: '#A9A9A9' },
  { name: 'Slate Grey', hex: '#708090' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Black', hex: '#18181B' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Dark Brown', hex: '#654321' },
  { name: 'Chocolate', hex: '#7B3F00' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Khaki', hex: '#C3B091' }
];

// Helper to convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Convert RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Find closest English color name for any given Hex
export function getClosestColorName(hex: string): { name: string; hex: string } {
  if (!hex || !hex.startsWith('#')) {
    return { name: 'Custom Color', hex: hex || '#800000' };
  }

  try {
    const target = hexToRgb(hex);

    // Exact match check first
    const exact = COLOR_DICTIONARY.find(
      (c) => c.hex.toLowerCase() === hex.toLowerCase()
    );
    if (exact) return exact;

    let minDistance = Infinity;
    let closest = COLOR_DICTIONARY[0];

    for (const item of COLOR_DICTIONARY) {
      const itemRgb = hexToRgb(item.hex);
      // Weighted Euclidean distance (human eye sensitivity: Red: 0.3, Green: 0.59, Blue: 0.11)
      const rDiff = target.r - itemRgb.r;
      const gDiff = target.g - itemRgb.g;
      const bDiff = target.b - itemRgb.b;
      const distance = Math.sqrt(
        0.3 * (rDiff * rDiff) +
        0.59 * (gDiff * gDiff) +
        0.11 * (bDiff * bDiff)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = item;
      }
    }

    return { name: closest.name, hex };
  } catch (e) {
    return { name: 'Custom Color', hex };
  }
}

// Get accurate Hex for any color name (e.g. "dark green", "silver", "blue", "maroon")
export function findHexByColorName(nameOrVal: string): string {
  if (!nameOrVal) return '#800000';

  const clean = nameOrVal.trim().toLowerCase();

  // If it's already a hex
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean)) {
    return clean;
  }

  // Exact match
  const exact = COLOR_DICTIONARY.find(
    (c) => c.name.toLowerCase() === clean
  );
  if (exact) return exact.hex;

  // Partial match
  const partial = COLOR_DICTIONARY.find(
    (c) => clean.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(clean)
  );
  if (partial) return partial.hex;

  // Fallback: generate a pleasing hash color from string
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  // HSL to hex with fixed 65% saturation and 45% lightness
  return hslToHex(h, 65, 45);
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
