# 🗄️ Directive: Database Schema
## Version: 1.0

This Directive defines the required database tables and access control rules for **Pray for Day** in order to store and query prayers dynamically.

---

## 📋 1. Tables Concept

### A. `prayers` (Orações)
Stores the daily prayers, categories, and media references.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary Key (Default: `uuid_generate_v4()`). |
| `title` | `TEXT` | Title layout like "Confie no Senhor". |
| `content` | `TEXT` | Full paragraph body prayer text. |
| `category` | `TEXT` | Category label: `Ansiedade`, `Família`, `Prosperidade`, `Provação`. |
| `audio_url` | `TEXT` | Optional location reference to bucket audio node. |
| `is_premium` | `BOOLEAN`| If true, requires subscript verification. |
| `created_at` | `TIMESTAMPTZ`| Static capture of insertion. |

---

## 🔒 2. Row Level Security (RLS)

To be compliant with **Multi-Tenant Boundaries**:
1.  **Read Access**: All Authenticated users can READ `prayers`. 
2.  **Write Access**: Locked. Standard app users DO NOT create prayers; prayers are pre-seeded or managed by system admins.

---

*Last Updated: 2026-03-21*
