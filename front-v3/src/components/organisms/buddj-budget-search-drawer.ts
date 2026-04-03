/**
 * Drawer de recherche des budgets (template). Recherche par intitulé ou montant alloué
 * parmi les buddj-template-budget-card du #template-detail.
 */
import type { BuddjSearchDrawerElement, SearchDrawerEntry } from './buddj-search-drawer.js';

const EVENT_SEARCH = 'buddj-budget-search';

export type BuddjBudgetSearchDrawerElement = HTMLElement & { open: () => void };

interface BudgetEntry extends SearchDrawerEntry {
  groupKey: string;
}

function getShell(el: HTMLElement): BuddjSearchDrawerElement | null {
  return el.querySelector('buddj-search-drawer') as BuddjSearchDrawerElement | null;
}

export class BuddjBudgetSearchDrawer extends HTMLElement {
  static readonly tagName = 'buddj-budget-search-drawer';

  connectedCallback(): void {
    if (this.querySelector('buddj-search-drawer')) return;
    this.appendChild(document.createElement('buddj-search-drawer'));
  }

  open(): void {
    const shell = getShell(this);
    if (!shell) return;
    shell.open({
      title: 'Rechercher un budget',
      placeholder: 'Ex. Sorties, Vacances, 120…',
      inputLabel: 'Par intitulé ou montant',
      getEntries: () => this.collectBudgetEntries(),
      getGroupKey: (e) => (e as BudgetEntry).groupKey,
      createMirrorRow: (e) => this.createMirrorRow(e as BudgetEntry),
      rowWrapperClass: 'budget-item',
      eventName: EVENT_SEARCH,
    });
  }

  private createMirrorRow(entry: BudgetEntry): HTMLElement {
    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', entry.icon);
    lineItem.setAttribute('label', entry.label);
    lineItem.setAttribute('amount', String(parseFloat(String(entry.amount)) || 0));

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      entry.element?.querySelector<HTMLElement>('buddj-icon-delete')?.click();
    });

    lineItem.appendChild(deleteBtn);
    return lineItem;
  }

  private collectBudgetEntries(): BudgetEntry[] {
    const main = document.getElementById('template-detail');
    if (!main) return [];
    const templateDetailScreen = main.closest('buddj-screen-template-detail');
    const templateName = templateDetailScreen?.querySelector('h1.new-month-title')?.textContent?.trim() ?? 'Template';
    const groupKey = `Budgets (${templateName})`;
    const entries: BudgetEntry[] = [];
    const cards = main.querySelectorAll('buddj-template-budget-card');
    cards.forEach((card) => {
      entries.push({
        groupKey,
        label: card.getAttribute('name') ?? '',
        amount: card.getAttribute('allocated') ?? '0',
        icon: card.getAttribute('icon') ?? '💰',
        element: card as HTMLElement,
      });
    });
    return entries;
  }
}

customElements.define(BuddjBudgetSearchDrawer.tagName, BuddjBudgetSearchDrawer);
