"""Verify published synthetic trace fixture SHA-256 against its exact stored JSON."""
import hashlib, json, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = [
  "SCOPETRACE DEMO ARTIFACT 1: A fictional, redacted internal ticket set created for testing. No real customer data was accessed.",
  "SCOPETRACE DEMO ARTIFACT 2: An illustrative weekly support summary, not a real operational report."
]
HASH="e6ce66c283abba292a41aa3ce0cc6d83d6b004fb1b9bcbc2eec27d9ef5a93df2"
class FixtureIntegrity(unittest.TestCase):
    def test_exact_fixture_hash_matches_contract_sha256(self):
        file = ROOT / "examples/scope1_allowed_trace.json"
        items = json.loads(file.read_text(encoding="utf-8"))
        self.assertEqual([x["seq"] for x in items], [1,2])
        for row, raw in zip(items, EVIDENCE):
            self.assertEqual(row["evidence_sha256"],hashlib.sha256(raw.encode("utf-8")).hexdigest())
        canonical = json.dumps(items,sort_keys=True,separators=(",",":"),ensure_ascii=True)
        self.assertEqual(hashlib.sha256(canonical.encode("utf-8")).hexdigest(), HASH)
if __name__ == "__main__":unittest.main()
