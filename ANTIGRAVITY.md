# 🚀 ANTIGRAVITY.md - Living Document
## Project: Pray for Day

This document acts as our "Bible" and operational template for designing, coding, and maintaining **Pray for Day**. It must be read fully at the start of every session.

---

## 🛠️ 1. Tech Stack
*   **Framework / Front**: `Next.js` + `React` + `Tailwind CSS`
*   **Component Library**: `Shadcn UI`
*   **Database / Auth / Backend**: `Supabase`

---

## 🏗️ 2. Clean 3-Layer Architecture
We separate product intent, application orchestration, and infrastructure execution to maximize reliability and scalability.

### 📜 **Layer 1: DIRECTIVE** (`directives/`)
*   **Goal**: Define "What" the Micro-SaaS should do.
*   **Format**: Markdown file SOPs (Standard Operating Procedures).
*   **Content**: User flows, business rules, absolute outputs, and permissions specifications.
*   **Rule**: Authoritative documentation mirroring actual business cases.

### 🧠 **Layer 2: ORCHESTRATION** (`backend/`)
*   **Goal**: The decision layer for coordinating services.
*   **Function**: Reads Directives and calls Execution modules in correct sequence.
*   **Responsibilities**: Authentication, Validation, Authorization, Transaction scopes, Tenant scoping.

### 🔧 **Layer 3: EXECUTION** (`execution/`)
*   **Goal**: Deterministic I/O structure (Mechanics).
*   **Function**: Database queries, Third-party API Clients (Stripe, Mailer), Queues.
*   **Rule**: reliable, testable, retry-safe, and **free of business decisions**.

---

## 🧼 3. Clean Code Guidelines

*   **Name for Intent**: Descriptive names revealing purpose, not process (e.g., `calculate_invoice_total`, not `sumData`).
*   **Small Functions**: 5–20 lines of single responsibility work. One function = one job.
*   **Dry Abstraction**: Aggressively remove duplication. If two places change together, they must live together.
*   **Type Safety**: Model illegal states as impossible. Use Enums instead of string-status comparisons.
*   **Explicit Error Handling**: Never swallow errors; errors must preserve context and describe cause.
*   **Refactor Relentlessly**: Every modification must leave the code better than you found it.

---

## 🔒 4. Security as a Habit

We apply security analysis on every implementation step without exceptions.

*   **Multi-Tenancy Isolation FIRST**: All domain data includes `tenant_id`. Boundary isolation is enforced strictly at Repository (Layer 3) level. No cross-tenant mixing on queries.
*   **Secret Hygiene**: API tokens, keys, and DB credentials live in `.env` only (never committed).
*   **Static Vulnerability Vigilance**: Autoguards against SQLi, XSS, and command injection.
*   **Input Validation**: Strict sanitization of incoming client payload.

---

## 🔄 5. Extreme Programming (XP) Workflow

1.  **Small Releases**: Do not over-engineer or build everything at once. Small, fully functional steps.
2.  **Test-Driven Development (TDD)**: No new features or refactoring without automated tests backing them.
3.  **Continuous Refactoring**: Code grows cleaner as features expand, not more complex.
4.  **The Human is the Brake**: Pilot presents architecture paths; Navigator approves.

---

## 🔑 6. Environment Variables
*   `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Public Key
*   `SUPABASE_SERVICE_ROLE_KEY`: Supabase Admin Key (Never expose to client)
*   `STRIPE_SECRET_KEY`: Chave secreta do Stripe para a API de Checkout (Assinatura Premium)
*   `STRIPE_PRICE_ID`: O ID do Produto R$ 12,90 no painel do Stripe (`price_xxxxx`)

---

## 📌 7. Últimas Funcionalidades Entregues (Milestones)

*   **💬 Sistema de Comentários Premium**:
    *   Disponível para Orações Originais e Correntes de Oração.
    *   Gated no Servidor (`comments_repository.ts` + verificação `is_premium`).
    *   Visualização Instantânea (Optimistic Update) no client.
    *   Separação de Leituras no server-side para evitar conflitos de `JOIN` com a tabela `auth.users`.
    *   Regras de Deleção: O autor do comentário **OU** o criador do card/corrente podem excluir mensagens.

*   **🎯 Atalhos de Temas Customizáveis**:
    *   Campo `selected_themes TEXT[]` adicionado à tabela `profiles`.
    *   Fluxo de edição no Perfil que atualiza e limita até 4 categorias no Dashboard.
    *   Leitura dinâmica com Link-Wrap no Dashboard filtrando por URL Search Params (`?theme=`).

---

*Last Updated: 2026-03-24*
