import Element from "./Element.js";

export default class FormField extends Element {
    /** @type {string} */
    id;

    /**
     *
     * @param {string} id
     */
    constructor(id) {
        super();
        this.id = id;
    }
}
