import Page from "./Page.js";
import {getMonthName} from "../utils/month.js";

export default class Home extends Page {
    /** @type {Rouster} */
    #router;
    /** @type {NodeListOf<Element>|null} */
    #$dropdowns = null;
    /** @type {function(page: Page, result: *): void} */
    #archiveMonthsSubmitHandler

    /**
     *
     * @param {Element} $main
     * @param {Rouster} router
     * @param {function(page: Page, result: *): void} archiveMonthsSubmitHandler
     */
    constructor({$main, router, archiveMonthsSubmitHandler}) {
        super($main, 'home');

        this.#router = router;
        this.#archiveMonthsSubmitHandler = archiveMonthsSubmitHandler;

        this.$page.insertAdjacentHTML('afterbegin', `
            <h2 class="title is-2"><i class="fa-solid fa-house"></i>&nbsp;Home</h2>
        `);

        this.$page.querySelector('.title.is-2').insertAdjacentElement('afterend', this.loader.$element);
    }

    /**
     *
     * @param {Month[]} months
     */
    createDropdowns(months) {
        if (this.#$dropdowns) {
            this.#$dropdowns.forEach(($e) => $e.remove());
            this.#$dropdowns = null;
        }
        const dropdowns = months.map((month) => {
            const name = getMonthName(month);
            return `
            <div class="dropdown" data-month="${month.id}">
                <div class="dropdown-trigger">
                    <button class="button month-button" aria-haspopup="true" aria-controls="dropdown-menu">
                        <span class="icon"><i class="fa-solid fa-calendar-days"></i></span>
                        <span>${name}</span>
                        <span class="icon is-small">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                    </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <div class="dashboard dropdown-item">
                            <span class="icon"><i class="fa-solid fa-square-poll-vertical"></i></span>
                            <span>Dashboard</span>
                        </div>
                        <div class="weekly dropdown-item">
                            <span class="icon"><i class="fa-regular fa-credit-card"></i></span>
                            <span>Budget Hebdo</span>
                        </div>
                        <div class="outflows dropdown-item">
                            <span class="icon"><i class="fa-solid fa-money-bill-transfer"></i></span>
                            <span>Entrées / Sorties</span>
                        </div>
                        <hr class="dropdown-divider" />
                        <div class="archive dropdown-item">
                            <span class="icon"><i class="fa-solid fa-trash"></i></span>
                            <span>Archiver</span>
                            <div class="buttons are-small is-hidden">
                                <button class="button confirm-archive is-warning" type="button">Confirmer</button>
                                <button class="button cancel-archive is-info" type="button">Annuler</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `
        }).join('');
        this.$page.querySelector('.title.is-2').insertAdjacentHTML('afterend', dropdowns);

        this.$page.insertAdjacentHTML('beforeend', `
            <button id="new-month" class="button" type="button">
                <span class="icon"><i class="fa-solid fa-plus"></i></span>
            </button>
        `);

        this.#$dropdowns = this.$page.querySelectorAll('.dropdown');
        this.#$dropdowns.forEach(($e) => {
            $e.querySelector('.dropdown-trigger').addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                $parent.classList.toggle('is-active');
            });
            $e.querySelectorAll('.dropdown-item').forEach(($e) => {
                $e.addEventListener('click', (e) => {
                    const hasClickedOnArchive = !!(e.target.closest('.archive'));
                    if (hasClickedOnArchive) {
                        e.stopPropagation();
                        return;
                    }
                    const $parent = e.target.closest('.dropdown');
                    $parent.classList.toggle('is-active');
                });
            });
        });

        this.$page.querySelectorAll('.dashboard').forEach(($e) => {
            $e.addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                const monthId = $parent.dataset.month;
                this.#router.navigate('/dashboard/' + monthId);
            });
        });

        this.$page.querySelectorAll('.weekly').forEach(($e) => {
            $e.addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                const monthId = $parent.dataset.month;
                this.#router.navigate('/weekly/' + monthId);
            });
        });

        this.$page.querySelectorAll('.outflows').forEach(($e) => {
            $e.addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                const monthId = $parent.dataset.month;
                this.#router.navigate('/outflows/' + monthId);
            });
        });

        this.$page.querySelectorAll('.archive').forEach(($e) => {
            $e.addEventListener('click', () => {
                const $options = $e.querySelector('.buttons.are-small');
                if ($options.classList.contains('is-hidden')) {
                    $options.classList.remove('is-hidden');
                }
            }, true);
        });

        this.$page.querySelectorAll('.confirm-archive').forEach(($e) => {
            $e.addEventListener('click', async (e) => {
                const $parent = e.target.closest('.dropdown');
                $parent.classList.toggle('is-active');
                const monthId = $parent.dataset.month;
                await this.#archiveMonthsSubmitHandler(this, monthId);
            });
        });

        this.$page.querySelectorAll('.cancel-archive').forEach(($e) => {
            $e.addEventListener('click', async (e) => {
                const $parent = e.target.closest('.buttons.are-small');
                $parent.classList.add('is-hidden');
            }, true);
        });

        this.$page.querySelector('#new-month').addEventListener('click', () => {
            this.#router.navigate('/admin/create');
        });

        this.loader.stop();
    }
}
