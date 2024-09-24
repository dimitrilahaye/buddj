import Component from "./Component.js";
import htmlFactory from "../utils/htmlFactory.js";

export default class Notification extends Component {
    constructor() {
        super();
        document.body.querySelector('.notification')?.remove();
        this.$element = htmlFactory(`
            <div class="notification">
                <button class="delete"></button>
                <span class="content"></span>
            </div>
        `);

        this.$element.querySelector('.delete').addEventListener('click', () => {
            this.hide();
        });

        document.querySelector('#app').insertAdjacentElement('beforebegin', this.$element);
    }

    error(message) {
        this.$element.classList.add('is-danger');
        this.$element.classList.remove('is-success');
        this.$element.querySelector('.content').innerText = message;
        this.show();
    }

    success() {
        this.$element.classList.add('is-success');
        this.$element.classList.remove('is-danger');
        this.$element.querySelector('.content').innerText = 'Success!';
        this.show();
    }
}
