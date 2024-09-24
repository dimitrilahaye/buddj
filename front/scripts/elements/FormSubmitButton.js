import Button from "./Button";

export default class FormSubmitButton extends Button {
    /**
     *
     * @param {string} label
     */
    constructor({label}) {
        super({
            type: 'submit',
            label,
            classes: 'is-link'
        });
    }
}
