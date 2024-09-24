import Button from "../elements/Button";
import Page from "./Page.js";

export default class Login extends Page {
    /** @type {Button} */
    #loginButton;

    /**
     *
     * @param {Element} $main
     * @param {function(page: Page): void} loginHandler
     */
    constructor({$main, loginHandler}) {
        super($main, 'login');

        this.$page.insertAdjacentHTML('afterbegin', `
            <h2 class="title is-2">Welcome to Mortal Kompta</h2>
            <!-- Form -->
        `);

        this.#loginButton = new Button({
            classes: 'is-medium is-info',
            label: 'Login',
            clickHandler: async () => {
                if (this.#loginButton.isDisabled) {
                    return;
                }
                await loginHandler(this);
            },
        });
        this.$page.insertAdjacentElement('beforeend', this.#loginButton.$element);
    }

    startLoader() {
        this.#loginButton.startLoader();
    }

    stopLoader() {
        this.#loginButton.stopLoader();
    }
}
