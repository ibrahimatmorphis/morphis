import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateEnv } from './env';

describe('validateEnv', () => {
  const validEnv = {
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-value',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-value',
    STRIPE_SECRET_KEY: 'sk_test_123',
    STRIPE_WEBHOOK_SECRET: 'whsec_123',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
  };

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', validEnv.NEXT_PUBLIC_SUPABASE_URL);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', validEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', validEnv.SUPABASE_SERVICE_ROLE_KEY);
    vi.stubEnv('STRIPE_SECRET_KEY', validEnv.STRIPE_SECRET_KEY);
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', validEnv.STRIPE_WEBHOOK_SECRET);
    vi.stubEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', validEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns EnvConfig when all variables are present', () => {
    const result = validateEnv();
    expect(result).toEqual(validEnv);
  });

  it('throws an error when a variable is missing', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', undefined as unknown as string);
    delete process.env.STRIPE_SECRET_KEY;

    expect(() => validateEnv()).toThrow('Missing required environment variable: STRIPE_SECRET_KEY');
  });

  it('treats empty string as missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');

    expect(() => validateEnv()).toThrow('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL');
  });

  it('treats whitespace-only string as missing', () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '   ');

    expect(() => validateEnv()).toThrow('Missing required environment variable: STRIPE_WEBHOOK_SECRET');
  });

  it('logs error to console when validation fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    expect(() => validateEnv()).toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');

    consoleSpy.mockRestore();
  });

  it('checks all 6 required environment variables', () => {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    ];

    for (const varName of requiredVars) {
      vi.stubEnv(varName, '');
      expect(() => validateEnv()).toThrow(`Missing required environment variable: ${varName}`);
      vi.stubEnv(varName, validEnv[varName as keyof typeof validEnv]);
    }
  });
});
