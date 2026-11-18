# Synthetic fixture — NOT evidence of external work

Use the two raw UTF-8 strings in this file as source artifacts for the demonstrated hash commitments. They are fictional and do not document a real support-ticket operation.

Artifact 1 (exact bytes excluding Markdown fences):
```text
SCOPETRACE DEMO ARTIFACT 1: A fictional, redacted internal ticket set created for testing. No real customer data was accessed.
```
SHA-256: `3a8cbc0916fdd1abc5550b0980bb87fe465c59b52a838691886c8e90ac6f9a59`

Artifact 2:
```text
SCOPETRACE DEMO ARTIFACT 2: An illustrative weekly support summary, not a real operational report.
```
SHA-256: `50f984da04e9e66dcc5b794ac8a9d2b16646f009ed2cb6de3df3db6c8b9933e8`

## Transaction instructions

- Call on **Contract B** `0xaD4de51008032F665d44964B1589B7D112156a32`, with **Agent wallet** `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`.
- `submit_trace(scope_id=1, trace_json=<JSON in examples/scope1_allowed_trace.json>, trace_sha256=e6ce66c283abba292a41aa3ce0cc6d83d6b004fb1b9bcbc2eec27d9ef5a93df2)`.
- Signed input is a synthetic demonstration: a compliant AI decision would only concern this submitted sample trace, **not** independent verification that real-world actions occurred.
- Check `get_audit(1)` after FINALIZED; then ask GenLayer AI consensus via `assess_trace(1)`.
