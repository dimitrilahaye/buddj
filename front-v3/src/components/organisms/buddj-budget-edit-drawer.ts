/**
 * Drawer d’édition d’un budget : emoji (picker global) + libellé.
 * API : open({ initialLabel, initialEmoji?, onValidate(label, emoji) }) — champ libellé requis.
 */
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { attachInputClear } from '../../shared/input-clear.js';

const DEFAULT_EMOJI = '💰';

/** Callback de validation du drawer d'édition budget : label, emoji */
export type BudgetEditDrawerOnValidate = (label: string, emoji: string) => void;

export class BuddjBudgetEditDrawer extends HTMLElement {
  static readonly tagName = 'buddj-budget-edit-drawer';

  private _label = '';
  private _emoji = DEFAULT_EMOJI;
  private _onValidate: BudgetEditDrawerOnValidate | null = null;
  private _dialogTitle = 'Modifier le budget';
  private _dialogAriaLabel = 'Modifier le budget';

  open(options: {
    initialLabel: string;
    initialEmoji?: string;
    onValidate: BudgetEditDrawerOnValidate;
    /** Titre du panneau (défaut : « Modifier le budget »). */
    title?: string;
    /** `aria-label` du dialogue (défaut : égal à `title` ou au défaut). */
    ariaLabel?: string;
  }): void {
    this._label = options.initialLabel;
    this._emoji = options.initialEmoji ?? DEFAULT_EMOJI;
    this._onValidate = options.onValidate;
    this._dialogTitle = options.title ?? 'Modifier le budget';
    this._dialogAriaLabel = options.ariaLabel ?? options.title ?? 'Modifier le budget';
    this.render();
    this.classList.add('budget-edit-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('budget-edit-drawer--open');
    this._onValidate = null;
  }

  private render(): void {
    this.innerHTML = `
      <div class="budget-edit-drawer-backdrop" data-budget-edit-backdrop></div>
      <div class="budget-edit-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(this._dialogAriaLabel)}">
        <div class="budget-edit-drawer-header">
          <h2 class="budget-edit-drawer-title">${escapeHtml(this._dialogTitle)}</h2>
        </div>
        <div class="budget-edit-drawer-body">
          <div class="budget-edit-drawer-field">
            <span class="budget-edit-drawer-label">Libellé</span>
            <div class="budget-edit-drawer-label-row">
              <button type="button" class="budget-edit-emoji-btn" data-budget-edit-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <div class="buddj-input-clear-wrap">
                <input type="text" class="budget-edit-drawer-input" data-budget-edit-label placeholder="Ex. Vacances" value="${escapeAttr(this._label)}" aria-label="Libellé du budget">
                <button type="button" class="buddj-input-clear-btn" data-buddj-input-clear aria-label="Effacer le libellé" hidden><span aria-hidden="true">×</span></button>
              </div>
            </div>
          </div>
        </div>
        <div class="budget-edit-drawer-footer">
          <button type="button" class="btn budget-edit-drawer-cancel">Annuler</button>
          <button type="button" class="btn budget-edit-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-budget-edit-backdrop]');
    backdrop?.addEventListener('click', () => this.close());

    const emojiBtn = this.querySelector('[data-budget-edit-emoji]');
    emojiBtn?.addEventListener('click', () => this.openEmojiPicker());

    const labelInput = this.querySelector('[data-budget-edit-label]');
    const clearLabelError = (): void => {
      labelInput?.closest('.budget-edit-drawer-field')?.classList.remove('budget-edit-drawer-field--error');
    };
    labelInput?.addEventListener('focus', clearLabelError);
    labelInput?.addEventListener('input', clearLabelError);

    const labelClearWrap = this.querySelector('[data-budget-edit-label]')?.closest('.buddj-input-clear-wrap');
    if (labelClearWrap instanceof HTMLElement) attachInputClear({ root: labelClearWrap });

    const cancelBtn = this.querySelector('.budget-edit-drawer-cancel');
    cancelBtn?.addEventListener('click', () => this.close());

    const validateBtn = this.querySelector('.budget-edit-drawer-validate');
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
    const el = this.querySelector('[data-budget-edit-emoji]');
    if (el) el.textContent = this._emoji;
  }

  private doValidate(): void {
    const labelInput = this.querySelector('[data-budget-edit-label]') as HTMLInputElement;
    const label = labelInput?.value?.trim() ?? '';
    const toast = getToast();
    if (!label) {
      labelInput?.closest('.budget-edit-drawer-field')?.classList.add('budget-edit-drawer-field--error');
      toast?.show({ message: 'Le champ libellé est requis', variant: 'warning' });
      return;
    }
    this._onValidate?.(label, this._emoji);
    this.close();
  }
}

customElements.define(BuddjBudgetEditDrawer.tagName, BuddjBudgetEditDrawer);
