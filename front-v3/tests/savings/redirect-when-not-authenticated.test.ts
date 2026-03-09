import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

describe('page Savings', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('redirige vers / quand non authentifié', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceFromInMemory(false) });
    await new Promise((r) => setTimeout(r, 150));

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    window.history.replaceState(null, '', '/savings');
    replaceStateSpy.mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));
    await new Promise((r) => setTimeout(r, 50));

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome on Buddj!' })).exist;
  });
});
