export type Role = 'superadmin' | 'tenant_owner' | 'tenant_member';
export type SubscriptionStatus = 'active' | 'past_due' | 'trialing' | 'unpaid' | 'canceled' | 'inactive';
export type TicketStatus = 'open' | 'in_progress' | 'closed';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Tenant {
  id: string;
  name: string;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  usage_limit: number;
}

export interface TenantUser {
  user_id: string;
  tenant_id: string;
  role: 'tenant_owner' | 'tenant_member';
  joined_at: string;
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  key_hash: string;
  created_at: string;
}

export interface UsageStats {
  totalCalls: number;
  currentPeriodCalls: number;
  remainingQuota: number;
}

export interface TeamMember {
  user_id: string;
  email: string;
  role: 'tenant_owner' | 'tenant_member';
  joined_at: string;
}
