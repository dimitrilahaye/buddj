import htmlFactory from "../utils/htmlFactory.js";
import Element from "./Element.js";

export default class Block extends Element {
    /**
     *
     * @param {string} color
     * @param {string} content
     * @param {string=} size
     */
    constructor({color, content, size}) {
        super();

        this.$element = htmlFactory(`
            <div class="block column ${size ? size : ''}">
                <p class="${color}">
                    ${content}
                </p>
            </div>
        `);
    }
}
