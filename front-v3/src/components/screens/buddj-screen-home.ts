/**
 * Écran d’accueil : logo, description de l’app, disclaimer, contact, CTA Sign in.
 */
export class BuddjScreenHome extends HTMLElement {
  static readonly tagName = 'buddj-screen-home';

  connectedCallback(): void {
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
        <p class="home-description">
          Buddj! vous aide à piloter votre budget au quotidien : charges récurrentes, enveloppes par mois,
          objectifs d’épargne, suivi des remboursements et des sorties annuelles. Une app simple et claire
          pour garder la main sur vos finances.
        </p>
        <p class="home-disclaimer" role="status">
          Buddj! n’est pas ouvert au public.
        </p>
        <p class="home-contact">
          Si vous êtes intéressés, veuillez contacter son auteur
          <a href="mailto:contact@dimitrilahaye.net">contact@dimitrilahaye.net</a>.
        </p>
        <a href="#" class="home-cta btn btn--primary" id="home-signin">Sign in</a>
      </div>
    `;
    this.appendChild(main);
  }
}

customElements.define(BuddjScreenHome.tagName, BuddjScreenHome);
