/**
 * Drawer d’ajout d’une charge : emoji (picker global), label, montant (calculette globale), Annuler / Valider.
 */
import type { BudgetChargeDrawerOnValidate } from './buddj-budget-add-drawer.js';
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { attachInputClear } from '../../shared/input-clear.js';

const DEFAULT_CHARGE_EMOJI = '💰';

export interface ChargeAddDrawerOptions {
  title?: string;
  initialLabel?: string;
  initialAmount?: string;
  initialEmoji?: string;
  /** Si fourni, mode édition : au valid on appelle ce callback au lieu d’émettre l’événement. */
  onValidate?: BudgetChargeDrawerOnValidate;
}

export type BuddjChargeAddDrawerElement = HTMLElement & { open: () => void };

export class BuddjChargeAddDrawer extends HTMLElement {
  static readonly tagName = 'buddj-charge-add-drawer';

  private _label = '';
  private _amount = '0,00 €';
  private _emoji = DEFAULT_CHARGE_EMOJI;
  private _onValidate: BudgetChargeDrawerOnValidate | null = null;

  private _title = 'Ajouter une charge';

  open(options?: ChargeAddDrawerOptions): void {
    this._title = options?.title ?? 'Ajouter une charge';
    this._label = options?.initialLabel ?? '';
    this._amount = options?.initialAmount ?? '0,00 €';
    this._emoji = options?.initialEmoji ?? DEFAULT_CHARGE_EMOJI;
    this._onValidate = options?.onValidate ?? null;
    this.render();
    this.classList.add('charge-add-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('charge-add-drawer--open');
  }

  private render(): void {
    this.innerHTML = `
      <div class="charge-add-drawer-backdrop" data-charge-add-backdrop></div>
      <div class="charge-add-drawer-panel" role="dialog" aria-modal="true" aria-label="Ajouter une charge">
        <div class="charge-add-drawer-header">
          <h2 class="charge-add-drawer-title">${escapeHtml(this._title)}</h2>
        </div>
        <div class="charge-add-drawer-body">
          <div class="charge-add-drawer-field">
            <span class="charge-add-drawer-label">Libellé</span>
            <div class="charge-add-drawer-label-row">
              <button type="button" class="charge-add-emoji-btn" data-charge-add-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <div class="buddj-input-clear-wrap">
                <input type="text" class="charge-add-drawer-input" data-charge-add-label placeholder="Ex. Loyer" value="${escapeAttr(this._label)}" aria-label="Libellé de la charge">
                <button type="button" class="buddj-input-clear-btn" data-buddj-input-clear aria-label="Effacer le libellé" hidden><span aria-hidden="true">×</span></button>
              </div>
            </div>
          </div>
          <label class="charge-add-drawer-field">
            <span class="charge-add-drawer-label">Montant</span>
            <button type="button" class="charge-add-drawer-amount" data-charge-add-amount aria-label="Montant (ouvrir la calculatrice)">${escapeHtml(this._amount)}</button>
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
    const backdrop = this.querySelector('[data-charge-add-backdrop]');
    backdrop?.addEventListener('click', () => this.close());

    const emojiBtn = this.querySelector('[data-charge-add-emoji]');
    emojiBtn?.addEventListener('click', () => this.openEmojiPicker());

    const labelInput = this.querySelector('[data-charge-add-label]');
    const clearLabelError = (): void => {
      labelInput?.closest('.charge-add-drawer-field')?.classList.remove('charge-add-drawer-field--error');
    };
    labelInput?.addEventListener('focus', clearLabelError);
    labelInput?.addEventListener('input', clearLabelError);

    const labelClearWrap = this.querySelector('[data-charge-add-label]')?.closest('.buddj-input-clear-wrap');
    if (labelClearWrap instanceof HTMLElement) attachInputClear({ root: labelClearWrap });

    const amountBtn = this.querySelector('[data-charge-add-amount]');
    amountBtn?.addEventListener('click', () => this.openCalculator());

    const cancelBtn = this.querySelector('.charge-add-drawer-cancel');
    cancelBtn?.addEventListener('click', () => this.close());

    const validateBtn = this.querySelector('.charge-add-drawer-validate');
    validateBtn?.addEventListener('click', () => this.doValidate());
  }

  private openEmojiPicker(): void {
    const picker = document.getElementById('emoji-picker-drawer') as BuddjEmojiPickerDrawerElement;
    picker?.open({
      defaultEmoji: this._emoji,
      onSelect: (emoji: string) => {
        this._emoji = emoji;
        this.updateEmojiDisplay();
      },
    });
  }

  private updateEmojiDisplay(): void {
    const el = this.querySelector('[data-charge-add-emoji]');
    if (el) el.textContent = this._emoji;
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    calculator?.open({
      title: 'Montant',
      initialValue: this._amount,
      startWithInitialValue: this._amount !== '0,00 €',
      onValidate: (value: string) => {
        this._amount = value;
        this.updateAmountDisplay();
      },
      onCancel: () => {},
    });
  }

  private updateAmountDisplay(): void {
    const el = this.querySelector('[data-charge-add-amount]');
    if (el) el.textContent = this._amount;
  }

  private doValidate(): void {
    const labelInput = this.querySelector('[data-charge-add-label]') as HTMLInputElement;
    this._label = labelInput?.value?.trim() ?? '';
    const toast = getToast();
    if (!this._label) {
      labelInput?.closest('.charge-add-drawer-field')?.classList.add('charge-add-drawer-field--error');
      toast?.show({ message: 'Le champ libellé est requis', variant: 'warning' });
      return;
    }
    this.close();
    if (this._onValidate) {
      this._onValidate(this._label, this._amount, this._emoji);
      toast?.show({ message: 'La charge a bien été modifiée' });
    } else {
      this.dispatchEvent(new CustomEvent('buddj-charge-add-done', { bubbles: true, detail: { label: this._label, amount: this._amount, emoji: this._emoji } }));
      toast?.show({ message: 'La charge a bien été ajoutée' });
    }
  }
}

customElements.define(BuddjChargeAddDrawer.tagName, BuddjChargeAddDrawer);
