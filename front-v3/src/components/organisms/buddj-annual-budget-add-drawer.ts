/**
 * Drawer d’ajout d’un budget annuel : emoji, nom, montant.
 */
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { attachInputClear } from '../../shared/input-clear.js';
import { parseEurosToNumber } from '../../shared/goal.js';

const DEFAULT_EMOJI = '💰';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export type AnnualBudgetAddOpenOptions = { month: number };

export type BuddjAnnualBudgetAddDrawerElement = HTMLElement & {
  open: (o: AnnualBudgetAddOpenOptions) => void;
};

export class BuddjAnnualBudgetAddDrawer extends HTMLElement {
  static readonly tagName = 'buddj-annual-budget-add-drawer';

  private _month = 1;
  private _name = '';
  private _amount = '0,00 €';
  private _emoji = DEFAULT_EMOJI;

  open(options: AnnualBudgetAddOpenOptions): void {
    this._month = options.month;
    this._name = '';
    this._amount = '0,00 €';
    this._emoji = DEFAULT_EMOJI;
    this.render();
    this.classList.add('budget-add-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('budget-add-drawer--open');
  }

  private monthTitle(): string {
    const idx = this._month - 1;
    return idx >= 0 && idx < MONTH_NAMES.length ? MONTH_NAMES[idx]! : `Mois ${this._month}`;
  }

  private render(): void {
    const title = `Ajouter un budget — ${this.monthTitle()}`;
    this.innerHTML = `
      <div class="budget-add-drawer-backdrop" data-annual-budget-add-backdrop></div>
      <div class="budget-add-drawer-panel" role="dialog" aria-modal="true" aria-label="Ajouter un budget annuel">
        <div class="budget-add-drawer-header">
          <h2 class="budget-add-drawer-title">${escapeHtml(title)}</h2>
        </div>
        <div class="budget-add-drawer-body">
          <div class="budget-add-drawer-field">
            <span class="budget-add-drawer-label">Libellé</span>
            <div class="budget-add-drawer-label-row">
              <button type="button" class="budget-add-emoji-btn" data-annual-budget-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <div class="buddj-input-clear-wrap">
                <input type="text" class="budget-add-drawer-input" data-annual-budget-label placeholder="Ex. Vacances" value="${escapeAttr(this._name)}" aria-label="Nom du budget">
                <button type="button" class="buddj-input-clear-btn" data-buddj-input-clear aria-label="Effacer le libellé" hidden><span aria-hidden="true">×</span></button>
              </div>
            </div>
          </div>
          <label class="budget-add-drawer-field">
            <span class="budget-add-drawer-label">Montant</span>
            <button type="button" class="budget-add-drawer-amount" data-annual-budget-amount aria-label="Montant (ouvrir la calculatrice)">${escapeHtml(this._amount)}</button>
          </label>
        </div>
        <div class="budget-add-drawer-footer">
          <button type="button" class="btn budget-add-drawer-cancel">Annuler</button>
          <button type="button" class="btn budget-add-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    this.querySelector('[data-annual-budget-add-backdrop]')?.addEventListener('click', () => this.close());

    this.querySelector('[data-annual-budget-emoji]')?.addEventListener('click', () => this.openEmojiPicker());

    const labelInput = this.querySelector('[data-annual-budget-label]');
    const clearLabelError = (): void => {
      labelInput?.closest('.budget-add-drawer-field')?.classList.remove('budget-add-drawer-field--error');
    };
    labelInput?.addEventListener('focus', clearLabelError);
    labelInput?.addEventListener('input', clearLabelError);

    const labelClearWrap = this.querySelector('[data-annual-budget-label]')?.closest('.buddj-input-clear-wrap');
    if (labelClearWrap instanceof HTMLElement) attachInputClear({ root: labelClearWrap });

    this.querySelector('[data-annual-budget-amount]')?.addEventListener('click', () => this.openCalculator());

    this.querySelector('.budget-add-drawer-cancel')?.addEventListener('click', () => this.close());
    this.querySelector('.budget-add-drawer-validate')?.addEventListener('click', () => this.doValidate());
  }

  private openEmojiPicker(): void {
    const picker = document.getElementById('emoji-picker-drawer') as BuddjEmojiPickerDrawerElement;
    picker?.open({
      defaultEmoji: this._emoji,
      onSelect: (emoji: string) => {
        this._emoji = emoji;
        const el = this.querySelector('[data-annual-budget-emoji]');
        if (el) el.textContent = emoji;
      },
    });
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    calculator?.open({
      title: 'Montant',
      initialValue: this._amount,
      startWithInitialValue: this._amount !== '0,00 €',
      onValidate: (value: string) => {
        this._amount = value;
        const el = this.querySelector('[data-annual-budget-amount]');
        if (el) el.textContent = value;
      },
      onCancel: () => {},
    });
  }

  private doValidate(): void {
    const nameInput = this.querySelector('[data-annual-budget-label]') as HTMLInputElement;
    const name = nameInput?.value?.trim() ?? '';
    const toast = getToast();
    if (!name) {
      nameInput?.closest('.budget-add-drawer-field')?.classList.add('budget-add-drawer-field--error');
      toast?.show({ message: 'Le libellé est requis', variant: 'warning' });
      return;
    }
    const amount = parseEurosToNumber(this._amount);
    if (amount <= 0) {
      toast?.show({ message: 'Le montant doit être supérieur à 0', variant: 'warning' });
      return;
    }
    this.close();
    this.dispatchEvent(
      new CustomEvent('buddj-annual-budget-add-submit', {
        bubbles: true,
        composed: true,
        detail: { month: this._month, name, amount, emoji: this._emoji },
      }),
    );
  }
}

customElements.define(BuddjAnnualBudgetAddDrawer.tagName, BuddjAnnualBudgetAddDrawer);
