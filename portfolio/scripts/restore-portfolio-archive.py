"""Restore documented photo collections from the owner's preserved portfolio PDFs.

These are source-document collections, not byte-identical Blob recoveries.
The private PDFs and extracted originals stay in backups; only reviewed images
and provenance are published. No CMS or remote storage writes are performed.
"""
import hashlib
import json
import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "portfolio"
BACKUP = ROOT / "backups/connected-drive-recovery-2026-10-15"
CONTENT = Path(os.environ["TEMP"]) / "jayszrs-all-media-current.json"


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


content = read(CONTENT)
unavailable = {x["url"] for x in read(ROOT / "backups/unresolved-before-archive-recovery-2026-10-15.json")}
embedded = {x["file"]: x for x in read(BACKUP / "embedded-manifest.json")}
destination = APP / "public/recovered-media/portfolio-archive"
destination.mkdir(parents=True, exist_ok=True)
images = {}


def restore(filename):
    if filename in images:
        return images[filename]
    entry = embedded[filename]
    source = BACKUP / "embedded" / filename
    assert hashlib.sha256(source.read_bytes()).hexdigest() == entry["sha256"]
    target = destination / (source.stem + ".webp")
    with Image.open(source) as im:
        im.convert("RGB").save(target, "WEBP", quality=95, method=6)
    result = {
        "url": "/recovered-media/portfolio-archive/" + target.name,
        "sourceFile": filename,
        "sourcePdf": entry["pdf"],
        "sourcePage": entry["page"],
        "width": entry["width"],
        "height": entry["height"],
        "sourceImageSha256": entry["sha256"],
        "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
    }
    images[filename] = result
    return result


cyber = [f"portfolio-large-p17-x{n}.jpeg" for n in range(236, 242)]
ui = [f"portfolio-large-p18-x{n}.jpeg" for n in range(247, 250)]
collections = [
    ("education", "edu-1", "Kegiatan Universitas Bani Saleh", cyber + ui),
    ("experience", "exp-1", "Kuliah tamu keamanan siber", cyber),
    ("experience", "exp-1783719364880-ase1", "Magang Etiqa", [
        "portfolio-july-p15-x1011.png", "portfolio-july-p15-x1022.png"]),
    ("experience", "exp-1783772159261-p1xt", "Shortform editing Akademi Crypto", [
        "portfolio-large-p14-x851.jpeg", "portfolio-july-p13-x191.png", "portfolio-july-p13-x192.png"]),
    ("experience", "exp-1783776885789-crbl", "Editing Fulday", [
        "portfolio-large-p15-x889.png", "portfolio-large-p15-x900.png"]),
    ("experience", "exp-1783839299562-6pqs", "Akademi Crypto Summit 2025", [
        f"portfolio-large-p16-x{n}.jpeg" for n in range(227, 231)]),
    ("experience", "exp-1783941595934-agwd", "Pengabdian masyarakat UI x UBS 2024", ui),
    ("experience", "exp-1783942987111-8nlx", "Kegiatan PPJI — lomba menu sehat MBG", [
        f"portfolio-july-p19-x{n}.png" for n in range(264, 267)]),
]
registry = {}
keys = ["image", "logo", "documentationImage", "documentationImage2", "documentationImage3",
        "documentationFile", "documentationImages", "org", "orgLink", "title", "institution", "link"]
for section, identifier, label, files in collections:
    item = next(x for x in content[section] if x["id"] == identifier)
    snapshot = {k: item.get(k, [] if k == "documentationImages" else "") for k in keys}
    old_docs = [*item.get("documentationImages", []), *(item.get(k, "") for k in
                ["documentationImage", "documentationImage2", "documentationImage3", "documentationFile"])]
    registry[identifier] = {
        "section": section,
        "snapshot": snapshot,
        "sourceLabel": label,
        "sourceKind": "Arsip portofolio",
        "unavailableDocumentation": list(dict.fromkeys(x for x in old_docs if x in unavailable)),
        "images": [restore(f) for f in files],
    }

write(APP / "frontend/lib/recovered-documentation.json", registry)
provenance = {
    "kind": "source-document collections; not byte-identical Blob copies",
    "sourcePdfs": {name: hashlib.sha256((BACKUP / name).read_bytes()).hexdigest()
                   for name in ["portfolio-july.pdf", "portfolio-large.pdf"]},
    "images": list(images.values()),
}
write(APP / "backend/data/portfolio-archive-recovery.json", provenance)

logos = read(APP / "frontend/lib/organization-logos.json")
for key, filename, old, sourcefile in [
    ("ppji", "ppji.png", content["experience"][10]["image"], "portfolio-july-p19-x267.png"),
]:
    source = BACKUP / "embedded" / sourcefile
    target = APP / "public/organization-logos" / filename
    target.write_bytes(source.read_bytes())
    logos["assets"][key] = {
        "file": filename, "source": f"Owner's original portfolio PDF: {sourcefile}",
        "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
        "note": "Original logo image embedded in the owner's portfolio; alternate source, not an identical Blob copy.",
    }
    logos["sources"][old] = "/organization-logos/" + filename
write(APP / "frontend/lib/organization-logos.json", logos)
print(json.dumps({"uniqueImages": len(images), "collections": len(registry), "logoMappings": 1}))
