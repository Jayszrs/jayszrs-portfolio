"""Build lazy-loaded public content catalogs; never read secrets or admin settings."""
import concurrent.futures
import json
import pathlib
import re
import sys
import time
import urllib.parse
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
source = pathlib.Path(sys.argv[1])
content = json.loads(source.read_text(encoding="utf-8-sig"))
keys = {"title", "subtitle", "description", "summary", "focus", "activities", "responsibilities", "companyBackground", "achievement", "highlights", "tools", "role", "roles", "position", "degree", "major", "field", "label", "name", "text", "message", "body", "intro", "headline", "tagline", "eyebrow", "category", "period", "location", "start", "end", "issuedAt", "year"}
texts = set()

def visit(value, field=""):
    if isinstance(value, dict):
        for key, child in value.items():
            visit(child, key)
    elif isinstance(value, list):
        for child in value:
            visit(child, field)
    elif isinstance(value, str) and (field in keys or len(value) > 80):
        for raw in [value, *value.splitlines()]:
            text = re.sub(r"\s+", " ", raw).strip()
            if len(text) >= 4 and re.search(r"[A-Za-z]", text) and not re.search(r"https?://|[\w.+-]+@[\w.-]+", text):
                texts.add(text)

visit(content)
output = root / "frontend/locales"
output.mkdir(exist_ok=True)

def translate(text, language):
    chunks = re.findall(r".{1,1100}(?:\s|$)|\S{1,1100}", text)
    result = []
    for chunk in chunks:
        params = urllib.parse.urlencode({"client": "gtx", "sl": "auto", "tl": language, "dt": "t", "q": chunk.strip()})
        for attempt in range(4):
            try:
                with urllib.request.urlopen("https://translate.googleapis.com/translate_a/single?" + params, timeout=18) as response:
                    payload = json.load(response)
                translated = "".join(part[0] or "" for part in payload[0]).strip()
                if not translated:
                    raise ValueError("Empty translation")
                result.append(translated)
                break
            except Exception:
                if attempt == 3:
                    raise
                time.sleep(1 + attempt)
    return " ".join(result)

for language in ["ja", "fr"]:
    target = output / (language + ".json")
    catalog = json.loads(target.read_text(encoding="utf-8")) if target.exists() else {}
    pending = sorted(texts - catalog.keys())
    failures = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(translate, text, language): text for text in pending}
        for number, future in enumerate(concurrent.futures.as_completed(futures), 1):
            try:
                catalog[futures[future]] = future.result()
            except Exception:
                failures += 1
            if number % 25 == 0 or number == len(pending):
                target.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                print(f"{language}: {number}/{len(pending)}, cached={len(catalog)}, failures={failures}", flush=True)
    if failures:
        raise SystemExit(f"{language}: {failures} missing translations; rerun to retry")
