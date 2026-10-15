"""Bundle downloaded certificate originals and render first-page previews.

Usage: python scripts/import-drive-assets.py path/to/download-manifest.json
Requires PyMuPDF and Pillow. Reads local input only; never calls Blob or writes Drive.
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

import fitz
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
manifest = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
destination = root / "public" / "certificates"
previews = destination / "previews"
previews.mkdir(parents=True, exist_ok=True)
assets = []
for item in manifest:
    if item.get("error"):
        raise RuntimeError(f"Download failed: {item['name']}")
    source = Path(item["file"])
    suffix = ".pdf" if item["type"] == "application/pdf" else ".jpg" if item["type"] == "image/jpeg" else ".png"
    name = item["id"] + suffix
    target = destination / name
    shutil.copyfile(source, target)
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if hashlib.sha256(target.read_bytes()).hexdigest() != digest:
        raise RuntimeError(f"Copy verification failed: {name}")
    if suffix == ".pdf":
        with fitz.open(source) as document:
            page_count = len(document)
            pixmap = document[0].get_pixmap(matrix=fitz.Matrix(900 / document[0].rect.width, 900 / document[0].rect.width), alpha=False)
            image = Image.frombytes("RGB", [pixmap.width, pixmap.height], pixmap.samples)
    else:
        image = Image.open(source).convert("RGB")
        page_count = 1
    ImageOps.contain(image, (1000, 1000)).save(previews / (item["id"] + ".webp"), "WEBP", quality=84)
    assets.append({
        "id": item["id"], "name": item["name"], "folder": item["path"],
        "mimeType": item["type"], "sha256": digest, "bytes": source.stat().st_size,
        "pages": page_count, "url": "/certificates/" + name,
        "preview": "/certificates/previews/" + item["id"] + ".webp",
        "driveUrl": "https://drive.google.com/file/d/" + item["id"] + "/view",
    })
output = root / "backend" / "data" / "drive-certificate-assets.json"
output.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Bundled and verified {len(assets)} original files with first-page previews.")
