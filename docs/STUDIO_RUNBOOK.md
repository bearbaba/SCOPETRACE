# SCOPETRACE — Studio deployment and evidence runbook

**Target:** GenLayer Studionet. **Status:** NOT DEPLOYED. Complete this runbook with actual on-chain links, never guessed addresses.

## Contract A: ScopeDelta

1. Open [GenLayer Studio](https://studio.genlayer.com/). Paste `contracts/scope_delta.py`, verify source starts with the GenLayer dependency directive.
2. Deploy **ScopeDelta** with **no** constructor arguments.
3. Capture **deployed address A**, transaction hash, and `stats()`: expected `name=SCOPEDELTA`, `version=1.0.0`. Record them in an evidence section after finalization.
4. Switch to **Principal** browser wallet. Use a **different Agent wallet** to populate `create_scope(agent_address, policy_json)`. Example editable policy:
```json
{"goal":"Summarize internal support tickets into weekly reports without exposing personal data.","allowed_actions":["read_ticket","write_summary"],"forbidden_actions":["external_export","transfer_funds"],"constraints":"All work is confined to the authorized internal workspace. No customer records may be sent to external destinations."}
```
5. Read `get_active_scope(scope_id)` at `LATEST_FINAL`. Record scope ID, principal/agent wallets, version=1 and canonical `policy_sha256`.

## Contract B: TraceBound

6. Paste `contracts/trace_bound.py` into Studio. At deploy, set its required constructor `scope_registry_address` to the **actual address A**. Deploy B. Never paste the address of an unrelated contract or a sample placeholder.
7. Read B `stats()` / `get_registry()` and assert B's stored source address equals deployed A. Use `get_active_scope(scope_id)` from A as the provenance check.
8. Connect the named **Agent** wallet. Build a list of 1–16 ordered trace steps. Each has `seq`, `action`, `note` and an actual SHA-256 digest of externally retained evidence bytes. This digest binds only submitted evidence, not external activity truth.
9. Save the steps as e.g. `trace.json`, then compute its **canonical JSON** digest:
```bash
python scripts/hash_inputs.py trace.json
```
10. Call B `submit_trace(scope_id, trace_json, trace_sha256)`. On accepted transaction, call `assess_trace(audit_id)` and use `get_audit(audit_id)` to verify the stored trace, frozen scope hash, actor and independent consensus verdict.
11. From the **Principal** wallet, call `acknowledge_audit(audit_id, accept)`. This means acknowledging/disputing the audit conclusion, not proving that every real-world action was logged.

## Mandatory proof cases before submission

| Scenario | Required behavior | Claim that is NOT permitted |
|---|---|---|
| All allowed actions, sufficiently described, validators agree | `COMPLIANT` (if AI independently returns all PASS) | "All real agent activity has been observed" |
| Trace includes `external_export` | `BREACH` (deterministic veto) | "A malicious external export was independently observed" |
| Same trace with corrupted SHA | Rejected before on-chain commit | "AI detected bad hash" |
| Change A's version after trace submission | B assessment refuses stale scope | "Old audit applies automatically to new scope" |
| A change adds `external_send` to allowed actions | `EXPANDED` even if leader AI calls it NARROWED | "AI cannot be mistaken" |
| Activate amended scope | Requires separate approvals from Principal and Agent, consensus accepted | "Single admin can force activation" |
| Validator labels materially disagree | No accepted decisive assessment, possible `UNDETERMINED` | "Undetermined is approved" |

## Evidence to collect

- A Studio import URL + full deployed address
- B Studio import URL + full deployed address, constructor A address
- At least 2 independent accepted consensus TX receipts (one at A, one at B)
- A positive and negative case **with real Explorer TX hashes**, including `FINALIZED` and `LATEST_FINAL`
- Source identity against deployed code for both contracts
- Screenshots are useful but not substitutes for Explorer links

## Contribution draft (only AFTER verification)

**Title:** SCOPETRACE — AI Scope Change Consensus + Cross-Contract Action Audits

**Notes:** Two complementary GenLayer Intelligent Contracts: ScopeDelta locks versioned agent authority, assesses semantic scope amendments with independent AI validators and deterministic expansion checks, and requires both Principal and Agent to approve activation. TraceBound reads ScopeDelta's deployed state through a pinned address, binds signed action traces to exact policy versions and hashes, and combines deterministic permission vetoes with independent three-criterion AI consensus. No automatically trusted reports, token controls or self-approved completion. Include real deployed contracts, tests, threat model and signed Studio receipts after validation.

**Evidence URL:** https://github.com/bearbaba/SCOPETRACE

**Submission:** one `Intelligent Contracts` slot for the pair, not one slot per source file.
