/**
 * Placeholder lorsqu’aucun mois n’est disponible dans le store (budgets, charges, etc.).
 */
export class BuddjMonthsEmptyPlaceholder extends HTMLElement {
  static readonly tagName = 'buddj-months-empty-placeholder';

  connectedCallback(): void {
    if (this.querySelector('.months-empty-placeholder')) return;
    this.innerHTML = `
      <div class="months-empty-placeholder" role="region" aria-label="Aucun mois actif">
        <p class="months-empty-placeholder__text">Aucun mois à afficher pour le moment.</p>
        <p class="months-empty-placeholder__actions">
          <a href="/new-month" class="months-empty-placeholder__cta">Créer un mois</a>
        </p>
      </div>
    `;
  }
}

customElements.define(BuddjMonthsEmptyPlaceholder.tagName, BuddjMonthsEmptyPlaceholder);
