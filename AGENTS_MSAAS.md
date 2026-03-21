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