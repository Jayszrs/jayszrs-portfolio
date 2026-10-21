"""Cache the portfolio's existing Iconify SVGs for reliable same-origin delivery."""
import concurrent.futures
import hashlib
import json
import pathlib
import re
import urllib.request
import xml.etree.ElementTree as ET

root = pathlib.Path(__file__).resolve().parents[1]
source = (root / "frontend/components/BrandIcon.js").read_text(encoding="utf-8")
registry_path = root / "frontend/lib/skill-icons.json"
existing = json.loads(registry_path.read_text(encoding="utf-8")) if registry_path.exists() else {}
icons = {quoted or bare: icon for quoted, bare, icon in re.findall(r'^\s*(?:"([^"]+)"|(\w+)):\s*"([^\"]+:\S+)"', source, re.M)}
if not icons:
    icons = {name: entry["icon"] for name, entry in existing.items()}
destination = root / "public/skill-icons"
destination.mkdir(exist_ok=True)
collections = {}
for prefix in sorted({icon.split(":", 1)[0] for icon in icons.values()}):
    url = f"https://raw.githubusercontent.com/iconify/icon-sets/master/json/{prefix}.json"
    with urllib.request.urlopen(url, timeout=45) as response:
        collections[prefix] = json.load(response)

def cache(entry):
    name, icon = entry
    collection, symbol = icon.split(":", 1)
    assert re.fullmatch(r"[a-z0-9-]+", collection) and re.fullmatch(r"[a-z0-9-]+", symbol)
    url = f"https://github.com/iconify/icon-sets/blob/master/json/{collection}.json"
    target = destination / f"{collection}-{symbol}.svg"
    if target.exists():
        data = target.read_bytes()
    else:
        bundle = collections[collection]
        definition = bundle["icons"].get(symbol)
        if definition is None:
            alias = bundle.get("aliases", {}).get(symbol, {})
            assert set(alias) <= {"parent"}, f"Transformed alias needs explicit handling: {icon}"
            definition = bundle["icons"][alias["parent"]]
        width = definition.get("width", bundle.get("width", 16))
        height = definition.get("height", bundle.get("height", 16))
        data = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">' + definition["body"] + '</svg>\n').encode()
        svg = ET.fromstring(data)
        assert svg.tag.endswith("svg") and svg.get("viewBox")
        assert b"<script" not in data and b"foreignObject" not in data
        target.write_bytes(data)
    return name, {"src": "/skill-icons/" + target.name, "icon": icon, "source": url, "license": collections[collection].get("info", {}).get("license"), "sha256": hashlib.sha256(data).hexdigest()}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = dict(pool.map(cache, icons.items()))
(destination / "attribution.json").write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
display = {name: {"src": entry["src"], "icon": entry["icon"]} for name, entry in results.items()}
registry_path.write_text(json.dumps(display, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Cached {len(results)} existing brand SVGs, preserving original geometry and colors.")
