import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

describe('page Templates', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('redirige vers / quand non authentifié (liste templates)', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceFromInMemory(false) });
    await new Promise((r) => setTimeout(r, 150));

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    window.history.replaceState(null, '', '/templates');
    replaceStateSpy.mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));
    await new Promise((r) => setTimeout(r, 50));

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
  });

  it('redirige vers / quand non authentifié (détail template)', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    bootstrap({ authService: createAuthServiceFromInMemory(false) });
    await new Promise((r) => setTimeout(r, 150));

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    window.history.replaceState(null, '', '/templates/tpl-1');
    replaceStateSpy.mockClear();

    window.dispatchEvent(new PopStateEvent('popstate'));
    await new Promise((r) => setTimeout(r, 50));

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/');
  });
});
