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
    "boss2c": {"box": (960,20,1225,258), "erase": [(960,135,1005,258)]},
    "bag2a": (55,505,200,715), "bag2b": (55,730,182,935), "wall2": (985,680,1195,945),
  },
  "level-3.jpg": {
    "gate3": (50,25,230,200), "shop3a": (258,5,392,148), "shop3b": (438,5,562,142), "shop3c": (608,15,712,135),
    "super3": (700,12,895,165), "boss3a": (898,10,1095,138), "boss3b": (858,185,1100,378), "boss3c": (838,405,1112,598),
    "bag3a": (5,448,145,642), "bag3b": (5,648,110,815), "wall3": (698,648,852,818),
  },
  "level-4.jpg": {
    "gate4": (15,22,155,165), "shop4a": (188,22,322,112), "shop4b": (372,22,512,118), "shop4c": (578,22,702,108),
    "super4": (678,148,822,272), "boss4a": (812,22,1062,200),
    "boss4b": {"box": (718,200,1005,472), "erase": [(718,200,825,275)]},
    "boss4c": (478,278,702,472), "bag4a": (25,448,175,622), "bag4b": (25,625,155,818), "wall4": (898,648,1085,835),
  },
}
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites")

def cut(im, box):
    erase = []
    if isinstance(box, dict): erase, box = box["erase"], box["box"]
    a = np.asarray(im.crop(box).convert("RGB")).astype(np.float32)
    border = np.concatenate([a[0], a[-1], a[:,0], a[:,-1]])
    paper = np.median(border, axis=0)
    for (ex0, ey0, ex1, ey1) in erase:   # paint erase rectangles with the paper colour
        a[max(0,ey0-box[1]):ey1-box[1], max(0,ex0-box[0]):ex1-box[0]] = paper
    # Local paper colour: strokes are thin, so a wide median filter (then blur) per channel
    # removes them and leaves the paper, including its lighting gradient and shadows.
    from PIL import ImageFilter
    src = Image.fromarray(a.astype(np.uint8))
    bg = np.dstack([np.asarray(ch.filter(ImageFilter.MedianFilter(51)).filter(ImageFilter.GaussianBlur(6))) for ch in src.split()]).astype(np.float32)
    dist = np.sqrt(((a - bg)**2).sum(axis=2))            # how far from the local paper colour
    alpha = np.clip((dist - 18) / 34.0, 0, 1)             # soft threshold
    # blue annotation text -> transparent (mask grown by 3px to catch the fringe)
    r, g, b = a[...,0], a[...,1], a[...,2]
    blue = (b > r + 25) & (b > g + 10)
    blue = np.asarray(Image.fromarray((blue*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    alpha[blue] = 0
    # push colours away from the paper colour so pencil strokes read as solid ink
    rgb = np.clip(np.minimum(bg + (a - bg) * 2.6, bg), 0, 255)   # only ever darker than the paper
    out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = Image.fromarray((alpha*255).astype(np.uint8)).getbbox()
    return img.crop(bbox) if bbox else img

for src, boxes in BOXES.items():
    im = Image.open(os.path.join(os.path.dirname(__file__), "..", "local", src))
    for name, box in boxes.items():
        cut(im, box).save(os.path.join(OUT, name + ".png"))
        print("wrote", name)
