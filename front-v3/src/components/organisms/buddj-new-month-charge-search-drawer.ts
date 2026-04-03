/**
 * Drawer de recherche des charges du template (page nouveau mois).
 * Délègue l’UI au shell buddj-search-drawer ; collecte les lignes dans la section « Charges du template ».
 */
import type { BuddjSearchDrawerElement, SearchDrawerEntry } from './buddj-search-drawer.js';

const GROUP_LABEL = 'Charges du template';

export type BuddjNewMonthChargeSearchDrawerElement = HTMLElement & { open: () => void };

interface NewMonthChargeEntry extends SearchDrawerEntry {
  id: string;
  element: HTMLElement;
}

function getShell(el: HTMLElement): BuddjSearchDrawerElement | null {
  return el.querySelector('buddj-search-drawer') as BuddjSearchDrawerElement | null;
}

export class BuddjNewMonthChargeSearchDrawer extends HTMLElement {
  static readonly tagName = 'buddj-new-month-charge-search-drawer';

  connectedCallback(): void {
    if (this.querySelector('buddj-search-drawer')) return;
    this.appendChild(document.createElement('buddj-search-drawer'));
  }

  open(): void {
    const shell = getShell(this);
    if (!shell) return;
    shell.open({
      title: 'Rechercher une charge du template',
      placeholder: 'Ex. Loyer, 650, 45…',
      inputLabel: 'Par intitulé ou montant',
      getEntries: () => this.collectEntries(),
      getGroupKey: () => GROUP_LABEL,
      createMirrorRow: (e) => this.createMirrorRow(e as NewMonthChargeEntry),
      rowWrapperClass: 'new-month-row new-month-row--charge',
    });
  }

  private createMirrorRow(entry: NewMonthChargeEntry): HTMLElement {
    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', entry.icon);
    lineItem.setAttribute('label', entry.label);
    lineItem.setAttribute('amount', entry.amount);
    lineItem.setAttribute('no-inner-padding', '');

    const realRow = entry.element;
    if (realRow.classList.contains('new-month-row--hidden')) {
      lineItem.classList.add('new-month-row--hidden');
    }
    const includeBtn = realRow.querySelector<HTMLButtonElement>('.new-month-btn-include-toggle');
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'new-month-row-actions budget-card-actions';
    actionsWrap.setAttribute('slot', 'actions');

    const editBtn = document.createElement('buddj-icon-edit');
    editBtn.setAttribute('title', 'Modifier la charge');
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      realRow.querySelector('buddj-icon-edit')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer la charge');
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      realRow.querySelector('buddj-icon-delete')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const isIncluded = includeBtn?.classList.contains('new-month-btn-rappel-toggle--on') ?? true;
    const includeToggle = document.createElement('button');
    includeToggle.type = 'button';
    includeToggle.className = `btn new-month-btn-include-toggle new-month-btn-rappel-toggle ${isIncluded ? 'new-month-btn-rappel-toggle--on' : ''}`;
    includeToggle.textContent = isIncluded ? 'Inclus' : 'Exclus';
    includeToggle.title = isIncluded ? 'Exclure du solde prévisionnel' : 'Inclure dans le solde prévisionnel';
    includeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const realBtn = realRow.querySelector<HTMLButtonElement>('.new-month-btn-include-toggle');
      realBtn?.click();
      const wasIncluded = includeToggle.classList.contains('new-month-btn-rappel-toggle--on');
      const nowIncluded = !wasIncluded;
      includeToggle.classList.toggle('new-month-btn-rappel-toggle--on', nowIncluded);
      includeToggle.textContent = nowIncluded ? 'Inclus' : 'Exclus';
      includeToggle.title = nowIncluded ? 'Exclure du solde prévisionnel' : 'Inclure dans le solde prévisionnel';
      lineItem.classList.toggle('new-month-row--hidden', !nowIncluded);
    });

    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(deleteBtn);
    actionsWrap.appendChild(includeToggle);
    lineItem.appendChild(actionsWrap);
    return lineItem;
  }

  private collectEntries(): NewMonthChargeEntry[] {
    const section = document.querySelector('[data-new-month-section="template-charges"]');
    if (!section) return [];
    const list = section.querySelector('.new-month-list');
    if (!list) return [];
    const items = list.querySelectorAll('buddj-line-item.new-month-row--charge');
    const entries: NewMonthChargeEntry[] = [];
    items.forEach((el) => {
      entries.push({
        id: el.getAttribute('data-id') ?? '',
        label: el.getAttribute('label') ?? '',
        amount: el.getAttribute('amount') ?? '',
        icon: el.getAttribute('icon') ?? '💰',
        element: el as HTMLElement,
      });
    });
    return entries;
  }
}

customElements.define(BuddjNewMonthChargeSearchDrawer.tagName, BuddjNewMonthChargeSearchDrawer);
