# Requirements Document

## Introduction

Morphis is a B2B SaaS MVP providing AI-first hot-deploy UI infrastructure. It enables secure, instant AI UI injection without CI/CD redeploys via a Vanilla JS SDK. This document defines the requirements for the full-stack web application including the public marketing website, authentication system, tenant dashboard, superadmin dashboard, database schema, and Stripe billing integration.

The application is built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, Supabase (PostgreSQL, Auth, RLS), and Stripe for payments.

## Glossary

- **Morphis_App**: The Next.js 14+ web application serving the public website, authentication flows, tenant dashboard, and superadmin dashboard
- **Auth_Module**: The Supabase-based authentication system handling login, registration, password reset, and role-based access control
- **Tenant_Dashboard**: The protected client-facing dashboard at /dashboard for managing API keys, team members, billing, and usage statistics
- **Superadmin_Dashboard**: The protected admin-facing dashboard at /admin for managing all tenants, users, subscriptions, and support
- **API_Key_Manager**: The subsystem responsible for generating, storing, copying, and deleting Morphis SDK API keys
- **Billing_Module**: The Stripe-integrated subsystem handling subscriptions, customer portal access, and webhook processing
- **RLS_Policy_Engine**: The Supabase Row Level Security system enforcing data isolation between tenants
- **Webhook_Handler**: The Next.js API route at /api/webhooks/stripe/route.ts processing Stripe webhook events
- **Toast_System**: The Shadcn UI toast notification system for displaying success, error, and informational messages
- **Tenant**: A company or organization using Morphis, identified by a unique tenant record in the database
- **Tenant_Owner**: A user with the 'tenant_owner' role who can manage all aspects of their tenant
- **Tenant_Member**: A user with the 'tenant_member' role who has limited access within their tenant
- **Superadmin**: A user with the 'superadmin' role who has full access to the admin dashboard and all system data
- **Landing_Page**: The public-facing marketing website including Home, Who We Are, Contact Us, and Pricing pages
- **SDK_Key**: A hashed API key stored in the api_keys table, used by external applications to authenticate with the Morphis SDK

## Requirements

### Requirement 1: Environment Configuration

**User Story:** As a developer, I want a well-defined environment configuration, so that I can set up the application with all required service credentials.

#### Acceptance Criteria

1. THE Morphis_App SHALL provide a `.env.example` file containing the variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, each with a placeholder value indicating the expected format (URL for URL variables, key string for key variables)
2. THE Morphis_App SHALL configure absolute imports in the TypeScript configuration using the `@/` path alias mapped to the project source root directory
3. IF a required environment variable is missing at startup, THEN THE Morphis_App SHALL log an error message to the console identifying the missing variable by name and SHALL prevent the application from starting
4. IF a required environment variable is present but contains an empty string value, THEN THE Morphis_App SHALL treat it as missing and apply the same validation failure behavior as criterion 3

### Requirement 2: Public Landing Page

**User Story:** As a visitor, I want to browse a professional marketing website, so that I can understand the Morphis product value proposition and pricing.

#### Acceptance Criteria

1. THE Landing_Page SHALL render four pages at distinct routes: Home, Who We Are, Contact Us, and Pricing, each accessible via a persistent navigation bar visible on all four pages
2. THE Landing_Page SHALL apply dark-mode styling by default using the custom color palette (primary '#49D49D', secondary '#69EBD0', accent '#95F9E3', darkGreen '#558564', darkCharcoal '#564946')
3. THE Landing_Page SHALL use the 'Baloo 2' font imported via next/font/google as the global typeface
4. THE Landing_Page SHALL display the product value proposition text "Secure, instant AI UI injection without CI/CD redeploys via Vanilla JS SDK" on the Home page in a visible hero section
5. THE Landing_Page SHALL display at least 2 subscription pricing tiers on the Pricing page, where each tier includes a plan name, a monthly price amount, and a list of included features
6. WHEN a visitor views the Pricing page, THE Landing_Page SHALL present a comparison layout that indicates, for each feature, which tiers include it and which do not
7. THE Landing_Page SHALL be responsive and functional on viewport widths from 320px to 1920px

### Requirement 3: User Authentication

**User Story:** As a user, I want to register, log in, and reset my password securely, so that I can access my account and protected features.

#### Acceptance Criteria

1. WHEN a user submits registration credentials with a valid email format and a password of at least 8 characters containing at least one uppercase letter, one lowercase letter, and one digit, THE Auth_Module SHALL create a new user account in Supabase and assign the default role 'tenant_member'
2. WHEN a user submits valid login credentials, THE Auth_Module SHALL authenticate the user and establish a session with a duration of 1 hour, automatically refreshing while the user remains active
3. WHEN a user requests a password reset, THE Auth_Module SHALL send a password reset email containing a single-use link valid for 60 minutes to the registered email address
4. IF a user submits invalid login credentials, THEN THE Auth_Module SHALL display an error message via the Toast_System without revealing whether the email or password was incorrect
5. IF a user submits a registration request with an already-registered email, THEN THE Auth_Module SHALL display a generic error message via the Toast_System without confirming the email exists
6. WHEN a user session expires, THE Auth_Module SHALL redirect the user to the login page and display an informational message via the Toast_System indicating the session has ended
7. IF a user requests a password reset for an email address that is not registered, THEN THE Auth_Module SHALL display the same confirmation message as for a valid request without revealing whether the email exists in the system
8. IF a user submits registration credentials with a password shorter than 8 characters or missing required character types, THEN THE Auth_Module SHALL display a validation error via the Toast_System indicating the specific password requirements not met

### Requirement 4: Role-Based Access Control

**User Story:** As a system administrator, I want role-based access control enforced across the application, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. THE Auth_Module SHALL store and validate three roles: 'superadmin', 'tenant_owner', and 'tenant_member', persisted in the users table role column
2. WHEN an authenticated user with the 'superadmin' role navigates to /admin, THE Morphis_App SHALL grant access to the Superadmin_Dashboard
3. WHEN an authenticated user without the 'superadmin' role navigates to /admin, THE Morphis_App SHALL redirect the user to the Tenant_Dashboard
4. WHEN an unauthenticated user navigates to /dashboard or /admin, THE Morphis_App SHALL redirect the user to the login page
5. THE Morphis_App SHALL enforce role checks via Next.js middleware on all routes under the /dashboard and /admin path prefixes
6. WHEN an authenticated user with the 'tenant_member' role attempts to access a tenant_owner-only feature (API key generation, API key deletion, team invitation, role changes, or billing management), THE Morphis_App SHALL deny the action and display an error notification via the Toast_System indicating insufficient permissions
7. IF a user's role cannot be determined from the session, THEN THE Morphis_App SHALL treat the request as unauthenticated and redirect the user to the login page

### Requirement 5: Tenant Dashboard Layout

**User Story:** As a tenant user, I want a well-organized dashboard interface, so that I can efficiently navigate and manage my account.

#### Acceptance Criteria

1. THE Tenant_Dashboard SHALL render a sidebar navigation component containing all navigation links and a top header component displaying the current tenant name and authenticated user's email
2. THE Tenant_Dashboard SHALL display navigation links for: Usage Stats, API Keys, Team, and Billing sections, and SHALL visually indicate the currently active section
3. THE Tenant_Dashboard SHALL apply the custom color palette (primary '#49D49D', secondary '#69EBD0', accent '#95F9E3', darkGreen '#558564', darkCharcoal '#564946') and 'Baloo 2' font as defined in the shared Tailwind theme configuration used by the Landing_Page
4. WHILE the viewport width is 768px or greater, THE Tenant_Dashboard SHALL display the sidebar as a persistent visible panel alongside the main content area
5. WHILE the viewport width is less than 768px, THE Tenant_Dashboard SHALL collapse the sidebar into a toggleable overlay menu accessible via a menu button in the header, and SHALL display all content without horizontal scrolling
6. THE Tenant_Dashboard SHALL render all navigation links, interactive controls, and content as accessible and operable without horizontal scrolling on viewport widths from 320px to 1920px

### Requirement 6: API Usage Statistics

**User Story:** As a tenant owner, I want to view my API usage statistics, so that I can monitor consumption and plan capacity.

#### Acceptance Criteria

1. WHEN a tenant user navigates to the Usage Stats section, THE Tenant_Dashboard SHALL display a loading indicator while fetching API usage data from Supabase, and SHALL render the usage statistics within 3 seconds of navigation
2. THE Tenant_Dashboard SHALL display usage statistics including: total API calls (lifetime count), API calls made in the current billing period (determined by the tenant's Stripe subscription cycle start and end dates), and remaining quota (tenant's plan quota limit minus calls in the current billing period)
3. IF the Supabase query for usage data fails, THEN THE Tenant_Dashboard SHALL display an error notification via the Toast_System indicating that usage data could not be loaded, and SHALL provide a retry option
4. IF the tenant has no recorded API usage data, THEN THE Tenant_Dashboard SHALL display all usage metrics as zero and indicate that no API calls have been made yet

### Requirement 7: API Key Management

**User Story:** As a tenant owner, I want to generate, view, copy, and delete API keys, so that I can manage SDK access for my applications.

#### Acceptance Criteria

1. WHEN a tenant owner clicks the generate key button, THE API_Key_Manager SHALL create a new API key of at least 32 characters, store the hashed value in the api_keys table with the tenant_id, and display the plaintext key in a read-only field that is only shown until the user dismisses it or navigates away
2. WHEN a tenant user clicks the copy button for an API key, THE API_Key_Manager SHALL copy the masked key identifier displayed in the key list to the clipboard and display a success confirmation via the Toast_System
3. WHEN a tenant owner clicks the delete button for an API key, THE API_Key_Manager SHALL present a confirmation dialog, and upon user confirmation, remove the key record from the api_keys table and display a success notification via the Toast_System
4. THE API_Key_Manager SHALL display all non-deleted API keys for the current tenant in a list showing a masked key value (first 8 and last 4 characters visible) and the creation date for each key
5. IF the API key generation fails, THEN THE API_Key_Manager SHALL display an error notification via the Toast_System and not store any partial record in the api_keys table
6. IF a tenant owner has reached the maximum of 10 API keys, THEN THE API_Key_Manager SHALL disable the generate key button and display a message indicating the key limit has been reached
7. IF the API key deletion fails, THEN THE API_Key_Manager SHALL display an error notification via the Toast_System and retain the key record unchanged in the api_keys table

### Requirement 8: Team Management

**User Story:** As a tenant owner, I want to invite users to my organization, so that team members can collaborate within the tenant.

#### Acceptance Criteria

1. WHEN a tenant owner submits a valid email address in the invitation form, THE Tenant_Dashboard SHALL create a tenant_users mapping record with the default role 'tenant_member' and send an invitation email via Supabase
2. THE Tenant_Dashboard SHALL display all current team members with their assigned role, join date, and email address
3. WHEN a tenant owner changes a team member's role, THE Tenant_Dashboard SHALL update the user's role in the database to one of the permitted values: 'tenant_owner' or 'tenant_member'
4. IF the invitation email address is already a member of the tenant, THEN THE Tenant_Dashboard SHALL display an informational message via the Toast_System indicating the user is already a member
5. IF the invitation email address does not conform to a valid email format, THEN THE Tenant_Dashboard SHALL display an error message via the Toast_System indicating the email is invalid and SHALL NOT create a tenant_users record
6. IF a tenant owner attempts to change the role of the only remaining tenant_owner in the tenant, THEN THE Tenant_Dashboard SHALL prevent the change and display an error message via the Toast_System indicating at least one owner is required
7. WHEN a tenant owner clicks the remove button for a team member, THE Tenant_Dashboard SHALL remove the tenant_users mapping record after user confirmation and display a success notification via the Toast_System

### Requirement 9: Stripe Billing Integration

**User Story:** As a tenant owner, I want to manage my subscription through Stripe, so that I can upgrade, downgrade, or cancel my plan.

#### Acceptance Criteria

1. WHEN a tenant owner clicks the manage billing button, THE Billing_Module SHALL redirect the user to the Stripe Customer Portal within 5 seconds
2. WHEN a tenant's initial subscription is created in Stripe, THE Billing_Module SHALL store the stripe_customer_id on the tenants table record
3. WHEN the Webhook_Handler receives a 'customer.subscription.updated' event, THE Billing_Module SHALL update the tenant's subscription_status in the database to one of the following values matching the Stripe subscription state: 'active', 'past_due', 'trialing', or 'unpaid'
4. WHEN the Webhook_Handler receives a 'customer.subscription.deleted' event, THE Billing_Module SHALL set the tenant's subscription_status to 'canceled' in the database
5. THE Webhook_Handler SHALL verify the Stripe webhook signature using STRIPE_WEBHOOK_SECRET before processing events
6. IF the webhook signature verification fails, THEN THE Webhook_Handler SHALL return a 400 status code and log the verification failure
7. WHEN the Webhook_Handler successfully processes a valid webhook event, THE Webhook_Handler SHALL return a 200 status code within 10 seconds of receiving the request
8. IF the Stripe Customer Portal redirect fails, THEN THE Billing_Module SHALL display an error notification via the Toast_System and retain the user on the current billing page
9. IF the Webhook_Handler receives an event referencing a stripe_customer_id that does not match any tenant record, THEN THE Webhook_Handler SHALL log the unmatched event and return a 200 status code without modifying any tenant data

### Requirement 10: Database Schema

**User Story:** As a developer, I want a well-structured database schema, so that the application data is organized, secure, and performant.

#### Acceptance Criteria

1. THE Morphis_App SHALL provide a schema.sql file defining the following tables: users (id UUID primary key, email TEXT unique not null, role TEXT not null default 'tenant_member'), tenants (id UUID primary key, name TEXT not null, stripe_customer_id TEXT, subscription_status TEXT default 'inactive', usage_limit INTEGER default 1000), tenant_users (user_id UUID references users, tenant_id UUID references tenants, role TEXT not null default 'tenant_member', joined_at TIMESTAMPTZ default now(), primary key (user_id, tenant_id)), and api_keys (id UUID primary key, tenant_id UUID references tenants not null, key_hash TEXT not null, created_at TIMESTAMPTZ default now())
2. THE RLS_Policy_Engine SHALL enforce that authenticated users can only SELECT, INSERT, UPDATE, and DELETE rows in the tenants, tenant_users, and api_keys tables WHERE the tenant_id matches a tenant_id associated with the authenticated user's id in the tenant_users table
3. THE RLS_Policy_Engine SHALL enforce that users with the 'superadmin' role can SELECT all rows in all tables regardless of tenant association
4. THE RLS_Policy_Engine SHALL enforce that api_keys records are only accessible (SELECT, INSERT, DELETE) to users belonging to the associated tenant via the tenant_users table
5. THE Morphis_App SHALL use the Supabase service role key exclusively in server-side API routes, and the anon key in client-side code
6. THE schema.sql SHALL enable Row Level Security on all tables (users, tenants, tenant_users, api_keys) using ALTER TABLE ... ENABLE ROW LEVEL SECURITY

### Requirement 11: Superadmin Dashboard

**User Story:** As a superadmin, I want to view and manage all tenants, users, and subscriptions, so that I can oversee the platform and provide support.

#### Acceptance Criteria

1. WHEN a superadmin navigates to the Superadmin_Dashboard, THE Superadmin_Dashboard SHALL display a paginated list of all tenants showing tenant name, subscription_status, and stripe_customer_id, with a maximum of 50 tenants per page
2. WHEN a superadmin navigates to the users section, THE Superadmin_Dashboard SHALL display a paginated list of all registered users showing email, role, and associated tenant name, with a maximum of 50 users per page
3. WHEN a superadmin navigates to the Superadmin_Dashboard, THE Superadmin_Dashboard SHALL display global subscription metrics including total active subscriptions count and monthly recurring revenue (MRR) in the platform's base currency
4. WHEN a superadmin submits an updated usage limit value for a tenant, THE Superadmin_Dashboard SHALL validate that the new value is a positive integer, update the tenant record in the database, and confirm the change via the Toast_System
5. IF the update to a tenant's usage limit fails, THEN THE Superadmin_Dashboard SHALL display an error notification via the Toast_System and retain the previous limit value on screen
6. THE Superadmin_Dashboard SHALL provide an interface to view support tickets in a list showing ticket subject, submitting tenant name, creation date, and status (open, in_progress, or closed), and allow the superadmin to update a ticket's status

### Requirement 12: Error Handling and Notifications

**User Story:** As a user, I want clear feedback on all actions, so that I understand the result of my interactions with the application.

#### Acceptance Criteria

1. WHEN a database operation succeeds, THE Toast_System SHALL display a success notification that identifies the completed action by name (e.g., "API key created", "Team member invited") and remain visible for a minimum of 4 seconds
2. IF a database operation fails, THEN THE Toast_System SHALL display an error notification that describes the failure in terms of the user action that could not be completed, without exposing internal system details such as database error codes, stack traces, or table names
3. IF a network request does not receive a response within 10 seconds, THEN THE Morphis_App SHALL display a timeout error notification via the Toast_System and present a retry button that re-initiates the original request, up to a maximum of 3 retry attempts
4. THE Toast_System SHALL render notifications using Shadcn UI toast components styled with the custom color palette
5. WHEN a toast notification has been displayed for 5 seconds without user interaction, THE Toast_System SHALL automatically dismiss the notification

### Requirement 13: Implementation Completeness

**User Story:** As a developer, I want all features to be fully implemented with real logic, so that the application functions as a production-ready MVP.

#### Acceptance Criteria

1. THE Morphis_App SHALL implement all Supabase operations (user creation, session management, tenant CRUD, tenant_users CRUD, api_keys CRUD, usage stats queries) with complete query logic including parameterized queries and error handling that surfaces failures to the Toast_System
2. THE Morphis_App SHALL implement all Stripe API interactions (Customer Portal session creation, webhook signature verification, subscription status updates) with complete request construction, response parsing, and error handling
3. THE Morphis_App SHALL apply the 'Baloo 2' font and five custom colors (primary, secondary, accent, darkGreen, darkCharcoal) globally across all Shadcn UI components via the Tailwind theme configuration
4. THE Morphis_App SHALL contain no placeholder functions, TODO comments, or stub implementations in any file under the src/ directory or app/ directory
5. Each implemented database and API operation SHALL handle both the success path (updating UI state and displaying success notification) and the failure path (displaying error notification and preserving previous UI state)
