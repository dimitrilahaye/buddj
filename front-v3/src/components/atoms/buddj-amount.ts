/**
 * Affichage d'un montant (charge, budget, solde).
 * Attribut "value" pour le montant affiché.
 * Attribut "variant" optionnel : "default" (couleur navy) ou "highlight" (coral, pour solde après charges).
 */
export class BuddjAmount extends HTMLElement {
  static readonly tagName = 'buddj-amount';

  static get observedAttributes(): string[] {
    return ['value', 'variant'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    this.render();
  }

  private render(): void {
    const value = this.getAttribute('value') ?? '';
    const variant = this.getAttribute('variant'); // 'default' | 'highlight' | null
    const variantClass = variant ? ` buddj-amount--${variant}` : '';
    this.className = `budget-amount${variantClass}`.trim();
    this.textContent = '';
    const span = document.createElement('span');
    span.className = variant === 'highlight' ? 'amount-value amount-value--highlight' : 'amount-value';
    span.textContent = value;
    this.appendChild(span);
  }
}

customElements.define(BuddjAmount.tagName, BuddjAmount);
