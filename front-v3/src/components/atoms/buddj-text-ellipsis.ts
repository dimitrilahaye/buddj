/**
 * Texte sur une ligne avec ellipsis si débordement. Utilisé pour intitulés de charges, budgets, dépenses.
 * Attribut "text" pour le contenu, ou contenu enfant (slot). Attribut "class" optionnel pour le contexte (ex. charge-label, expense-desc).
 */
export class BuddjTextEllipsis extends HTMLElement {
  static readonly tagName = 'buddj-text-ellipsis';

  static get observedAttributes(): string[] {
    return ['text', 'class'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string): void {
    if (name === 'text') this.render();
  }

  private render(): void {
    const textAttr = this.getAttribute('text');
    const extraClass = this.getAttribute('class') ?? '';
    const hostClass = 'buddj-text-ellipsis ' + (extraClass ? ' ' + extraClass : '%').replace('%', '').trim();
    this.className = hostClass || 'buddj-text-ellipsis ';

    const inner = document.createElement('span');
    inner.className = 'buddj-text-ellipsis__inner';
    if (textAttr !== null && textAttr !== '') {
      inner.textContent = textAttr;
    } else {
      while (this.firstChild) {
        inner.appendChild(this.firstChild);
      }
    }
    this.textContent = '';
    this.appendChild(inner);
  }
}

customElements.define(BuddjTextEllipsis.tagName, BuddjTextEllipsis);
