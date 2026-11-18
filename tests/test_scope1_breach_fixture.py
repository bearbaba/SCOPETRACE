"""Check simulated forbidden action fixture digest without issuing transactions."""
import hashlib
import json
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXPECTED_TRACE_SHA256="6b0c3d450f4c057a4fd77e2a30e31453052c6b0219ac8e8602cd8218fba32db2"
ARTIFACT_ONE="SCOPETRACE DEMO ARTIFACT 1: A fictional, redacted internal ticket set created for testing. No real customer data was accessed."
ARTIFACT_THREE="SCOPETRACE DEMO ARTIFACT 3: A synthetic trace records a hypothetical external export of fictional ticket records. No real customer data was exported."

class BreachFixtureTests(unittest.TestCase):
    def test_fixture_data_provenance_and_canonical_trace_digest(self):
        steps=json.loads((ROOT/"examples/scope1_breach_trace.json").read_text(encoding="utf-8"))
        self.assertEqual([x["seq"] for x in steps], [1,2])
        self.assertEqual([x["action"] for x in steps], ["read_ticket","external_export"])
        for step,raw in zip(steps,[ARTIFACT_ONE,ARTIFACT_THREE]):
            self.assertEqual(step["evidence_sha256"],hashlib.sha256(raw.encode("utf-8")).hexdigest())
        canonical=json.dumps(steps,sort_keys=True,separators=(",",":"),ensure_ascii=True)
        self.assertEqual(hashlib.sha256(canonical.encode("utf-8")).hexdigest(),EXPECTED_TRACE_SHA256)

if __name__=="__main__":
    unittest.main()
