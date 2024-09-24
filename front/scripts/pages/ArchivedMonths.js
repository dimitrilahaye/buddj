import Page from "./Page.js";
import htmlFactory from "../utils/htmlFactory";
import {getMonthName} from "../utils/month";

export default class ArchivedMonths extends Page {
    /** @type {function(monthId: string): Promise<void>} */
    #unarchiveMonthHandler;
    /** @type {function(monthId: string): Promise<void>} */
    #deleteMonthHandler;
    /** @type {string|null} */
    #selectedMonthForDeletion = null;

    /**
     *
     * @param {Element} $main
     * @param {function(monthId: string): Promise<void>} unarchiveMonthHandler
     * @param {function(monthId: string): Promise<void>} deleteMonthHandler
     */
    constructor({$main, unarchiveMonthHandler, deleteMonthHandler}) {
        super($main, 'archived-months');

        this.#unarchiveMonthHandler = unarchiveMonthHandler;
        this.#deleteMonthHandler = deleteMonthHandler;

        this.$page.insertAdjacentHTML('afterbegin', `
            <h2 class="title is-2"><i class="fa-solid fa-calendar-days"></i>&nbsp;Mois archivés</h2>
        `);
    }

    /**
     *
     * @param {Month[]} months
     */
    initPage(months) {
        const $table = htmlFactory(`
            <div class="table-container">
              <table class="table is-striped is-fullwidth">
                <tbody>
                    ${months.map((month) => `<tr id="${month.id}">
                        <td>${getMonthName(month)}</td>
                        <td>
                            <button class="button is-small unarchive is-link" type="button"><i class="fa-solid fa-trash-can-arrow-up"></i>&nbsp;Désarchiver</button>
                        </td>
                        <td>
                            <button class="button delete is-danger" type="button"></button>
                        </td>
                    </tr>`).join('')}
                </tbody>
              </table>
              <button class="button is-warning confirm-delete is-hidden" type="button">Confirmer la suppression</button>
              <button class="button is-info is-light cancel-delete is-hidden" type="button">Abandonner la suppression</button>
            </div>
        `);
        this.$page.insertAdjacentElement('beforeend', $table);

        const $confirmDelete = this.$page.querySelector('.confirm-delete');
        const $cancelDelete = this.$page.querySelector('.cancel-delete');

        this.$page.querySelectorAll('.button.unarchive').forEach(($button) => {
           $button.addEventListener('click', async (e) => {
               const $row = e.target.closest('tr');
               const monthId = $row.id;
               this.#startLoader(e.target);
               await this.#unarchiveMonthHandler(monthId);
               this.#stopLoader(e.target);
           });
        });

        this.$page.querySelectorAll('.button.delete').forEach(($button) => {
           $button.addEventListener('click', async (e) => {
               const $row = e.target.closest('tr');
               this.#selectedMonthForDeletion = $row.id;
               $confirmDelete.classList.remove('is-hidden');
               $cancelDelete.classList.remove('is-hidden');
           });
        });

        $cancelDelete.addEventListener('click', () => {
            $confirmDelete.classList.add('is-hidden');
            $cancelDelete.classList.add('is-hidden');
            this.#selectedMonthForDeletion = null;
        });
        $confirmDelete.addEventListener('click', async () => {
            $confirmDelete.classList.add('is-hidden');
            $cancelDelete.classList.add('is-hidden');
            this.#startLoader($confirmDelete);
            await this.#deleteMonthHandler(this.#selectedMonthForDeletion);
            this.#stopLoader($confirmDelete);
        });
        this.$page.querySelectorAll('#form .icon.delete').forEach(($deleteButton) => {
            $deleteButton.addEventListener('click', () => {
                $deleteButton.dataset.selected = 'true';
                $confirmDelete.classList.remove('is-hidden');
                $cancelDelete.classList.remove('is-hidden');
            });
        });
    }

    #startLoader($button) {
        $button.classList.add('is-loading');
        $button.setAttribute('disabled', 'disabled');
    }

    #stopLoader($button) {
        $button.classList.remove('is-loading');
        $button.removeAttribute('disabled');
    }
}
