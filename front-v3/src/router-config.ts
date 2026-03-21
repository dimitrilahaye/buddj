/**
 * Configuration du routeur : routes et mois par défaut.
 * Partagé entre main.ts et les tests pour utiliser le même router.
 */
import './components/screens/buddj-screen-home.js';
import './components/screens/buddj-screen-recurring.js';
import './components/screens/buddj-screen-new-month.js';
import './components/screens/buddj-screen-archived.js';
import './components/screens/buddj-screen-savings.js';
import './components/screens/buddj-screen-reimbursements.js';
import './components/screens/buddj-screen-templates.js';
import './components/screens/buddj-screen-template-detail.js';
import './components/screens/buddj-screen-annual-outflows.js';
import type { DefaultRoute, RouteDef } from './router.js';
import type { AuthStore } from './application/auth/auth-store.js';
import type { MonthStore } from './application/month/month-store.js';
import { BuddjScreenHome } from './components/screens/buddj-screen-home.js';
import { BuddjScreenBudgets } from './components/screens/buddj-screen-budgets.js';

export const DEFAULT_MONTH_ID = '2024-04';

export const DEFAULT_ROUTE: DefaultRoute = { name: 'home', path: '/' };

function wrapGuard(authStore: AuthStore, redirectToHome: () => void, handle: RouteDef['handle']): RouteDef['handle'] {
  return (ctx) => {
    if (!authStore.getIsAuthenticated()) {
      redirectToHome();
      return;
    }
    return handle(ctx);
  };
}

export function createRoutes({
  authStore,
  monthStore,
  redirectToHome,
}: {
  authStore: AuthStore;
  monthStore: MonthStore;
  redirectToHome: () => void;
}): RouteDef[] {
  return [
    {
      name: 'home',
      pattern: '/',
      handle(ctx) {
        const el = document.createElement('buddj-screen-home') as BuddjScreenHome;
        el.init({ store: authStore });
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'new-month',
      pattern: '/new-month',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-new-month');
        ctx.outlet.replaceChildren(el);
      }),
    },
    {
      name: 'archived',
      pattern: '/archived',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-archived');
        ctx.outlet.replaceChildren(el);
      }),
    },
    {
      name: 'savings',
      pattern: '/savings',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-savings');
        ctx.outlet.replaceChildren(el);
      }),
    },
    {
      name: 'reimbursements',
      pattern: '/reimbursements',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-reimbursements');
        ctx.outlet.replaceChildren(el);
      }),
    },
    {
      name: 'template-detail',
      pattern: '/templates/:id',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-template-detail');
        el.setAttribute('template-id', ctx.params.id ?? '');
        el.setAttribute('is-default', 'false');
        ctx.outlet.replaceChildren(el);
      }),
    },
    {
      name: 'templates',
      pattern: '/templates',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-templates');
        ctx.outlet.replaceChildren(el);
      }),
    },
    {
      name: 'annual-outflows',
      pattern: '/annual-outflows',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-annual-outflows');
        ctx.outlet.replaceChildren(el);
      }),
    },
    {
      name: 'outflows',
      pattern: '/outflows/:monthId',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = document.createElement('buddj-screen-recurring');
        ctx.outlet.replaceChildren(el);
        const main = document.getElementById('recurring');
        if (main) main.setAttribute('data-month-id', ctx.params.monthId ?? '');
      }),
    },
    {
      name: 'budgets',
      pattern: '/budgets',
      handle: wrapGuard(authStore, redirectToHome, (ctx) => {
        const el = new BuddjScreenBudgets();
        el.init({ monthStore });
        ctx.outlet.replaceChildren(el);
      }),
    },
  ];
}
