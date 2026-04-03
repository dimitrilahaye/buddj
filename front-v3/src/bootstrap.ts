/**
 * Bootstrap de l’app : config (vars d’env), auth, router, routes.
 * `monthService` est obligatoire (composition : `main.ts` injecte l’API, les tests un in-memory).
 * `templateService` est optionnel : défaut = client API sur `config.apiUrl` (comme `authService`).
 */
import type { AppConfig } from './config.js';
import { buildConfigFromEnv } from './config.js';
import type { AuthService } from './application/auth/auth-service.js';
import { AuthStore } from './application/auth/auth-store.js';
import { checkUserIsAuthenticated } from './application/auth/check-user-is-authenticated.js';
import { userSignIn } from './application/auth/user-sign-in.js';
import { userLogout } from './application/auth/user-logout.js';
import { createAuthServiceFromApi } from './adapters/auth-service-from-api.js';
import { createLoadUnarchivedMonths } from './application/month/load-unarchived-months.js';
import { createLoadArchivedMonths } from './application/month/load-archived-months.js';
import { createUnarchiveMonth } from './application/month/unarchive-month.js';
import { createDeleteArchivedMonth } from './application/month/delete-archived-month.js';
import { ArchivedMonthStore } from './application/month/archived-month-store.js';
import { MonthStore } from './application/month/month-store.js';
import { createCreateBudget } from './application/month/create-budget.js';
import { createUpdateBudget } from './application/month/update-budget.js';
import { createCreateExpense } from './application/month/create-expense.js';
import { createCreateOutflow } from './application/month/create-outflow.js';
import { createDeleteBudget } from './application/month/delete-budget.js';
import { createDeleteExpense } from './application/month/delete-expense.js';
import { createDeleteOutflow } from './application/month/delete-outflow.js';
import { createPutExpensesChecking } from './application/month/put-expenses-checking.js';
import { createPutOutflowsChecking } from './application/month/put-outflows-checking.js';
import { createTransferFromWeeklyBudget } from './application/month/transfer-from-weekly-budget.js';
import { createTransferFromAccount } from './application/month/transfer-from-account.js';
import { createArchiveMonth } from './application/month/archive-month.js';
import type { MonthService } from './application/month/month-service.js';
import { createLoadTemplates } from './application/template/load-templates.js';
import { createUpdateTemplate } from './application/template/update-template.js';
import { createAddTemplateOutflow } from './application/template/add-template-outflow.js';
import { createDeleteTemplateOutflow } from './application/template/delete-template-outflow.js';
import { createAddTemplateBudget } from './application/template/add-template-budget.js';
import { createDeleteTemplateBudget } from './application/template/delete-template-budget.js';
import { TemplatesStore } from './application/template/templates-store.js';
import type { TemplateService } from './application/template/template-service.js';
import { createTemplateServiceFromApi } from './adapters/template-service-from-api.js';
import { createRouter } from './router.js';
import { createRoutes, DEFAULT_MONTH_ID, DEFAULT_ROUTE } from './router-config.js';
import { BuddjBurgerPanel } from './components/organisms/buddj-burger-panel.js';
import type { BuddjSummaryBarElement } from './components/organisms/buddj-summary-bar.js';
import { getCurrentMonth } from './application/month/month-state.js';
import { getToast } from './components/atoms/buddj-toast.js';

/** Référence du listener délégation SPA : retiré avant un second `bootstrap()` (tests). */
let spaNavigationClickListener: ((e: Event) => void) | undefined;

/** Route protégée demandée avant redirection vers `/` (garde auth) ; relue après vérif de session. */
const POST_AUTH_REDIRECT_STORAGE_KEY = 'buddj-post-auth-redirect';

function isSpaInternalPath(pathname: string): boolean {
  if (
    pathname === '/budgets' ||
    pathname.startsWith('/budgets/') ||
    pathname === '/new-month' ||
    pathname === '/archived' ||
    pathname === '/annual-outflows' ||
    pathname === '/savings' ||
    pathname === '/reimbursements' ||
    pathname === '/templates'
  ) {
    return true;
  }
  if (pathname.startsWith('/outflows/')) return true;
  if (pathname.startsWith('/templates/')) return true;
  return false;
}

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
    { class: 'route-budgets', active: match.name === 'budgets' || match.name === 'budgets-month' },
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
  monthService: MonthService;
  templateService?: TemplateService;
};

export function bootstrap(options: BootstrapOptions): void {
  const config = options.config ?? buildConfigFromEnv();
  const authService = options.authService ?? createAuthServiceFromApi({ apiUrl: config.apiUrl });
  const templateService = options.templateService ?? createTemplateServiceFromApi({ apiUrl: config.apiUrl });
  const loadUnarchivedMonths = createLoadUnarchivedMonths({ monthService: options.monthService });
  const putExpensesChecking = createPutExpensesChecking({ monthService: options.monthService });
  const putOutflowsChecking = createPutOutflowsChecking({ monthService: options.monthService });
  const deleteExpense = createDeleteExpense({ monthService: options.monthService });
  const deleteOutflow = createDeleteOutflow({ monthService: options.monthService });
  const deleteBudget = createDeleteBudget({ monthService: options.monthService });
  const createExpense = createCreateExpense({ monthService: options.monthService });
  const createBudget = createCreateBudget({ monthService: options.monthService });
  const createOutflow = createCreateOutflow({ monthService: options.monthService });
  const updateBudget = createUpdateBudget({ monthService: options.monthService });
  const transferFromWeeklyBudget = createTransferFromWeeklyBudget({ monthService: options.monthService });
  const transferFromAccount = createTransferFromAccount({ monthService: options.monthService });
  const archiveMonth = createArchiveMonth({ monthService: options.monthService });
  const loadArchivedMonths = createLoadArchivedMonths({ monthService: options.monthService });
  const unarchiveMonth = createUnarchiveMonth({ monthService: options.monthService });
  const deleteArchivedMonth = createDeleteArchivedMonth({ monthService: options.monthService });
  const monthStore = new MonthStore({
    loadUnarchivedMonths,
    archiveMonth,
    putExpensesChecking,
    putOutflowsChecking,
    deleteExpense,
    deleteOutflow,
    deleteBudget,
    createExpense,
    createBudget,
    createOutflow,
    updateBudget,
    transferFromWeeklyBudget,
    transferFromAccount,
  });
  const archivedMonthStore = new ArchivedMonthStore({
    loadArchivedMonths,
    unarchiveMonth,
    deleteArchivedMonth,
    monthStore,
  });
  const loadTemplates = createLoadTemplates({ templateService });
  const updateTemplate = createUpdateTemplate({ templateService });
  const addTemplateOutflow = createAddTemplateOutflow({ templateService });
  const deleteTemplateOutflow = createDeleteTemplateOutflow({ templateService });
  const addTemplateBudget = createAddTemplateBudget({ templateService });
  const deleteTemplateBudget = createDeleteTemplateBudget({ templateService });
  const templatesStore = new TemplatesStore({
    loadTemplates,
    updateTemplate,
    addTemplateOutflow,
    deleteTemplateOutflow,
    addTemplateBudget,
    deleteTemplateBudget,
  });
  // config injecté là où nécessaire (ex. futur client API : config.apiUrl)
  const outlet = document.getElementById('screen-outlet')!;

  // let requis : authStore a besoin de router dans onAuthenticatedRedirect, router dépend de authStore pour createRoutes
  // eslint-disable-next-line prefer-const
  let router: ReturnType<typeof createRouter>;
  const authStore = new AuthStore({
    checkUserIsAuthenticated: () => checkUserIsAuthenticated({ authService }),
    userSignIn: () => userSignIn({ authService }),
    userLogout: () => userLogout({ authService }),
    onAuthenticatedRedirect: () => {
      const saved = sessionStorage.getItem(POST_AUTH_REDIRECT_STORAGE_KEY);
      sessionStorage.removeItem(POST_AUTH_REDIRECT_STORAGE_KEY);
      if (saved) {
        try {
          const u = new URL(saved, window.location.origin);
          if (u.origin === window.location.origin && isSpaInternalPath(u.pathname)) {
            router.navigate(`${u.pathname}${u.search}${u.hash}`);
            return;
          }
        } catch {
          /* ignore */
        }
      }
      router.navigate('/budgets');
    },
    onLogoutSuccess: () => router.replace('/'),
  });

  const burgerPanel = document.querySelector('buddj-burger-panel') as BuddjBurgerPanel;
  burgerPanel?.init?.({ store: authStore });

  const routes = createRoutes({
    authStore,
    monthStore,
    archivedMonthStore,
    templatesStore,
    redirectToHome: () => {
      const target = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (isSpaInternalPath(window.location.pathname)) {
        sessionStorage.setItem(POST_AUTH_REDIRECT_STORAGE_KEY, target);
      }
      // Désynchroniser pour que les listeners de la navigation en cours (route protégée) ne réappliquent pas leurs classes après applyRoute(home)
      setTimeout(() => router.replace('/'), 0);
    },
  });
  router = createRouter({
    outlet,
    routes,
    defaultMonthId: DEFAULT_MONTH_ID,
    defaultRoute: DEFAULT_ROUTE,
  });

  monthStore.addEventListener('routeMonthIdNotFound', () => {
    getToast()?.show({
      message: 'Ce mois n’est pas disponible dans la liste des mois non archivés.',
      variant: 'error',
      durationMs: 2500,
    });
  });

  monthStore.addEventListener('currentMonthChanged', () => {
    const m = getCurrentMonth({ state: monthStore.getState() });
    if (!m) return;
    const name = router.getCurrent().name;
    const suffix = `${window.location.search}${window.location.hash}`;
    if (name === 'outflows') {
      window.history.replaceState(null, '', `/outflows/${m.id}${suffix}`);
    } else if (name === 'budgets' || name === 'budgets-month') {
      window.history.replaceState(null, '', `/budgets/${m.id}${suffix}`);
    }
  });

  const summaryBar = document.querySelector('buddj-summary-bar') as BuddjSummaryBarElement | null;
  summaryBar?.init({
    monthStore,
    getCurrentRouteName: () => router.getCurrent().name,
    defaultMonthIdForNav: DEFAULT_MONTH_ID,
  });

  function applyRoute(match: { name: string; params: Record<string, string> }): void {
    const isStandalone = STANDALONE_ROUTE_NAMES.has(match.name);
    getBodyClassToggles(match).forEach(({ class: cls, active }) => {
      document.body.classList.toggle(cls, active);
    });
    const nav = document.querySelector('buddj-nav');
    if (nav) {
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

  const onSpaNavigationClick = (e: Event): void => {
    const t = e.target as Node;
    const start = t instanceof Element ? t : t.parentElement;
    const raw = start?.closest('a');
    if (!raw || !(raw instanceof HTMLAnchorElement) || raw.target === '_blank') return;
    const hrefAttr = raw.getAttribute('href');
    if (!hrefAttr || hrefAttr.startsWith('mailto:') || hrefAttr.startsWith('tel:')) return;

    if (raw.closest('.global-header-logo')) {
      e.preventDefault();
      monthStore.emitAction('loadUnarchivedMonths');
      return;
    }

    if (!hrefAttr.startsWith('/')) {
      try {
        const u = new URL(raw.href, window.location.origin);
        if (u.origin !== window.location.origin) return;
        if (!isSpaInternalPath(u.pathname)) return;
        e.preventDefault();
        router.navigate(`${u.pathname}${u.search}${u.hash}`);
      } catch {
        return;
      }
      return;
    }
    const pathOnly = hrefAttr.split(/[?#]/)[0] ?? '';
    if (!pathOnly || !isSpaInternalPath(pathOnly)) return;
    e.preventDefault();
    router.navigate(hrefAttr);
  };
  if (spaNavigationClickListener) {
    document.removeEventListener('click', spaNavigationClickListener);
  }
  spaNavigationClickListener = onSpaNavigationClick;
  document.addEventListener('click', spaNavigationClickListener);

  router.subscribe(applyRoute);
  router.init();
}
