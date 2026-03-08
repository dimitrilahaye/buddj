/**
 * Bootstrap de l’app : config (vars d’env), auth, router, routes. Exporté pour permettre aux tests d’injecter config et authService.
 */
import type { AppConfig } from './config.js';
import { buildConfigFromEnv } from './config.js';
import type { AuthService } from './application/auth/auth-service.js';
import { AuthStore } from './application/auth/auth-store.js';
import { checkUserIsAuthenticated } from './application/auth/check-user-is-authenticated.js';
import { createAuthServiceFromApi } from './adapters/auth-service-from-api.js';
import { createAuthServiceFromInMemory } from './adapters/auth-service-from-in-memory.js';
import { createRouter } from './router.js';
import { createRoutes, DEFAULT_MONTH_ID, DEFAULT_ROUTE } from './router-config.js';

const STANDALONE_ROUTE_NAMES = new Set([
  'home',
  'new-month',
  'archived',
  'savings',
  'reimbursements',
  'templates',
  'template-detail',
  'annual-outflows',
]);

function getBodyClassToggles(match: { name: string }): Array<{ class: string; active: boolean }> {
  return [
    { class: 'route-home', active: match.name === 'home' },
    { class: 'route-outflows', active: match.name === 'outflows' },
    { class: 'route-budgets', active: match.name === 'budgets' },
    { class: 'route-templates', active: match.name === 'templates' || match.name === 'template-detail' },
    { class: 'route-annual-outflows', active: match.name === 'annual-outflows' },
    { class: 'route-new-month', active: match.name === 'new-month' },
    { class: 'route-archived', active: match.name === 'archived' },
    { class: 'route-savings', active: match.name === 'savings' },
    { class: 'route-reimbursements', active: match.name === 'reimbursements' },
  ];
}

const BURGER_LINK_ACTIVE_BY_HREF: Record<string, string[]> = {
  '/new-month': ['new-month'],
  '/archived': ['archived'],
  '/templates': ['templates', 'template-detail'],
  '/annual-outflows': ['annual-outflows'],
  '/savings': ['savings'],
  '/reimbursements': ['reimbursements'],
};

export type BootstrapOptions = {
  config?: AppConfig;
  authService?: AuthService;
};

export function bootstrap(options?: BootstrapOptions): void {
  const config = options?.config ?? buildConfigFromEnv();
  const authService = options?.authService ?? createAuthServiceFromApi({ apiUrl: config.apiUrl });
  // config injecté là où nécessaire (ex. futur client API : config.apiUrl)
  const outlet = document.getElementById('screen-outlet')!;

  // let requis : authStore a besoin de router dans onAuthenticatedRedirect, router dépend de authStore pour createRoutes
  // eslint-disable-next-line prefer-const
  let router: ReturnType<typeof createRouter>;
  const authStore = new AuthStore({
    checkUserIsAuthenticated: () => checkUserIsAuthenticated({ authService }),
    onAuthenticatedRedirect: () => router.navigate(`/budgets/${DEFAULT_MONTH_ID}`),
  });

  const routes = createRoutes({ authStore });
  router = createRouter({
    outlet,
    routes,
    defaultMonthId: DEFAULT_MONTH_ID,
    defaultRoute: DEFAULT_ROUTE,
  });

  function applyRoute(match: { name: string; params: Record<string, string> }): void {
    const isStandalone = STANDALONE_ROUTE_NAMES.has(match.name);
    getBodyClassToggles(match).forEach(({ class: cls, active }) => {
      document.body.classList.toggle(cls, active);
    });
    const nav = document.querySelector('buddj-nav');
    if (nav) {
      (nav as HTMLElement).setAttribute('month-id', match.params.monthId ?? DEFAULT_MONTH_ID);
      (nav as unknown as { setActiveRoute: (name: string) => void }).setActiveRoute(isStandalone ? '' : match.name);
    }
    const burgerPanel = document.querySelector('buddj-burger-panel');
    const burgerLinks = burgerPanel?.querySelectorAll('.burger-panel-list .burger-panel-link') ?? [];
    burgerLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const activeRouteNames = href ? BURGER_LINK_ACTIVE_BY_HREF[href] ?? [] : [];
      link.classList.toggle('burger-panel-link--active', activeRouteNames.includes(match.name));
    });
  }

  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest(
      'a[href^="/outflows/"], a[href^="/budgets/"], a[href="/new-month"], a[href="/archived"], a[href="/annual-outflows"], a[href="/savings"], a[href="/reimbursements"], a[href="/templates"], a[href^="/templates/"]'
    );
    if (!a || (a as HTMLAnchorElement).target === '_blank') return;
    e.preventDefault();
    router.navigate((a as HTMLAnchorElement).getAttribute('href')!);
  });

  router.subscribe(applyRoute);
  router.init();
}
