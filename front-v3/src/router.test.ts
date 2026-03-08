import { describe, it, expect, beforeEach } from 'vitest';
import { createRouter } from './router.js';
import { createRoutes, DEFAULT_MONTH_ID } from './router-config.js';

describe('router', () => {
  let outlet: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="screen-outlet"></div>';
    outlet = document.getElementById('screen-outlet')!;
    window.history.replaceState(null, '', '/');
  });

  it('redirige vers une URL /budgets/ quand la path initiale ne matche aucune route', () => {
    const routes = createRoutes(outlet);
    const router = createRouter({ outlet, routes, defaultMonthId: DEFAULT_MONTH_ID });

    router.init();

    expect(window.location.pathname).toMatch(/^\/budgets\//);
    expect(router.getCurrent().name).toBe('budgets');
    expect(router.getCurrent().path).toBe(`/budgets/${DEFAULT_MONTH_ID}`);
  });
});
