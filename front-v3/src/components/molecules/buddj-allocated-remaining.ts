/**
 * Bloc allocated → remaining (ex. « 200 € → 145 € restant »). Utilisé dans budget-card et goal-card.
 * Attributs allocated et remaining : nombres (le WC formate en « X € » / « X € restant »).
 */
import { escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

function parseAmount(value: string | null): number {
  if (value == null || value === '') return 0;
  const n = parseFloat(String(value).replace(/\s/g, '').replace(',', '.').replace('€', '').trim());
  return Number.isNaN(n) ? 0 : n;
}

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
    const allocatedNum = parseAmount(this.getAttribute('allocated'));
    const remainingNum = parseAmount(this.getAttribute('remaining'));
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
