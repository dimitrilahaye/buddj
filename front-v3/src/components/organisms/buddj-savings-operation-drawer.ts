/**
 * Drawer d'ajout / modification d'une opération d'épargne : type (ajout / retrait), libellé facultatif,
 * montant (calculette globale) et date (calendrier en mode jour). Annuler / Valider.
 * Reprend l'allure du drawer d'ajout de dépense.
 */
import type { SavingsOperationInput, SavingsOperationType } from '../../application/savings-account/savings-account-types.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import './buddj-date-range-picker-drawer.js';
import type { BuddjDateRangePickerDrawerElement } from './buddj-date-range-picker-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { attachInputClear } from '../../shared/input-clear.js';
import { formatEuros, parseEurosToNumber } from '../../shared/goal.js';

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatOperationDay(day: string): string {
  return dayFormatter.format(new Date(`${day}T00:00:00Z`));
}

const TYPE_LABELS: Record<SavingsOperationType, string> = {
  deposit: 'Ajout',
  withdrawal: 'Retrait',
};

export type SavingsOperationDrawerOpenOptions = {
  title: string;
  /** Opération à modifier ; absent pour un ajout */
  initial?: SavingsOperationInput;
  /** Jour par défaut d'un ajout (YYYY-MM-DD) */
  today: string;
  onValidate: (operation: SavingsOperationInput) => void;
};

export type BuddjSavingsOperationDrawerElement = HTMLElement & {
  open: (o: SavingsOperationDrawerOpenOptions) => void;
  close: () => void;
};

export class BuddjSavingsOperationDrawer extends HTMLElement {
  static readonly tagName = 'buddj-savings-operation-drawer';

  private _title = '';
  private _type: SavingsOperationType = 'deposit';
  private _label = '';
  private _amount = '0,00 €';
  private _date = '';
  private _today = '';
  private _onValidate: ((operation: SavingsOperationInput) => void) | null = null;

  open({ title, initial, today, onValidate }: SavingsOperationDrawerOpenOptions): void {
    this._title = title;
    this._type = initial?.type ?? 'deposit';
    this._label = initial?.label ?? '';
    this._amount = initial ? formatEuros(initial.amount) : '0,00 €';
    this._date = initial?.date ?? today;
    this._today = today;
    this._onValidate = onValidate;
    this._render();
    this.classList.add('savings-operation-drawer--open');
    this._attachListeners();
  }

  close(): void {
    this.classList.remove('savings-operation-drawer--open');
    this._onValidate = null;
    this.innerHTML = '';
  }

  private _render(): void {
    this.innerHTML = `
      <div class="expense-add-drawer-backdrop" data-savings-operation-backdrop></div>
      <div class="expense-add-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(this._title)}">
        <div class="expense-add-drawer-header">
          <h2 class="expense-add-drawer-title">${escapeHtml(this._title)}</h2>
        </div>
        <div class="expense-add-drawer-body">
          <fieldset class="expense-add-drawer-field savings-operation-types">
            <legend class="expense-add-drawer-label">Type</legend>
            ${(['deposit', 'withdrawal'] as const)
              .map(
                (type) => `
            <label class="spending-tracker-chip savings-operation-type savings-operation-type--${type}">
              <input type="radio" name="savings-operation-type" value="${type}"${type === this._type ? ' checked' : ''}>
              <span>${TYPE_LABELS[type]}</span>
            </label>`
              )
              .join('')}
          </fieldset>
          <div class="expense-add-drawer-field">
            <span class="expense-add-drawer-label">Libellé (facultatif)</span>
            <div class="buddj-input-clear-wrap">
              <input type="text" class="expense-add-drawer-input" data-savings-operation-label placeholder="Ex. Trou de trésorerie" value="${escapeAttr(this._label)}" aria-label="Libellé de l’opération">
              <button type="button" class="buddj-input-clear-btn" data-buddj-input-clear aria-label="Effacer le libellé" hidden><span aria-hidden="true">×</span></button>
            </div>
          </div>
          <div class="expense-add-drawer-field">
            <span class="expense-add-drawer-label">Montant</span>
            <button type="button" class="expense-add-drawer-amount" data-savings-operation-amount aria-label="Montant : ${escapeAttr(this._amount)} (ouvrir la calculatrice)">${escapeHtml(this._amount)}</button>
          </div>
          <div class="expense-add-drawer-field">
            <span class="expense-add-drawer-label">Date</span>
            <button type="button" class="expense-add-drawer-amount" data-savings-operation-date aria-haspopup="dialog" aria-label="Date : ${escapeAttr(formatOperationDay(this._date))}">${escapeHtml(formatOperationDay(this._date))}</button>
          </div>
        </div>
        <div class="expense-add-drawer-footer">
          <button type="button" class="btn expense-add-drawer-cancel">Annuler</button>
          <button type="button" class="btn expense-add-drawer-validate">Valider</button>
        </div>
      </div>
      <buddj-date-range-picker-drawer></buddj-date-range-picker-drawer>
    `;
  }

  private _attachListeners(): void {
    this.querySelector('[data-savings-operation-backdrop]')?.addEventListener('click', () => this.close());
    this.querySelector('.expense-add-drawer-cancel')?.addEventListener('click', () => this.close());
    this.querySelector('.expense-add-drawer-validate')?.addEventListener('click', () => this._validate());
    this.querySelector('[data-savings-operation-amount]')?.addEventListener('click', () => this._openCalculator());
    this.querySelector('[data-savings-operation-date]')?.addEventListener('click', () => this._openDatePicker());
    this.querySelectorAll<HTMLInputElement>('input[name="savings-operation-type"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        if (radio.checked) this._type = radio.value as SavingsOperationType;
      });
    });
    const clearWrap = this.querySelector('[data-savings-operation-label]')?.closest('.buddj-input-clear-wrap');
    if (clearWrap instanceof HTMLElement) attachInputClear({ root: clearWrap });
  }

  private _openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement | null;
    calculator?.open({
      title: 'Montant',
      initialValue: this._amount,
      startWithInitialValue: this._amount !== '0,00 €',
      onValidate: (value: string) => {
        this._amount = value;
        const button = this.querySelector('[data-savings-operation-amount]');
        if (button) {
          button.textContent = value;
          button.setAttribute('aria-label', `Montant : ${value} (ouvrir la calculatrice)`);
        }
      },
      onCancel: () => {},
    });
  }

  private _openDatePicker(): void {
    const picker = this.querySelector('buddj-date-range-picker-drawer') as BuddjDateRangePickerDrawerElement;
    picker.open({
      mode: 'day',
      range: { from: this._date, to: this._date },
      today: this._today,
      onValidate: ({ from }) => {
        this._date = from;
        const button = this.querySelector('[data-savings-operation-date]');
        if (button) {
          button.textContent = formatOperationDay(from);
          button.setAttribute('aria-label', `Date : ${formatOperationDay(from)}`);
        }
      },
    });
  }

  private _validate(): void {
    const amount = parseEurosToNumber(this._amount);
    if (amount <= 0) {
      getToast()?.show({ message: 'Le montant doit être supérieur à 0', variant: 'warning' });
      return;
    }
    const labelInput = this.querySelector('[data-savings-operation-label]') as HTMLInputElement | null;
    const label = labelInput?.value.trim() ?? '';
    const onValidate = this._onValidate;
    const operation: SavingsOperationInput = {
      type: this._type,
      amount,
      label: label === '' ? null : label,
      date: this._date,
    };
    this.close();
    onValidate?.(operation);
  }
}

customElements.define(BuddjSavingsOperationDrawer.tagName, BuddjSavingsOperationDrawer);
