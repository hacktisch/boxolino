"""Cut sprites out of the pencil drawings and make the paper transparent.
Usage: python3 tools/extract_sprites.py
Edit BOXES below to add new drawings (x0, y0, x1, y1 in source pixels)."""
import numpy as np
from PIL import Image
import os

BOXES = {
  "main-character.jpg": {
    "somersault": (45,25,160,135), "dead": (150,160,395,315), "kick": (425,160,597,320),
    "bag_kick": (600,115,700,300), "bag_left": (15,275,95,475), "flykick": (90,325,255,450),
    "walk1": (100,452,240,605), "walk2": (228,450,322,605), "walk3": (305,445,432,605),
    "stand": (432,365,590,545), "punch": (605,330,762,525), "bag_right": (762,320,841,485),
  },
  "scene-1.jpg": {
    "gate": (55,5,270,180), "boss": (590,50,705,165), "boss_sign": (600,160,705,200),
    "shop": (338,172,572,362), "bag1": (20,425,112,575), "bag_gold": (190,420,328,580),
    "wall": (722,332,935,595), "hud_coin": (800,3,905,58), "hud_level": (380,3,565,58),
    "hud_power": (625,3,745,58),
  },
  "level-2.jpg": {
    "gate2": (65,55,240,300), "drinkshop": (255,268,440,432), "gloveshop": (455,140,600,285),
    "shop2": (440,290,640,470),
    # bosses overlap on the page: `erase` = rectangles (source pixels) to blank out inside the box
    "boss2a": {"box": (705,128,835,283), "erase": [(790,192,835,283)]},
    "boss2b": {"box": (765,140,960,283), "erase": [(765,140,832,193), (765,215,800,283)]},
    "boss2c": {"box": (960,20,1225,258), "erase": [(960,135,1005,258)]}, "bag2a": (55,505,200,715), "bag2b": (55,730,182,935), "wall2": (985,680,1195,945),
  },
}
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites")

def cut(im, box):
    erase = []
    if isinstance(box, dict): erase, box = box["erase"], box["box"]
    a = np.asarray(im.crop(box).convert("RGB")).astype(np.float32)
    for (ex0, ey0, ex1, ey1) in erase:   # paint erase rectangles with the paper colour
        a[max(0,ey0-box[1]):ey1-box[1], max(0,ex0-box[0]):ex1-box[0]] = np.median(a[:5], axis=(0,1))
    h, w, _ = a.shape
    # paper colour = median of the crop border
    border = np.concatenate([a[0], a[-1], a[:,0], a[:,-1]])
    paper = np.median(border, axis=0)
    dist = np.sqrt(((a - paper)**2).sum(axis=2))          # how far from paper colour
    alpha = np.clip((dist - 12) / 30.0, 0, 1)             # soft threshold
    # blue annotation text -> transparent (mask grown by 3px to catch the fringe)
    r, g, b = a[...,0], a[...,1], a[...,2]
    blue = (b > r + 25) & (b > g + 10)
    from PIL import ImageFilter
    blue = np.asarray(Image.fromarray((blue*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    alpha[blue] = 0
    # push colours away from the paper colour so pencil strokes read as solid ink
    rgb = np.clip(paper + (a - paper) * 2.6, 0, 255)
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    # trim fully transparent margins
    bbox = Image.fromarray((alpha*255).astype(np.uint8)).getbbox()
    return img.crop(bbox) if bbox else img

for src, boxes in BOXES.items():
    im = Image.open(os.path.join(os.path.dirname(__file__), "..", "local", src))
    for name, box in boxes.items():
        cut(im, box).save(os.path.join(OUT, name + ".png"))
        print("wrote", name)
