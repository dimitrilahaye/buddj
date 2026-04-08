/**
 * Drawer de choix d’emoji réutilisable (charges, budgets, etc.).
 * API : open({ onSelect: (emoji: string) => void, defaultEmoji?: string })
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

export interface EmojiPickerDrawerOpenOptions {
  onSelect: (emoji: string) => void;
  defaultEmoji?: string;
}

export type BuddjEmojiPickerDrawerElement = HTMLElement & { open: (o: EmojiPickerDrawerOpenOptions) => void };

const EMOJI_PICKER_SECTIONS: { title: string; emojis: string[] }[] = [
  { title: 'Argent & finances', emojis: ['💰', '🐖', '💳', '💵', '💴', '💶', '💸', '🏦', '📈', '📉', '🧾'] },
  { title: 'Logement', emojis: ['🏠', '🏡', '🏢', '🏬', '🔑', '🛏️'] },
  { title: 'Transport', emojis: ['🚗', '🚕', '🚎', '🚌', '🚅', '🚄', '✈️', '🚲', '🛵', '⛽', '🅿️'] },
  { title: 'Énergie & utilitaires', emojis: ['⚡', '💧', '🔥', '📱', '💻', '🌐', '🌍'] },
  { title: 'Alimentation', emojis: ['🍎', '🍽️', '☕', '🍔', '🍕', '🥐', '🥖', '🥗', '🍻', '🍫'] },
  { title: 'Shopping & loisirs', emojis: ['🛒', '🛍️', '🎬', '🍿', '🥤', '🎫', '🎟️', '🎮', '📺', '🎵', '📷', '🎁', '🎯', '🎪'] },
  { title: 'Santé', emojis: ['🏥', '💊', '🩺', '🦷', '🧴'] },
  { title: 'Éducation', emojis: ['📚', '✏️', '📖', '🎓', '📝'] },
  { title: 'Voyage & vacances', emojis: ['🏝️', '🏨', '🌴', '✈️', '🧳', '🗺️', '☀️'] },
  { title: 'Maison & entretien', emojis: ['🧹', '🔧', '📦', '🛋️', '🪴', '🪣', '🧺'] },
  { title: 'Personnel & style', emojis: ['💇', '👕', '👗', '💄', '💅'] },
  { title: 'Animaux', emojis: ['🐕', '🐈', '🐠', '🐦'] },
  { title: 'Divers', emojis: ['💐', '🎉', '📌', '🔔', '⏰', '📆'] },
];

export class BuddjEmojiPickerDrawer extends HTMLElement {
  static readonly tagName = 'buddj-emoji-picker-drawer';

  private _onSelect: ((emoji: string) => void) | null = null;

  open(options: EmojiPickerDrawerOpenOptions): void {
    this._onSelect = options.onSelect;
    this.render();
    this.classList.add('emoji-picker-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('emoji-picker-drawer--open');
    this._onSelect = null;
  }

  private render(): void {
    const sectionsHtml = EMOJI_PICKER_SECTIONS.map(
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
        <p class="emoji-picker-drawer-title">Choisir un emoji</p>
        <div class="emoji-picker-drawer-scroll">${sectionsHtml}</div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-emoji-picker-drawer-backdrop]');
    backdrop?.addEventListener('click', () => this.close());

    this.querySelectorAll('.emoji-picker-drawer-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const emoji = (btn as HTMLElement).dataset.emoji ?? '';
        this._onSelect?.(emoji);
        this.close();
      });
    });
  }
}

customElements.define(BuddjEmojiPickerDrawer.tagName, BuddjEmojiPickerDrawer);
