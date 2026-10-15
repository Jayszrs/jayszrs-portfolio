"""Check deployed recovery bytes, SSR/client assets and preserved CMS records."""
import concurrent.futures
import hashlib
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "portfolio"
BASE = sys.argv[1].rstrip("/")


def get(url):
    request = urllib.request.Request(url, headers={"User-Agent": "Portfolio-Recovery-Verification/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


provenance = json.loads((APP / "backend/data/portfolio-archive-recovery.json").read_text(encoding="utf-8"))
urls = {x["url"]: x["sha256"] for x in provenance["images"]}
for path in ["/recovered-media/drive/laundryuk-dashboard-admin.png", "/organization-logos/ppji.png"]:
    urls[path] = hashlib.sha256((APP / "public" / path.lstrip("/")).read_bytes()).hexdigest()


def verify_file(pair):
    path, checksum = pair
    data = get(BASE + path)
    assert hashlib.sha256(data).hexdigest() == checksum, path
    return {"url": path, "bytes": len(data), "sha256": checksum, "status": 200}


with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    files = list(pool.map(verify_file, urls.items()))

pages = {path: get(BASE + path).decode("utf-8") for path in ["/pengalaman", "/pendidikan", "/proyek"]}
assert "portfolio-archive/" in pages["/pengalaman"]
assert "Universitas Bani Saleh" in pages["/pendidikan"]
assert "laundryuk-dashboard-admin.png" in pages["/proyek"]
scripts = set(re.findall(r'<script[^>]+src="([^"]+\.js[^\"]*)"', pages["/pendidikan"]))
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    bundles = "\n".join(pool.map(lambda url: get(BASE + url).decode("utf-8"), scripts))
assert "recoveredDocumentationLabel" in bundles
for path in [x["url"] for x in provenance["images"]]:
    assert path in bundles, path
current = json.loads(get(BASE + "/api/content"))
baseline = json.loads((Path(os.environ["TEMP"]) / "jayszrs-all-media-current.json").read_text(encoding="utf-8-sig"))
sections = [key for key in baseline if key != "ratings"]
for section in sections:
    assert current[section] == baseline[section], "CMS data changed: " + section
assert len(current["certificates"]) == 67
assert len(current["achievements"]) == 3
report = {"baseUrl": BASE, "status": "PASS", "files": files, "ssrPages": list(pages),
          "educationClientIncludesAllArchiveImages": True,
          "preservedCmsSections": sections, "certificates": 67, "achievements": 3,
          "interactiveBrowserVerification": "Unavailable: no connected browser"}
if len(sys.argv) > 2:
    (ROOT / sys.argv[2]).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"status": "PASS", "files": len(files), "ssrPages": len(pages),
                  "cmsSectionsUnchanged": len(sections), "certificates": 67, "achievements": 3}))
