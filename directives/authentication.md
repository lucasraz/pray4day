# 🔐 Directive: Authentication & Multi-Tenancy
## Version: 1.0

This Directive defines the behavior and boundary rules for signing in, signing up, and isolating tenant data in **Pray for Day**.

---

## 🛡️ 1. Core Principles
1.  **Strict Isolation**: Every single query of domain data MUST filter by `tenant_id`. Users only see data belonging to their workspace/organization.
2.  **Explicit Verification**: Frontend views NEVER display data without Server-side verification of session token integrity.

---

## 🚶‍♂️ 2. User Flows

### A. SIGN UP (Cadastro)
*   **Trigger**: User submits Email + Password, or uses OAuth (Google).
*   **Rules**:
    1.  Create User in Auth provider (Supabase Auth).
    2.  An active workspace (`tenant_id`) must be created synchronously or linked immediately.
    3.  User is assigned an `owner` role inside that `tenant_id`.

### B. SIGN IN (Login)
*   **Trigger**: User provides credentials.
*   **Rules**:
    1.  Verify Auth credentials with Supabase.
    2.  Check in database if the user has an active relation to a `tenant_id`.
    3.  Set Secure HttpOnly Session cookie containing the payload.

### C. SESSION REFRESH
*   **Scope**: Automated on request.
*   **Rules**: Middleware validates token expiry and refreshes token from Auth Server keeping the user online.

---

## 🚦 3. Protected Routes Boundary

| Route Path | Permission | Description |
| :--- | :--- | :--- |
| `/` | `Public` | Landing page / marketing payload. |
| `/login` | `Public` | Redirects to `/dashboard` if user ALREADY has a valid session. |
| `/signup` | `Public` | Same as above. |
| `/dashboard` | `Protected` | User must be logged in & belong to active tenant. |
| `/settings` | `Protected & Admin` | Accessible only for tenant Owners. |

---

## 📦 4. Input & Output Contracts (Orchestration Layer)

*   **Inputs**:
    *   `email`: string (valid format)
    *   `password`: string (minimum 8 characters)
*   **Outputs (Success)**:
    *   `session_token` (HTTP Only Cookie)
    *   `redirect_url`

*   **Inputs (Database Layer)**:
    *   `tenant_id`: UUID
    *   All row-level queries MUST include `AND tenant_id = current_tenant_id()`

---

*Last Updated: 2026-03-21*
