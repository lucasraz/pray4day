Micro-SaaS Agent Instructions

This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer Micro-SaaS architecture that separates concerns to maximize reliability, security, and scalability. LLMs are probabilistic, whereas SaaS business logic and infrastructure must be deterministic and consistent. This system resolves that mismatch by separating product intent, application orchestration, and infrastructure execution.

The 3-Layer Architecture

Layer 1: Directive (What the SaaS must do)

Product and business SOPs written in Markdown, stored in directives/

Define user flows, business rules, inputs, outputs, permissions, billing implications, and edge cases

Natural language specifications similar to product requirements or backend use-case descriptions

Represent the authoritative behavior of the Micro-SaaS

Layer 2: Orchestration (Application decision layer)

This is the application/service layer of the SaaS

Reads directives and implements their flows through backend services

Coordinates repositories, integrations, and infrastructure tools in the correct order

Enforces validation, authorization, tenant boundaries, and business rules

Handles errors, transactions, and async jobs

Updates directives with architectural learnings when behavior evolves

You are the bridge between product intent and infrastructure execution.
For example, you do not implement billing logic directly in database code — you read directives/manage_subscription.md, determine required inputs/outputs, then call services and execution modules such as execution/payments/stripe_client.

Layer 3: Execution (Infrastructure and integrations)

Deterministic infrastructure modules in execution/

Database repositories, payment providers, storage adapters, email/SMS clients, queues, and external APIs

Environment variables, secrets, and API tokens stored in .env or secure vault

Handle I/O, persistence, and external communication only

Reliable, testable, retry-safe, and free of business decisions

Why this works:
If business logic, infrastructure, and orchestration are mixed, errors compound and systems become insecure and unmaintainable.
Separating deterministic execution from decision logic ensures reliability, auditability, and scalability in Micro-SaaS systems.

Operating Principles

1. Check existing execution modules first
Before creating new infrastructure or integration code, inspect execution/ for existing repositories or providers referenced by the directive. Only create new execution modules if none exist.

2. Self-anneal when things break

Read error messages and stack traces

Fix the orchestration or execution module

Test again (unless the operation incurs external cost — billing, tokens, etc., in which case confirm first)

Update the directive with constraints or edge cases discovered (API limits, billing rules, tenant constraints)

Example:
You encounter a payment provider rate limit → inspect provider docs → implement retry or batch strategy in execution layer → test → update directive with limits.

3. Update directives as the system evolves
Directives are living SaaS specifications.
When you discover constraints, improved flows, common failure cases, or compliance requirements — update the directive.
Do not create or overwrite directives without explicit approval unless instructed.
Directives are the canonical product behavior and must be preserved and improved over time.

Self-Annealing Loop

Errors strengthen the system when resolved correctly.

When something breaks:

Fix orchestration or execution code

Update or create automated tests

Validate tenant safety and security impact

Update directive to reflect corrected flow

System becomes more robust

File Organization

Persistent SaaS Data vs Temporary Processing

Persistent data: database records, storage objects, billing entities, tenant data accessible via the SaaS

Temporary data: processing artifacts or transient exports

Directory structure:

.tmp/ — Temporary processing files. Never commit. Always regenerable.

execution/ — Infrastructure modules (repositories, payments, storage, integrations)

directives/ — Product and business specifications in Markdown

backend/ — Orchestration layer (services, controllers, policies, jobs)

.env — Environment variables and secrets

credentials.json, token.json — OAuth or integration credentials (git-ignored)

Key principle:
Local files are only for processing.
Persistent SaaS state lives in database, storage, or external systems.
Everything in .tmp/ must be disposable and reproducible.

Multi-Tenant SaaS Principles

All domain data includes tenant_id

Tenant isolation enforced at repository level

Authorization always tenant-scoped

No cross-tenant queries or data mixing

Billing and subscriptions linked to tenants

Storage and resources tenant-segmented

Security Responsibilities

Directive layer

Defines permissions and ownership

Compliance and retention requirements

Billing and audit expectations

Orchestration layer

Authentication and authorization

Input validation and anti-abuse

Tenant boundary enforcement

Transaction safety

Execution layer

Secret and credential handling

Secure API clients

Encrypted or isolated storage

Least-privilege database access

Sensitive data must never be logged outside secure audit contexts.

Summary

You sit between Micro-SaaS product intent (directives) and deterministic infrastructure (execution).

Read directives.
Implement flows via orchestration services.
Use repositories and integrations in execution.
Respect tenant boundaries and security.
Handle errors and evolve directives.
Continuously strengthen the system.

Be pragmatic.
Be reliable.
Build secure Micro-SaaS systems that scale.

---

# Clean Code Agent Instructions

This file is mirrored across CLAUDE.md, AGENTS.md, GEMINI.md, and CLEAN_CODE.md so the same engineering standards load in any AI environment.

You operate within a Clean Code architecture that separates intent, structure, and implementation to maximize readability, maintainability, and correctness.
Software that merely works is insufficient — it must also be understandable, evolvable, and safe to change.
This system ensures that generated or modified code remains human-quality, not just machine-valid.

---

# The 3-Layer Code Quality Model

## Layer 1: Intent (What the code means)

The semantic purpose of the code — domain meaning and business intent.

Defines:
- domain concepts
- invariants and rules
- expected behavior
- contracts and side effects
- input/output semantics

This layer answers:
“Why does this exist?”

Code at this layer should reflect domain language, not technical mechanics.

Examples:
- calculate_invoice_total
- user_has_active_subscription
- mark_order_as_shipped

Not:
- processData
- handleStuff
- doLogic

Intent must be explicit in names and structure.

---

## Layer 2: Structure (How the logic is organized)

The architectural and logical composition of behavior.

Defines:
- function boundaries
- module responsibilities
- dependency direction
- abstraction levels
- separation of concerns

Rules:
- One function = one responsibility
- One module = one reason to change
- High-level policy must not depend on low-level details
- Call hierarchy should read like a narrative

Good structure allows reading code top-down without mental jumps.

---

## Layer 3: Implementation (How the machine executes)

The concrete operations and syntax.

Includes:
- loops
- conditionals
- API calls
- persistence
- data transforms
- algorithms

Implementation must be:
- minimal
- explicit
- unsurprising
- duplication-free
- side-effect controlled

This layer must never leak complexity upward.

---

# Why this works

If intent, structure, and implementation are mixed:
- names lose meaning
- functions grow
- duplication spreads
- bugs hide
- changes become dangerous

Separating them ensures:
- readability
- safe refactoring
- testability
- long-term evolution

---

# Operating Principles

## 1. Name for intent, not mechanics
Names must describe purpose, not process.

Prefer:
- invoice_total
- expired_sessions
- send_password_reset_email

Avoid:
- data
- list
- obj
- tmp
- handler
- util

If a name needs a comment, the name is wrong.

---

## 2. Functions must be small and singular
A function should do one thing.

Signs it does too much:
- multiple verbs in name
- nested conditionals
- more than one abstraction level
- comments separating sections

Target:
- 5–20 lines typical
- single conceptual step
- no mixed responsibilities

---

## 3. Abstraction levels must not mix
Do not combine:
- high-level policy
- mid-level orchestration
- low-level mechanics

Bad:
processOrder():
  validate input
  calculate tax
  for item in db.query(...)

Good:
process_order():
  validate_order()
  totals = calculate_totals()
  persist_order(totals)

---

## 4. Eliminate duplication aggressively
Duplication includes:
- logic
- condition patterns
- algorithms
- validation rules
- magic constants

Rule:
If two places change together, they must live together.

---

## 5. Make illegal states unrepresentable
Prefer modeling over validation.

Instead of:
status: string

Prefer:
enum OrderStatus { Pending, Paid, Shipped, Cancelled }

Constraints belong in types and structure.

---

## 6. Comments are last resort
Good code explains itself.

Allowed comments:
- rationale (“why”)
- non-obvious constraints
- external requirements
- legal or protocol notes

Avoid:
- restating code
- narrating steps
- obvious explanations

---

## 7. Errors must be explicit and meaningful
Never:
- swallow errors
- return null silently
- use generic messages

Errors should:
- describe cause
- include context
- be actionable
- preserve stack or chain

---

## 8. Side effects must be visible
Functions that mutate state must signal it.

Prefer names like:
- save_user
- mark_paid
- delete_session

Pure functions should remain pure.

---

## 9. Structure for reading, not writing
Code is read far more than written.

Optimize for:
- scanning
- navigation
- comprehension
- change safety

Not for:
- cleverness
- brevity tricks
- density

---

## 10. Refactor continuously
Every modification must improve:
- names
- structure
- duplication
- clarity

Leave code better than found.

---

# Self-Improving Loop

When code smells appear:
- rename for clarity
- extract function
- remove duplication
- raise abstraction
- simplify branches

Then:
- ensure tests still pass
- verify behavior unchanged
- commit improvement

Clean code compounds.

---

# Code Smell Signals

Refactor immediately if you see:
- long functions
- vague names
- boolean flags controlling behavior
- deep nesting
- repeated conditionals
- mixed abstraction
- comment blocks explaining code
- temporary variables spreading
- data clumps
- switch/if chains on type

These indicate structural decay.

---

# Testing Alignment

Clean code enables clean tests.

Tests should be:
- readable
- intention-revealing
- independent
- deterministic

If tests are hard to write, code structure is wrong.

---

# Summary

You generate and modify code that humans must understand and evolve.

Preserve intent in names.
Preserve structure in composition.
Minimize implementation complexity.

Separate meaning from mechanics.
Eliminate duplication.
Make states explicit.
Refactor relentlessly.

Write code that communicates.

Be clear.
Be small.
Be predictable.
Build systems humans can trust.