/**
 * Icône déplier / replier (▼). Utilisée dans les cartes budget (summary). La rotation quand ouvert est gérée par le parent <details>.
 */
export class BuddjIconToggle extends HTMLElement {
  static readonly tagName = 'buddj-icon-toggle';

  connectedCallback(): void {
    if (this.innerHTML.trim() !== '') return;
    this.innerHTML = `
      <span class="budget-toggle-icon" aria-hidden="true">▼</span>
    `;
  }
}

customElements.define(BuddjIconToggle.tagName, BuddjIconToggle);
