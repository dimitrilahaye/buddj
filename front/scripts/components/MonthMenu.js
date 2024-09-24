import Component from "./Component.js";
import htmlFactory from "../utils/htmlFactory.js";

export default class MonthMenu extends Component {
    /**
     * @param {Rouster} router
     */
    constructor({router}) {
        super();
        this.$element = htmlFactory(`
            <div id="month-dropdown" class="dropdown">
                <div class="dropdown-trigger">
                    <h2 class="title is-2" aria-haspopup="true" aria-controls="dropdown-menu">
                        <!-- month -->
                        <span class="title-container">
                            <!-- title and icon -->
                        </span>
                    </h2>
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
                    </div>
                </div>
            </div>
        `);
        this.$element.querySelector('.dropdown-trigger').addEventListener('click', (e) => {
            const $parent = e.target.closest('.dropdown');
            $parent.classList.toggle('is-active');
        });
        this.$element.querySelectorAll('.dropdown-item').forEach(($e) => {
            $e.addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                $parent.classList.toggle('is-active');
            });
        });

        this.$element.querySelectorAll('.dashboard').forEach(($e) => {
            $e.addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                const monthId = $parent.dataset.month;
                router.navigate('/dashboard/' + monthId);
            });
        });

        this.$element.querySelectorAll('.weekly').forEach(($e) => {
            $e.addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                const monthId = $parent.dataset.month;
                router.navigate('/weekly/' + monthId);
            });
        });

        this.$element.querySelectorAll('.outflows').forEach(($e) => {
            $e.addEventListener('click', (e) => {
                const $parent = e.target.closest('.dropdown');
                const monthId = $parent.dataset.month;
                router.navigate('/outflows/' + monthId);
            });
        });
    }

    getMonthId() {
        const url = new URL(location.href);
        return url.pathname.split('/').at(-1);
    }

    /**
     *
     * @param {string} title
     * @param {string} icon
     */
    initializeInPage({title, icon}) {
        this.$element.setAttribute("data-month", this.getMonthId());
        this.$element.querySelector('.title-container').innerHTML = '';
        this.$element.querySelector('.title-container').insertAdjacentHTML("afterbegin",`
            <i class="fa-solid fa-${icon}"></i>
            &nbsp;${title}        
        `);
        this.$element.querySelector('.title-container').insertAdjacentHTML("beforeend",`
            <i class="fas fa-angle-down" aria-hidden="true"></i>        
        `);
    }

    removeMenuItem(name) {
        this.$element.querySelectorAll('.dropdown-item').forEach(($e) => {
            $e.classList.remove('is-hidden');
        });
        this.$element.querySelector(`.${name}`).classList.add('is-hidden');
    }
}
