/**
 * Drawer de recherche des dépenses. Délègue l’UI au shell buddj-search-drawer ;
 * ne contient que la logique de collecte et de création des lignes miroir pour les dépenses.
 */
import type { BuddjSearchDrawerElement, SearchDrawerEntry } from './buddj-search-drawer.js';

const CHECKBOX_ID_PREFIX = 'buddj-expense-search-cb-';
const EVENT_SEARCH = 'buddj-expense-search';

export type BuddjExpenseSearchDrawerElement = HTMLElement & { open: () => void };

interface ExpenseEntry extends SearchDrawerEntry {
  budgetName: string;
}

function getShell(el: HTMLElement): BuddjSearchDrawerElement | null {
  return el.querySelector('buddj-search-drawer') as BuddjSearchDrawerElement | null;
}

export class BuddjExpenseSearchDrawer extends HTMLElement {
  static readonly tagName = 'buddj-expense-search-drawer';

  connectedCallback(): void {
    if (this.querySelector('buddj-search-drawer')) return;
    this.appendChild(document.createElement('buddj-search-drawer'));
  }

  open(): void {
    const shell = getShell(this);
    if (!shell) return;
    shell.open({
      title: 'Rechercher une dépense',
      placeholder: 'Ex. Billet train, 35…',
      inputLabel: 'Par intitulé ou montant',
      getEntries: () => this.collectExpenseEntries(),
      getGroupKey: (e) => (e as ExpenseEntry).budgetName,
      createMirrorRow: (e) => this.createMirrorRow(e as ExpenseEntry),
      rowWrapperClass: 'expense-item',
      eventName: EVENT_SEARCH,
    });
  }

  private createMirrorRow(entry: ExpenseEntry): HTMLElement {
    const cbId = CHECKBOX_ID_PREFIX + Math.random().toString(36).slice(2, 11);
    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', entry.icon);
    lineItem.setAttribute('label', entry.label);
    lineItem.setAttribute('amount', String(parseFloat(String(entry.amount)) || 0));
    lineItem.setAttribute('checkable-for', cbId);

    const realCheckbox = entry.element.querySelector<HTMLInputElement>('.expense-taken');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = cbId;
    checkbox.className = 'expense-taken';
    checkbox.title = 'Appuyer pour marquer comme débité ou non';
    checkbox.checked = realCheckbox?.checked ?? false;
    checkbox.slot = 'prefix';

    checkbox.addEventListener('change', () => {
      if (realCheckbox) {
        realCheckbox.checked = checkbox.checked;
        realCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      entry.element.querySelector<HTMLElement>('buddj-icon-delete')?.click();
    });

    lineItem.appendChild(checkbox);
    lineItem.appendChild(deleteBtn);
    return lineItem;
  }

  private collectExpenseEntries(): ExpenseEntry[] {
    const main = document.getElementById('budgets');
    if (!main) return [];
    const entries: ExpenseEntry[] = [];
    const cards = main.querySelectorAll('buddj-budget-card');
    cards.forEach((card) => {
      const budgetName = card.getAttribute('name') ?? '';
      const items = card.querySelectorAll('buddj-expense-item');
      items.forEach((el) => {
        if (el.hasAttribute('empty')) return;
        entries.push({
          budgetName,
          label: el.getAttribute('desc') ?? '',
          amount: el.getAttribute('amount') ?? '',
          icon: el.getAttribute('icon') ?? '💰',
          element: el as HTMLElement,
        });
      });
    });
    return entries;
  }
}

customElements.define(BuddjExpenseSearchDrawer.tagName, BuddjExpenseSearchDrawer);
