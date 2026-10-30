# PII inventory and KVKK/GDPR engineering controls

Legal content here is orientation for engineers, not legal advice. Confirm applicability, thresholds and deadlines with counsel; laws and authority guidance change.

## Inventory

| Field / group | Category | Stored in | Purpose | Lawful basis / consent record | Readers (roles, tenants, operators) | Retention + mechanism | Processors receiving it | Region(s) |
|---|---|---|---|---|---|---|---|---|

Categories to check for: identity (name, national id), contact (phone, email, address), location (precise or coarse), financial (card tokens, IBAN, invoices), special categories (health, biometrics, religion, etc. — stricter rules under both laws), children's data, credentials, device and advertising ids, free text (often contains anything), photos and documents, communication content (messages sent through the product).

## Processor register

| Processor | Data sent | Code path | Region | Retention | Agreement in place | Sub-processors known | Transfer mechanism |
|---|---|---|---|---|---|---|---|

Typical processors: hosting/PaaS, database host, cache host, CDN/WAF, error tracker, log host, analytics, push service, SMS/WhatsApp/email providers, payment and store providers, maps, AI providers, support tooling.

## Engineering controls both laws expect

| Control | What to check in code/config | GDPR anchor | KVKK anchor |
|---|---|---|---|
| Data minimization | Fields collected are used; forms do not ask for more than the purpose needs; logs and telemetry carry ids, not profiles | Art. 5(1)(c), Art. 25 | Art. 4 general principles |
| Purpose and basis recorded | Consent captured with timestamp, version and scope where consent is the basis; withdrawals honoured in code | Art. 6, 7 | Art. 5, explicit consent rules |
| Records of processing | A maintained list matching the inventory above | Art. 30 | VERBIS registration where the controller is not exempt |
| Security of processing | Access control, encryption in transit and at rest, tenant isolation, MFA for operators | Art. 32 | Art. 12 |
| Access and export | Authorized self-service or operator flow; output limited to the requester's data | Art. 15, 20 | Art. 11 |
| Rectification and erasure | Deletion cascades across stores, caches, indexes, files, processors; backups expire | Art. 16, 17 | Art. 7, Art. 11 |
| Processor agreements | Agreement per processor; sub-processor awareness | Art. 28 | data processor obligations, Art. 12 |
| Cross-border transfer | Mechanism per processor outside the country (adequacy, standard contracts or other safeguards); KVKK standard-contract notifications to the Authority where required | Chapter V | Art. 9 (as amended in 2024) |
| Breach notification | Detection, triage owner, regulator notice within 72 hours of awareness where required, user notice when high risk | Art. 33, 34 | Art. 12(5) and Board guidance (72 hours) |
| Impact assessment | DPIA for high-risk processing (large-scale special categories, systematic monitoring, new AI uses) | Art. 35 | not mandated by statute; good practice |

## Retention table

| Store / processor | Data | Period | Enforced by | Deletion on account/tenant closure |
|---|---|---|---|---|

## Breach-readiness questions

1. How would we learn that data leaked (alert, user report, vendor notice)? Who is paged?
2. Which logs prove what was accessed, by whom, and for which tenants? Are they retained long enough?
3. Can every credential be rotated quickly, and is the procedure written down?
4. Who decides on notification, and who drafts the regulator and user notices?
5. Can we list affected users per tenant from evidence, not guesswork?
