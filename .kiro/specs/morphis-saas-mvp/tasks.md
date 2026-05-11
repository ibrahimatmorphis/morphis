# Implementation Plan: Morphis SaaS MVP

## Overview

This plan implements the Morphis B2B SaaS MVP as a Next.js 14+ App Router application with TypeScript, Tailwind CSS, Shadcn UI, Supabase (auth + DB + RLS), and Stripe billing. Tasks are ordered to build foundational layers first (config, types, schema), then auth and middleware, followed by UI pages, and finally integration/wiring.

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Initialize Next.js 14+ project with TypeScript, Tailwind CSS, and Shadcn UI
    - Create the Next.js project with App Router enabled
    - Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `@stripe/stripe-js`
    - Initialize Shadcn UI with the default configuration
    - Configure `tsconfig.json` with `@/` path alias mapped to `src/`
    - Create `.env.example` with placeholder values for: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Configure Tailwind theme with custom palette and Baloo 2 font
    - Extend `tailwind.config.ts` with colors: primary '#49D49D', secondary '#69EBD0', accent '#95F9E3', darkGreen '#558564', darkCharcoal '#564946'
    - Configure dark mode as default
    - Import 'Baloo 2' via `next/font/google` in the root layout
    - Apply the font globally via the root `layout.tsx`
    - _Requirements: 2.2, 2.3, 5.3, 13.3_

  - [x] 1.3 Create environment validation module (`src/lib/env.ts`)
    - Implement `validateEnv()` function that checks all 6 required env vars
    - Treat empty string values as missing
    - Throw an error with the specific missing variable name
    - Log error to console identifying the missing variable
    - Prevent application from starting if validation fails
    - _Requirements: 1.3, 1.4_

  - [x] 1.4 Create TypeScript type definitions (`src/types/database.ts` and `src/types/index.ts`)
    - Define `Role`, `SubscriptionStatus`, `TicketStatus` union types
    - Define `User`, `Tenant`, `TenantUser`, `ApiKey`, `UsageStats`, `TeamMember` interfaces
    - Export all types from `src/types/index.ts`
    - _Requirements: 10.1, 13.1_

- [x] 2. Database schema and Supabase setup
  - [x] 2.1 Create database schema file (`schema.sql`)
    - Define `users` table: id UUID PK, email TEXT UNIQUE NOT NULL, role TEXT NOT NULL DEFAULT 'tenant_member'
    - Define `tenants` table: id UUID PK, name TEXT NOT NULL, stripe_customer_id TEXT, subscription_status TEXT DEFAULT 'inactive', usage_limit INTEGER DEFAULT 1000
    - Define `tenant_users` table: user_id UUID FK, tenant_id UUID FK, role TEXT NOT NULL DEFAULT 'tenant_member', joined_at TIMESTAMPTZ DEFAULT now(), PRIMARY KEY (user_id, tenant_id)
    - Define `api_keys` table: id UUID PK, tenant_id UUID FK NOT NULL, key_hash TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now()
    - Enable RLS on all tables with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
    - Create RLS policies: tenant_member_access on tenants, own_tenant_access on tenant_users, tenant_key_access on api_keys, superadmin_full_access on all tables
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_

  - [x] 2.2 Create Supabase client modules
    - Create `src/lib/supabase/client.ts` — browser client using anon key
    - Create `src/lib/supabase/server.ts` — server client using anon key + cookies
    - Create `src/lib/supabase/admin.ts` — admin client using service role key (server-side only)
    - _Requirements: 10.5, 13.1_

- [x] 3. Checkpoint - Verify foundation
  - Ensure all configuration, types, schema, and Supabase clients compile without errors. Ask the user if questions arise.

- [x] 4. Authentication module
  - [x] 4.1 Create auth server actions (`src/actions/auth.ts`)
    - Implement `register(email, password)`: validate password (8+ chars, uppercase, lowercase, digit), create user via Supabase Auth, assign default role 'tenant_member'
    - Implement `login(email, password)`: authenticate via Supabase Auth, establish 1-hour session
    - Implement `resetPassword(email)`: send password reset email via Supabase, return same response regardless of email existence
    - Implement `logout()`: destroy session
    - Handle all error cases with generic messages (no email/password leak)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8_

  - [x] 4.2 Create auth pages (`src/app/auth/login`, `register`, `reset-password`)
    - Build login page with email/password form, error display via Toast, link to register and reset
    - Build register page with email/password form, password validation feedback, link to login
    - Build reset-password page with email form, generic success message
    - All forms use client components with `"use client"` directive
    - Style with custom palette and Baloo 2 font
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.7, 3.8_

  - [x] 4.3 Create auth callback route (`src/app/auth/callback/route.ts`)
    - Handle Supabase auth callback (email confirmation, password reset)
    - Exchange code for session
    - Redirect to dashboard on success, login on failure
    - _Requirements: 3.2, 3.3_

- [x] 5. Middleware — Auth and RBAC (`src/middleware.ts`)
  - [x] 5.1 Implement Next.js middleware for authentication and role-based access control
    - Define public routes (landing pages, auth pages)
    - Define admin routes (`/admin/*`) requiring 'superadmin' role
    - Define protected routes (`/dashboard/*`) requiring any authenticated user
    - Validate Supabase session from cookies on every protected request
    - Redirect unauthenticated users to `/auth/login`
    - Redirect non-superadmin users from `/admin` to `/dashboard`
    - Redirect users with undetermined role to `/auth/login`
    - Refresh session token if close to expiry
    - Configure middleware matcher for relevant paths
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 6. Checkpoint - Verify auth flow
  - Ensure auth actions, pages, callback, and middleware compile without errors. Ask the user if questions arise.

- [x] 7. Shared components and layout
  - [x] 7.1 Create shared UI components (`src/components/shared/`)
    - Build `Navbar` component with links: Home, Who We Are, Contact, Pricing, Login/Dashboard
    - Build `Footer` component with basic site info
    - Build `ToastProvider` wrapping Shadcn UI Toaster, styled with custom palette
    - Configure toast auto-dismiss at 5 seconds, minimum display of 4 seconds for success
    - _Requirements: 2.1, 12.1, 12.4, 12.5_

  - [x] 7.2 Create root layout (`src/app/layout.tsx`)
    - Import and apply Baloo 2 font globally
    - Include ToastProvider
    - Include metadata (title, description)
    - Call `validateEnv()` for server-side validation
    - _Requirements: 2.3, 13.3, 1.3_

- [x] 8. Public landing pages
  - [x] 8.1 Create Home page (`src/app/page.tsx`)
    - Build HeroSection with value proposition: "Secure, instant AI UI injection without CI/CD redeploys via Vanilla JS SDK"
    - Build FeaturesSection highlighting key product features
    - Build CTASection with call-to-action button
    - Apply dark-mode styling with custom palette
    - Ensure responsive layout (320px–1920px)
    - _Requirements: 2.1, 2.4, 2.7_

  - [x] 8.2 Create Who We Are page (`src/app/who-we-are/page.tsx`)
    - Build team/company information section
    - Apply dark-mode styling with custom palette
    - Ensure responsive layout (320px–1920px)
    - _Requirements: 2.1, 2.7_

  - [x] 8.3 Create Contact page (`src/app/contact/page.tsx`)
    - Build contact form with name, email, message fields
    - Apply dark-mode styling with custom palette
    - Ensure responsive layout (320px–1920px)
    - _Requirements: 2.1, 2.7_

  - [x] 8.4 Create Pricing page (`src/app/pricing/page.tsx`)
    - Build at least 2 pricing tier cards with plan name, monthly price, and feature list
    - Build feature comparison table showing which features are included per tier
    - Apply dark-mode styling with custom palette
    - Ensure responsive layout (320px–1920px)
    - _Requirements: 2.1, 2.5, 2.6, 2.7_

- [x] 9. Checkpoint - Verify landing pages
  - Ensure all landing pages and shared components compile and render correctly. Ask the user if questions arise.

- [x] 10. Tenant Dashboard layout and navigation
  - [x] 10.1 Create dashboard layout (`src/app/dashboard/layout.tsx`)
    - Build Sidebar component with nav links: Usage Stats, API Keys, Team, Billing
    - Build Header component displaying tenant name and user email
    - Implement active link indicator
    - Include LogoutButton in sidebar
    - Apply custom palette and Baloo 2 font
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 10.2 Implement responsive sidebar behavior
    - Persistent sidebar panel at viewport ≥ 768px
    - Collapsible overlay menu with toggle button at viewport < 768px
    - No horizontal scrolling on any viewport (320px–1920px)
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 11. Usage Stats page (`src/app/dashboard/page.tsx`)
  - [x] 11.1 Create usage stats server action (`src/actions/usage.ts`)
    - Implement `getUsageStats()`: query total API calls, current period calls (based on Stripe billing cycle), remaining quota
    - Handle query failures with error return
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 13.1_

  - [x] 11.2 Create Usage Stats page component
    - Display loading indicator while fetching data
    - Render StatCards: Total API Calls, Current Period Calls, Remaining Quota
    - Display zero values with "no API calls made yet" message when no data exists
    - Show error notification via Toast on failure with retry button
    - Render within 3 seconds of navigation
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 12. API Key Management page (`src/app/dashboard/api-keys/page.tsx`)
  - [x] 12.1 Create API key server actions (`src/actions/api-keys.ts`)
    - Implement `generateApiKey()`: generate 32+ char key, hash it, store in api_keys table, return plaintext
    - Implement `deleteApiKey(keyId)`: remove key record from api_keys table
    - Implement `listApiKeys()`: fetch all keys for current tenant
    - Enforce 10-key maximum limit
    - Enforce tenant_owner role for generate and delete operations
    - Handle all error cases (generation failure, deletion failure)
    - _Requirements: 7.1, 7.3, 7.5, 7.6, 7.7, 4.6, 13.1_

  - [x] 12.2 Create API Keys page component
    - Display key list with masked values (first 8 + last 4 chars) and creation date
    - Implement Generate Key button (disabled at 10-key limit with message)
    - Display newly generated plaintext key in dismissible read-only field
    - Implement Copy button with clipboard API and success toast
    - Implement Delete button with confirmation dialog
    - Show success/error toasts for all operations
    - Deny actions for tenant_member role with insufficient permissions toast
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 4.6_

- [x] 13. Team Management page (`src/app/dashboard/team/page.tsx`)
  - [x] 13.1 Create team server actions (`src/actions/team.ts`)
    - Implement `inviteTeamMember(email)`: validate email format, check existing membership, create tenant_users record, send invitation via Supabase
    - Implement `updateMemberRole(userId, role)`: validate role value, prevent removing last owner, update role
    - Implement `removeMember(userId)`: remove tenant_users mapping
    - Implement `listTeamMembers()`: fetch all members with email, role, joined_at
    - Enforce tenant_owner role for invite, role change, and remove operations
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6, 8.7, 4.6, 13.1_

  - [x] 13.2 Create Team page component
    - Build invite form with email input and submit button
    - Display team member list with email, role, join date
    - Implement role change dropdown (tenant_owner / tenant_member)
    - Implement remove button with confirmation dialog
    - Show appropriate toasts: success on invite/role-change/remove, error on invalid email, info on existing member, error on last-owner prevention
    - Deny actions for tenant_member role with insufficient permissions toast
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 4.6_

- [x] 14. Billing page and Stripe integration
  - [x] 14.1 Create Stripe client and portal modules (`src/lib/stripe/`)
    - Create `src/lib/stripe/client.ts`: initialize Stripe SDK with STRIPE_SECRET_KEY
    - Create `src/lib/stripe/portal.ts`: implement `createPortalSession(customerId, returnUrl)` function
    - _Requirements: 9.1, 13.2_

  - [x] 14.2 Create billing server action (`src/actions/billing.ts`)
    - Implement `createPortalSession()`: fetch tenant's stripe_customer_id, create Stripe portal session, return URL
    - Handle errors (missing customer ID, Stripe API failure)
    - _Requirements: 9.1, 9.8, 13.2_

  - [x] 14.3 Create Billing page component (`src/app/dashboard/billing/page.tsx`)
    - Display current plan card with subscription status and plan name
    - Implement "Manage Billing" button that redirects to Stripe Customer Portal
    - Show error toast if portal redirect fails, retain user on billing page
    - Redirect within 5 seconds
    - _Requirements: 9.1, 9.8_

  - [x] 14.4 Create Stripe webhook handler (`src/app/api/webhooks/stripe/route.ts`)
    - Implement POST handler that reads raw request body
    - Verify webhook signature using STRIPE_WEBHOOK_SECRET
    - Return 400 on signature verification failure with logged error
    - Handle `customer.subscription.updated`: update tenant subscription_status to 'active', 'past_due', 'trialing', or 'unpaid'
    - Handle `customer.subscription.deleted`: set subscription_status to 'canceled'
    - Store stripe_customer_id on tenant record when subscription is first created
    - Log and return 200 for unmatched stripe_customer_id events
    - Return 200 within 10 seconds on success
    - Use admin Supabase client (service role key) for DB operations
    - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.9, 10.5_

- [x] 15. Checkpoint - Verify tenant dashboard
  - Ensure all dashboard pages, server actions, and Stripe integration compile without errors. Ask the user if questions arise.

- [x] 16. Superadmin Dashboard
  - [x] 16.1 Create admin server actions (`src/actions/tenants.ts`)
    - Implement `listTenants(page)`: paginated query (50/page) returning tenant name, subscription_status, stripe_customer_id
    - Implement `updateTenantUsageLimit(tenantId, limit)`: validate positive integer, update tenant record
    - Implement `listUsers(page)`: paginated query (50/page) returning email, role, associated tenant name
    - Implement `listTickets()`: fetch support tickets with subject, tenant name, date, status
    - Implement `updateTicketStatus(ticketId, status)`: update ticket status to open/in_progress/closed
    - Use admin Supabase client for all queries (superadmin bypasses RLS)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 13.1_

  - [x] 16.2 Create admin layout (`src/app/admin/layout.tsx`)
    - Build AdminSidebar with nav links: Tenants, Users, Support
    - Build AdminHeader with admin badge
    - Apply custom palette and Baloo 2 font
    - _Requirements: 11.1, 5.3_

  - [x] 16.3 Create Tenants page (`src/app/admin/page.tsx`)
    - Display metrics bar: total active subscriptions count, MRR
    - Display paginated tenant table (50/page) with name, status, stripe_customer_id
    - Implement inline usage_limit editing with validation (positive integer)
    - Show success/error toasts for limit updates
    - Implement pagination controls
    - _Requirements: 11.1, 11.3, 11.4, 11.5_

  - [x] 16.4 Create Users page (`src/app/admin/users/page.tsx`)
    - Display paginated user table (50/page) with email, role, tenant name
    - Implement pagination controls
    - _Requirements: 11.2_

  - [x] 16.5 Create Support page (`src/app/admin/support/page.tsx`)
    - Display ticket list with subject, tenant name, creation date, status
    - Implement status update dropdown (open, in_progress, closed)
    - Show success/error toasts for status updates
    - _Requirements: 11.6_

- [x] 17. Error handling and network resilience
  - [x] 17.1 Implement global error handling and retry logic
    - Configure Toast_System to display action-specific success messages (e.g., "API key created", "Team member invited")
    - Configure error toasts to describe user-facing failure without exposing internals
    - Implement 10-second network timeout with retry button (max 3 retries)
    - Ensure all server actions handle both success and failure paths
    - Verify no placeholder functions, TODO comments, or stub implementations exist
    - _Requirements: 12.1, 12.2, 12.3, 13.4, 13.5_

- [x] 18. Final checkpoint - Full integration verification
  - Ensure all pages, actions, middleware, webhook handler, and components compile without TypeScript errors. Verify no TODO comments or placeholder implementations remain. Ask the user if questions arise.

## Notes

- All tasks use TypeScript as specified in the design document
- No property-based tests are included as the design has no Correctness Properties section
- Tasks are ordered to build foundational layers first, enabling incremental compilation checks
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key integration points
- Server components are used by default; `"use client"` only where interactivity is needed
- The admin Supabase client (service role key) is used exclusively in server-side API routes and admin actions

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.4"] },
    { "id": 1, "tasks": ["1.2", "1.3", "2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["4.1", "5.1", "7.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "7.2"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 6, "tasks": ["10.1", "10.2"] },
    { "id": 7, "tasks": ["11.1", "12.1", "13.1", "14.1"] },
    { "id": 8, "tasks": ["11.2", "12.2", "13.2", "14.2"] },
    { "id": 9, "tasks": ["14.3", "14.4", "16.1"] },
    { "id": 10, "tasks": ["16.2", "16.3", "16.4", "16.5"] },
    { "id": 11, "tasks": ["17.1"] }
  ]
}
```
