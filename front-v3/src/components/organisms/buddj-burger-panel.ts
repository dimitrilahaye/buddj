/**
 * Panel coulissant depuis la droite (menu burger).
 * Backdrop flouté, panel avec contenu. API : open(), close(), toggle(), isOpen.
 * Dispatch 'buddj-burger-change' avec { detail: { open: boolean } } à chaque changement.
 */
export class BuddjBurgerPanel extends HTMLElement {
  static readonly tagName = 'buddj-burger-panel';

  private _open = false;

  get isOpen(): boolean {
    return this._open;
  }

  open(): void {
    if (this._open) return;
    this._open = true;
    this.classList.add('burger-panel--open');
    this.dispatchChange();
  }

  close(): void {
    if (!this._open) return;
    this._open = false;
    this.classList.remove('burger-panel--open');
    this.dispatchChange();
  }

  toggle(): void {
    if (this._open) this.close();
    else this.open();
  }

  connectedCallback(): void {
    if (this.querySelector('.burger-panel-backdrop')) return;
    this.render();
    this.attachListeners();
  }

  private dispatchChange(): void {
    this.dispatchEvent(new CustomEvent('buddj-burger-change', { detail: { open: this._open }, bubbles: true }));
  }

  private render(): void {
    this.innerHTML = `
      <div class="burger-panel-backdrop" data-burger-backdrop aria-hidden="true"></div>
      <div class="burger-panel-drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="burger-panel-header">
          <button type="button" class="btn burger-panel-close" title="Fermer le menu" aria-label="Fermer le menu">×</button>
        </div>
        <nav class="burger-panel-content">
          <ul class="burger-panel-list">
            <li><a href="/new-month" class="burger-panel-link">Créer un nouveau mois</a></li>
            <li><a href="/archived" class="burger-panel-link">Accéder aux mois archivés</a></li>
            <li><a href="/templates" class="burger-panel-link">Gérer les templates</a></li>
          </ul>
          <div class="burger-panel-divider" aria-hidden="true"></div>
          <ul class="burger-panel-list">
            <li><a href="/annual-outflows" class="burger-panel-link">Sorties annuelles</a></li>
            <li><a href="/savings" class="burger-panel-link">Économies</a></li>
            <li><a href="/reimbursements" class="burger-panel-link">Remboursements</a></li>
          </ul>
          <div class="burger-panel-divider" aria-hidden="true"></div>
          <ul class="burger-panel-list">
            <li><button type="button" class="burger-panel-link burger-panel-link--logout">Se déconnecter</button></li>
          </ul>
        </nav>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-burger-backdrop]');
    const closeBtn = this.querySelector('.burger-panel-close');

    backdrop?.addEventListener('click', () => this.close());
    closeBtn?.addEventListener('click', () => this.close());

    this.querySelectorAll('.burger-panel-link').forEach((link) => {
      link.addEventListener('click', () => this.close());
    });
  }
}

customElements.define(BuddjBurgerPanel.tagName, BuddjBurgerPanel);
