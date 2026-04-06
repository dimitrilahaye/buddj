/**
 * Carte objectif (économie / remboursement) : même rendu que buddj-budget-card
 * mais sans toggle de détails, sans "n dépenses en attente", sans liste à l'intérieur.
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

export class BuddjGoalCard extends HTMLElement {
  static readonly tagName = 'buddj-goal-card';

  static get observedAttributes(): string[] {
    return ['data-id', 'name', 'icon', 'allocated', 'remaining', 'back-disabled', 'forward-disabled'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private render(): void {
    const id = this.getAttribute('data-id') ?? this.getAttribute('id') ?? '';
    const name = this.getAttribute('name') ?? 'Objectif';
    const icon = this.getAttribute('icon') ?? '💰';
    const allocated = this.getAttribute('allocated') ?? '0';
    const remaining = this.getAttribute('remaining') ?? '0';
    const backDisabled = this.getAttribute('back-disabled') === 'true';
    const forwardDisabled = this.getAttribute('forward-disabled') === 'true';
    const remainingNum = parseFloat(String(remaining).replace(',', '.').trim()) || 0;
    const isCompleteBool = remainingNum <= 0;

    this.innerHTML = `
      <div class="budget-details goal-card${isCompleteBool ? ' goal-card--completed' : ''}" data-id="${escapeAttr(id)}">
        <div class="budget-card-header">
          <div class="budget-card-title-row">
            <h2 class="budget-name">
              <span class="budget-icon" aria-hidden="true">${escapeHtml(icon)}</span>
              <span class="budget-name-text">${escapeHtml(name)}</span>
            </h2>
            <div class="budget-card-actions goal-card-actions">
              <buddj-icon-add data-action="add" data-id="${escapeAttr(id)}" title="Ajouter une somme" aria-label="Ajouter une somme" ${isCompleteBool ? ' disabled' : ''}></buddj-icon-add>
              <button type="button" class="btn goal-btn-max" data-action="add-remaining" data-id="${escapeAttr(id)}" title="Ajouter la somme restante" ${isCompleteBool ? ' disabled' : ''}>Max</button>
              <buddj-actions-dropdown target-id="${escapeAttr(id)}" position="right" class="goal-menu-wrap">
                <button type="button" class="btn btn-menu-dots" slot="trigger" title="Options">⋮</button>
                <button type="button" slot="items" data-action="back" ${backDisabled ? ' disabled' : ''}>Retour arrière</button>
                <button type="button" slot="items" data-action="forward" ${forwardDisabled ? ' disabled' : ''}>Retour avant</button>
                <button type="button" slot="items" data-action="update">Mettre à jour</button>
                <hr slot="items" class="dropdown-menu-separator" aria-hidden="true" />
                <button type="button" slot="items" data-action="${isCompleteBool ? 'delete-victory' : 'delete'}" data-variant="${isCompleteBool ? 'victory' : 'danger'}">${isCompleteBool ? 'Supprimer (victoire)' : 'Supprimer'}</button>
              </buddj-actions-dropdown>
            </div>
          </div>
          <buddj-allocated-remaining allocated="${escapeAttr(allocated)}" remaining="${escapeAttr(remaining)}"></buddj-allocated-remaining>
        </div>
      </div>
    `;
  }
}

customElements.define(BuddjGoalCard.tagName, BuddjGoalCard);
