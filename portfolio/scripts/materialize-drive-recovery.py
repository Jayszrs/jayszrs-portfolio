"""Download connector file references locally; never persist signed download URLs."""
import base64
import hashlib
import json
import pathlib
import sys
import urllib.request

root = pathlib.Path(__file__).resolve().parents[2]
request = json.loads(base64.b64decode(sys.argv[1]))
destination = (root / request["destination"]).resolve()
if not destination.is_relative_to(root / "backups"):
    raise ValueError("Recovery download must stay in backups")
destination.parent.mkdir(parents=True, exist_ok=True)
with urllib.request.urlopen(request["download_url"], timeout=60) as response:
    data = response.read()
if len(data) != int(request["size"]):
    raise ValueError("Downloaded size does not match Drive metadata")
destination.write_bytes(data)
print(json.dumps({"path": str(destination), "bytes": len(data),
                  "md5": hashlib.md5(data).hexdigest(),
                  "sha256": hashlib.sha256(data).hexdigest()}))
