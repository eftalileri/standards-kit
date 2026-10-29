# MMKV — encrypted-instance design and migration lifecycle

```kit-cover
type: normative
part-of: README.md
binds: the MMR obligations for at-rest encryption of a local key-value store — one fail-closed key authority, the one-mode-per-store-identity invariant, the copy to prove to delete to prove-empty migration, and the boundary that keeps encryption from being read as a permit to persist
open-when: shape:frontend-heavy, signal:key-value-storage-only, signal:cache-persistence, signal:persistence-invariant
skip-when: signal:backend-only, signal:no-client-persistence
owns: MMR-M12, MMR-N5
```

Part of [MMKV — cleanup, removal and session teardown](mmkv-cleanup-and-teardown.md). The retirement rows stay there and bind this band: **MMR-M8** (one session-teardown authority and a written verdict per store), **MMR-M11** (dedicated legacy-sensitive instance removal with proof of absence — the rule that retires the old store identity this band's mode invariant sends it to), **MMR-M13** and the prohibitions **MMR-N4**, **MMR-N6**, **MMR-N7**. The persist budgets, `maxAge`, buster and the persist classification gate (**MMR-M1**–**MMR-M7**, **MMR-M9**, **MMR-M10**) are in [mmkv-retention-limits-and-buster.md](mmkv-retention-limits-and-buster.md), which owns the classification this band **must not** be read as overriding. This topic's complete normative set is [mmkv.md](mmkv.md) (MMK-\*, GMM1–GMM5), [mmkv-instance-and-lazy-init.md](mmkv-instance-and-lazy-init.md) (MMI-\*), [mmkv-async-adapter.md](mmkv-async-adapter.md) (MMA-\*), [mmkv-retention-limits-and-buster.md](mmkv-retention-limits-and-buster.md), [mmkv-cleanup-and-teardown.md](mmkv-cleanup-and-teardown.md) and this file.

Document type: Normative — part of MMKV SSOT.

Binding principle: Encryption is a design, not a switch: a store whose key has two sources, whose identity means two different formats across releases, or whose migration cannot prove the old copy is gone, is not protected by the cipher it advertises.

References: [mmkv-cleanup-and-teardown.md](mmkv-cleanup-and-teardown.md) — **MMR-M8**, **MMR-M11** (the retirement path a superseded store identity is moved to); [mmkv-retention-limits-and-buster.md](mmkv-retention-limits-and-buster.md) — **MMR-M10** (the persist classification that encryption does not override, in either direction); [mmkv.md](mmkv.md) — GMM4; [mmkv-instance-and-lazy-init.md](mmkv-instance-and-lazy-init.md) — **MMI-M7** (store identity and domain isolation); [Security — secrets and storage](../security/security-secrets-and-logging.md) — **SEC-M-STORE-2**; [Client observability (RN / Expo) — silent failure paths](../client-observability-rn/silent-failure-paths.md) — **COB-RN-M11**.

---

## **MUST**

| ID | Rule |
|----|------|
| **MMR-M12** | Encrypted-instance design (what an "approved at-rest design" means here). When a project does introduce at-rest encryption for a local store, three properties are mandatory and none of them may be re-decided per call site. (a) One key authority, fail-closed. The key is generated, read, and validated by exactly one module and is held in the platform's secure area (Keychain/Keystore); no second key, no second derivation, no environment/source-embedded key. If the key cannot be resolved, the store does not open — continuing unencrypted "just this once" silently downgrades every consumer, and its accessibility class is an explicit, written decision (a device-bound class means a user restoring onto a new device **must** re-authenticate — a product cost that **must** be accepted deliberately, not discovered in production). (b) Instance-mode invariant. A store identity is either always plaintext or always encrypted — never the same id in two modes across releases. Switching an existing id in place produces a store that some installs can read and others cannot, and the failure looks like data loss. Move the live store to a new id and retire the old one under **MMR-M11**. (c) Migration lifecycle is copy → prove → delete → prove empty, idempotent and loss-free; and it is a *decision* whether to copy at all: when the retired blob is precisely the sensitive data being retired, the correct copier is the empty one — moving it would re-import what the cleanup exists to destroy. A cache whose authority is the server loses nothing by not being copied; say so in the code so the omission is not read as an oversight. (d) Encryption is not a persist permit — and not a persist prerequisite either. Adding encryption does not by itself satisfy **MMR-M10** / [security **SEC-M-STORE-2**](../security/security-secrets-and-logging.md): the credential class stays memory-only however strong the cipher is, and a cipher that is unauthenticated (or whose mode cannot be verified from the dependency in-tree) is defense-in-depth only, measured against the project's own AEAD criterion. Symmetrically, encryption strength is not what licenses the fact class — a recorded risk-owner decision is (**MMR-M10**). Write that boundary where the next reader will hit it (the store module's own header), because "we encrypted it" is otherwise read as "we may persist anything now", and "it is only AES, not AEAD" is otherwise read as "nothing may be persisted". |

---

## **MUST NOT**

| ID | Rule |
|----|------|
| **MMR-N5** | **Must not** open a second key source or fall back to an unencrypted store when the key is unresolvable, reuse one store identity in both plaintext and encrypted mode, copy a retired sensitive blob into the new encrypted store, or treat the presence of encryption as authorization to persist a family that **MMR-M10** classified memory-only (**MMR-M12**). |

---

## Implementation checklist

- [ ] **MMR-M12**, **MMR-N5**
- [ ] One key authority in the platform secure area; the store does not open when the key is unresolvable
- [ ] Store identity is in exactly one mode across releases; a mode change moves to a new id and retires the old one under **MMR-M11**
- [ ] Migration is copy -> prove -> delete -> prove empty, and the decision *not* to copy a retired sensitive blob is written where the next reader hits it
