/**
 * Drawer calculette réutilisable (solde, montant charge, montant budget, etc.).
 * API : open({ initialValue, title?, onValidate, onCancel })
 * Rangée opérations + / − / = (1/4, 1/4, 2/4), puis icônes Effacer / Recharger / Suppr (idem).
 * Pied : Annuler | Valider.
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

export interface CalculatorDrawerOpenOptions {
  initialValue: string;
  title?: string;
  /** Si true, l'affichage démarre avec initialValue au lieu de 0 (ex. après clic sur Max dans le drawer transfert). */
  startWithInitialValue?: boolean;
  onValidate: (value: string) => void;
  onCancel: () => void;
}

export type BuddjCalculatorDrawerElement = HTMLElement & { open: (o: CalculatorDrawerOpenOptions) => void };

export class BuddjCalculatorDrawer extends HTMLElement {
  static readonly tagName = 'buddj-calculator-drawer';

  private _title = 'Solde actuel';
  private _initialRaw = '0';
  private _display = '0';
  private _leftOperand: number | null = null;
  private _operation: 'add' | 'subtract' | null = null;
  private _onValidate: ((value: string) => void) | null = null;
  private _onCancel: (() => void) | null = null;

  open(options: CalculatorDrawerOpenOptions): void {
    this._title = options.title ?? 'Solde actuel';
    this._initialRaw = parseRaw(options.initialValue);
    this._display = options.startWithInitialValue ? formatDisplay(parseRaw(options.initialValue)) : '0';
    this._leftOperand = null;
    this._operation = null;
    this._onValidate = options.onValidate;
    this._onCancel = options.onCancel;
    this.render();
    this.classList.add('calculator-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('calculator-drawer--open');
  }

  private getDisplayText(): string {
    return this._display.replace('.', ',');
  }

  private render(): void {
    const display = this.getDisplayText();
    const titleEsc = escapeAttr(this._title);
    this.innerHTML = `
      <div class="calculator-drawer-backdrop" data-calculator-drawer-backdrop></div>
      <div class="calculator-drawer-panel" role="dialog" aria-modal="true" aria-label="${titleEsc}">
        <div class="calculator-drawer-header">
          <h2 class="calculator-drawer-title">${escapeHtml(this._title)}</h2>
        </div>
        <div class="calculator-drawer-display" aria-live="polite">${escapeHtml(display)} €</div>
        <div class="calculator-drawer-ops" role="group" aria-label="Opérations">
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--op" data-action="plus" aria-label="Ajouter">+</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--op" data-action="minus" aria-label="Soustraire">−</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--op calculator-drawer-btn--equals-op" data-action="equals" aria-label="Égal">=</button>
        </div>
        <div class="calculator-drawer-fn-row" role="group" aria-label="Correction">
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--fn calculator-drawer-btn--fn-icon" data-action="clear" aria-label="Effacer" title="Tout effacer, remettre à zéro">
            <svg class="calculator-drawer-fn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--fn calculator-drawer-btn--fn-icon" data-action="reload" aria-label="Recharger" title="Recharger la valeur affichée à l’ouverture">
            <svg class="calculator-drawer-fn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--fn calculator-drawer-btn--fn-icon" data-action="suppr" aria-label="Suppr" title="Supprimer le dernier caractère">
            <svg class="calculator-drawer-fn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M18 9l-6 6"/><path d="M12 9l6 6"/></svg>
          </button>
        </div>
        <div class="calculator-drawer-numpad">
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="7">7</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="8">8</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="9">9</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="4">4</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="5">5</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="6">6</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="1">1</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="2">2</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit="3">3</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num calculator-drawer-num--zero-wide" data-digit="0">0</button>
          <button type="button" class="calculator-drawer-btn calculator-drawer-btn--num" data-digit=",">,</button>
        </div>
        <div class="calculator-drawer-footer">
          <button type="button" class="btn calculator-drawer-cancel">Annuler</button>
          <button type="button" class="btn calculator-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-calculator-drawer-backdrop]');
    backdrop?.addEventListener('click', () => this.doCancel());

    this.querySelector('[data-action="minus"]')?.addEventListener('click', () => this.doMinus());
    this.querySelector('[data-action="plus"]')?.addEventListener('click', () => this.doPlus());
    this.querySelector('[data-action="equals"]')?.addEventListener('click', () => this.doEquals());
    this.querySelector('[data-action="suppr"]')?.addEventListener('click', () => this.doSuppr());
    this.querySelector('[data-action="clear"]')?.addEventListener('click', () => this.doClear());
    this.querySelector('[data-action="reload"]')?.addEventListener('click', () => this.doReload());

    this.querySelectorAll('[data-digit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = (btn as HTMLElement).dataset.digit;
        if (d !== undefined) this.appendDigit(d);
      });
    });

    this.querySelector('.calculator-drawer-cancel')?.addEventListener('click', () => this.doCancel());
    this.querySelector('.calculator-drawer-validate')?.addEventListener('click', () => this.doValidate());
  }

  private getLeftPart(): string {
    const plusIdx = this._display.lastIndexOf(' + ');
    const minusIdx = this._display.lastIndexOf(' - ');
    const opIdx = plusIdx > minusIdx ? plusIdx : minusIdx;
    if (opIdx === -1) return this._display.trim();
    return this._display.slice(0, opIdx).trim();
  }

  private getRightPart(): string {
    const plusIdx = this._display.lastIndexOf(' + ');
    const minusIdx = this._display.lastIndexOf(' - ');
    const opIdx = plusIdx > minusIdx ? plusIdx : minusIdx;
    if (opIdx === -1) return '';
    return this._display.slice(opIdx + 3).trim();
  }

  private parseNum(s: string): number {
    return parseFloat(s.replace(/\s/g, '').replace(',', '.')) || 0;
  }

  private appendDigit(d: string): void {
    if (this._operation !== null) {
      const right = this.getRightPart();
      const opStr = this._operation === 'add' ? ' + ' : ' - ';
      if (d === ',') {
        if (right.includes(',')) return;
        this._display += ',';
      } else {
        const parts = right.split(',');
        if (parts[1]?.length >= 2) return;
        if (right === '0' && d !== ',') this._display = this.getLeftPart() + opStr + d;
        else this._display += d;
      }
    } else {
      if (d === ',') {
        if (this._display.includes(',')) return;
        if (this._display === '0' || this._display === '') this._display = '0,';
        else this._display += ',';
      } else {
        if (this._display.includes(',')) {
          const parts = this._display.split(',');
          if (parts[1]?.length >= 2) return;
        }
        if (this._display === '0' && d !== ',') this._display = d;
        else this._display += d;
      }
    }
    this.updateDisplay();
  }

  private doPlus(): void {
    if (this._operation !== null) this.doEquals();
    const left = this.getLeftPart();
    this._leftOperand = this.parseNum(left);
    this._operation = 'add';
    this._display = left + ' + ';
    this.updateDisplay();
  }

  private doMinus(): void {
    if (this._operation !== null) this.doEquals();
    const left = this.getLeftPart();
    this._leftOperand = this.parseNum(left);
    this._operation = 'subtract';
    this._display = left + ' - ';
    this.updateDisplay();
  }

  private doEquals(): void {
    if (this._leftOperand === null || this._operation === null) return;
    const rightStr = this.getRightPart();
    const right = this.parseNum(rightStr);
    const result =
      this._operation === 'add' ? this._leftOperand + right : this._leftOperand - right;
    this._display = result.toFixed(2).replace('.', ',');
    this._leftOperand = null;
    this._operation = null;
    this.updateDisplay();
  }

  private doSuppr(): void {
    if (this._operation !== null) {
      const right = this.getRightPart();
      if (right === '') {
        this._display = this.getLeftPart();
        this._leftOperand = null;
        this._operation = null;
      } else {
        this._display = this._display.slice(0, -1);
      }
    } else {
      if (this._display.length <= 1) this._display = '0';
      else this._display = this._display.slice(0, -1);
    }
    this.updateDisplay();
  }

  private doClear(): void {
    this._display = '0';
    this._leftOperand = null;
    this._operation = null;
    this.updateDisplay();
  }

  private doReload(): void {
    this._display = formatDisplay(this._initialRaw);
    this._leftOperand = null;
    this._operation = null;
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const el = this.querySelector('.calculator-drawer-display');
    if (el) el.textContent = this.getDisplayText() + ' €';
  }

  private doCancel(): void {
    this._onCancel?.();
    this.close();
  }

  /** Valeur à valider : si une opération est en cours sans avoir cliqué sur =, on garde l'opérande de gauche. */
  private getCurrentValue(): number {
    if (this._operation === null) return this.parseNum(this._display);
    return this._leftOperand ?? this.parseNum(this.getLeftPart());
  }

  private doValidate(): void {
    const n = this.getCurrentValue();
    const formatted = n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    this._onValidate?.(formatted);
    this.close();
  }
}

function parseRaw(value: string): string {
  const cleaned = value.replace(/\s/g, '').replace('€', '').trim().replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? '0' : n.toFixed(2);
}

function formatDisplay(raw: string): string {
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return '0';
  return n.toFixed(2).replace('.', ',');
}

customElements.define(BuddjCalculatorDrawer.tagName, BuddjCalculatorDrawer);
