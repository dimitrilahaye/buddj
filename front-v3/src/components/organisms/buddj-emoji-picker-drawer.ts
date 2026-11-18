/**
 * Drawer de choix d’emoji réutilisable (charges, budgets, etc.).
 * API : open({ onSelect: (emoji: string) => void, defaultEmoji?: string })
 *
 * La poignée en tête du drawer se tire : vers le haut, il passe en grand ;
 * vers le bas, il revient à sa taille par défaut puis, au geste suivant, se ferme.
 * La croix et le clic en dehors le ferment aussi.
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { EMOJI_CATEGORIES } from '../../shared/emoji-categories.js';

export interface EmojiPickerDrawerOpenOptions {
  onSelect: (emoji: string) => void;
  defaultEmoji?: string;
}

export type BuddjEmojiPickerDrawerElement = HTMLElement & { open: (o: EmojiPickerDrawerOpenOptions) => void };

/** Distance (px) à partir de laquelle un geste change l'état du drawer. */
const DRAG_THRESHOLD_PX = 60;

const EXPANDED_CLASS = 'emoji-picker-drawer--expanded';
const DRAGGING_CLASS = 'emoji-picker-drawer--dragging';

export class BuddjEmojiPickerDrawer extends HTMLElement {
  static readonly tagName = 'buddj-emoji-picker-drawer';

  private _onSelect: ((emoji: string) => void) | null = null;
  private _isExpanded = false;
  /** Geste en cours sur la poignée : position de départ et hauteur du panneau à ce moment. */
  private _drag: { pointerId: number; startY: number; startHeight: number; dy: number } | null = null;

  open(options: EmojiPickerDrawerOpenOptions): void {
    this._onSelect = options.onSelect;
    this.render();
    this._setExpanded(false);
    this.classList.add('emoji-picker-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('emoji-picker-drawer--open', DRAGGING_CLASS);
    this._setExpanded(false);
    this._drag = null;
    this._onSelect = null;
  }

  private _panel(): HTMLElement | null {
    return this.querySelector('.emoji-picker-drawer-panel');
  }

  private _setExpanded(expanded: boolean): void {
    this._isExpanded = expanded;
    this.classList.toggle(EXPANDED_CLASS, expanded);
    this.querySelector('.emoji-picker-drawer-handle')?.setAttribute('aria-expanded', String(expanded));
  }

  private render(): void {
    const sectionsHtml = EMOJI_CATEGORIES.map(
      (section) => `
        <div class="emoji-picker-drawer-section">
          <p class="emoji-picker-drawer-section-title">${escapeHtml(section.title)}</p>
          <div class="emoji-picker-drawer-grid">
            ${section.emojis
              .map(
                (emoji) =>
                  `<button type="button" class="emoji-picker-drawer-item" data-emoji="${escapeAttr(emoji)}" aria-label="Choisir ${escapeAttr(emoji)}">${escapeHtml(emoji)}</button>`
              )
              .join('')}
          </div>
        </div>`
    ).join('');
    this.innerHTML = `
      <div class="emoji-picker-drawer-backdrop" data-emoji-picker-drawer-backdrop></div>
      <div class="emoji-picker-drawer-panel" role="dialog" aria-modal="true" aria-label="Choisir un emoji">
        <div class="emoji-picker-drawer-header">
          <button type="button" class="emoji-picker-drawer-handle" aria-label="Agrandir ou réduire" aria-expanded="false">
            <span class="emoji-picker-drawer-handle-bar" aria-hidden="true"></span>
          </button>
          <p class="emoji-picker-drawer-title">Choisir un emoji</p>
          <button type="button" class="emoji-picker-drawer-close" aria-label="Fermer">✕</button>
        </div>
        <div class="emoji-picker-drawer-scroll">${sectionsHtml}</div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-emoji-picker-drawer-backdrop]');
    backdrop?.addEventListener('click', () => this.close());
    this.querySelector('.emoji-picker-drawer-close')?.addEventListener('click', () => this.close());

    const header = this.querySelector('.emoji-picker-drawer-header') as HTMLElement | null;
    header?.addEventListener('pointerdown', this._onPointerDown);
    header?.addEventListener('pointermove', this._onPointerMove);
    header?.addEventListener('pointerup', this._onPointerUp);
    header?.addEventListener('pointercancel', this._onPointerCancel);
    // Au clavier (ou clic sans glisser), la poignée bascule entre taille par défaut et grand.
    this.querySelector('.emoji-picker-drawer-handle')?.addEventListener('click', this._onHandleClick);

    this.querySelectorAll('.emoji-picker-drawer-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const emoji = (btn as HTMLElement).dataset.emoji ?? '';
        this._onSelect?.(emoji);
        this.close();
      });
    });
  }

  /** Un clic qui suit un vrai glisser a déjà été traité au relâchement. */
  private _ignoreNextHandleClick = false;

  private _onHandleClick = (): void => {
    if (this._ignoreNextHandleClick) {
      this._ignoreNextHandleClick = false;
      return;
    }
    this._setExpanded(!this._isExpanded);
  };

  private _onPointerDown = (e: PointerEvent): void => {
    if ((e.target as Element).closest('.emoji-picker-drawer-close')) return;
    const panel = this._panel();
    if (!panel) return;
    this._ignoreNextHandleClick = false;
    this._drag = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startHeight: panel.getBoundingClientRect().height,
      dy: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  private _onPointerMove = (e: PointerEvent): void => {
    const drag = this._drag;
    const panel = this._panel();
    if (!drag || !panel || e.pointerId !== drag.pointerId) return;
    drag.dy = e.clientY - drag.startY;
    if (Math.abs(drag.dy) < 4) return;
    this.classList.add(DRAGGING_CLASS);
    // Le panneau suit le doigt : il grandit vers le haut, glisse vers le bas.
    if (drag.dy < 0) {
      panel.style.height = drag.startHeight > 0 ? `${drag.startHeight - drag.dy}px` : '';
      panel.style.transform = '';
    } else {
      panel.style.height = '';
      panel.style.transform = `translateY(${drag.dy}px)`;
    }
  };

  private _onPointerUp = (e: PointerEvent): void => {
    const drag = this._drag;
    if (!drag || e.pointerId !== drag.pointerId) return;
    const dy = e.clientY - drag.startY;
    this._endDrag();
    if (Math.abs(dy) >= 4) this._ignoreNextHandleClick = true;
    if (dy <= -DRAG_THRESHOLD_PX) {
      this._setExpanded(true);
    } else if (dy >= DRAG_THRESHOLD_PX) {
      // Un cran à la fois : grand → défaut, défaut → fermé.
      if (this._isExpanded) this._setExpanded(false);
      else this.close();
    }
  };

  private _onPointerCancel = (): void => {
    this._endDrag();
  };

  private _endDrag(): void {
    this._drag = null;
    this.classList.remove(DRAGGING_CLASS);
    const panel = this._panel();
    if (panel) {
      panel.style.height = '';
      panel.style.transform = '';
    }
  }
}

customElements.define(BuddjEmojiPickerDrawer.tagName, BuddjEmojiPickerDrawer);
