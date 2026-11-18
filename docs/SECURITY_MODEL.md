# SCOPETRACE — Protocol and threat model

- **Separation:** A and B are deployed independently. B's constructor stores A's actual deployed address; an agent cannot swap it per audit.
- **Trusted scope:** B reads `get_active_scope(id)`, verifies marker/name, version, principals and canonical policy SHA-256. Hash only assures internally consistent declared data; selecting the wrong contract address is a deployment trust mistake.
- **Authorizations:** Principal registers scope with a different Agent address. Only either party proposes/assesses changes, and both must approve an AI-assessed change before activation. EXPANDED requires the same explicit dual approval; REVIEW/CONFLICT cannot activate.
- **Veto:** Newly added action identifiers or removed forbidden identifiers deterministically force semantic expansion labeling. Out-of-scope trace action identifiers force BREACH, never COMPLIANT, regardless of LLM output.
- **Cross-state drift:** B remembers A policy hash/version from submission; if scope changes before assessment, abort safely.
- **Validator behavior:** For activating verdicts, independent validators rerun semantic classifications. In B, independently rerun all-PASS claims. Conservative REVIEW cannot authorize scope change or attest compliance.
- **Replay / identity:** Single pending amendment per scope; immutable snapshots; unique IDs; different Principal/Agent; one assessment and one principal acknowledgement per trace.
- **Limitations:** No proof a self-reported action trace includes every action; evidence hashes alone are not independent telemetry. No automatic funds movement, production account permission changes, or external enforcement.
- **Adversarial cases:** LLM prompt injections inside constraints/notes, fake policy response, altered policy hash, wrong registry address, wrong sender, stale scope versions, unauthorized action identifier, duplicate approvals, malformed JSON, validator disagreement.
