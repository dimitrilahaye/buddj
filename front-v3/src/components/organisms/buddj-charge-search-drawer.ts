/**
 * Drawer de recherche des charges. Délègue l’UI au shell buddj-search-drawer ;
 * ne contient que la logique de collecte et de création des lignes miroir pour les charges.
 */
import type { BuddjSearchDrawerElement, SearchDrawerEntry } from './buddj-search-drawer.js';

const CHECKBOX_ID_PREFIX = 'buddj-charge-search-cb-';
const EVENT_SEARCH = 'buddj-charge-search';

export type BuddjChargeSearchDrawerElement = HTMLElement & { open: () => void };

interface ChargeEntry extends SearchDrawerEntry {
  month: string;
  isTemplateContext?: boolean;
}

function getShell(el: HTMLElement): BuddjSearchDrawerElement | null {
  return el.querySelector('buddj-search-drawer') as BuddjSearchDrawerElement | null;
}

export class BuddjChargeSearchDrawer extends HTMLElement {
  static readonly tagName = 'buddj-charge-search-drawer';

  connectedCallback(): void {
    if (this.querySelector('buddj-search-drawer')) return;
    this.appendChild(document.createElement('buddj-search-drawer'));
  }

  open(): void {
    const shell = getShell(this);
    if (!shell) return;
    shell.open({
      title: 'Rechercher une charge',
      placeholder: 'Ex. Loyer, 650, 45…',
      inputLabel: 'Par intitulé ou montant',
      getEntries: () => this.collectChargeEntries(),
      getGroupKey: (e) => (e as ChargeEntry).month,
      createMirrorRow: (e) => this.createMirrorRow(e as ChargeEntry),
      rowWrapperClass: 'charge-item',
      eventName: EVENT_SEARCH,
    });
  }

  private createMirrorRow(entry: ChargeEntry): HTMLElement {
    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', entry.icon);
    lineItem.setAttribute('label', entry.label);
    lineItem.setAttribute('amount', entry.amount);

    if (!entry.isTemplateContext) {
      const cbId = CHECKBOX_ID_PREFIX + Math.random().toString(36).slice(2, 11);
      lineItem.setAttribute('checkable-for', cbId);

      const realCheckbox = entry.element.querySelector<HTMLInputElement>('.charge-taken');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = cbId;
      checkbox.className = 'charge-taken';
      checkbox.title = 'Marquer comme prélevé du compte (ne compte plus dans le solde)';
      checkbox.checked = realCheckbox?.checked ?? false;
      checkbox.slot = 'prefix';

      checkbox.addEventListener('change', () => {
        if (realCheckbox) {
          realCheckbox.checked = checkbox.checked;
          realCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      lineItem.appendChild(checkbox);
    }

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      entry.element.querySelector<HTMLElement>('buddj-icon-delete')?.click();
    });

    lineItem.appendChild(deleteBtn);
    return lineItem;
  }

  private collectChargeEntries(): ChargeEntry[] {
    const templateDetailEl = document.getElementById('template-detail');
    const recurringEl = document.getElementById('recurring');
    const templateDetailScreen = templateDetailEl?.closest('buddj-screen-template-detail');
    const isTemplateDetailVisible =
      templateDetailScreen != null && getComputedStyle(templateDetailScreen).display !== 'none';
    const main = isTemplateDetailVisible && templateDetailEl
      ? templateDetailEl
      : (recurringEl ?? templateDetailEl ?? null);
    if (!main) return [];
    const entries: ChargeEntry[] = [];
    const groups = main.querySelectorAll('.charge-group');
    const isTemplateDetail = main.id === 'template-detail';
    const templateName =
      isTemplateDetail && templateDetailScreen
        ? (templateDetailScreen.querySelector('h1.new-month-title')?.textContent?.trim() ?? 'Template')
        : '';
    const monthLabel = isTemplateDetail ? `Charges (${templateName})` : '';
    groups.forEach((group) => {
      const titleEl = group.querySelector('.charge-group-title');
      const month = isTemplateDetail ? monthLabel : (titleEl?.textContent?.trim() ?? '');
      const list = group.querySelector('ul.charge-list');
      if (!list) return;
      const items = list.querySelectorAll('buddj-charge-item');
      items.forEach((el) => {
        entries.push({
          month,
          label: el.getAttribute('label') ?? '',
          amount: el.getAttribute('amount') ?? '',
          icon: el.getAttribute('icon') ?? '💰',
          element: el as HTMLElement,
          isTemplateContext: isTemplateDetail,
        });
      });
    });
    return entries;
  }
}

customElements.define(BuddjChargeSearchDrawer.tagName, BuddjChargeSearchDrawer);
