# PolicyVault - Enterprise Insurance CRM

PolicyVault is a premium, high-performance CRM designed for insurance brokerages to manage customers, policies, claims, and documents with enterprise-grade security and a modern user experience.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Validation**: Zod + React Hook Form
- **State Management**: React Hooks + Supabase Realtime

## Project Structure
- `src/app/(dashboard)`: Main application interface.
  - `(backbone)`: Core infrastructure management (Global Customers, All Policies, Reports).
  - `motor`: Motor insurance vertical.
  - `health`: Health insurance vertical.
  - `others`: Commercial and other insurance types.
- `src/app/(portal)`: Customer-facing interface.
- `src/components/layout`: Sidebar, Navbar, Search, and Workspace switchers.
- `src/lib/supabase`: Client and server-side Supabase configurations.
- `src/lib/validations`: Zod schemas for data integrity.

## Core Entities
- **Customers**: Central profile management with PII protection.
- **Policies**: Segregated into Motor, Health, and Others with specific schemas.
- **Claims**: Centralized claim registry and tracking.
- **Documents**: Integrated Document Vault with B2/S3 storage backend.
- **Audit Logs**: Comprehensive tracking of all database modifications.

## Development Patterns & Guidelines

### 1. Database Access & RLS
- All tables have **Row Level Security (RLS)** enabled.
- Access is governed by `user_roles` (admin, staff, customer).
- Use `get_my_role()` SQL function to check the current user's role in RLS policies.
- Avoid direct joins with `auth.users` in client-side queries due to permission restrictions; use UUIDs and fetch user data via secure patterns.

### 2. PII Protection (Personally Identifiable Information)
- Sensitive fields like `aadhaar_number` and `pan_number` are stored in the `customers` table.
- Use the `reveal_customer_pii` RPC function to fetch unmasked values. This function enforces role checks and logs access in `audit_logs`.

### 3. Form Submission
- When inserting data into Postgres (especially for optional dates or UUIDs), ensure empty strings (`""`) are converted to `null` to avoid type errors.
- Always perform duplicate detection (e.g., checking for existing phone numbers) before creating new customers.

### 4. Realtime Synchronization
- Use Supabase Realtime channels for pages requiring live updates (e.g., Customer list, Policy pipeline).
- Convention: `supabase.channel('[page-name]-sync').on('postgres_changes', ...).subscribe()`.

## AI Interaction Rules
- **Respect Aesthetics**: The project uses a premium, dark-themed or slate-based UI. Use smooth transitions and consistent spacing (2xl/3xl rounded corners).
- **Security First**: Never bypass RLS or expose raw PII without using the provided audit-logged mechanisms.
- **Clean Code**: Follow the established pattern of using Lucide icons and Tailwind v4 utility classes.
