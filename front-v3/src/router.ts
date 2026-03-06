/**
 * Routeur minimal : routes avec paramètres (ex. :monthId), History API, abonnement aux changements.
 */

export type RouteMatch = {
  name: string;
  params: Record<string, string>;
  path: string;
};

export type RouteDef = {
  name: string;
  pattern: string; // ex. '/outflows/:monthId'
};

const DEFAULT_MONTH_ID = '2024-04';

function pathToRegex(pattern: string): { re: RegExp; keys: string[] } {
  const keys: string[] = [];
  const s = pattern
    .replace(/\/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '/([^/]+)';
    });
  return { re: new RegExp(`^${s}$`), keys };
}

function matchPath(pathname: string, route: RouteDef): RouteMatch | null {
  const { re, keys } = pathToRegex(route.pattern);
  const m = pathname.replace(/\?.*$/, '').match(re);
  if (!m) return null;
  const params: Record<string, string> = {};
  keys.forEach((key, i) => {
    params[key] = m[i + 1] ?? '';
  });
  return { name: route.name, params, path: pathname };
}

export function createRouter({
  routes,
  defaultMonthId = DEFAULT_MONTH_ID,
}: {
  routes: RouteDef[];
  defaultMonthId?: string;
}) {
  type Listener = (match: RouteMatch) => void;
  const listeners: Listener[] = [];

  function getPath(): string {
    return window.location.pathname || '/';
  }

  function findMatch(pathname: string): RouteMatch | null {
    for (const route of routes) {
      const m = matchPath(pathname, route);
      if (m) return m;
    }
    return null;
  }

  function getCurrent(): RouteMatch {
    const path = getPath();
    const m = findMatch(path);
    if (m) return m;
    return { name: 'budgets', params: { monthId: defaultMonthId }, path: `/budgets/${defaultMonthId}` };
  }

  function navigate(path: string): void {
    if (path !== getPath()) {
      window.history.pushState(null, '', path);
      emit();
    }
  }

  function replace(path: string): void {
    window.history.replaceState(null, '', path);
    emit();
  }

  function emit(): void {
    const match = getCurrent();
    listeners.forEach((fn) => fn(match));
  }

  function subscribe(fn: Listener): () => void {
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  function init(): RouteMatch {
    window.addEventListener('popstate', emit);
    const path = getPath();
    if (!findMatch(path)) {
      replace(`/budgets/${defaultMonthId}`);
      return getCurrent();
    }
    return getCurrent();
  }

  return { getCurrent, navigate, replace, subscribe, init };
}

export const ROUTES: RouteDef[] = [
  { name: 'new-month', pattern: '/new-month' },
  { name: 'archived', pattern: '/archived' },
  { name: 'savings', pattern: '/savings' },
  { name: 'reimbursements', pattern: '/reimbursements' },
  { name: 'templates', pattern: '/templates' },
  { name: 'template-detail', pattern: '/templates/:id' },
  { name: 'annual-outflows', pattern: '/annual-outflows' },
  { name: 'outflows', pattern: '/outflows/:monthId' },
  { name: 'budgets', pattern: '/budgets/:monthId' },
];
