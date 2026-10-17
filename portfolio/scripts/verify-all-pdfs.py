"""Verify every published recovery PDF against local/source checksums and parse pages.

Read-only remote requests; writes a local evidence report and a contact sheet.
Usage: python scripts/verify-all-pdfs.py [base-url] [YYYY-MM-DD]
"""
import concurrent.futures
import hashlib
import json
import re
import sys
import threading
import urllib.request
from pathlib import Path

import fitz
from PIL import Image, ImageDraw

APP = Path(__file__).resolve().parents[1]
ROOT = APP.parent
BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://jayszrs.my.id").rstrip("/")
DATE = sys.argv[2] if len(sys.argv) > 2 else "2026-10-17"
assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", DATE)
OUT = ROOT / "backups" / f"pdf-verification-{DATE}"
OUT.mkdir(parents=True, exist_ok=True)


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def request(path):
    url = path if path.startswith("https://") else BASE + path
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Portfolio-Recovery-Verification/1.0"}), timeout=60) as response:
        return response.read(), response.headers.get("Content-Type", ""), response.status


content = json.loads(request("/api/content")[0])
mapping = {}
for name in ["organization-logos.json", "recovered-media.json", "certificate-media.json"]:
    value = read(APP / "frontend/lib" / name)
    mapping.update(value.get("sources", value))
references = {}


def collect(value, path=""):
    if isinstance(value, str) and re.search(r"\.pdf(?:[?#].*)?$", value, re.I):
        resolved = mapping.get(value.strip(), value.strip()).split("#")[0]
        references.setdefault(resolved, []).append({"field": path, "original": value})
    elif isinstance(value, dict):
        for key, item in value.items():
            collect(item, f"{path}.{key}".strip("."))
    elif isinstance(value, list):
        for index, item in enumerate(value):
            collect(item, f"{path}.{index}")


collect(content)
expected = {}
for asset in read(APP / "backend/data/drive-certificate-assets.json"):
    if asset["mimeType"] == "application/pdf":
        expected[asset["url"]] = {"sha256": asset["sha256"], "kind": "original-certificate", "name": asset["name"]}
for asset in read(APP / "backend/data/media-recovery-sources.json"):
    # Different recovery generations use different source-record structures.
    if isinstance(asset, dict):
        url = asset.get("url", asset.get("localUrl", ""))
        if isinstance(url, str) and url.endswith(".pdf") and asset.get("sha256"):
            expected[url] = {"sha256": asset["sha256"], "kind": "original-recovery", "name": asset.get("name", Path(url).name)}
for project in read(APP / "frontend/lib/recovered-project-media.json").values():
    for document in project.get("documents", []):
        expected[document["url"]] = {"sha256": document["sha256"], "kind": document["kind"], "name": document["title"]}
for path in (APP / "public").rglob("*.pdf"):
    url = "/" + path.relative_to(APP / "public").as_posix()
    expected.setdefault(url, {"sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "kind": "local-recovery", "name": path.name})
paths = sorted(set(expected) | set(references))
parse_lock = threading.Lock()
fitz.TOOLS.mupdf_display_errors(False)
fitz.TOOLS.mupdf_display_warnings(False)


def verify(url):
    info = {"url": url, **expected.get(url, {}), "references": references.get(url, [])}
    try:
        data, content_type, status = request(url)
        assert data.startswith(b"%PDF-"), "Response is not a PDF"
        sha = hashlib.sha256(data).hexdigest()
        if url in expected:
            assert sha == expected[url]["sha256"], "Source checksum mismatch"
        if url.startswith("/"):
            assert sha == hashlib.sha256((APP / "public" / url.lstrip("/")).read_bytes()).hexdigest(), "Local checksum mismatch"
        # MuPDF's parser-warning buffer is global; keep parsing serial to attribute warnings correctly.
        with parse_lock:
            fitz.TOOLS.mupdf_warnings(reset=True)
            with fitz.open(stream=data, filetype="pdf") as pdf:
                assert not pdf.needs_pass, "PDF requires a password"
                assert len(pdf) > 0, "PDF has no pages"
                for page in pdf:
                    page.get_displaylist()
                first = pdf[0]
                pixmap = first.get_pixmap(matrix=fitz.Matrix(220 / first.rect.width, 220 / first.rect.width), alpha=False)
                name = hashlib.sha256(url.encode()).hexdigest()[:18] + ".png"
                pixmap.save(OUT / name)
                info.update(status="PASS", httpStatus=status, bytes=len(data), sha256=sha, pages=len(pdf), contentType=content_type, thumbnail=name)
            warnings = fitz.TOOLS.mupdf_warnings(reset=True)
            if warnings:
                info["parserWarnings"] = warnings
    except Exception as error:
        info.update(status="FAIL", error=str(error))
    return info


with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    files = list(pool.map(verify, paths))
for start in range(0, len(files), 30):
    group = files[start:start + 30]
    sheet = Image.new("RGB", (1200, ((len(group) + 4) // 5) * 270), "#e9eceb")
    draw = ImageDraw.Draw(sheet)
    for index, item in enumerate(group):
        x, y = index % 5 * 240, index // 5 * 270
        if item.get("thumbnail"):
            with Image.open(OUT / item["thumbnail"]) as im:
                im.thumbnail((225, 235))
                sheet.paste(im, (x + 7, y + 5))
        draw.text((x + 7, y + 242), f"{start + index + 1:02} {Path(item['url']).name[:24]}", fill="black")
        draw.text((x + 7, y + 255), f"{item['status']} / {item.get('pages', '?')} pages", fill="black")
    sheet.save(OUT / f"contact-{start // 30 + 1}.jpg", quality=90)
failures = [item for item in files if item["status"] != "PASS"]
report = {"date": DATE, "baseUrl": BASE, "status": "FAIL" if failures else "PASS", "uniquePdfs": len(files),
          "livePdfReferenceFields": sum(len(items) for items in references.values()), "resolvedReferenceTargets": len(references),
          "verifiedPages": sum(item.get("pages", 0) for item in files), "files": files,
          "failures": failures, "remoteMutations": 0}
(ROOT / "backups" / f"all-public-pdf-verification-{DATE}.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(json.dumps({key: value for key, value in report.items() if key not in ["files", "failures"]}))
if failures:
    print(json.dumps(failures, ensure_ascii=False))
    sys.exit(1)
