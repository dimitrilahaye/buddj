/**
 * Bouton « Déplier tout » / « Replier tout » partagé.
 * Ouvre ou ferme tous les éléments <details> correspondant au sélecteur (dans le main parent).
 * Attributs : target-selector (requis), label-expand, label-collapse, title-expand, title-collapse.
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

const DEFAULT_LABEL_EXPAND = 'Déplier tout';
const DEFAULT_LABEL_COLLAPSE = 'Replier tout';

export class BuddjToggleAll extends HTMLElement {
  static readonly tagName = 'buddj-toggle-all';

  static get observedAttributes(): string[] {
    return ['target-selector', 'label-expand', 'label-collapse', 'title-expand', 'title-collapse'];
  }

  private _expanded = false;

  connectedCallback(): void {
    if (this.querySelector('.btn--toggle-all')) return;
    this.render();
    this.attachListeners();
  }

  attributeChangedCallback(): void {
    if (this.querySelector('.btn--toggle-all')) this.render();
  }

  private render(): void {
    const labelExpand = this.getAttribute('label-expand') ?? DEFAULT_LABEL_EXPAND;
    const labelCollapse = this.getAttribute('label-collapse') ?? DEFAULT_LABEL_COLLAPSE;
    const titleExpand = this.getAttribute('title-expand') ?? labelExpand;
    const titleCollapse = this.getAttribute('title-collapse') ?? labelCollapse;
    const label = this._expanded ? labelCollapse : labelExpand;
    const title = this._expanded ? titleCollapse : titleExpand;
    this.innerHTML = `
      <button type="button" class="btn btn--toggle-all" title="${escapeAttr(title)}">${escapeHtml(label)}</button>
    `;
  }

  private attachListeners(): void {
    this.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest('.btn--toggle-all');
      if (!btn) return;
      e.preventDefault();
      const selector = this.getAttribute('target-selector');
      if (!selector) return;
      const main = this.closest('main');
      if (!main) return;
      const details = main.querySelectorAll<HTMLDetailsElement>(selector);
      this._expanded = !this._expanded;
      details.forEach((el) => {
        el.open = this._expanded;
      });
      this.render();
    });
  }
}

customElements.define(BuddjToggleAll.tagName, BuddjToggleAll);
