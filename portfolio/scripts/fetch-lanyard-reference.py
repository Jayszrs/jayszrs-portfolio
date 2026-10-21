"""Retain public reference artifacts for inert REA inspection, without copying site artwork."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import urlopen

origin = "https://djazuli.my.id/"
output = Path(__file__).resolve().parents[2] / "backups/djazuli-reference-2026-10-21"
output.mkdir(exist_ok=True)
data = urlopen(origin, timeout=30).read()
(output / "index.html").write_bytes(data)

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []
        self.inline = []
        self.parts = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "script":
            if attrs.get("src"):
                self.sources.append(urljoin(origin, attrs["src"]))
            elif attrs.get("type") not in {"application/ld+json", "application/json"}:
                self.parts = []

    def handle_data(self, data):
        if self.parts is not None:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.parts is not None:
            self.inline.append("".join(self.parts))
            self.parts = None

parser = Scripts()
parser.feed(data.decode("utf-8"))
manifest = []
for index, script in enumerate(parser.inline):
    if script.strip():
        name = f"inline-{index}.js"
        payload = script.encode()
        (output / name).write_bytes(payload)
        manifest.append({"file": name, "source": origin, "kind": "inline", "sha256": hashlib.sha256(payload).hexdigest()})
for index, url in enumerate(parser.sources):
    if urlparse(url).netloc != urlparse(origin).netloc:
        continue
    payload = urlopen(url, timeout=30).read()
    name = f"site-{index}.js"
    (output / name).write_bytes(payload)
    manifest.append({"file": name, "source": url, "kind": "external-same-origin", "sha256": hashlib.sha256(payload).hexdigest()})
(output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"htmlBytes": len(data), "publicScriptUrls": parser.sources, "retainedFiles": [item["file"] for item in manifest]}))
