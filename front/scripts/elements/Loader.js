import htmlFactory from "../utils/htmlFactory.js";
import Element from "./Element.js";

export default class Loader extends Element {
    constructor() {
        super();

        this.$element = htmlFactory(`
            <div class="loader-wrapper">
              <div class="loader is-loading"></div>
            </div>
        `);
    }

    start() {
        this.$element.classList.add('is-active');
    }

    stop() {
        this.$element.classList.remove('is-active');
    }
}
