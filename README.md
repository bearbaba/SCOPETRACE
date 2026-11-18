# SCOPETRACE — Semantic Scope + Execution Audit

**Two interoperable, standalone GenLayer Intelligent Contracts in ONE contribution.**

| Deploy order | Contract | Role |
|---|---|---|
| A (first) | `contracts/scope_delta.py` — **ScopeDelta** | Versioned semantic scope policies, AI change classification, separate Principal and Agent approvals |
| B (second) | `contracts/trace_bound.py` — **TraceBound** | Reads Contract A through `gl.get_contract_at(Address).view()`, binds each trace to an exact policy version/hash, checks out-of-scope operations and independent AI analysis |

## Why this is reusable

A free-form instruction such as "summarize customer tickets but never send data outside the company" cannot be modeled safely as a single boolean. ScopeDelta locks structured permissions *and* full natural-language commitments. The action list is checked deterministically, and GenLayer consensus interprets semantic changes to the goal/constraints. **No change activates from an AI label:** two distinct wallets must sign approval.

TraceBound is a separate auditing primitive. It reads the **live active policy from A** rather than accepting a policy pasted by the agent, checks exact action IDs, required sequential structure and SHA-256 evidence commitments, then asks validators to independently verify an all-PASS verdict. If the provided action ID is out of scope, a deterministic BREACH veto overrides any AI classification. A Principal can acknowledge or dispute results without altering the AI verdict.

**Trust boundary:** traces are self-reported and hashes do not prove omitted actions did not happen. This is not a production telemetry oracle, funds controller, or actual enforcement firewall. The contract names, declared version and hash of A are checked, but deployment of B still requires trusting/verifying the selected source address.

## Studionet deployment source + constructor verified (18 Nov 2026)

- **Contract A — live deployed source verified:** [ScopeDelta 0xEE7B3883e8a52A48368AdB0528F49730A0aE1689](https://studio.genlayer.com/?import-contract=0xEE7B3883e8a52A48368AdB0528F49730A0aE1689)
- **Verification status:** [Read-only Studionet attestation](https://github.com/bearbaba/SCOPETRACE/actions/runs/44245818416) PASS. Both deployed source files match GitHub exactly; A and B stats read at LATEST_FINAL report v1.0.0, and B.get_registry() returns A. Initial counts: 0 scopes, 0 audits.
- **Contract B:** `contracts/trace_bound.py`, deploy with constructor `scope_registry_address="0xEE7B3883e8a52A48368AdB0528F49730A0aE1689"` **only after** confirming A is deployed and `stats()` reports `SCOPEDELTA`, version `1.0.0`.
- **Contract B — live deployed source verified:** [TraceBound `0xaD4de51008032F665d44964B1589B7D112156a32`](https://studio.genlayer.com/?import-contract=0xaD4de51008032F665d44964B1589B7D112156a32).
- **Read-only deployment verifier:** `npm run verify:studionet` checks the deployed source bytes for A/B, `stats()`, `get_registry()`, and `LATEST_FINAL` against the GitHub contract files. The CI result (rather than the URLs alone) establishes whether the link is verified.
- **Signed create/assess/audit TX links:** Pending. [Deployment proof](docs/DEPLOYMENT_EVIDENCE.md) confirms source identity and registry binding, not signed trace calls or AI consensus.

## Deploy on GenLayer Studio / Studionet

1. Paste `contracts/scope_delta.py` into Studio, deploy **ScopeDelta** without constructor arguments. Record the **actual finalized address A**.
2. Create a scope via `create_scope(agent_address, policy_json)` from Principal wallet. Use two distinct accounts. The policy JSON has **exactly** `goal`, `constraints`, `allowed_actions`, `forbidden_actions` keys. Example in `examples/studio_inputs.json`.
3. Paste `contracts/trace_bound.py` and deploy **TraceBound** with `scope_registry_address="0x…"`, inserting *your deployed address A*. This address is **not prefilled or guessed**.
4. From Agent wallet, call `submit_trace(scope_id, trace_json, trace_sha256)`. Hash canonical JSON with sorted keys and compact separators as in `scripts/hash_inputs.py`.
5. Call `assess_trace(audit_id)` and check the finalized receipt and `get_audit(audit_id)` at `LATEST_FINAL`; Principal independently calls `acknowledge_audit`. A completed demo must include a COMPLIANT example and a BREACH/UNVERIFIED example.
6. To demonstrate change governance: `propose_change → assess_change → approve_change` from each distinct party → `activate_change`; reject any REVIEW/CONFLICT or stale scope.

**Never submit either GenLayer contribution slot based on unverified simulated tests.** Both contracts must be deployed and cross-contract calls plus real consensus validated before describing the flow as live.

## Verify locally

```bash
python -m unittest discover -s tests -v
python -m py_compile contracts/*.py
```

See [Architecture and safety model](docs/SECURITY_MODEL.md) and [GenLayer developer docs](https://docs.genlayer.com/developers/intelligent-contracts/features/interacting-with-intelligent-contracts). MIT licensed.
