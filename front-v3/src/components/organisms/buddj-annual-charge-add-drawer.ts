/**
 * Drawer d’ajout d’une charge annuelle (sortie annuelle) : emoji, libellé, montant.
 */
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { parseEurosToNumber } from '../../shared/goal.js';

const DEFAULT_EMOJI = '💰';

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export type AnnualChargeAddOpenOptions = { month: number };

export type BuddjAnnualChargeAddDrawerElement = HTMLElement & {
  open: (o: AnnualChargeAddOpenOptions) => void;
};

export class BuddjAnnualChargeAddDrawer extends HTMLElement {
  static readonly tagName = 'buddj-annual-charge-add-drawer';

  private _month = 1;
  private _label = '';
  private _amount = '0,00 €';
  private _emoji = DEFAULT_EMOJI;

  open(options: AnnualChargeAddOpenOptions): void {
    this._month = options.month;
    this._label = '';
    this._amount = '0,00 €';
    this._emoji = DEFAULT_EMOJI;
    this.render();
    this.classList.add('charge-add-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('charge-add-drawer--open');
  }

  private monthTitle(): string {
    const idx = this._month - 1;
    return idx >= 0 && idx < MONTH_NAMES.length ? MONTH_NAMES[idx]! : `Mois ${this._month}`;
  }

  private render(): void {
    const title = `Ajouter une charge — ${this.monthTitle()}`;
    this.innerHTML = `
      <div class="charge-add-drawer-backdrop" data-annual-charge-add-backdrop></div>
      <div class="charge-add-drawer-panel" role="dialog" aria-modal="true" aria-label="Ajouter une charge annuelle">
        <div class="charge-add-drawer-header">
          <h2 class="charge-add-drawer-title">${escapeHtml(title)}</h2>
        </div>
        <div class="charge-add-drawer-body">
          <div class="charge-add-drawer-field">
            <span class="charge-add-drawer-label">Libellé</span>
            <div class="charge-add-drawer-label-row">
              <button type="button" class="charge-add-emoji-btn" data-annual-charge-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <input type="text" class="charge-add-drawer-input" data-annual-charge-label placeholder="Ex. Assurance habitation" value="${escapeAttr(this._label)}" aria-label="Libellé de la charge">
            </div>
          </div>
          <label class="charge-add-drawer-field">
            <span class="charge-add-drawer-label">Montant</span>
            <button type="button" class="charge-add-drawer-amount" data-annual-charge-amount aria-label="Montant (ouvrir la calculatrice)">${escapeHtml(this._amount)}</button>
          </label>
        </div>
        <div class="charge-add-drawer-footer">
          <button type="button" class="btn charge-add-drawer-cancel">Annuler</button>
          <button type="button" class="btn charge-add-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    this.querySelector('[data-annual-charge-add-backdrop]')?.addEventListener('click', () => this.close());

    this.querySelector('[data-annual-charge-emoji]')?.addEventListener('click', () => this.openEmojiPicker());

    const labelInput = this.querySelector('[data-annual-charge-label]');
    const clearLabelError = (): void => {
      labelInput?.closest('.charge-add-drawer-field')?.classList.remove('charge-add-drawer-field--error');
    };
    labelInput?.addEventListener('focus', clearLabelError);
    labelInput?.addEventListener('input', clearLabelError);

    this.querySelector('[data-annual-charge-amount]')?.addEventListener('click', () => this.openCalculator());

    this.querySelector('.charge-add-drawer-cancel')?.addEventListener('click', () => this.close());
    this.querySelector('.charge-add-drawer-validate')?.addEventListener('click', () => this.doValidate());
  }

  private openEmojiPicker(): void {
    const picker = document.getElementById('emoji-picker-drawer') as BuddjEmojiPickerDrawerElement;
    picker?.open({
      defaultEmoji: this._emoji,
      onSelect: (emoji: string) => {
        this._emoji = emoji;
        const el = this.querySelector('[data-annual-charge-emoji]');
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
        const el = this.querySelector('[data-annual-charge-amount]');
        if (el) el.textContent = value;
      },
      onCancel: () => {},
    });
  }

  private doValidate(): void {
    const labelInput = this.querySelector('[data-annual-charge-label]') as HTMLInputElement;
    const label = labelInput?.value?.trim() ?? '';
    const toast = getToast();
    if (!label) {
      labelInput?.closest('.charge-add-drawer-field')?.classList.add('charge-add-drawer-field--error');
      toast?.show({ message: 'Le champ libellé est requis', variant: 'warning' });
      return;
    }
    const amount = parseEurosToNumber(this._amount);
    if (amount <= 0) {
      toast?.show({ message: 'Le montant doit être supérieur à 0', variant: 'warning' });
      return;
    }
    this.close();
    this.dispatchEvent(
      new CustomEvent('buddj-annual-charge-add-submit', {
        bubbles: true,
        composed: true,
        detail: { month: this._month, label, amount, emoji: this._emoji },
      }),
    );
  }
}

customElements.define(BuddjAnnualChargeAddDrawer.tagName, BuddjAnnualChargeAddDrawer);
