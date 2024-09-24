import htmlFactory from "../utils/htmlFactory.js";
import FormField from "./FormField.js";

export default class Input extends FormField {
    /**
     *
     * @param {boolean=} required
     * @param {string} id
     * @param {string} name
     * @param {string} type
     * @param {string=} placeholder
     * @param {string=} step
     * @param {string=} value
     * @param {boolean=} checked
     */
    constructor({required, id, name, type, placeholder, step, value, checked}) {
        super(id);

        this.$element = htmlFactory(`
        <input
            ${required === true ? 'required' : ''}
            id="${this.id}"
            ${value ? `value="${value}"` : ''}
            name="${name}"
            type="${type}"
            autocomplete="off"
            ${placeholder ? `placeholder="${placeholder}"` : ''}
            ${checked !== undefined ? checked ? 'checked' : '' : ''}
            class="${type === 'checkbox' ? 'checkbox' : 'input'}"
            ${step ? `step="${step}"` : ''}
        />`);
    }
}
