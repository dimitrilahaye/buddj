/**
 * Ligne titre + bouton d’action (ex. "Mes charges" + "Ajouter une charge").
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

export class BuddjSectionHeader extends HTMLElement {
  static readonly tagName = 'buddj-section-header';

  connectedCallback(): void {
    if (this.innerHTML.trim() !== '') return;
    const title = this.getAttribute('title') ?? '';
    const addLabel = this.getAttribute('add-label') ?? '';
    const addTitle = this.getAttribute('add-title') ?? 'Ajouter';
    const addButton =
      addLabel !== ''
        ? `<buddj-btn-add label="${escapeAttr(addLabel)}" title="${escapeAttr(addTitle)}"></buddj-btn-add>`
        : '';
    this.innerHTML = `
      <div class="section-title-row">
        <h2 class="section-title">${escapeHtml(title)}</h2>
        ${addButton}
      </div>
    `;
  }
}

customElements.define(BuddjSectionHeader.tagName, BuddjSectionHeader);
