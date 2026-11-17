/**
 * Une ligne de dépense dans un budget (toggle débité, libellé, montant, menu ⋮ Modifier / Supprimer).
 * Utilise buddj-line-item ; logique checkbox, édition et suppression côté parent (ce composant).
 * Cas vide (empty) : affiche un placeholder sans line-item.
 * Attribut amount : nombre (buddj-line-item formate en « X € »).
 */
import type { BuddjConfirmModalElement } from './buddj-confirm-modal.js';
import { getToast } from '../atoms/buddj-toast.js';
import { formatEuros } from '../../shared/goal.js';
import { createLineActionsMenu, listenLineMenuActions } from '../../shared/line-actions-menu.js';
import { openExpenseEditDrawer } from '../../shared/line-edit-drawers.js';

export class BuddjExpenseItem extends HTMLElement {
  static readonly tagName = 'buddj-expense-item';

  connectedCallback(): void {
    if (this.querySelector('buddj-line-item') || this.querySelector('.expense-item--empty')) return;
    const icon = this.getAttribute('icon') ?? '';
    const desc = this.getAttribute('desc') ?? '';
    const amountNum = parseFloat(this.getAttribute('amount') ?? '0') || 0;
    const taken = this.hasAttribute('taken') ? this.getAttribute('taken') !== 'false' : false;
    const empty = this.hasAttribute('empty');

    this.classList.add('expense-item');
    if (empty) {
      this.classList.add('expense-item--empty');
      this.innerHTML = `<span class="expense-desc">${escapeHtml(desc || "Aucune dépense pour l'instant")}</span>`;
      return;
    }

    const cbId = 'buddj-expense-cb-' + Math.random().toString(36).slice(2, 11);

    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', icon);
    lineItem.setAttribute('label', desc);
    lineItem.setAttribute('amount', String(amountNum));
    lineItem.setAttribute('checkable-for', cbId);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = cbId;
    checkbox.className = 'expense-taken';
    checkbox.title = 'Appuyer pour marquer comme débité ou non';
    checkbox.setAttribute('aria-label', `Dépense ${desc}, ${formatEuros(amountNum)}`);
    checkbox.checked = taken;
    checkbox.slot = 'prefix';

    lineItem.appendChild(checkbox);
    lineItem.appendChild(createLineActionsMenu({ subject: 'la dépense' }));
    this.appendChild(lineItem);

    this.attachToggleListener();
    listenLineMenuActions(this, {
      onEdit: () => this.openEditDrawer(),
      onDelete: () => this.openDeleteConfirm(desc),
    });
  }

  /** Ouvre l’édition (utilisé aussi par les drawers de recherche). */
  requestEdit(): void {
    this.openEditDrawer();
  }

  private openEditDrawer(): void {
    const expenseId = this.getAttribute('expense-id') ?? '';
    const weeklyBudgetId = this.closest('buddj-budget-card')?.getAttribute('weekly-budget-id') ?? '';
    if (!expenseId || !weeklyBudgetId) return;
    openExpenseEditDrawer({
      label: this.getAttribute('desc') ?? '',
      icon: this.getAttribute('icon') ?? '',
      amount: parseFloat(this.getAttribute('amount') ?? '0') || 0,
      onSubmit: (label, amount) => {
        this.dispatchEvent(
          new CustomEvent('buddj-expense-update-confirmed', {
            bubbles: true,
            composed: true,
            detail: { expenseId, weeklyBudgetId, label, amount },
          }),
        );
      },
    });
  }

  private attachToggleListener(): void {
    const checkbox = this.querySelector<HTMLInputElement>('.expense-taken');
    checkbox?.addEventListener('change', () => {
      if (checkbox.checked) this.setAttribute('taken', '');
      else this.removeAttribute('taken');
      const toast = getToast();
      const message = checkbox.checked ? 'La dépense a bien été cochée' : 'La dépense a bien été décochée';
      toast?.show({ message });
      const expenseId = this.getAttribute('expense-id') ?? '';
      const card = this.closest('buddj-budget-card');
      const weeklyBudgetId = card?.getAttribute('weekly-budget-id') ?? '';
      this.dispatchEvent(
        new CustomEvent('buddj-expense-taken-change', {
          bubbles: true,
          detail: { expenseId, weeklyBudgetId, isChecked: checkbox.checked },
        }),
      );
    });
  }

  /** Ouvre la confirmation de suppression (utilisé aussi par les drawers de recherche). */
  requestDelete(): void {
    this.openDeleteConfirm(this.getAttribute('desc') ?? '');
  }

  private openDeleteConfirm(expenseDesc: string): void {
    const desc = this.getAttribute('desc') ?? expenseDesc;
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous vraiment supprimer la dépense "${desc}" ?`,
      onConfirm: () => {
        const expenseId = this.getAttribute('expense-id') ?? '';
        const card = this.closest('buddj-budget-card');
        const weeklyBudgetId = card?.getAttribute('weekly-budget-id') ?? '';
        if (expenseId && weeklyBudgetId) {
          this.dispatchEvent(
            new CustomEvent('buddj-expense-delete-confirmed', {
              bubbles: true,
              detail: { expenseId, weeklyBudgetId },
            }),
          );
          return;
        }
        const toast = getToast();
        toast?.show({ message: 'La dépense a bien été supprimée' });
      },
      onCancel: () => {},
    });
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

customElements.define(BuddjExpenseItem.tagName, BuddjExpenseItem);
