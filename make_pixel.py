from PIL import Image, ImageFilter, ImageEnhance

SRC = "/Users/salina/Downloads/234B2D15-9C9F-45BA-9C61-285709C6CE6B.jpg"
OUT = "/Users/salina/SalinaGiri.github.io/public/salina-pixel.png"

img = Image.open(SRC).convert("RGB")
w, h = img.size

# Crop: centre on face + shoulders
crop = img.crop((int(w*0.18), int(h*0.04), int(w*0.82), int(h*0.70)))

# Slight contrast/saturation boost before pixelating so colours pop
crop = ImageEnhance.Contrast(crop).enhance(1.15)
crop = ImageEnhance.Color(crop).enhance(1.1)

# Target output size
OUT_W, OUT_H = 344, 430

# Pixel block size — 2px blocks: face totally clear, tiny pixel hint for the theme
BLOCK = 2
grid_w = OUT_W // BLOCK
grid_h = OUT_H // BLOCK

# Shrink with high quality, then back up nearest-neighbour
small  = crop.resize((grid_w, grid_h), Image.LANCZOS)

# Large palette — fine blocks need many colours to stay accurate
PALETTE = [
    # skin — very bright highlights to deep shadows, many steps
    (255, 235, 215), (252, 225, 202), (250, 215, 190),
    (247, 205, 178), (244, 195, 165), (240, 183, 152),
    (235, 170, 138), (228, 158, 124), (220, 145, 110),
    (210, 132, 96),  (198, 118, 82),  (185, 104, 68),
    (170, 90,  55),  (155, 78,  44),  (138, 66,  35),
    (120, 55,  28),  (100, 45,  22),
    # hair — near-black to medium brown
    (18,  10,  5),   (28,  16,  8),   (40,  24,  12),
    (55,  34,  18),  (72,  46,  26),  (90,  58,  34),
    (110, 74,  44),  (132, 92,  56),  (155, 112, 72),
    (178, 135, 92),  (200, 158, 112),
    # lips
    (225, 130, 120), (210, 110, 100), (195, 90,  82),
    (180, 72,  66),  (165, 58,  54),
    # eyes / brows
    (22,  12,  8),   (38,  22,  14),  (58,  38,  24),
    (80,  56,  38),  (105, 78,  55),
    # eye whites / sclera
    (245, 242, 238), (235, 232, 228), (255, 253, 250),
    # red top — many shades
    (255, 100, 90),  (245, 82,  72),  (232, 65,  58),
    (218, 50,  48),  (200, 38,  40),  (182, 28,  32),
    (165, 20,  26),
    # background curtain fringe — warm tans
    (245, 228, 195), (232, 212, 175), (218, 196, 155),
    (202, 178, 135), (185, 160, 115), (168, 142, 96),
    (150, 124, 78),  (132, 106, 62),  (115, 90,  48),
    (98,  75,  36),  (82,  62,  28),
    # background wall — cool light grey
    (238, 236, 232), (225, 222, 218), (210, 207, 203),
    (195, 192, 188), (178, 175, 170),
    # wooden table / warm dark tones
    (160, 108, 60),  (140, 90,  46),  (118, 74,  34),
    (96,  58,  24),  (76,  44,  16),
    # portfolio accent colours (subtle presence for theme tie-in)
    (255, 184, 210), (255, 220, 170), (174, 224, 255),
    # near-whites
    (255, 255, 255), (250, 248, 245), (242, 240, 237),
]

def nearest(r, g, b):
    return min(PALETTE, key=lambda c: (c[0]-r)**2+(c[1]-g)**2+(c[2]-b)**2)

pixels = list(small.convert("RGB").getdata())
mapped = [nearest(*p) for p in pixels]

quantised = Image.new("RGB", (grid_w, grid_h))
quantised.putdata(mapped)

# Scale up with NEAREST so each block is a crisp square
big = quantised.resize((OUT_W, OUT_H), Image.NEAREST)

# Pink border (matches --pink in portfolio)
BORDER = 5
final = Image.new("RGB", (OUT_W + BORDER*2, OUT_H + BORDER*2), (255, 184, 210))
final.paste(big, (BORDER, BORDER))
final.save(OUT, "PNG")
print(f"Saved {final.width}×{final.height}px — block size {BLOCK}px")
