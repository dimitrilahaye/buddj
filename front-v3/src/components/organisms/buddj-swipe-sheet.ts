/**
 * Feuille ouverte en grand depuis le bas de l'écran, faite de pages côte à côte qu'on fait défiler
 * au doigt (ou aux flèches, ou via les points en haut et en bas). Le titre est celui de la page affichée.
 *
 * À créer avec document.createElement puis à poser dans <body> (l'écran crée un contexte d'empilement
 * sous l'en-tête global). API : setPages(pages), page(id), open(id), show(id), close(), current.
 * Événements (non propagés) : `swipe-sheet-change` ({ id }) quand la page affichée change,
 * `swipe-sheet-close` ({ id }) à la fermeture (bouton, fond ou Échap).
 */
import { escapeAttr } from '../../shared/escape.js';

export type SwipeSheetPage = { id: string; label: string };

export type SwipeSheetEventDetail = { id: string };

function dotsHtml(pages: SwipeSheetPage[], position: 'top' | 'bottom'): string {
  return `
    <div class="pager-dots swipe-sheet-dots swipe-sheet-dots--${position}" aria-hidden="true">
      ${pages.map((p) => `<button type="button" tabindex="-1" class="pager-dot" data-dot="${escapeAttr(p.id)}"></button>`).join('')}
    </div>`;
}

export class BuddjSwipeSheet extends HTMLElement {
  static readonly tagName = 'buddj-swipe-sheet';

  private _pages: SwipeSheetPage[] = [];
  /** Page affichée, null quand la feuille est fermée. */
  private _current: string | null = null;
  private _scrollFrame = 0;

  constructor() {
    super();
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeyDown);
  }

  get current(): string | null {
    return this._current;
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this._scrollFrame);
  }

  setPages(pages: SwipeSheetPage[]): void {
    this._pages = pages;
    this.hidden = true;
    this.innerHTML = `
      <div class="swipe-sheet-backdrop" data-sheet-close></div>
      <div class="swipe-sheet-panel" role="dialog" aria-modal="true">
        <div class="swipe-sheet-header">
          <h2 class="swipe-sheet-title"></h2>
          <button type="button" class="swipe-sheet-close" data-sheet-close aria-label="Fermer">✕</button>
        </div>
        ${dotsHtml(pages, 'top')}
        <div class="swipe-sheet-track">
          ${pages.map((p) => `<div class="swipe-sheet-page" data-page="${escapeAttr(p.id)}"></div>`).join('')}
        </div>
        ${dotsHtml(pages, 'bottom')}
      </div>
    `;
    this._track().addEventListener('scroll', this._onScroll, { passive: true });
  }

  page(id: string): HTMLElement {
    return this.querySelector(`.swipe-sheet-page[data-page="${id}"]`) as HTMLElement;
  }

  /** Ouvre la feuille directement sur la page demandée. */
  open(id: string): void {
    this._current = id;
    this.hidden = false;
    this._scrollTo(id, 'instant');
    this._sync();
    (this.querySelector('.swipe-sheet-close') as HTMLElement | null)?.focus();
  }

  /** Fait défiler jusqu'à la page demandée, feuille ouverte. */
  show(id: string): void {
    if (this._current === null) return;
    this._scrollTo(id, 'smooth');
    this._setCurrent(id);
  }

  close(): void {
    const id = this._current;
    if (id === null) return;
    this._current = null;
    this.hidden = true;
    this.dispatchEvent(new CustomEvent<SwipeSheetEventDetail>('swipe-sheet-close', { detail: { id } }));
  }

  private _track(): HTMLElement {
    return this.querySelector('.swipe-sheet-track') as HTMLElement;
  }

  private _scrollTo(id: string, behavior: ScrollBehavior): void {
    const track = this._track();
    const page = this.page(id);
    if (page && typeof track.scrollTo === 'function') {
      track.scrollTo({ left: page.offsetLeft - track.offsetLeft, behavior });
    }
  }

  private _setCurrent(id: string): void {
    if (this._current === null || id === this._current) return;
    this._current = id;
    this._sync();
    this.dispatchEvent(new CustomEvent<SwipeSheetEventDetail>('swipe-sheet-change', { detail: { id } }));
  }

  /** Titre, nom de la boîte de dialogue et points : ceux de la page affichée. */
  private _sync(): void {
    const label = this._pages.find((p) => p.id === this._current)?.label ?? '';
    (this.querySelector('.swipe-sheet-panel') as HTMLElement).setAttribute('aria-label', label);
    (this.querySelector('.swipe-sheet-title') as HTMLElement).textContent = label;
    this.querySelectorAll<HTMLElement>('.pager-dot').forEach((dot) => {
      dot.classList.toggle('pager-dot--active', dot.dataset.dot === this._current);
    });
  }

  /** Le balayage d'une page à l'autre change la page affichée. */
  private _onScroll = (): void => {
    cancelAnimationFrame(this._scrollFrame);
    this._scrollFrame = requestAnimationFrame(() => {
      const track = this._track();
      if (this._current === null || track.clientWidth === 0) return;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      this._setCurrent(this._pages[Math.min(Math.max(index, 0), this._pages.length - 1)]!.id);
    });
  };

  private _onClick = (e: Event): void => {
    const target = e.target as Element;
    const dot = target.closest<HTMLElement>('.pager-dot');
    if (dot) {
      this.show(dot.dataset.dot!);
      return;
    }
    if (target.closest('[data-sheet-close]')) this.close();
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this._current === null) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    // Flèches gauche / droite d'une page à l'autre, sauf si un élément de la page s'en sert déjà
    if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.defaultPrevented) return;
    e.preventDefault();
    const index = this._pages.findIndex((p) => p.id === this._current);
    const step = e.key === 'ArrowRight' ? 1 : this._pages.length - 1;
    this.show(this._pages[(index + step) % this._pages.length]!.id);
  };
}

customElements.define(BuddjSwipeSheet.tagName, BuddjSwipeSheet);
