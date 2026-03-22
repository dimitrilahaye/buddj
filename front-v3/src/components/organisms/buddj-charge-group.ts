/**
 * Groupe de charges pour un mois (titre + optionnellement bouton Ajouter une charge, liste).
 */
import type { BuddjChargeAddDrawerElement } from './buddj-charge-add-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

export class BuddjChargeGroup extends HTMLElement {
  static readonly tagName = 'buddj-charge-group';

  connectedCallback(): void {
    const previous = this.hasAttribute('previous');
    const annual = this.hasAttribute('annual');
    const title = previous ? 'Charges des mois précédents' : (this.getAttribute('title') ?? 'Charges');
    const showAdd = this.hasAttribute('show-add');
    const addLabel = this.getAttribute('add-label') ?? 'Ajouter une charge';
    const addTitle = this.getAttribute('add-title') ?? 'Ajouter une charge récurrente';
    const recapCount = this.getAttribute('recap-count');
    const recapTotal = this.getAttribute('recap-total');
    const addAlignRight = this.hasAttribute('add-align') && this.getAttribute('add-align') === 'right';
    const showSearch = this.hasAttribute('show-search');
    let groupClass = 'charge-group';
    if (previous) groupClass += ' charge-group--previous';
    if (annual) groupClass += ' charge-group--annual';
    if (addAlignRight) groupClass += ' charge-group--add-right';
    const children = Array.from(this.childNodes);
    const div = document.createElement('div');
    div.className = groupClass;
    const recapHtml =
      recapCount != null && recapTotal != null
        ? `<div class="charge-group-recap"><span class="charge-group-recap-line">${escapeHtml(recapCount)} charge${parseInt(recapCount, 10) > 1 ? 's' : ''}</span><span class="charge-group-recap-line">${escapeHtml(recapTotal)}</span></div>`
        : '';
    const searchHtml = showSearch
      ? `<buddj-icon-search class="template-section-search charge-group-search" title="Rechercher dans les charges" aria-label="Rechercher les charges"></buddj-icon-search>`
      : '';
    const hideInlineAdd = this.hasAttribute('hide-inline-add');
    if (showAdd) {
      const addBtnHtml = hideInlineAdd
        ? ''
        : `<buddj-btn-add label="${escapeAttr(addLabel)}" title="${escapeAttr(addTitle)}"></buddj-btn-add>`;
      const actionsInner = `${addBtnHtml}${searchHtml}`;
      const hasActionsRow = actionsInner.trim() !== '';
      if (hasActionsRow) {
        div.innerHTML = `
        <div class="charge-group-title-row">
          <div class="charge-group-title-block">
            <h3 class="charge-group-title">${escapeHtml(title)}</h3>
            ${recapHtml}
          </div>
          <div class="charge-group-actions">
            ${actionsInner}
          </div>
        </div>
        <ul class="charge-list"></ul>
      `;
      } else {
        div.innerHTML = `<div class="charge-group-title-block"><h3 class="charge-group-title">${escapeHtml(title)}</h3>${recapHtml}</div><ul class="charge-list"></ul>`;
      }
    } else {
      div.innerHTML = `<div class="charge-group-title-block"><h3 class="charge-group-title">${escapeHtml(title)}</h3>${recapHtml}</div><ul class="charge-list"></ul>`;
    }
    const ul = div.querySelector('ul')!;
    const chargeItems = children.filter(
      (n): n is Element => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName === 'BUDDJ-CHARGE-ITEM'
    ) as Element[];
    const isChargeChecked = (el: Element) =>
      (el.querySelector('.charge-taken') as HTMLInputElement | null)?.checked ?? (el.hasAttribute('taken') && el.getAttribute('taken') !== 'false');
    chargeItems.sort((a, b) => {
      const aChecked = isChargeChecked(a);
      const bChecked = isChargeChecked(b);
      if (aChecked !== bChecked) return aChecked ? 1 : -1;
      return (a.getAttribute('label') ?? '').localeCompare(b.getAttribute('label') ?? '', undefined, { sensitivity: 'base' });
    });
    for (const item of chargeItems) {
      ul.appendChild(item);
    }
    if (showAdd && ul.querySelectorAll('buddj-charge-item').length === 0) {
      const placeholder = document.createElement('li');
      placeholder.className = 'charge-list-empty';
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.textContent = 'Aucune charge pour l\'instant';
      ul.appendChild(placeholder);
    }
    this.innerHTML = '';
    this.appendChild(div);

    if (showAdd && !hideInlineAdd) {
      const addBtn = div.querySelector('buddj-btn-add');
      addBtn?.addEventListener('click', () => {
        const drawer = document.getElementById('charge-add-drawer') as BuddjChargeAddDrawerElement;
        drawer?.open();
      });
    }

    this.attachTakenChangeListener(isChargeChecked);
  }

  private attachTakenChangeListener(isChargeChecked: (el: Element) => boolean): void {
    this.addEventListener('buddj-charge-taken-change', () => {
      const ul = this.querySelector('ul.charge-list');
      if (!ul) return;
      const items = Array.from(ul.querySelectorAll('buddj-charge-item'));
      items.sort((a, b) => {
        const aChecked = isChargeChecked(a);
        const bChecked = isChargeChecked(b);
        if (aChecked !== bChecked) return aChecked ? 1 : -1;
        return (a.getAttribute('label') ?? '').localeCompare(b.getAttribute('label') ?? '', undefined, { sensitivity: 'base' });
      });
      items.forEach((el) => ul.appendChild(el));
    });
  }
}

customElements.define(BuddjChargeGroup.tagName, BuddjChargeGroup);
