export default class Element {
    /** @type {HTMLElement} */
    $element;

    show() {
        this.$element.classList.remove('is-hidden');
    }

    hide() {
        this.$element.classList.add('is-hidden');
    }
}
