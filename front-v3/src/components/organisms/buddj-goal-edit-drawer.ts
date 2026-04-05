/**
 * Drawer pour mettre à jour un objectif (émoji + intitulé + somme totale).
 */
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import type { GoalDrawerOnValidate } from './buddj-goal-add-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

const FALLBACK_EMOJI = '💰';

export class BuddjGoalEditDrawer extends HTMLElement {
  static readonly tagName = 'buddj-goal-edit-drawer';

  private _title = 'Mettre à jour';
  private _label = '';
  private _total = '0,00 €';
  private _emoji = FALLBACK_EMOJI;
  private _onValidate: GoalDrawerOnValidate | null = null;

  open(options: {
    title?: string;
    initialLabel: string;
    initialTotal: string;
    initialEmoji?: string;
    onValidate: GoalDrawerOnValidate;
  }): void {
    this._title = options.title ?? 'Mettre à jour';
    this._label = options.initialLabel;
    this._total = options.initialTotal;
    this._emoji = options.initialEmoji?.trim() || FALLBACK_EMOJI;
    this._onValidate = options.onValidate;
    this.render();
    this.classList.add('goal-edit-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('goal-edit-drawer--open');
  }

  private render(): void {
    this.innerHTML = `
      <div class="goal-edit-drawer-backdrop" data-goal-edit-backdrop></div>
      <div class="goal-edit-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(this._title)}">
        <div class="goal-edit-drawer-header">
          <h2 class="goal-edit-drawer-title">${escapeHtml(this._title)}</h2>
        </div>
        <div class="goal-edit-drawer-body">
          <div class="goal-edit-drawer-field">
            <span class="goal-edit-drawer-label">Intitulé</span>
            <div class="goal-edit-drawer-label-row">
              <button type="button" class="goal-edit-emoji-btn" data-goal-edit-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <input type="text" class="goal-edit-drawer-input" data-goal-edit-label value="${escapeAttr(this._label)}" placeholder="Ex. Vacances">
            </div>
          </div>
          <label class="goal-edit-drawer-field">
            <span class="goal-edit-drawer-label">Somme totale</span>
            <button type="button" class="goal-edit-drawer-amount" data-goal-edit-amount>${escapeHtml(this._total)}</button>
          </label>
        </div>
        <div class="goal-edit-drawer-footer">
          <button type="button" class="btn goal-edit-drawer-cancel">Annuler</button>
          <button type="button" class="btn goal-edit-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    this.querySelector('[data-goal-edit-backdrop]')?.addEventListener('click', () => this.close());
    this.querySelector('.goal-edit-drawer-cancel')?.addEventListener('click', () => this.close());
    this.querySelector('.goal-edit-drawer-validate')?.addEventListener('click', () => this.doValidate());
    this.querySelector('[data-goal-edit-amount]')?.addEventListener('click', () => this.openCalculator());
    this.querySelector('[data-goal-edit-emoji]')?.addEventListener('click', () => this.openEmojiPicker());
  }

  private openEmojiPicker(): void {
    const picker = document.getElementById('emoji-picker-drawer') as BuddjEmojiPickerDrawerElement;
    picker?.open({
      defaultEmoji: this._emoji,
      onSelect: (emoji: string) => {
        this._emoji = emoji;
        const btn = this.querySelector('[data-goal-edit-emoji]');
        if (btn) btn.textContent = emoji;
      },
    });
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    const raw = this._total.replace(/\s/g, '').replace('€', '').trim().replace(',', '.');
    calculator?.open({
      initialValue: raw || '0',
      title: 'Somme totale',
      startWithInitialValue: true,
      onValidate: (value: string) => {
        this._total = value;
        const btn = this.querySelector('[data-goal-edit-amount]');
        if (btn) btn.textContent = value;
      },
      onCancel: () => {},
    });
  }

  private doValidate(): void {
    const label = (this.querySelector('[data-goal-edit-label]') as HTMLInputElement)?.value?.trim() ?? '';
    if (!label) {
      this.showToast('L\'intitulé est requis.');
      this.querySelector('.goal-edit-drawer-field')?.classList.add('goal-edit-drawer-field--error');
      return;
    }
    this._onValidate?.(label, this._total, this._emoji);
    this.close();
  }

  private showToast(message: string): void {
    const toast = getToast();
    toast?.show({ message });
  }
}

customElements.define(BuddjGoalEditDrawer.tagName, BuddjGoalEditDrawer);
