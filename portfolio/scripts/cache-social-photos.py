"""Cache the owner's public Instagram preview images supplied through stdin."""
import hashlib
import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

root = Path(__file__).resolve().parents[1]
output = root / "public/social/instagram"
output.mkdir(parents=True, exist_ok=True)
records = []
for index, item in enumerate(json.load(sys.stdin)):
    url = item["url"]
    if not urlparse(url).hostname.endswith(".cdninstagram.com"):
        raise ValueError("Expected a public Instagram image host")
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=25) as response:
        payload = response.read()
        if not response.headers.get("Content-Type", "").startswith("image/"):
            raise ValueError("Expected an image response")
    digest = hashlib.sha256(payload).hexdigest()
    filename = f"{digest[:20]}.jpg"
    (output / filename).write_bytes(payload)
    records.append({"src": f"/social/instagram/{filename}", "alt": item["alt"], "sha256": digest, "bytes": len(payload)})
manifest = {"handle": "jayszrs", "source": "https://www.instagram.com/jayszrs/embed/", "capturedAt": str(date.today()), "avatar": records[0], "photos": records[1:]}
(root / "frontend/lib/instagram-gallery.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"images": len(records), "bytes": sum(r["bytes"] for r in records)}))
