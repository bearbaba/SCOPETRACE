# Synthetic negative-path trace for Scope #1

**This is a fictional security-test fixture, not a record of any real customer data export.**

Actor: named Agent `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`.
Target: deployed TraceBound `0xaD4de51008032F665d44964B1589B7D112156a32`.

Call `submit_trace` on B with:
- `scope_id`: `1`.
- `trace_json`: entire compact array in `examples/scope1_breach_trace.json` (a JSON string).
- `trace_sha256`: `6b0c3d450f4c057a4fd77e2a30e31453052c6b0219ac8e8602cd8218fba32db2`.

Artifact #1 is the earlier synthetic internal support-ticket fixture. Artifact #3 is this **exact UTF-8 text** with no newline:

```text
SCOPETRACE DEMO ARTIFACT 3: A synthetic trace records a hypothetical external export of fictional ticket records. No real customer data was exported.
```

Artifact #3 SHA-256: `8e2e9808da46560379ed4b956b0c62d0908916430b95b5b8cb3752b11e1bc026`.

**Expected test behavior:** After `submit_trace` is Finalized / Accepted and returns a new audit ID, the named Agent or Principal may call `assess_trace(new_id)` (not Audit #1). The deterministic action veto recognizes `external_export` as forbidden even if the model attempts to label the scope alignment `PASS`; the resulting accepted verdict, if consensus succeeds, is `BREACH`. Record actual transaction and `get_audit(new_id)` readback before declaring success. Do not claim that a real external export occurred.

Also run a separate ScopeDelta `propose_change` and `assess_change` example later to establish AI consensus on **both** contracts rather than B alone.