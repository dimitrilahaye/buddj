import { describe, it, expect } from 'vitest';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { DEFAULT_MONTH_ID } from '../../src/router-config.js';

describe('home quand l’utilisateur est authentifié', () => {
  it('redirige vers /budgets/:monthId', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');
    (window as Window & { __INJECT_AUTH_SERVICE__?: ReturnType<typeof createAuthServiceFromInMemory> }).__INJECT_AUTH_SERVICE__ =
      createAuthServiceFromInMemory(true);

    await import('../../src/main.js');

    await new Promise((r) => setTimeout(r, 100));

    expect(window.location.pathname).toBe(`/budgets/${DEFAULT_MONTH_ID}`);
  });
});
