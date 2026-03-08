import { describe, it, expect } from 'vitest';

describe('app bootstrap', () => {
  it('redirige vers /budgets/ quand on visite /', async () => {
    document.body.innerHTML = '<main id="screen-outlet" role="main"></main>';
    window.history.replaceState(null, '', '/');

    await import('../src/main.js');

    expect(window.location.pathname).toMatch(/^\/budgets\//);
  });
});
