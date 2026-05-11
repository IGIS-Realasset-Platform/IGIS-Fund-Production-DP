import os
import unicodedata
from PIL import Image

for f in os.listdir("public"):
    norm_name = unicodedata.normalize('NFC', f)
    if norm_name == "홍장군.jpg":
        img = Image.open(os.path.join("public", f))
        out_name = unicodedata.normalize('NFC', "홍장군.webp")
        out_path = os.path.join("public", out_name)
        img.save(out_path, 'WEBP')
        print(f"Saved {out_path}")
