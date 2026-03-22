/**
 * Routeur : routes avec paramètres (ex. :monthId), History API, outlet unique.
 * Chaque route enregistre un handler qui monte le WC screen dans l’outlet et reçoit params + query.
 */

export type RouteMatch = {
  name: string;
  params: Record<string, string>;
  path: string;
};

/** Contexte passé au handler : params du path, query string, outlet pour monter le screen. */
export type RouteContext = {
  name: string;
  params: Record<string, string>;
  query: Record<string, string>;
  path: string;
  outlet: HTMLElement;
};

export type RouteHandler = (ctx: RouteContext) => void | HTMLElement | Promise<HTMLElement>;

export type RouteDef = {
  name: string;
  pattern: string;
  handle: RouteHandler;
};

function getQuery(): Record<string, string> {
  const q: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    q[key] = value;
  });
  return q;
}

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
  const pathOnly = pathname.replace(/\?.*$/, '');
  const m = pathOnly.match(re);
  if (!m) return null;
  const params: Record<string, string> = {};
  keys.forEach((key, i) => {
    params[key] = m[i + 1] ?? '';
  });
  return { name: route.name, params, path: pathname };
}

export type DefaultRoute = {
  name: string;
  path: string;
  params?: Record<string, string>;
};

export function createRouter({
  outlet,
  routes,
  defaultRoute,
}: {
  outlet: HTMLElement;
  routes: RouteDef[];
  defaultMonthId?: string;
  defaultRoute?: DefaultRoute;
}) {
  type Listener = (match: RouteMatch) => void;
  const listeners: Listener[] = [];
  const fallbackMatch: RouteMatch = defaultRoute
    ? { name: defaultRoute.name, params: defaultRoute.params ?? {}, path: defaultRoute.path }
    : { name: 'budgets', params: {}, path: '/budgets' };

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
    return fallbackMatch;
  }

  /** Exécute le handler et les listeners pour un match donné (évite de dépendre de location.pathname à jour). */
  function runForMatch(match: RouteMatch): void {
    runHandler(match).then(() => {
      listeners.forEach((fn) => fn(match));
    });
  }

  function navigate(path: string): void {
    if (path !== getPath()) {
      window.history.pushState(null, '', path);
      const match = findMatch(path) ?? fallbackMatch;
      runForMatch(match);
    }
  }

  function replace(path: string): void {
    window.history.replaceState(null, '', path);
    const match = findMatch(path) ?? fallbackMatch;
    runForMatch(match);
  }

  async function runHandler(match: RouteMatch): Promise<void> {
    const route = routes.find((r) => r.name === match.name);
    if (!route?.handle) return;
    const ctx: RouteContext = {
      name: match.name,
      params: match.params,
      query: getQuery(),
      path: match.path,
      outlet,
    };
    const result = route.handle(ctx);
    if (result instanceof HTMLElement) {
      outlet.replaceChildren(result);
    } else if (result != null && typeof (result as Promise<HTMLElement>).then === 'function') {
      const el = await (result as Promise<HTMLElement>);
      if (el instanceof HTMLElement) outlet.replaceChildren(el);
    }
  }

  function emit(): void {
    const match = getCurrent();
    runHandler(match).then(() => {
      listeners.forEach((fn) => fn(match));
    });
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
      replace(fallbackMatch.path);
      return getCurrent();
    }
    emit();
    return getCurrent();
  }

  return { getCurrent, navigate, replace, subscribe, init };
}
