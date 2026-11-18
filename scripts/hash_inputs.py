"""Print canonical SHA-256 for policy or trace from a JSON file."""
import hashlib, json, sys
from pathlib import Path
if len(sys.argv) != 2:
    raise SystemExit("usage: python scripts/hash_inputs.py path/to/trace.json")
value = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
canonical = json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(",", ":"))
print("canonical_json =", canonical)
print("sha256 =", hashlib.sha256(canonical.encode("utf-8")).hexdigest())
