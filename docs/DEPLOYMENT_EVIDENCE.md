# SCOPETRACE — Verified Studionet Deployment Evidence

Date: 18 November 2026. Chain: GenLayer Studionet, 61999.

Reproducible read-only attestation: https://github.com/bearbaba/SCOPETRACE/actions/runs/44245818416

## Contract A: ScopeDelta
- Address: 0xEE7B3883e8a52A48368AdB0528F49730A0aE1689
- Studio: https://studio.genlayer.com/?import-contract=0xEE7B3883e8a52A48368AdB0528F49730A0aE1689
- Source: contracts/scope_delta.py
- Source SHA-256: d7f964693056b6240c1d41c38f25910996239840c95b538bb07b0beb7ee1e107
- Verified at LATEST_FINAL: name=SCOPEDELTA; version=1.0.0; scopes=0; changes=0.

## Contract B: TraceBound
- Address: 0xaD4de51008032F665d44964B1589B7D112156a32
- Studio: https://studio.genlayer.com/?import-contract=0xaD4de51008032F665d44964B1589B7D112156a32
- Source: contracts/trace_bound.py
- Source SHA-256: 3ee6a8d6705fceb30c9707665b87ada02ae99afa6b5c0bc9df621a512f3ef49a
- Verified at LATEST_FINAL: name=TRACEBOUND; version=1.0.0; audits=0.
- Verified stored registry address: 0xee7b3883e8a52a48368adb0528f49730a0ae1689

## Exactly what has and has not been proven

GitHub Actions independently retrieved and byte-compared both deployed Python source files, read both deployed contracts at LATEST_FINAL, and checked that TraceBound's get_registry() and stats().source_registry equal ScopeDelta A. All seven read-only checks passed.

This does not yet prove a successful live cross-contract call with a real scope: no scope existed when these reads were performed. It also does not prove accepted semantic consensus or an actual COMPLIANT/BREACH result.

## Required next on-chain evidence

1. Principal creates a scope on A with independent Agent wallet and original policy. Capture TX hash and read get_active_scope(scope_id).
2. Agent calls submit_trace on B. Check that the B transaction is FINALIZED / Accepted / SUCCESS and get_audit(audit_id) stores the active scope version/hash.
3. Trigger genuine GenLayer semantic consensus via A.assess_change and B.assess_trace and collect real receipt hashes; label Undetermined truthfully.
4. Run a positive/negative authorization test and document exact final verdicts, if accepted.
5. Do not claim independent evidence of real-world agent actions: traces and evidence hashes are user-submitted claims.

No fabricated transaction hashes or success claims are supplied here.

## Scope #1 — real signed transaction (18 November 2026)

- **create_scope:** [0xdb76c4b0ff10564c24085617fc552d26ca94092467cebe11c18a73e73e1e9af2](https://explorer-studio.genlayer.com/tx/0xdb76c4b0ff10564c24085617fc552d26ca94092467cebe11c18a73e73e1e9af2)
- User-provided Explorer receipt: FINALIZED / Accepted / GenVM SUCCESS; return value **1**.
- **Principal:** `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb`; **Agent:** `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF` (distinct wallets).
- **Frozen initial version:** 1; **initial policy SHA-256:** `facc957baeedb76db936131d228e88f3ce5455e35652938a5b06882bad5550c9`.
- **Initial allowed actions:** `read_ticket`, `write_summary`. **Forbidden:** `external_export`, `transfer_funds`.
- An independent read-only CI attestation now reads `get_scope(1)` and `get_active_scope(1)` at `LATEST_FINAL`; it verifies the historical SHA and signer addresses without signing anything.

**Cross-contract proof gate:** Satisfied by Audit #1. A live accepted `UNVERIFIED` assessment of Audit #1 is recorded below; an independent LATEST_FINAL CI check enforces its final state.


## Audit #1 — real Agent-signed cross-contract submission (18 November 2026)

- **submit_trace:** [`0x02bfc789ed69f4615bec61bbeed76b16640c88f0aa72d6685ef62d5adb55b531`](https://explorer-studio.genlayer.com/tx/0x02bfc789ed69f4615bec61bbeed76b16640c88f0aa72d6685ef62d5adb55b531)
- User-provided Explorer record: **FINALIZED / Accepted / GenVM SUCCESS**, returned **Audit ID = 1**.
- From Agent `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`, to deployed TraceBound B.
- Signed input: `scope_id=1`, canonical `trace_json` from [synthetic fixture](../examples/scope1_allowed_trace.json), and `trace_sha256=e6ce66c283abba292a41aa3ce0cc6d83d6b004fb1b9bcbc2eec27d9ef5a93df2`.
- Returned Audit #1: `registry=0xee7b3883e8a52a48368adb0528f49730a0ae1689`, `scope_version=1`, `scope_sha256=facc957baeedb76db936131d228e88f3ce5455e35652938a5b06882bad5550c9`, `state=SUBMITTED`, `verdict=""`.
- This demonstrates that B's submission succeeded while reading the active ScopeDelta policy; its original policy hash, agent identity and trace digest can now be verified independently using `scripts/verify-deployment.mjs`.

**Caveat:** The evidence items are fictional samples created for this demo. This proves an on-chain cross-contract scope-bound record, **not** real operational activity or independent source truth.

**Next:** Submit a separate synthetic unauthorized-action trace on B as Audit #2 to demonstrate the deterministic violation veto. Do not run `assess_trace(1)` again: Audit #1 has already been assessed.


## Audit #1 — genuine GenLayer AI consensus (18 November 2026)

- **assess_trace(1) transaction:** [`0x80644f594c4328466fba0d680afd98fbd6faea38b2d856b981a5cb06d7b7e7e0`](https://explorer-studio.genlayer.com/tx/0x80644f594c4328466fba0d680afd98fbd6faea38b2d856b981a5cb06d7b7e7e0)
- From the named Agent wallet to TraceBound B. User-provided Explorer receipt: **FINALIZED, Accepted, GenVM SUCCESS**.
- **Returned verdict: `UNVERIFIED`.** Equivalence Principle output: `{"evidence_sufficiency":"REVIEW","scope_alignment":"PASS","sequence_integrity":"PASS"}`.
- The reviewer found no mismatch in declared scope and action sequence but declined to verify the completeness of the fictional external evidence. This is a meaningful fail-closed AI classification, *not* a runtime failure and *not* a false `COMPLIANT` attestation.
- Read-only CI checks `get_audit(1)` against `LATEST_FINAL` to confirm `state=ASSESSED`, `verdict=UNVERIFIED` and all three exact labels. The transaction receipt is the evidence for the Accepted consensus result; a state read alone does not independently show all validator votes.
- The agent-submitted evidence remains a **synthetic fixture**. Nothing here asserts that external tickets were actually read or exported.

## Audit #2 — real Agent-signed negative-path submission (18 November 2026)

- **submit_trace transaction:** [`0xe2cc7fdf8afdeb6fb31a5ff94f768902891bcbeec4d3d1979a38357bb55c9c89`](https://explorer-studio.genlayer.com/tx/0xe2cc7fdf8afdeb6fb31a5ff94f768902891bcbeec4d3d1979a38357bb55c9c89)
- User-provided Explorer receipt: **FINALIZED / Accepted / GenVM SUCCESS**; method `submit_trace`, returned **Audit ID = 2**.
- From bound Agent `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF` to deployed TraceBound B `0xaD4de51008032F665d44964B1589B7D112156a32`, nonce 133, value 0 GEN.
- Exact signed arguments: `scope_id=1`, `trace_json` from [the hypothetical forbidden-action fixture](../examples/scope1_breach_trace.json), `trace_sha256=6b0c3d450f4c057a4fd77e2a30e31453052c6b0219ac8e8602cd8218fba32db2`.
- Its second declared action is `external_export`, **forbidden** by Scope #1. The fixture represents a hypothetical violation using fictional records, **not a real export**.
- Signed submission is proven by the user-provided transaction receipt. Read-only CI independently checks `get_audit(2)` at `LATEST_FINAL` against the canonical fixture, frozen scope version/hash, registry address, and Agent identity.
- **Assessment result shared by the user:** subsequent `get_audit(2)` output reports `state=ASSESSED`, `verdict=BREACH`, with `scope_alignment=VIOLATION`, `sequence_integrity=PASS`, `evidence_sufficiency=REVIEW`, `deterministic_out_of_scope_steps=[2]`, and `principal_ack=NONE`. The separate `assess_trace(2)` TX hash/Explorer receipt is **not yet provided**; do not describe its independent consensus receipt as checked.
- Next evidence step: obtain the existing `assess_trace(2)` TX hash and link the receipt (do **not** rerun an already assessed trace). Independently attest the stored BREACH outcome at `LATEST_FINAL`, then test `propose_change` / `assess_change` on ScopeDelta A.

## Scope #1 — real Agent-signed proposed permission expansion / Change #1 (18 November 2026)

- **propose_change TX:** [`0x7d016ac6bc0632728e6e2bb78eaff95b18de2ae24eb0ffad97d957141a6b11f4`](https://explorer-studio.genlayer.com/tx/0x7d016ac6bc0632728e6e2bb78eaff95b18de2ae24eb0ffad97d957141a6b11f4)
- User-provided Explorer receipt: **FINALIZED / Accepted / GenVM SUCCESS**, return **Change ID = 1**, `scope_id=1`, nonce 135, value 0 GEN.
- Signed by bound Agent `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`; to ScopeDelta A `0xEE7B3883e8a52A48368AdB0528F49730A0aE1689`.
- Original allowed actions `read_ticket`, `write_summary`; requested new allowed action `tag_ticket` (existing forbidden actions `external_export` and `transfer_funds` retained). Goal and constraints unchanged.
- This **proposes**, but does **not** activate, a scope expansion. Contract A returned **`EXPANDED`** in a real Accepted / Finalized assessment (below); this is an assessment of a proposed expansion, **not** automatic authorization.
- Read-only CI verifies `get_change(1)` at `LATEST_FINAL`, including its proposer, base version/hash, exact proposed actions and canonical new SHA, regardless of subsequent review state.
- **assess_change(1) TX:** [`0x5029d3cd69311fb93166771e7a414616824dfdb7ef841f9d8e0e7d63bd174d2f`](https://explorer-studio.genlayer.com/tx/0x5029d3cd69311fb93166771e7a414616824dfdb7ef841f9d8e0e7d63bd174d2f).
- User-provided Explorer receipt: **FINALIZED / Accepted / GenVM SUCCESS**; Agent signer `0xD6b8A3A5eB329410D9504784812b8569afA8C2aF`, nonce 136, result **`EXPANDED`**.
- Genuine GenLayer Equivalence Principle output: `{"label":"EXPANDED"}`.
- This proves an accepted on-chain classification from ScopeDelta A, alongside the prior accepted AI assessment of TraceBound Audit #1. Read-only CI verifies Change #1's resulting `label=EXPANDED` and `state=ASSESSMENT_ACCEPTED` or, if later activated through the required two approvals, `ACTIVATED`.
- **Next security gate:** separately test `approve_change(1)` with Principal and Agent, then `activate_change(1)` only after both approvals; record transaction receipts. Until activation, active Scope #1 version remains 1.

## Negative security gate — premature activation rejected (18 November 2026)

- **Rejected attempt TX:** [`0xf82c0f5f8dcb30c2d87d2706b88264d35a5352281e149a60bdd3a90dad45727e`](https://explorer-studio.genlayer.com/tx/0xf82c0f5f8dcb30c2d87d2706b88264d35a5352281e149a60bdd3a90dad45727e).
- User-provided Explorer receipt: outer transaction **FINALIZED / Accepted**, but **GenVM ERROR / Rollback** (not a successful activation).
- Principal `0x4C7cb73aC8F8999af21cfc9fF4cF2333a9508Dcb` attempted `activate_change(1)` on ScopeDelta A, nonce 552.
- Exact reported rejection: `two independent approvals and accepted review required`. Since `assess_change(1)` had already succeeded, the missing requirement is approval by both independent wallets. An outer Accepted consensus does **not** override GenVM rollback.
- This rejection is evidence that the dual-approval activation guard is enforced. No activation was committed by the rejected call. The read-only CI additionally checks active policy version/hash against the change's state at `LATEST_FINAL`.
- **Next:** Principal should call `approve_change(1)` and obtain `ONE_APPROVAL`, then the bound Agent separately calls `approve_change(1)` and obtains `BOTH_APPROVED`, and only then should a party call `activate_change(1)`. Record actual receipts. Never claim either approval has occurred without proof.
