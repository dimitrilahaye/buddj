/**
 * Shell générique pour les drawers de recherche (charges, dépenses, etc.).
 * Gère uniquement : structure UI (backdrop, panneau, champ recherche, zone résultats),
 * filtre par label/montant (normalisé, insensible aux accents), groupement par clé, rendu des sections.
 * La logique métier (collecte, création des lignes miroir) est fournie via la config.
 */
import { escapeAttr } from '../../shared/escape.js';
import { entryMatchesSearch } from '../../shared/search.js';

export interface SearchDrawerEntry {
  label: string;
  amount: string;
  icon: string;
  /** Référence DOM optionnelle (ex. collecte depuis l’écran monté). */
  element?: HTMLElement;
  [key: string]: unknown;
}

export interface SearchDrawerConfig {
  title: string;
  placeholder: string;
  inputLabel?: string;
  getEntries: () => SearchDrawerEntry[];
  getGroupKey: (entry: SearchDrawerEntry) => string;
  createMirrorRow: (entry: SearchDrawerEntry) => HTMLElement;
  /** Classe sur la ligne (ex. charge-item / expense-item). */
  rowWrapperClass?: string;
  getRowWrapperClass?: (entry: SearchDrawerEntry) => string;
  eventName?: string;
  /** Si défini, chaque event reçoit le même `detail.query` (ex. charges + dépenses). */
  eventNames?: string[];
}

export type BuddjSearchDrawerElement = HTMLElement & {
  open: (config: SearchDrawerConfig) => void;
  refresh: () => void;
};

const DATA_BACKDROP = 'data-search-drawer-backdrop';
const DATA_INPUT = 'data-search-drawer-input';
const DATA_RESULTS = 'data-search-drawer-results';

export class BuddjSearchDrawer extends HTMLElement {
  static readonly tagName = 'buddj-search-drawer';

  private _query = '';
  private _config: SearchDrawerConfig | null = null;

  open(config: SearchDrawerConfig): void {
    this._query = '';
    this._config = config;
    this.render();
    this.classList.add('search-drawer--open');
    this.attachListeners();
    this.updateResults();
    const input = this.querySelector<HTMLInputElement>(`[${DATA_INPUT}]`);
    requestAnimationFrame(() => input?.focus());
  }

  /** Recalcule les entrées (ex. après suppression d’une dépense) en conservant la requête courante. */
  refresh(): void {
    if (!this.classList.contains('search-drawer--open') || !this._config) return;
    this.updateResults();
  }

  close(): void {
    const names = this._searchEventNames();
    this.classList.remove('search-drawer--open');
    this._query = '';
    this._config = null;
    for (const eventName of names) {
      this.dispatchEvent(new CustomEvent(eventName, { detail: { query: '' }, bubbles: true }));
    }
  }

  private updateResults(): void {
    const config = this._config;
    if (!config) return;

    const entries = config.getEntries();
    const q = this._query.trim();
    const filtered =
      q === ''
        ? []
        : entries.filter((e) => entryMatchesSearch(e.label, e.amount, q));

    const container = this.querySelector(`[${DATA_RESULTS}]`);
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = q
        ? '<p class="search-drawer-empty">Aucun résultat</p>'
        : '<p class="search-drawer-hint">Saisissez un intitulé ou un montant pour filtrer.</p>';
      this.dispatchSearchEvent();
      return;
    }

    const byGroup = new Map<string, SearchDrawerEntry[]>();
    filtered.forEach((entry) => {
      const key = config.getGroupKey(entry);
      const list = byGroup.get(key) ?? [];
      list.push(entry);
      byGroup.set(key, list);
    });

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    byGroup.forEach((entries, groupKey) => {
      const section = document.createElement('section');
      section.className = 'search-drawer-group';
      const title = document.createElement('h3');
      title.className = 'search-drawer-group-title';
      title.textContent = groupKey;
      section.appendChild(title);
      const list = document.createElement('ul');
      list.className = 'search-drawer-list';
      entries.forEach((entry) => {
        const wrap = document.createElement('li');
        wrap.className = 'search-drawer-item';
        const rowWrap = document.createElement('div');
        const rowExtra = config.getRowWrapperClass
          ? config.getRowWrapperClass(entry)
          : (config.rowWrapperClass ?? '');
        rowWrap.className = ['search-drawer-item-row', rowExtra].filter(Boolean).join(' ');
        rowWrap.appendChild(config.createMirrorRow(entry));
        wrap.appendChild(rowWrap);
        list.appendChild(wrap);
      });
      section.appendChild(list);
      fragment.appendChild(section);
    });
    container.setAttribute('aria-live', 'polite');
    container.appendChild(fragment);
    this.dispatchSearchEvent();
  }

  private _searchEventNames(): string[] {
    const c = this._config;
    if (!c) return [];
    if (c.eventNames?.length) return c.eventNames;
    if (c.eventName) return [c.eventName];
    return [];
  }

  private dispatchSearchEvent(): void {
    for (const eventName of this._searchEventNames()) {
      this.dispatchEvent(new CustomEvent(eventName, { detail: { query: this._query }, bubbles: true }));
    }
  }

  private render(): void {
    const config = this._config;
    if (!config) return;

    const inputLabel = config.inputLabel ?? 'Par intitulé ou montant';
    this.innerHTML = `
      <div class="search-drawer-backdrop" ${DATA_BACKDROP}></div>
      <div class="search-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(config.title)}">
        <div class="search-drawer-header">
          <h2 class="search-drawer-title">Rechercher</h2>
        </div>
        <div class="search-drawer-body">
          <div class="search-drawer-results" ${DATA_RESULTS}></div>
          <label class="search-drawer-field">
            <span class="search-drawer-label">${escapeAttr(inputLabel)}</span>
            <input type="search" class="search-drawer-input" ${DATA_INPUT} placeholder="${escapeAttr(config.placeholder)}" value="${escapeAttr(this._query)}" aria-label="Rechercher par intitulé ou montant" autocomplete="off">
          </label>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector(`[${DATA_BACKDROP}]`);
    backdrop?.addEventListener('click', () => this.close());

    const input = this.querySelector<HTMLInputElement>(`[${DATA_INPUT}]`);
    input?.addEventListener('input', () => {
      this._query = input.value ?? '';
      this.updateResults();
    });
  }
}

customElements.define(BuddjSearchDrawer.tagName, BuddjSearchDrawer);
