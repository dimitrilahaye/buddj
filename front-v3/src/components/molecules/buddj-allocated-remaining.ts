/**
 * Bloc allocated → remaining (ex. « 200 € → 145 € restant »). Utilisé dans budget-card et goal-card.
 * Attributs allocated et remaining : nombres (le WC formate en « X € » / « X € restant »).
 */
import { escapeHtml } from '../../shared/escape.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';

export class BuddjAllocatedRemaining extends HTMLElement {
  static readonly tagName = 'buddj-allocated-remaining';

  static get observedAttributes(): string[] {
    return ['allocated', 'remaining'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private render(): void {
    const allocatedNum = parseEurosToNumber(this.getAttribute('allocated') ?? '0');
    const remainingNum = parseEurosToNumber(this.getAttribute('remaining') ?? '0');
    const allocatedStr = formatEuros(parseFloat(String(allocatedNum)) || 0);
    const remainingStr = formatEuros(parseFloat(String(remainingNum)) || 0) + ' restant';
    this.innerHTML = `
      <div class="amount-totals">
        <span class="amount-allocated">${escapeHtml(allocatedStr)}</span>
        <span class="amount-sep">→</span>
        <span class="amount-remaining">${escapeHtml(remainingStr)}</span>
      </div>
    `;
  }
}

customElements.define(BuddjAllocatedRemaining.tagName, BuddjAllocatedRemaining);
