/**
 * Carte budget repliable (details/summary) : titre, actions, totaux, pending, liste de dépenses.
 * Les enfants <buddj-expense-item> sont rendus dans la liste.
 * Attribut allocated : nombre (montant alloué). remaining et pendingCount sont calculés :
 * - remaining = allocated − somme des montants des dépenses
 * - pendingCount = nombre de dépenses non débitées (sans l’attribut taken / checkbox non cochée).
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { BudgetEditDrawerOnValidate } from './buddj-budget-edit-drawer.js';
import type { BuddjExpenseAddDrawerElement } from './buddj-expense-add-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';

export class BuddjBudgetCard extends HTMLElement {
  static readonly tagName = 'buddj-budget-card';

  connectedCallback(): void {
    const name = this.getAttribute('name') ?? 'Budget';
    const icon = this.getAttribute('icon') ?? '💰';
    const allocatedRaw = this.getAttribute('allocated') ?? '0';
    const allocated = String(parseFloat(allocatedRaw) || 0);
    const expenseItems = Array.from(this.querySelectorAll('buddj-expense-item'));
    const isExpenseChecked = (el: Element) =>
      (el.querySelector('.expense-taken') as HTMLInputElement | null)?.checked ?? (el.hasAttribute('taken') && el.getAttribute('taken') !== 'false');
    const sumExpenses = expenseItems
      .filter((el) => !(el as HTMLElement).hasAttribute('empty'))
      .reduce((sum, el) => sum + (parseFloat(el.getAttribute('amount') ?? '0') || 0), 0);
    const remaining = String(Math.round((parseFloat(allocated) - sumExpenses) * 100) / 100);
    const pendingCount = expenseItems.filter((el) => !(el as HTMLElement).hasAttribute('empty') && !isExpenseChecked(el)).length;
    expenseItems.sort((a, b) => {
      const aChecked = isExpenseChecked(a);
      const bChecked = isExpenseChecked(b);
      if (aChecked !== bChecked) return aChecked ? 1 : -1;
      return (a.getAttribute('desc') ?? '').localeCompare(b.getAttribute('desc') ?? '', undefined, { sensitivity: 'base' });
    });
    const details = document.createElement('details');
    details.className = 'budget-details';
    details.innerHTML = `
      <summary class="budget-summary">
        <div class="budget-card-header">
          <div class="budget-card-title-row">
            <span class="budget-toggle-icon" aria-hidden="true">▼</span>
            <h2 class="budget-name"><span class="budget-icon" aria-hidden="true">${escapeHtml(icon)}</span> <span class="budget-name-text">${escapeHtml(name)}</span></h2>
            <div class="budget-card-actions">
              <buddj-icon-add title="Ajouter une dépense dans ce budget" aria-label="Ajouter une dépense dans ce budget"></buddj-icon-add>
              <buddj-actions-dropdown position="right" class="budget-card-menu-wrap">
                <button type="button" class="btn btn-menu-dots" slot="trigger" title="Options du budget" aria-label="Options du budget">⋮</button>
                <button type="button" slot="items" data-action="edit">Modifier</button>
                <button type="button" slot="items" data-action="transfer" class="goal-injection-dropdown-item">
                  <span class="goal-injection-dropdown-title">Transférer un montant</span>
                  <span class="goal-injection-dropdown-text">Vous souhaitez ré-équilibrer vos comptes ? Alors transférez tout ou partie du reste de ce budget vers un autre de vos budgets ou vers votre solde prévisionnel.</span>
                </button>
                <hr slot="items" class="dropdown-menu-separator" aria-hidden="true" />
                <button type="button" slot="items" data-action="delete" data-variant="danger">Supprimer</button>
              </buddj-actions-dropdown>
            </div>
          </div>
          <buddj-allocated-remaining allocated="${escapeAttr(allocated)}" remaining="${escapeAttr(remaining)}"></buddj-allocated-remaining>
          <buddj-budget-pending count="${escapeAttr(String(pendingCount))}"></buddj-budget-pending>
        </div>
      </summary>
      <ul class="expense-list"></ul>
    `;
    const ul = details.querySelector('ul')!;
    for (const item of expenseItems) {
      ul.appendChild(item);
    }
    this.innerHTML = '';
    this.appendChild(details);
    this.setAttribute('remaining', remaining);
    this.attachDropdownListener();
    this.attachAddExpenseListener();
    this.attachTakenChangeListener(details, isExpenseChecked);
  }

  private attachDropdownListener(): void {
    this.addEventListener('buddj-dropdown-action', (e: Event) => {
      const ev = e as CustomEvent<{ actionId: string; targetId: string }>;
      const actionId = ev.detail?.actionId;
      if (actionId === 'edit') this.openEditDrawer();
      else if (actionId === 'delete') this.openDeleteConfirm();
      else if (actionId === 'transfer') this.openTransferDrawer();
    });
  }

  private openEditDrawer(): void {
    const currentName = this.getAttribute('name') ?? this.querySelector('.budget-name-text')?.textContent ?? 'Budget';
    const currentIcon = this.getAttribute('icon') ?? this.querySelector('.budget-icon')?.textContent ?? '💰';
    const drawer = document.getElementById('budget-edit-drawer') as HTMLElement & {
      open: (o: { initialLabel: string; initialEmoji?: string; onValidate: BudgetEditDrawerOnValidate }) => void;
    };
    drawer?.open({
      initialLabel: currentName,
      initialEmoji: currentIcon,
      onValidate: (newName: string, newEmoji: string) => {
        const weeklyBudgetId = this.getAttribute('weekly-budget-id') ?? '';
        const apiName = `${newEmoji} ${newName}`.trim();
        if (weeklyBudgetId) {
          this.dispatchEvent(
            new CustomEvent('buddj-budget-update-confirmed', {
              bubbles: true,
              composed: true,
              detail: { budgetId: weeklyBudgetId, name: apiName },
            }),
          );
          return;
        }
        this.setAttribute('name', newName);
        this.setAttribute('icon', newEmoji);
        const nameEl = this.querySelector('.budget-name-text');
        if (nameEl) nameEl.textContent = newName;
        const iconEl = this.querySelector('.budget-icon');
        if (iconEl) iconEl.textContent = newEmoji;
      },
    });
  }

  private openDeleteConfirm(): void {
    const name = this.getAttribute('name') ?? this.querySelector('.budget-name-text')?.textContent ?? 'Budget';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous vraiment supprimer le budget "${name}" ?`,
      onConfirm: () => {
        const weeklyBudgetId = this.getAttribute('weekly-budget-id') ?? '';
        if (weeklyBudgetId) {
          this.dispatchEvent(
            new CustomEvent('buddj-budget-delete-confirmed', {
              bubbles: true,
              composed: true,
              detail: { budgetId: weeklyBudgetId },
            }),
          );
          return;
        }
        const toast = getToast();
        toast?.show({ message: 'Le budget a bien été supprimé' });
      },
      onCancel: () => {},
    });
  }

  private attachTakenChangeListener(details: HTMLDetailsElement, isExpenseChecked: (el: Element) => boolean): void {
    this.addEventListener('buddj-expense-taken-change', () => {
      const ul = details.querySelector('ul.expense-list');
      if (!ul) return;
      const items = Array.from(ul.querySelectorAll('buddj-expense-item'));
      items.sort((a, b) => {
        const aChecked = isExpenseChecked(a);
        const bChecked = isExpenseChecked(b);
        if (aChecked !== bChecked) return aChecked ? 1 : -1;
        return (a.getAttribute('desc') ?? '').localeCompare(b.getAttribute('desc') ?? '', undefined, { sensitivity: 'base' });
      });
      items.forEach((el) => ul.appendChild(el));
      const pendingCount = items.filter((el) => !(el as HTMLElement).hasAttribute('empty') && !isExpenseChecked(el)).length;
      const pendingEl = this.querySelector('buddj-budget-pending');
      if (pendingEl) pendingEl.setAttribute('count', String(pendingCount));
    });
  }

  private openTransferDrawer(): void {
    const maxAmount = formatEuros(parseFloat(this.getAttribute('remaining') ?? '0') || 0);
    const allCards = Array.from(document.querySelectorAll('#budgets buddj-budget-card'));
    const otherBudgets = allCards
      .filter((card) => card !== this)
      .map((card) => ({
        id: card.getAttribute('weekly-budget-id') ?? '',
        label: card.getAttribute('name') ?? 'Budget',
        icon: card.getAttribute('icon') ?? '💰',
        currentAmount: formatEuros(parseFloat(card.getAttribute('remaining') ?? '0') || 0),
      }))
      .filter((d) => d.id);
      const afterChargesEl = document.querySelector('buddj-summary-bar .summary-balances-projected');
    const soldeFinMois = afterChargesEl?.textContent?.trim() ?? '0 €';
    const accountId =
      this.closest('buddj-screen-budgets')?.getAttribute('current-account-id') ??
      document.querySelector('#budgets')?.getAttribute('data-account-id') ??
      '';
    const destinations = [
      ...otherBudgets,
      { id: accountId, label: 'Solde fin de mois' as string, currentAmount: soldeFinMois },
    ].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
    const sourceBudgetId = this.getAttribute('weekly-budget-id') ?? '';
    if (!sourceBudgetId || !accountId) return;
    const drawer = document.getElementById('transfer-drawer') as HTMLElement & {
      open: (o: {
        source: 'outflows' | 'budget';
        maxAmount: string;
        maxLabel: string;
        destinations: { id: string; label: string; icon?: string; currentAmount: string }[];
        onTransfer: (amount: string, destinationId: string) => void;
      }) => void;
    };
    drawer?.open({
      source: 'budget',
      maxAmount,
      maxLabel: '',
      destinations,
      onTransfer: (amount: string, destinationId: string) => {
        if (!destinationId) return;
        const destinationType = otherBudgets.some((b) => b.id === destinationId) ? 'weekly-budget' : 'account';
        const amountNum = parseEurosToNumber(amount);
        if (amountNum <= 0) return;
        this.dispatchEvent(
          new CustomEvent('buddj-budget-transfer-confirmed', {
            bubbles: true,
            composed: true,
            detail: {
              fromWeeklyBudgetId: sourceBudgetId,
              destinationId,
              destinationType,
              amount: amountNum,
            },
          }),
        );
      },
    });
  }

  private attachAddExpenseListener(): void {
    const btn = this.querySelector('buddj-icon-add');
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const drawer = document.getElementById('expense-add-drawer') as BuddjExpenseAddDrawerElement;
      const weeklyBudgetId = this.getAttribute('weekly-budget-id') ?? '';
      drawer?.open({ weeklyBudgetId });
    });
  }

}

customElements.define(BuddjBudgetCard.tagName, BuddjBudgetCard);
