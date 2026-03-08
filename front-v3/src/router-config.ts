/**
 * Configuration du routeur : routes et mois par défaut.
 * Partagé entre main.ts et les tests pour utiliser le même router.
 */
import './components/screens/buddj-screen-home.js';
import './components/screens/buddj-screen-recurring.js';
import './components/screens/buddj-screen-budgets.js';
import './components/screens/buddj-screen-new-month.js';
import './components/screens/buddj-screen-archived.js';
import './components/screens/buddj-screen-savings.js';
import './components/screens/buddj-screen-reimbursements.js';
import './components/screens/buddj-screen-templates.js';
import './components/screens/buddj-screen-template-detail.js';
import './components/screens/buddj-screen-annual-outflows.js';
import type { DefaultRoute, RouteDef } from './router.js';

export const DEFAULT_MONTH_ID = '2024-04';

export const DEFAULT_ROUTE: DefaultRoute = { name: 'home', path: '/' };

export function createRoutes(): RouteDef[] {
  return [
    {
      name: 'home',
      pattern: '/',
      handle(ctx) {
        const el = document.createElement('buddj-screen-home');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'new-month',
      pattern: '/new-month',
      handle(ctx) {
        const el = document.createElement('buddj-screen-new-month');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'archived',
      pattern: '/archived',
      handle(ctx) {
        const el = document.createElement('buddj-screen-archived');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'savings',
      pattern: '/savings',
      handle(ctx) {
        const el = document.createElement('buddj-screen-savings');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'reimbursements',
      pattern: '/reimbursements',
      handle(ctx) {
        const el = document.createElement('buddj-screen-reimbursements');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'template-detail',
      pattern: '/templates/:id',
      handle(ctx) {
        const el = document.createElement('buddj-screen-template-detail');
        el.setAttribute('template-id', ctx.params.id ?? '');
        el.setAttribute('is-default', 'false');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'templates',
      pattern: '/templates',
      handle(ctx) {
        const el = document.createElement('buddj-screen-templates');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'annual-outflows',
      pattern: '/annual-outflows',
      handle(ctx) {
        const el = document.createElement('buddj-screen-annual-outflows');
        ctx.outlet.replaceChildren(el);
      },
    },
    {
      name: 'outflows',
      pattern: '/outflows/:monthId',
      handle(ctx) {
        const el = document.createElement('buddj-screen-recurring');
        ctx.outlet.replaceChildren(el);
        const main = document.getElementById('recurring');
        if (main) main.setAttribute('data-month-id', ctx.params.monthId ?? '');
      },
    },
    {
      name: 'budgets',
      pattern: '/budgets/:monthId',
      handle(ctx) {
        const el = document.createElement('buddj-screen-budgets');
        ctx.outlet.replaceChildren(el);
        const main = document.getElementById('budgets');
        if (main) main.setAttribute('data-month-id', ctx.params.monthId ?? '');
      },
    },
  ];
}
