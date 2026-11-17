/**
 * Drawer de recherche des sorties annuelles : charges et budgets de tous les mois.
 * Résultats groupés par mois, avec le nom du mois en en-tête de chaque section.
 */
import { createLineActionsMenu, listenLineMenuActions } from '../../shared/line-actions-menu.js';
import type { BuddjSearchDrawerElement, SearchDrawerEntry } from './buddj-search-drawer.js';

const EVENT_SEARCH = 'buddj-annual-outflows-search';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export type BuddjAnnualOutflowsSearchDrawerElement = HTMLElement & { open: () => void };

interface AnnualEntry extends SearchDrawerEntry {
  monthName: string;
}

function getShell(el: HTMLElement): BuddjSearchDrawerElement | null {
  return el.querySelector('buddj-search-drawer') as BuddjSearchDrawerElement | null;
}

type LineRowElement = HTMLElement & { requestDelete?: () => void; requestEdit?: () => void };

export class BuddjAnnualOutflowsSearchDrawer extends HTMLElement {
  static readonly tagName = 'buddj-annual-outflows-search-drawer';

  connectedCallback(): void {
    if (this.querySelector('buddj-search-drawer')) return;
    this.appendChild(document.createElement('buddj-search-drawer'));
  }

  /** Recalcule les résultats (ex. après une modification) en conservant la requête. */
  refresh(): void {
    getShell(this)?.refresh();
  }

  open(): void {
    const shell = getShell(this);
    if (!shell) return;
    shell.open({
      title: 'Rechercher dans les sorties annuelles',
      placeholder: 'Ex. Vacances, Croquettes, 350…',
      inputLabel: 'Par intitulé ou montant',
      getEntries: () => this.collectEntries(),
      getGroupKey: (e) => (e as AnnualEntry).monthName,
      createMirrorRow: (e) => this.createMirrorRow(e as AnnualEntry),
      rowWrapperClass: 'annual-outflows-search-item',
      eventName: EVENT_SEARCH,
    });
  }

  private createMirrorRow(entry: AnnualEntry): HTMLElement {
    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', entry.icon);
    lineItem.setAttribute('label', entry.label);
    lineItem.setAttribute('amount', String(parseFloat(String(entry.amount)) || 0));

    const row = (): LineRowElement | null | undefined => entry.element as LineRowElement | null | undefined;
    lineItem.appendChild(createLineActionsMenu({ subject: 'la ligne' }));
    listenLineMenuActions(lineItem, {
      onEdit: () => row()?.requestEdit?.(),
      onDelete: () => row()?.requestDelete?.(),
    });
    return lineItem;
  }

  private collectEntries(): AnnualEntry[] {
    const main = document.getElementById('annual-outflows');
    if (!main) return [];
    const entries: AnnualEntry[] = [];
    const monthBlocks = main.querySelectorAll('details.annual-outflows-month');

    monthBlocks.forEach((block) => {
      const indexStr = block.getAttribute('data-month-index');
      const monthIndex = indexStr != null ? parseInt(indexStr, 10) : -1;
      const monthName = monthIndex >= 0 && monthIndex < MONTH_NAMES.length ? MONTH_NAMES[monthIndex]! : '';

      block.querySelectorAll('buddj-charge-item').forEach((el) => {
        entries.push({
          monthName,
          label: el.getAttribute('label') ?? '',
          amount: el.getAttribute('amount') ?? '0',
          icon: el.getAttribute('icon') ?? '💰',
          element: el as HTMLElement,
        });
      });

      block.querySelectorAll('buddj-template-budget-card').forEach((el) => {
        entries.push({
          monthName,
          label: el.getAttribute('name') ?? '',
          amount: el.getAttribute('allocated') ?? '0',
          icon: el.getAttribute('icon') ?? '💰',
          element: el as HTMLElement,
        });
      });
    });

    return entries;
  }
}

customElements.define(BuddjAnnualOutflowsSearchDrawer.tagName, BuddjAnnualOutflowsSearchDrawer);
