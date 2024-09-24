import Notification from '../components/Notification.js';
import Loader from "../elements/Loader.js";
import {getMonthName} from "../utils/month.js";

export default class Page {
    /** @type {HTMLElement} */
    $main;
    /** @type {HTMLElement} */
    $page;
    /** @type {Notification} */
    notification;
    /** @type {Loader} */
    loader;
    /** @type {string} */
    #id;

    /**
     *
     * @param {Element} $main
     * @param {string} id
     */
    constructor($main, id) {
        this.#id = id;
        this.$main = $main;
        this.$main.innerHTML = '';
        this.$main.insertAdjacentHTML('beforeend', `<div id="${id}"></div>`);
        this.$page = this.$main.querySelector(`#${id}`);
        this.notification = new Notification();
        this.notification.hide();
        this.loader = new Loader();
    }

    /**
     *
     * @param {MonthMenu} monthMenu
     * @param {string} title
     * @param {string} icon
     */
    addMonthMenu(monthMenu, {title, icon}) {
        monthMenu.initializeInPage({title, icon});
        monthMenu.removeMenuItem(this.#id);
        this.$page.insertAdjacentElement('afterbegin', monthMenu.$element);

        this.$page.querySelector('#month-dropdown').insertAdjacentElement('afterend', this.loader.$element);
        this.loader.start();
    }

    /**
     *
     * @param {*} month
     */
    setMonthName(month) {
        const name = getMonthName(month);
        this.$page.querySelector('.month-name')?.remove();
        this.$page.querySelector('.title').insertAdjacentHTML('afterbegin', `
            <span class="month-name">${name}</span>
        `);
    }

    refreshNotification() {
        this.notification = new Notification();
        this.notification.hide();
    }
}
