import htmlFactory from "../utils/htmlFactory.js";
import Component from "./Component.js";

export default class NavBar extends Component {
    /** @type {Rouster} */
    #router;

    /** @type {HTMLElement} */
    #$burger;
    /** @type {HTMLElement} */
    #$menu;

    /**
     *
     * @param {Rouster} router
     * @param {function(): void} logoutHandler
     */
    constructor({router, logoutHandler}) {
        super();

        this.#router = router;
        this.$element = htmlFactory(`
            <nav id="navBar" class="nav-bar navbar is-fixed-top">
              <div class="navbar-brand">
                <img id="logo" class="navbar-item" alt="" src="/assets/images/logo.png" width="60px"/>
                <div id="burger" class="navbar-burger js-burger" data-target="menu">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            
              <div id="menu" class="navbar-menu">
                <div class="navbar-start">
                    <div class="navbar-dropdown">
                      <div id="archivedMonths" class="navbar-item">» Mois archivés</div>
                      <div id="logoutLink" class="navbar-item">» Logout</div>
                    </div>
                </div>
              </div>
            </nav>
        `);

        this.$element.querySelector('#logo').addEventListener('click', () => {
            this.#router.navigate('/home');
        });

        this.$element.querySelector('#archivedMonths').addEventListener('click', () => {
            this.closeMenuDropdown();
            this.#router.navigate('/admin/archived');
        });

        this.$element.querySelector('#logoutLink').addEventListener('click', () => {
            this.closeMenuDropdown();
            logoutHandler();
        });

        this.#$burger = this.$element.querySelector('#burger');
        this.#$menu = this.$element.querySelector('#menu');

        this.#$burger.addEventListener('click', () => {
            this.#$burger.classList.toggle('is-active');
            this.#$menu.classList.toggle('is-active');
        });
    }

    closeMenuDropdown() {
        this.#$burger.classList.remove('is-active');
        this.#$menu.classList.remove('is-active');
    }

    hideBurger() {
        this.#$burger.classList.add('is-hidden');
    }
}
