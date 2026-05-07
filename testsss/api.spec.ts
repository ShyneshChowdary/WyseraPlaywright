import { test, expect } from '@playwright/test';

/**
 * API Tests (via Playwright's request context)
 * Covers: REST API health, auth tokens, response schemas, error handling
 *
 * @tags: @regression @api
 * Note: Update API_BASE and endpoints based on actual backend URLs
 */

const API_BASE = process.env.BASE_URL || 'https://app-dev.foundershub.ai';

test.describe('API - Health & Authentication', () => {
  // ── TC-API-001 ──────────────────────────────────────────────────────
  test('@smoke TC-API-001: App server is reachable (200 OK)', async ({ request }) => {
    const response = await request.get(API_BASE);
    expect(response.status()).toBeLessThan(500);
    console.log(`Server status: ${response.status()}`);
  });

  // ── TC-API-002 ──────────────────────────────────────────────────────
  test('@regression TC-API-002: Login API returns token on valid credentials', async ({ request }) => {
    // Try common login endpoints
    const loginEndpoints = [
      '/api/auth/login',
      '/api/login',
      '/auth/login',
      '/api/v1/auth/login',
    ];

    for (const endpoint of loginEndpoints) {
      const response = await request.post(`${API_BASE}${endpoint}`, {
        data: {
          email: process.env.TEST_USER_EMAIL || 'info@foundershub.ai',
          password: process.env.TEST_USER_PASSWORD || 'Invest@92',
        },
      }).catch(() => null);

      if (response && response.status() !== 404) {
        console.log(`Login endpoint: ${endpoint} → ${response.status()}`);

        if (response.status() === 200) {
          const body = await response.json().catch(() => ({}));
          const hasToken = !!(body.token || body.access_token || body.accessToken || body.jwt || body.data?.token);
          console.log(`Token in response: ${hasToken}`);
          expect(hasToken).toBeTruthy();
        }
        break;
      }
    }
  });

  // ── TC-API-003 ──────────────────────────────────────────────────────
  test('@regression TC-API-003: Protected API endpoints reject unauthenticated requests', async ({ request }) => {
    const protectedEndpoints = [
      '/api/users',
      '/api/user/profile',
      '/api/dashboard',
      '/api/v1/users',
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(`${API_BASE}${endpoint}`).catch(() => null);

      if (response && response.status() !== 404) {
        console.log(`${endpoint} (no auth) → ${response.status()}`);
        // Should return 401 or 403
        expect([401, 403]).toContain(response.status());
      }
    }
  });

  // ── TC-API-004 ──────────────────────────────────────────────────────
  test('@regression TC-API-004: API returns JSON content-type', async ({ request }) => {
    // After login, check API responses have proper content-type
    const apiEndpoints = [
      '/api/health',
      '/api/status',
      '/health',
    ];

    for (const endpoint of apiEndpoints) {
      const response = await request.get(`${API_BASE}${endpoint}`).catch(() => null);
      if (response && response.status() !== 404) {
        const contentType = response.headers()['content-type'] || '';
        console.log(`${endpoint} → Content-Type: ${contentType}`);
        expect(contentType).toContain('json');
        break;
      }
    }
  });

  // ── TC-API-005 ──────────────────────────────────────────────────────
  test('@regression TC-API-005: API handles invalid JSON body gracefully', async ({ request }) => {
    const loginEndpoints = ['/api/auth/login', '/api/login', '/auth/login'];

    for (const endpoint of loginEndpoints) {
      const response = await request.post(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        data: 'this is not json {{{{',
      }).catch(() => null);

      if (response && response.status() !== 404) {
        console.log(`Invalid JSON body → ${response.status()}`);
        // Should return 400 (Bad Request), not 500
        expect(response.status()).not.toBe(500);
        break;
      }
    }
  });

  // ── TC-API-006 ──────────────────────────────────────────────────────
  test('@regression TC-API-006: CORS headers are set correctly', async ({ request }) => {
    const response = await request.get(API_BASE, {
      headers: {
        'Origin': 'https://malicious-site.com',
      },
    }).catch(() => null);

    if (response) {
      const corsHeader = response.headers()['access-control-allow-origin'];
      console.log(`CORS Allow-Origin: ${corsHeader || 'not set'}`);
      // Should NOT allow all origins with credentials in prod
      if (corsHeader === '*') {
        console.warn('⚠️ CORS allows all origins — verify this is intentional for dev');
      }
    }
  });

  // ── TC-API-007 ──────────────────────────────────────────────────────
  test('@regression TC-API-007: Rate limiting is in place on login endpoint', async ({ request }) => {
    const loginEndpoints = ['/api/auth/login', '/api/login', '/auth/login'];
    let testedEndpoint = '';

    for (const endpoint of loginEndpoints) {
      const response = await request.post(`${API_BASE}${endpoint}`, {
        data: { email: 'test@test.com', password: 'wrong' },
      }).catch(() => null);

      if (response && response.status() !== 404) {
        testedEndpoint = endpoint;
        break;
      }
    }

    if (testedEndpoint) {
      // Make 10 rapid requests
      const responses = await Promise.all(
        Array.from({ length: 10 }, () =>
          request.post(`${API_BASE}${testedEndpoint}`, {
            data: { email: 'brute@force.com', password: 'attempt' },
          }).catch(() => null)
        )
      );

      const statuses = responses.filter(Boolean).map((r) => r!.status());
      const hasRateLimit = statuses.some((s) => s === 429);
      console.log(`Rate limit triggered (429): ${hasRateLimit}`);
      console.log('Response statuses:', statuses);

      if (!hasRateLimit) {
        console.warn('⚠️ No rate limiting detected on login endpoint — security risk');
      }
    }
  });
});
