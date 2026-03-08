/**
 * Écran d’accueil : logo, description de l’app, disclaimer, contact, CTA Sign in.
 * Écoute les events auth du store (loading, userAuthenticatedChecked, failure) : modal de chargement, toast d’erreur en cas d’échec.
 */
import type { AuthStore } from '../../application/auth/auth-store.js';
import type { BuddjLoadingModal } from '../molecules/buddj-loading-modal.js';
import { getToast } from '../atoms/buddj-toast.js';

const LOADING_TEXT = 'Connexion à Buddj! en cours';

export class BuddjScreenHome extends HTMLElement {
  static readonly tagName = 'buddj-screen-home';

  private store?: AuthStore;
  private _loadingModal?: BuddjLoadingModal;
  private _unsubscribe?: () => void;

  init({ store }: { store: AuthStore }): void {
    this.store = store;
  }

  connectedCallback(): void {
    if (!this.store) return;
    this.attachAuthModalsAndListeners();
    this.store.emitAction('checkUserIsAuthenticated');
    if (this.querySelector('.home-content')) return;
    const main = document.createElement('main');
    main.id = 'home';
    main.className = 'screen screen--home';
    main.innerHTML = `
      <div class="home-content">
        <header class="home-header">
          <h1>Welcome on Buddj!</h1>
          <img src="/logo_with_title.png" alt="Buddj!" class="home-logo" width="200" height="auto" />
        </header>
        <section class="home-features" aria-label="Ce que fait Buddj">
          <article class="home-feature home-feature--charges">
            <span class="home-feature-icon" aria-hidden="true">📋</span>
            <h2 class="home-feature-title">Gérer ses charges</h2>
            <p class="home-feature-desc">Abonnements, loyer, factures récurrentes… tout au même endroit, sans mauvaise surprise.</p>
          </article>
          <article class="home-feature home-feature--enveloppes">
            <span class="home-feature-icon" aria-hidden="true">🎯</span>
            <h2 class="home-feature-title">Gérer ses enveloppes</h2>
            <p class="home-feature-desc">Budgets par mois et par poste : vous décidez où va l’argent avant qu’il ne file.</p>
          </article>
          <article class="home-feature home-feature--economies">
            <span class="home-feature-icon" aria-hidden="true">🐷</span>
            <h2 class="home-feature-title">Gérer ses économies</h2>
            <p class="home-feature-desc">Objectifs, projets, tirelires : gardez le cap sur ce que vous mettez de côté.</p>
          </article>
          <article class="home-feature home-feature--remboursements">
            <span class="home-feature-icon" aria-hidden="true">🤝</span>
            <h2 class="home-feature-title">Gérer ses remboursements</h2>
            <p class="home-feature-desc">Avances, prêts, dettes : qui doit quoi à qui, suivi simple et clair.</p>
          </article>
        </section>
        <div class="home-disclaimer" role="alert" aria-live="assertive">
          <span class="home-disclaimer-icon" aria-hidden="true">⚠</span>
          Buddj! n’est pas ouvert au public.
        </div>
        <p class="home-contact">
          Si vous êtes intéressés, veuillez contacter son auteur
          <a href="mailto:contact@dimitrilahaye.net">contact@dimitrilahaye.net</a>.
        </p>
        <a href="#" class="home-cta btn btn--primary" id="home-signin" role="button">Sign in</a>
      </div>
    `;
    this.appendChild(main);
    const signInBtn = main.querySelector('#home-signin');
    if (signInBtn && this.store) {
      signInBtn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        this.store!.emitAction('userSignIn');
      });
    }
  }

  disconnectedCallback(): void {
    this._unsubscribe?.();
  }

  private attachAuthModalsAndListeners(): void {
    if (this._loadingModal) return;
    const loadingModal = document.createElement('buddj-loading-modal') as BuddjLoadingModal;
    this._loadingModal = loadingModal;
    this.appendChild(loadingModal);

    const onLoading = (): void => {
      this._loadingModal?.show(LOADING_TEXT);
    };
    const onUserAuthenticatedChecked = (): void => {
      this._loadingModal?.hide();
    };
    const onFailure = (e: Event): void => {
      this._loadingModal?.hide();
      const message = (e as CustomEvent<{ message: string }>).detail?.message ?? 'Une erreur est survenue.';
      getToast()?.show({ message, variant: 'error', durationMs: 3000 });
    };

    this.store!.addEventListener('isAuthenticated:loading', onLoading);
    this.store!.addEventListener('isUserAuthenticatedChecked', onUserAuthenticatedChecked);
    this.store!.addEventListener('isAuthenticated:failure', onFailure);

    this._unsubscribe = (): void => {
      this.store!.removeEventListener('isAuthenticated:loading', onLoading);
      this.store!.removeEventListener('isUserAuthenticatedChecked', onUserAuthenticatedChecked);
      this.store!.removeEventListener('isAuthenticated:failure', onFailure);
    };
  }
}

customElements.define(BuddjScreenHome.tagName, BuddjScreenHome);
