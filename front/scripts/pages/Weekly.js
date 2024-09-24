import Page from "./Page.js";
import Receipt from "./Receipt";
import Pending from "./Pending";

export default class Weekly extends Page {
    /** @type {Element} */
    #$manageTab;
    /** @type {Element} */
    #$addTab;
    /** @type {Element} */
    #$pendingContainer;
    /** @type {Element} */
    #$receiptContainer;
    /** @type {Receipt} */
    #receipt;
    /** @type {Pending} */
    #pending;

    /**
     *
     * @param {Element} $main
     * @param {function(page: Page, result: *): void} updatePendingHandler
     * @param {MonthMenu} monthMenu
     */
    constructor({$main, monthMenu, updatePendingHandler}) {
        super($main, 'weekly');

        this.$page.insertAdjacentHTML('afterbegin', `
            <div class="tabs is-boxed is-small is-hidden">
              <ul>
                <li id="manage" class="is-active">
                  <a>
                    <span class="icon is-small"
                      ><i class="fas fa-gear" aria-hidden="true"></i
                    ></span>
                    <span>Gérer</span>
                  </a>
                </li>
                <li id="add">
                  <a>
                    <span class="icon is-small"
                      ><i class="fas fa-plus" aria-hidden="true"></i
                    ></span>
                    <span>Ajouter</span>
                  </a>
                </li>
              </ul>
            </div>
            <div id="pending" class="is-hidden"></div>
            <div id="receipt" class="is-hidden"></div>
        `);

        this.$page.querySelector('.tabs.is-boxed').insertAdjacentElement('beforebegin', this.loader.$element);
        this.loader.start();

        this.#$pendingContainer = this.$page.querySelector('#pending');
        this.#$receiptContainer = this.$page.querySelector('#receipt');

        this.#receipt = new Receipt({
            $main: this.#$receiptContainer,
        });

        this.#pending = new Pending({
            $main: this.#$pendingContainer,
            updatePendingHandler,
        });

        this.#$manageTab = this.$page.querySelector('#manage');
        this.#$manageTab.addEventListener('click', () => {
            this.#$manageTab.classList.toggle('is-active');
            this.#$addTab.classList.toggle('is-active');
            this.#$receiptContainer.classList.toggle('is-hidden');
            this.#$pendingContainer.classList.toggle('is-hidden');
        });

        this.#$addTab = this.$page.querySelector('#add');
        this.#$addTab.addEventListener('click', () => {
            this.#$manageTab.classList.toggle('is-active');
            this.#$addTab.classList.toggle('is-active');
            this.#$receiptContainer.classList.toggle('is-hidden');
            this.#$pendingContainer.classList.toggle('is-hidden');
        });

        this.addMonthMenu(monthMenu, {
            title: 'Budget hebdo',
            icon: 'credit-card',
        });

        this.refreshNotification();
    }

    /**
     * @param {function(page: this, weekId: string, expenseId: string)} deleteExpenseHandler
     * @param {WeeklyBudget[]} weeklyBudgets
     */
    displayPendingForm(weeklyBudgets, deleteExpenseHandler) {
        this.loader.stop();
        this.$page.querySelector('.tabs.is-boxed').classList.remove('is-hidden');
        this.#$pendingContainer.classList.remove('is-hidden');
        this.#pending.displayForm({weeklyBudgets, deleteExpenseHandler});
    }

    /**
     * @param {function(page: Receipt, result:ReceiptFormResult): void} addReceiptHandler
     * @param {Numpad} numpad
     * @param {WeeklyBudget[]} weeklyBudgets
     */
    updateWeeksSelect(weeklyBudgets, addReceiptHandler, numpad) {
        this.#receipt.updateWeeksSelect(weeklyBudgets, addReceiptHandler, numpad);
    }
}
