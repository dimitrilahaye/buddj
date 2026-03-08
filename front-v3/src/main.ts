/**
 * Point d’entrée : Web Components + routeur (outlet unique, un screen monté à la fois).
 */
import '../styles.css';
import './components/icons/buddj-icon-edit.js';
import './components/icons/buddj-icon-add.js';
import './components/icons/buddj-icon-delete.js';
import './components/icons/buddj-icon-search.js';
import './components/icons/buddj-icon-transfer.js';
import './components/icons/buddj-icon-save.js';
import './components/icons/buddj-icon-toggle.js';
import './components/atoms/buddj-text-ellipsis.js';
import './components/atoms/buddj-amount.js';
import './components/atoms/buddj-btn-add.js';
import './components/molecules/buddj-line-item.js';
import './components/molecules/buddj-charge-item.js';
import './components/molecules/buddj-expense-item.js';
import './components/molecules/buddj-allocated-remaining.js';
import './components/molecules/buddj-budget-pending.js';
import './components/molecules/buddj-confirm-modal.js';
import './components/molecules/buddj-toggle-all.js';
import './components/atoms/buddj-toast.js';
import './components/organisms/buddj-nav.js';
import './components/organisms/buddj-burger-panel.js';
import './components/organisms/buddj-calculator-drawer.js';
import './components/organisms/buddj-emoji-picker-drawer.js';
import './components/organisms/buddj-charge-add-drawer.js';
import './components/organisms/buddj-expense-add-drawer.js';
import './components/organisms/buddj-budget-add-drawer.js';
import './components/organisms/buddj-budget-edit-drawer.js';
import './components/organisms/buddj-transfer-drawer.js';
import './components/organisms/buddj-search-drawer.js';
import './components/organisms/buddj-charge-search-drawer.js';
import './components/organisms/buddj-expense-search-drawer.js';
import './components/organisms/buddj-budget-search-drawer.js';
import './components/organisms/buddj-annual-outflows-search-drawer.js';
import './components/organisms/buddj-new-month-charge-search-drawer.js';
import './components/organisms/buddj-goal-amount-drawer.js';
import './components/organisms/buddj-goal-edit-drawer.js';
import './components/organisms/buddj-goal-add-drawer.js';
import './components/organisms/buddj-actions-dropdown.js';
import './components/organisms/buddj-goal-card.js';
import './components/organisms/buddj-summary-bar.js';
import './components/organisms/buddj-section-header.js';
import './components/organisms/buddj-charge-group.js';
import './components/organisms/buddj-budget-card.js';
import './components/organisms/buddj-budget-group.js';
import './components/organisms/buddj-template-budget-card.js';
import { createRouter } from './router.js';
import { createRoutes, DEFAULT_MONTH_ID } from './router-config.js';

const outlet = document.getElementById('screen-outlet')!;
const routes = createRoutes(outlet);
const router = createRouter({ outlet, routes, defaultMonthId: DEFAULT_MONTH_ID });

/** Routes sans onglet mois (nav masque le sélecteur, layout type « page standalone »). */
const STANDALONE_ROUTE_NAMES = new Set([
  'new-month',
  'archived',
  'savings',
  'reimbursements',
  'templates',
  'template-detail',
  'annual-outflows',
]);

/** Classes body à toggler selon la route courante. */
function getBodyClassToggles(match: { name: string }): Array<{ class: string; active: boolean }> {
  return [
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

/** Pour chaque href du burger, noms de routes qui activent ce lien. */
const BURGER_LINK_ACTIVE_BY_HREF: Record<string, string[]> = {
  '/new-month': ['new-month'],
  '/archived': ['archived'],
  '/templates': ['templates', 'template-detail'],
  '/annual-outflows': ['annual-outflows'],
  '/savings': ['savings'],
  '/reimbursements': ['reimbursements'],
};

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