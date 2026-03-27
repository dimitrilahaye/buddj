import type { AuthStore } from '../../application/auth/auth-store.js';
import type { BuddjLoadingModal } from '../molecules/buddj-loading-modal.js';
import { getToast } from '../atoms/buddj-toast.js';

const LOGOUT_LOADING_TEXT = 'Déconnexion en cours';

/**
 * Panel coulissant depuis la droite (menu burger).
 * Backdrop flouté, panel avec contenu. API : open(), close(), toggle(), isOpen, init({ store }).
 * Écoute askForLogout:loading / askForLogout:failure pour modal de chargement et toast.
 * Dispatch 'buddj-burger-change' avec { detail: { open: boolean } } à chaque changement.
 */
export class BuddjBurgerPanel extends HTMLElement {
  static readonly tagName = 'buddj-burger-panel';

  private _open = false;
  private store?: AuthStore;
  private _loadingModal?: BuddjLoadingModal;
  private _unsubscribe?: () => void;

  init({ store }: { store: AuthStore }): void {
    this.store = store;
    this.attachLogoutListeners();
    const logoutBtn = this.querySelector('.burger-panel-link--logout');
    if (logoutBtn && this.store) {
      logoutBtn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.close();
        this.store!.emitAction('askForLogout');
      });
    }
  }

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

  disconnectedCallback(): void {
    this._unsubscribe?.();
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
      if (link.classList.contains('burger-panel-link--logout')) return;
      link.addEventListener('click', () => this.close());
    });
  }

  private attachLogoutListeners(): void {
    if (!this.store || this._loadingModal) return;
    const loadingModal = document.createElement('buddj-loading-modal') as BuddjLoadingModal;
    this._loadingModal = loadingModal;
    document.body.appendChild(loadingModal);

    const onLoading = (): void => {
      this._loadingModal?.show(LOGOUT_LOADING_TEXT);
    };
    const onSuccess = (): void => {
      this._loadingModal?.hide();
    };
    const onFailure = (e: Event): void => {
      this._loadingModal?.hide();
      const message = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Une erreur est survenue.';
      getToast()?.show({ message, variant: 'error', durationMs: 1250 });
    };

    this.store.addEventListener('askForLogout:loading', onLoading);
    this.store.addEventListener('askForLogout:success', onSuccess);
    this.store.addEventListener('askForLogout:failure', onFailure);

    this._unsubscribe = (): void => {
      this.store!.removeEventListener('askForLogout:loading', onLoading);
      this.store!.removeEventListener('askForLogout:success', onSuccess);
      this.store!.removeEventListener('askForLogout:failure', onFailure);
    };
  }
}

customElements.define(BuddjBurgerPanel.tagName, BuddjBurgerPanel);
