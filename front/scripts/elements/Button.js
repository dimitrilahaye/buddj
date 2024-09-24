import htmlFactory from "../utils/htmlFactory.js";
import Element from "./Element.js";

export default class Button extends Element {
    /**
     *
     * @param {string} classes
     * @param {string} label
     * @param {'submit'|'button'} type
     * @param {(function(e: Event): void)=} clickHandler
     */
    constructor({classes, label, type = 'button', clickHandler}) {
        super();

        this.$element = htmlFactory(`<button class="button ${classes}" type="${type ? type : 'button'}">${label}</button>`);
        if (clickHandler) {
            this.$element.addEventListener('click', clickHandler);
        }
    }

    startLoader() {
        this.$element.classList.add('is-loading');
        this.$element.setAttribute('disabled', 'disabled');
    }

    stopLoader() {
        this.$element.classList.remove('is-loading');
        this.$element.removeAttribute('disabled');
    }

    get isDisabled() {
        return this.$element.getAttribute('disabled');
    }
}
