/**
 * Point d’entrée : Web Components + routeur (outflows/:monthId, budgets/:monthId).
 * Les composants d’icônes sont enregistrés en premier pour être disponibles partout.
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
import './components/screens/buddj-screen-recurring.js';
import './components/screens/buddj-screen-budgets.js';
import './components/screens/buddj-screen-new-month.js';
import './components/screens/buddj-screen-archived.js';
import './components/screens/buddj-screen-savings.js';
import './components/screens/buddj-screen-reimbursements.js';
import './components/screens/buddj-screen-templates.js';
import './components/screens/buddj-screen-template-detail.js';
import './components/screens/buddj-screen-annual-outflows.js';
import { createRouter, ROUTES } from './router.js';

const router = createRouter({ routes: ROUTES, defaultMonthId: '2024-04' });

function applyRoute(match: { name: string; params: Record<string, string> }): void {
  const screenOutflows = document.querySelector('buddj-screen-recurring');
  const screenBudgets = document.querySelector('buddj-screen-budgets');
  const screenNewMonth = document.getElementById('new-month-screen') as HTMLElement & { open: () => void; close: () => void };
  const screenArchived = document.getElementById('archived-screen');
  const screenSavings = document.getElementById('savings-screen');
  const screenReimbursements = document.getElementById('reimbursements-screen');
  const screenTemplates = document.querySelector('buddj-screen-templates');
  const screenTemplateDetail = document.querySelector('buddj-screen-template-detail');
  const screenAnnualOutflows = document.querySelector('buddj-screen-annual-outflows');
  const nav = document.querySelector('buddj-nav');

  const isNewMonth = match.name === 'new-month';
  const isArchived = match.name === 'archived';
  const isSavings = match.name === 'savings';
  const isReimbursements = match.name === 'reimbursements';
  const isTemplates = match.name === 'templates';
  const isTemplateDetail = match.name === 'template-detail';
  const isAnnualOutflows = match.name === 'annual-outflows';
  const isStandalone = isNewMonth || isArchived || isSavings || isReimbursements || isTemplates || isTemplateDetail || isAnnualOutflows;

  document.body.classList.toggle('route-outflows', match.name === 'outflows');
  document.body.classList.toggle('route-budgets', match.name === 'budgets');
  document.body.classList.toggle('route-templates', isTemplates || isTemplateDetail);
  document.body.classList.toggle('route-annual-outflows', isAnnualOutflows);
  document.body.classList.toggle('route-new-month', isNewMonth);
  document.body.classList.toggle('route-archived', isArchived);
  document.body.classList.toggle('route-savings', isSavings);
  document.body.classList.toggle('route-reimbursements', isReimbursements);

  if (screenOutflows) (screenOutflows as HTMLElement).style.display = !isStandalone && match.name === 'outflows' ? '' : 'none';
  if (screenBudgets) (screenBudgets as HTMLElement).style.display = !isStandalone && match.name === 'budgets' ? '' : 'none';
  if (screenArchived) (screenArchived as HTMLElement).style.display = isArchived ? 'block' : 'none';
  if (screenSavings) (screenSavings as HTMLElement).style.display = isSavings ? 'flex' : 'none';
  if (screenReimbursements) (screenReimbursements as HTMLElement).style.display = isReimbursements ? 'flex' : 'none';
  if (screenTemplates) (screenTemplates as HTMLElement).style.display = isTemplates ? '' : 'none';
  if (screenTemplateDetail) {
    (screenTemplateDetail as HTMLElement).style.display = isTemplateDetail ? '' : 'none';
    if (isTemplateDetail) {
      const templateId = match.params.id ?? '';
      screenTemplateDetail.setAttribute('template-id', templateId);
      const listEl = screenTemplates as { getTemplateById?(id: string): { isDefault?: boolean } | undefined } | null;
      const template = listEl?.getTemplateById?.(templateId);
      screenTemplateDetail.setAttribute('is-default', template?.isDefault === true ? 'true' : 'false');
    }
  }

  if (screenAnnualOutflows) {
    (screenAnnualOutflows as HTMLElement).style.display = isAnnualOutflows ? 'flex' : 'none';
  }

  if (screenNewMonth) {
    if (isNewMonth) screenNewMonth.open();
    else screenNewMonth.close();
  }

  if (nav) {
    (nav as HTMLElement).setAttribute('month-id', match.params.monthId ?? '2024-04');
    (nav as unknown as { setActiveRoute: (name: string) => void }).setActiveRoute(isStandalone ? '' : match.name);
  }

  const mainOutflows = document.getElementById('recurring');
  const mainBudgets = document.getElementById('budgets');
  if (mainOutflows) mainOutflows.setAttribute('data-month-id', match.params.monthId ?? '');
  if (mainBudgets) mainBudgets.setAttribute('data-month-id', match.params.monthId ?? '');

  const burgerPanel = document.querySelector('buddj-burger-panel');
  const burgerLinks = burgerPanel?.querySelectorAll('.burger-panel-list .burger-panel-link') ?? [];
  burgerLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const isNewMonthLink = href === '/new-month';
    const isArchivedLink = href === '/archived';
    const isTemplatesLink = href === '/templates';
    const isAnnualOutflowsLink = href === '/annual-outflows';
    const isSavingsLink = href === '/savings';
    const isReimbursementsLink = href === '/reimbursements';
    link.classList.toggle(
      'burger-panel-link--active',
      (isNewMonth && isNewMonthLink) ||
        (isArchived && isArchivedLink) ||
        (isTemplates && isTemplatesLink) ||
        (isTemplateDetail && isTemplatesLink) ||
        (isAnnualOutflows && isAnnualOutflowsLink) ||
        (isSavings && isSavingsLink) ||
        (isReimbursements && isReimbursementsLink)
    );
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
applyRoute(router.getCurrent());
