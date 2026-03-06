/**
 * Navigation principale : liens vers /outflows/:monthId et /budgets/:monthId.
 * Attribut month-id pour construire les hrefs ; l’état actif est géré via .nav-link--active.
 */
export class BuddjNav extends HTMLElement {
  static readonly tagName = 'buddj-nav';

  static get observedAttributes(): string[] {
    return ['month-id'];
  }

  private get monthId(): string {
    return this.getAttribute('month-id') ?? '2024-04';
  }

  connectedCallback(): void {
    this.render();
    document.addEventListener('buddj-burger-change', this._onBurgerChange);
  }

  disconnectedCallback(): void {
    document.removeEventListener('buddj-burger-change', this._onBurgerChange);
  }

  private _onBurgerChange = (e: Event): void => {
    this._burgerOpen = (e as CustomEvent<{ open: boolean }>).detail.open;
    this.render();
  };

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private _activeRoute = '';
  private _burgerOpen = false;

  private render(): void {
    const m = this.monthId;
    const burgerIcon = this._burgerOpen ? '×' : '☰';
    const burgerTitle = this._burgerOpen ? 'Fermer le menu' : 'Ouvrir le menu';
    this.innerHTML = `
      <nav class="nav-main">
        <div class="nav-main-links">
          <a href="/outflows/${m}" class="nav-link">Charges</a>
          <a href="/budgets/${m}" class="nav-link">Budgets</a>
        </div>
        <button type="button" class="btn nav-burger" title="${burgerTitle}" aria-label="${burgerTitle}" aria-expanded="${this._burgerOpen}">${burgerIcon}</button>
      </nav>
    `;
    this.querySelectorAll('.nav-link').forEach((a) => {
      const route = (a.getAttribute('href') ?? '').replace(/^\/+/, '').split('/')[0] ?? '';
      a.classList.toggle('nav-link--active', route === this._activeRoute);
    });
    this.attachBurgerListeners();
  }

  private attachBurgerListeners(): void {
    const panel = document.getElementById('burger-panel') as HTMLElement & { open: () => void; close: () => void; isOpen: boolean };
    const burgerBtn = this.querySelector('.nav-burger');
    if (!panel || !burgerBtn) return;

    burgerBtn.addEventListener('click', () => {
      if (panel.isOpen) panel.close();
      else panel.open();
    });
  }

  setActiveRoute(routeName: string): void {
    this._activeRoute = routeName;
    this.querySelectorAll('.nav-link').forEach((a) => {
      const route = (a.getAttribute('href') ?? '').replace(/^\/+/, '').split('/')[0] ?? '';
      a.classList.toggle('nav-link--active', route === routeName);
    });
  }
}

customElements.define(BuddjNav.tagName, BuddjNav);
