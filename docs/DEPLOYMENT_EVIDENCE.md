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

**Next proof gate:** The Agent must submit a real action trace to B. Until that is FINALIZED / Accepted and B `get_audit` returns the frozen scope hash, actual cross-contract execution remains unproven.
