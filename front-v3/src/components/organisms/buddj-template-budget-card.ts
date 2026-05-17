/**
 * Carte budget simplifiée pour les templates : nom, icône, montant alloué, suppression uniquement.
 * Pas de dépenses, pas de remaining, pas de pending, pas de toggle.
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
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

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';

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

    lineItem.appendChild(deleteBtn);
    this.appendChild(lineItem);

    if (projectedSimulation) this.attachProjectedSimulationListener();
    this.attachDeleteListener(name);
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

  private attachDeleteListener(budgetName: string): void {
    this.addEventListener('click', (e) => {
      if (!(e.target as Element).closest('buddj-icon-delete')) return;
      e.preventDefault();
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
    });
  }
}

customElements.define(BuddjTemplateBudgetCard.tagName, BuddjTemplateBudgetCard);
