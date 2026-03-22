/**
 * Groupe de budgets pour un mois (titre, optionnellement bouton Ajouter un budget, liste de cartes).
 * Supporte buddj-budget-card et buddj-template-budget-card.
 * Attributs optionnels : recap-count, recap-total, show-search, add-align="right".
 */
import type { BuddjBudgetAddDrawerElement } from './buddj-budget-add-drawer.js';
import { escapeHtml } from '../../shared/escape.js';

export class BuddjBudgetGroup extends HTMLElement {
  static readonly tagName = 'buddj-budget-group';

  connectedCallback(): void {
    const title = this.getAttribute('title') ?? 'Budgets';
    const previous = this.hasAttribute('previous');
    const annual = this.hasAttribute('annual');
    const showAdd = this.hasAttribute('show-add');
    const recapCount = this.getAttribute('recap-count');
    const recapTotal = this.getAttribute('recap-total');
    const addAlignRight = this.hasAttribute('add-align') && this.getAttribute('add-align') === 'right';
    const showSearch = this.hasAttribute('show-search');
    const cards = Array.from(this.querySelectorAll('buddj-budget-card, buddj-template-budget-card'));
    cards.sort((a, b) =>
      (a.getAttribute('name') ?? '').localeCompare(b.getAttribute('name') ?? '', undefined, { sensitivity: 'base' })
    );
    let groupClass = 'budget-group';
    if (previous) groupClass += ' budget-group--previous';
    if (annual) groupClass += ' budget-group--annual';
    if (addAlignRight) groupClass += ' budget-group--add-right';
    if (this.hasAttribute('template-mode')) groupClass += ' budget-group--template';
    const recapHtml =
      recapCount != null && recapTotal != null
        ? `<div class="budget-group-recap"><span class="budget-group-recap-line">${escapeHtml(recapCount)} budget${parseInt(recapCount, 10) > 1 ? 's' : ''}</span><span class="budget-group-recap-line">${escapeHtml(recapTotal)}</span></div>`
        : '';
    const searchHtml = showSearch
      ? `<buddj-icon-search class="template-section-search template-section-search--expenses budget-group-search" title="Rechercher un budget" aria-label="Rechercher un budget"></buddj-icon-search>`
      : '';
    const hideInlineAdd = this.hasAttribute('hide-inline-add');
    const div = document.createElement('div');
    div.className = groupClass;
    if (showAdd) {
      const addBtnHtml = hideInlineAdd
        ? ''
        : `<buddj-btn-add label="Ajouter un budget" title="Ajouter un budget" data-budget-add-btn></buddj-btn-add>`;
      const actionsInner = `${addBtnHtml}${searchHtml}`;
      const hasActionsRow = actionsInner.trim() !== '';
      if (hasActionsRow) {
        div.innerHTML = `
        <div class="budget-group-title-row">
          <div class="budget-group-title-block">
            <h3 class="budget-group-title">${escapeHtml(title)}</h3>
            ${recapHtml}
          </div>
          <div class="budget-group-actions">
            ${actionsInner}
          </div>
        </div>
        <div class="budget-group-list"></div>
      `;
      } else {
        div.innerHTML = `
        <div class="budget-group-title-block">
          <h3 class="budget-group-title">${escapeHtml(title)}</h3>
          ${recapHtml}
        </div>
        <div class="budget-group-list"></div>
      `;
      }
      const addBtn = div.querySelector('[data-budget-add-btn]');
      addBtn?.addEventListener('click', () => {
        const drawer = document.getElementById('budget-add-drawer') as BuddjBudgetAddDrawerElement;
        drawer?.open();
      });
    } else {
      div.innerHTML = `
        <div class="budget-group-title-block">
          <h3 class="budget-group-title">${escapeHtml(title)}</h3>
          ${recapHtml}
        </div>
        <div class="budget-group-list"></div>
      `;
    }
    const list = div.querySelector('.budget-group-list')!;
    for (const card of cards) {
      list.appendChild(card);
    }
    if (showAdd && cards.length === 0) {
      const placeholder = document.createElement('p');
      placeholder.className = 'budget-group-empty';
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.textContent = 'Aucun budget pour l\'instant';
      list.appendChild(placeholder);
    }
    this.innerHTML = '';
    this.appendChild(div);
  }
}

customElements.define(BuddjBudgetGroup.tagName, BuddjBudgetGroup);
