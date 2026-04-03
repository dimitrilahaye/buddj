/**
 * Écran Liste des templates : données depuis TemplatesStore (GET /months/template).
 */
import type { TemplatesStore } from '../../application/template/templates-store.js';
import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import { escapeAttr } from '../../shared/escape.js';

const DEFAULT_TEMPLATE_EMOJI = '📆';

export class BuddjScreenTemplates extends HTMLElement {
  static readonly tagName = 'buddj-screen-templates';

  private _store?: TemplatesStore;

  init({ templatesStore }: { templatesStore: TemplatesStore }): void {
    this._store = templatesStore;
  }

  connectedCallback(): void {
    if (this.querySelector('#templates')) return;
    const store = this._store;
    if (!store) return;

    this._renderShell();
    store.addEventListener('templatesStateUpdated', this._onStore);
    store.emitAction('loadTemplates');
    this._syncFromStore();
  }

  disconnectedCallback(): void {
    this._store?.removeEventListener('templatesStateUpdated', this._onStore);
  }

  private _onStore = (): void => {
    this._syncFromStore();
  };

  private _renderShell(): void {
    const main = document.createElement('main');
    main.className = 'screen screen--templates';
    main.id = 'templates';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap templates-sticky-wrap">
        <header class="screen-header">
          <h1 class="title">Gérer les templates</h1>
        </header>
      </div>
      <p class="templates-loading" hidden>Chargement des templates…</p>
      <p class="templates-error" role="alert" hidden></p>
      <section class="templates-list-wrap" aria-label="Liste des templates"></section>
    `;
    this.appendChild(main);
  }

  private _syncFromStore(): void {
    const store = this._store;
    const main = this.querySelector('#templates');
    if (!store || !main) return;

    const { templates, isLoading, loadErrorMessage } = store.getState();
    const loadingEl = main.querySelector('.templates-loading');
    const errEl = main.querySelector('.templates-error');
    const wrap = main.querySelector('.templates-list-wrap');

    if (loadingEl instanceof HTMLElement) {
      loadingEl.hidden = !isLoading;
    }
    if (errEl instanceof HTMLElement) {
      const show = Boolean(loadErrorMessage) && !isLoading;
      errEl.hidden = !show;
      errEl.textContent = loadErrorMessage ?? '';
    }
    if (!wrap) return;

    if (isLoading && templates.length === 0) {
      wrap.innerHTML = '';
      return;
    }
    if (templates.length === 0 && !loadErrorMessage) {
      wrap.innerHTML = '<p class="templates-empty">Aucun template.</p>';
      return;
    }
    if (loadErrorMessage) {
      wrap.innerHTML = '';
      return;
    }

    wrap.innerHTML = '';
    for (const t of templates) {
      const parsed = splitLeadingEmoji({ label: t.name, defaultIcon: DEFAULT_TEMPLATE_EMOJI });
      const link = document.createElement('a');
      link.href = `/templates/${escapeAttr(t.id)}`;
      link.className = 'template-list-item';
      link.setAttribute('data-template-id', t.id);
      const lineItem = document.createElement('buddj-line-item');
      lineItem.setAttribute('icon', parsed.icon);
      lineItem.setAttribute('label', parsed.text || t.name);
      lineItem.setAttribute('hide-amount', '');
      if (t.isDefault) {
        const badge = document.createElement('span');
        badge.slot = 'actions';
        badge.className = 'template-list-badge';
        badge.textContent = 'Par défaut';
        lineItem.appendChild(badge);
      }
      link.appendChild(lineItem);
      wrap.appendChild(link);
    }
  }
}

customElements.define(BuddjScreenTemplates.tagName, BuddjScreenTemplates);
