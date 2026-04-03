/**
 * Drawer de recherche unique pour les pages Charges et Budgets (mois courant).
 * Mélange charges + dépenses depuis le mois courant du store (même écran non monté).
 * Groupes « Charges — … » / « Budgets — … ».
 */
import { formatEuros } from '../../shared/goal.js';
import { getCurrentMonth } from '../../application/month/month-state.js';
import type { MonthStore } from '../../application/month/month-store.js';
import type { BuddjSearchDrawerElement, SearchDrawerEntry } from './buddj-search-drawer.js';
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';

const CHARGE_CB_PREFIX = 'buddj-month-search-charge-cb-';
const EXPENSE_CB_PREFIX = 'buddj-month-search-expense-cb-';

export type BuddjMonthSearchDrawerElement = HTMLElement & {
  open: () => void;
  refresh: () => void;
  init: (o: { monthStore: MonthStore }) => void;
};

type MonthSearchEntry =
  | (SearchDrawerEntry & {
      kind: 'charge';
      month: string;
      outflowId: string;
      taken: boolean;
    })
  | (SearchDrawerEntry & {
      kind: 'expense';
      budgetName: string;
      expenseId: string;
      weeklyBudgetId: string;
      taken: boolean;
    });

function getShell(el: HTMLElement): BuddjSearchDrawerElement | null {
  return el.querySelector('buddj-search-drawer') as BuddjSearchDrawerElement | null;
}

export class BuddjMonthSearchDrawer extends HTMLElement {
  static readonly tagName = 'buddj-month-search-drawer';

  private _monthStore?: MonthStore;

  init({ monthStore }: { monthStore: MonthStore }): void {
    this._monthStore = monthStore;
  }

  connectedCallback(): void {
    if (this.querySelector('buddj-search-drawer')) return;
    this.appendChild(document.createElement('buddj-search-drawer'));
  }

  refresh(): void {
    getShell(this)?.refresh();
  }

  open(): void {
    const shell = getShell(this);
    if (!shell) return;
    shell.open({
      title: 'Rechercher',
      placeholder: 'Ex. Loyer, train, 35…',
      inputLabel: 'Par intitulé ou montant',
      getEntries: () => this.collectUnifiedEntries(),
      getGroupKey: (e) => {
        const x = e as MonthSearchEntry;
        if (x.kind === 'charge') return `Charges — ${x.month || 'Sans groupe'}`;
        return `Budgets — ${x.budgetName || 'Sans nom'}`;
      },
      getRowWrapperClass: (e) => ((e as MonthSearchEntry).kind === 'charge' ? 'charge-item' : 'expense-item'),
      createMirrorRow: (e) => {
        const x = e as MonthSearchEntry;
        return x.kind === 'charge' ? this.createChargeMirrorRow(x) : this.createExpenseMirrorRow(x);
      },
      eventNames: ['buddj-charge-search', 'buddj-expense-search'],
    });
  }

  private collectUnifiedEntries(): MonthSearchEntry[] {
    if (!this._monthStore) return [];
    const month = getCurrentMonth({ state: this._monthStore.getState() });
    if (!month) return [];
    const out: MonthSearchEntry[] = [];
    for (const g of month.chargeGroups ?? []) {
      const monthLabel = g.previous ? 'Mois précédents' : (g.title?.trim() ?? '');
      for (const c of g.charges) {
        const id = c.id?.trim() ?? '';
        if (!id) continue;
        out.push({
          kind: 'charge',
          month: monthLabel,
          outflowId: id,
          taken: !!c.taken,
          label: c.label,
          amount: String(c.amount),
          icon: c.icon || '💰',
        });
      }
    }
    for (const g of month.budgetGroups ?? []) {
      for (const b of g.budgets) {
        const wid = b.weeklyBudgetId?.trim() ?? '';
        if (!wid) continue;
        for (const exp of b.expenses) {
          const eid = exp.id?.trim() ?? '';
          if (!eid) continue;
          out.push({
            kind: 'expense',
            budgetName: b.name,
            expenseId: eid,
            weeklyBudgetId: wid,
            taken: !!exp.taken,
            label: exp.desc,
            amount: String(exp.amount),
            icon: exp.icon || '💰',
          });
        }
      }
    }
    return out;
  }

  private createChargeMirrorRow(entry: Extract<MonthSearchEntry, { kind: 'charge' }>): HTMLElement {
    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', entry.icon);
    lineItem.setAttribute('label', entry.label);
    lineItem.setAttribute('amount', entry.amount);

    const cbId = CHARGE_CB_PREFIX + Math.random().toString(36).slice(2, 11);
    lineItem.setAttribute('checkable-for', cbId);

    const getRealCheckbox = (): HTMLInputElement | null => {
      const oid = entry.outflowId;
      if (oid) {
        return document.querySelector(
          `buddj-charge-item[outflow-id="${CSS.escape(oid)}"] .charge-taken`,
        ) as HTMLInputElement | null;
      }
      return null;
    };

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = cbId;
    checkbox.className = 'charge-taken';
    checkbox.title = 'Marquer comme prélevé du compte (ne compte plus dans le solde)';
    checkbox.checked = getRealCheckbox()?.checked ?? entry.taken;
    checkbox.slot = 'prefix';

    checkbox.addEventListener('change', () => {
      const real = getRealCheckbox();
      if (real) {
        real.checked = checkbox.checked;
        real.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      if (entry.outflowId && this._monthStore) {
        this._monthStore.emitAction('putOutflowsChecking', {
          outflowId: entry.outflowId,
          isChecked: checkbox.checked,
        });
      }
    });

    lineItem.appendChild(checkbox);

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const oid = entry.outflowId;
      const realDel =
        oid &&
        (document.querySelector(
          `buddj-charge-item[outflow-id="${CSS.escape(oid)}"] buddj-icon-delete`,
        ) as HTMLElement | null);
      if (realDel) {
        realDel.click();
        return;
      }
      const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
      modal?.show({
        title: `Voulez-vous vraiment supprimer la charge "${entry.label}" ?`,
        onConfirm: () => {
          if (oid && this._monthStore) {
            this._monthStore.emitAction('deleteOutflow', { outflowId: oid });
          }
        },
        onCancel: () => {},
      });
    });

    lineItem.appendChild(deleteBtn);
    return lineItem;
  }

  private createExpenseMirrorRow(entry: Extract<MonthSearchEntry, { kind: 'expense' }>): HTMLElement {
    const cbId = EXPENSE_CB_PREFIX + Math.random().toString(36).slice(2, 11);
    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', entry.icon);
    lineItem.setAttribute('label', entry.label);
    lineItem.setAttribute('amount', String(parseFloat(String(entry.amount)) || 0));
    lineItem.setAttribute('checkable-for', cbId);

    const getExpenseCheckbox = (): HTMLInputElement | null => {
      const eid = entry.expenseId;
      if (!eid) return null;
      return document.querySelector(
        `#budgets buddj-expense-item[expense-id="${CSS.escape(eid)}"] .expense-taken`,
      ) as HTMLInputElement | null;
    };

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = cbId;
    checkbox.className = 'expense-taken';
    checkbox.title = 'Appuyer pour marquer comme débité ou non';
    checkbox.setAttribute(
      'aria-label',
      `Dépense ${entry.label}, ${formatEuros(parseFloat(String(entry.amount)) || 0)}`,
    );
    checkbox.checked = getExpenseCheckbox()?.checked ?? entry.taken;
    checkbox.slot = 'prefix';

    checkbox.addEventListener('change', () => {
      const real = getExpenseCheckbox();
      if (real) {
        real.checked = checkbox.checked;
        real.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      if (entry.expenseId && entry.weeklyBudgetId && this._monthStore) {
        this._monthStore.emitAction('putExpensesChecking', {
          expenseId: entry.expenseId,
          weeklyBudgetId: entry.weeklyBudgetId,
          isChecked: checkbox.checked,
        });
      }
    });

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const eid = entry.expenseId;
      const wid = entry.weeklyBudgetId;
      const realDel =
        eid &&
        (document.querySelector(
          `#budgets buddj-expense-item[expense-id="${CSS.escape(eid)}"] buddj-icon-delete`,
        ) as HTMLElement | null);
      if (realDel) {
        realDel.click();
        return;
      }
      const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
      modal?.show({
        title: `Voulez-vous vraiment supprimer la dépense "${entry.label}" ?`,
        onConfirm: () => {
          if (eid && wid && this._monthStore) {
            this._monthStore.emitAction('deleteExpense', { expenseId: eid, weeklyBudgetId: wid });
          }
        },
        onCancel: () => {},
      });
    });

    lineItem.appendChild(checkbox);
    lineItem.appendChild(deleteBtn);
    return lineItem;
  }
}

customElements.define(BuddjMonthSearchDrawer.tagName, BuddjMonthSearchDrawer);
