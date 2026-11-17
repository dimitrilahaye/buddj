/**
 * Carte budget simplifiée pour les templates et les sorties annuelles : nom, icône, montant alloué,
 * menu ⋮ Modifier / Supprimer. Pas de dépenses, pas de remaining, pas de pending, pas de toggle.
 * « Modifier » émet `buddj-template-budget-update-confirmed` ({ budgetId, name API, initialBalance }).
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { BuddjBudgetAddDrawerElement } from './buddj-budget-add-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';
import { createLineActionsMenu, listenLineMenuActions } from '../../shared/line-actions-menu.js';
import {
  PROJECTED_SIMULATION_INCLUDE_ATTR,
  PROJECTED_SIMULATION_ROW_ID_ATTR,
} from '../../shared/projected-simulation.js';

const SIMULATION_CHECKBOX_ID_PREFIX = 'buddj-template-budget-sim-cb-';

export class BuddjTemplateBudgetCard extends HTMLElement {
  static readonly tagName = 'buddj-template-budget-card';

  connectedCallback(): void {
    if (this.querySelector('buddj-line-item')) return;
    const icon = this.getAttribute('icon') ?? '💰';
    const name = this.getAttribute('name') ?? 'Budget';
    const allocated = this.getAttribute('allocated') ?? '0';
    const projectedSimulation = this.hasAttribute('projected-simulation');
    const cbId = SIMULATION_CHECKBOX_ID_PREFIX + Math.random().toString(36).slice(2, 11);

    this.classList.add('template-budget-card');

    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', icon);
    lineItem.setAttribute('label', name);
    lineItem.setAttribute('amount', allocated);
    if (projectedSimulation) {
      lineItem.setAttribute('checkable-for', cbId);
    }

    if (projectedSimulation) {
      const rowId = this.getAttribute('budget-id') ?? '';
      const included = this.getAttribute('simulation-included') !== 'false';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = cbId;
      checkbox.className = 'charge-taken';
      checkbox.setAttribute(PROJECTED_SIMULATION_INCLUDE_ATTR, 'budget');
      checkbox.setAttribute(PROJECTED_SIMULATION_ROW_ID_ATTR, rowId);
      checkbox.title = 'Exclure du total projeté';
      checkbox.setAttribute('aria-label', 'Exclure du total projeté');
      checkbox.checked = !included;
      checkbox.slot = 'prefix';
      lineItem.appendChild(checkbox);
    }

    lineItem.appendChild(createLineActionsMenu({ subject: 'le budget' }));
    this.appendChild(lineItem);

    if (projectedSimulation) this.attachProjectedSimulationListener();
    listenLineMenuActions(this, {
      onEdit: () => this.openEditDrawer(),
      onDelete: () => this.openDeleteConfirm(name),
    });
  }

  /** Ouvre la confirmation de suppression (utilisé aussi par les drawers de recherche). */
  requestDelete(): void {
    this.openDeleteConfirm(this.getAttribute('name') ?? '');
  }

  private openEditDrawer(): void {
    const budgetId = this.getAttribute('budget-id') ?? '';
    if (!budgetId) return;
    const drawer = document.getElementById('budget-add-drawer') as BuddjBudgetAddDrawerElement | null;
    drawer?.open({
      title: 'Modifier le budget',
      initialLabel: this.getAttribute('name') ?? '',
      initialAmount: formatEuros(parseFloat(this.getAttribute('allocated') ?? '0') || 0),
      initialEmoji: this.getAttribute('icon') || undefined,
      onValidate: (label, amountText, emoji) => {
        const initialBalance = parseEurosToNumber(amountText);
        if (initialBalance <= 0) {
          getToast()?.show({ message: 'Le montant doit être supérieur à 0', variant: 'warning' });
          return;
        }
        this.dispatchEvent(
          new CustomEvent('buddj-template-budget-update-confirmed', {
            bubbles: true,
            composed: true,
            detail: { budgetId, name: `${emoji.trim()} ${label.trim()}`.trim(), initialBalance },
          }),
        );
      },
    });
  }

  private attachProjectedSimulationListener(): void {
    const checkbox = this.querySelector<HTMLInputElement>(
      `input[${PROJECTED_SIMULATION_INCLUDE_ATTR}="budget"]`,
    );
    checkbox?.addEventListener('change', () => {
      const included = !checkbox.checked;
      if (included) this.setAttribute('simulation-included', '');
      else this.setAttribute('simulation-included', 'false');
      this.dispatchEvent(
        new CustomEvent('buddj-projected-simulation-change', {
          bubbles: true,
          composed: true,
          detail: {
            kind: 'budget' as const,
            rowId: this.getAttribute('budget-id') ?? '',
            included,
          },
        }),
      );
    });
  }

  private openDeleteConfirm(budgetName: string): void {
    const name = this.getAttribute('name') ?? budgetName;
    const budgetId = this.getAttribute('budget-id') ?? '';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous vraiment supprimer le budget "${name}" ?`,
      onConfirm: () => {
        this.dispatchEvent(
          new CustomEvent('buddj-template-budget-delete-confirmed', {
            bubbles: true,
            composed: true,
            detail: { budgetId, name },
          }),
        );
      },
      onCancel: () => {},
    });
  }
}

customElements.define(BuddjTemplateBudgetCard.tagName, BuddjTemplateBudgetCard);
